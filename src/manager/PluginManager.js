// src/plugins/manager/PluginManager.js
import { reactive, ref } from 'vue'
import JSZip from 'jszip'
import { PluginLoader } from './PluginLoader'
import { PluginRouter } from './PluginRouter'
import { usePluginStore } from '../store/pluginStore'

export class PluginManager {
    static instance = null
    app = null
    router = null
    loader = null
    pluginRouter = null
    plugins = reactive(new Map())
    isInitialized = false

    constructor() {
        this.loader = new PluginLoader()
        this.pluginRouter = new PluginRouter()
    }

    static getInstance() {
        if (!PluginManager.instance) {
            PluginManager.instance = new PluginManager()
        }
        return PluginManager.instance
    }

    initialize(app, router) {
        if (this.isInitialized) return

        this.app = app
        this.router = router
        this.pluginRouter.setRouter(router)
        this.isInitialized = true

        // 从存储加载已安装插件
        this.loadInstalledPlugins()
    }

    async loadInstalledPlugins() {
        const store = usePluginStore()
        const installedPlugins = store.getPlugins()

        for (const pluginData of installedPlugins) {
            try {
                if (pluginData.enabled) {
                    await this.loadPluginFromStorage(pluginData)
                }
            } catch (error) {
                console.error(`加载插件 ${pluginData.name} 失败:`, error)
            }
        }
    }

    async loadPluginFromStorage(pluginData) {
        // 这里可以从 localStorage 或 IndexedDB 加载插件代码
        const pluginCode = localStorage.getItem(`plugin_${pluginData.id}`)
        if (pluginCode) {
            const plugin = await this.loader.loadPluginFromCode(pluginCode, pluginData.manifest)
            this.registerPlugin(plugin, pluginData)
        }
    }

    async installPluginFromFile(file) {
        try {
            // 1. 解压 ZIP 文件
            const pluginData = await this.extractPluginZip(file)

            // 2. 验证插件
            this.validatePlugin(pluginData)

            // 3. 加载插件
            const plugin = await this.loader.loadPlugin(pluginData)

            // 4. 注册插件
            const pluginInstance = await this.registerPlugin(plugin, pluginData)

            // 5. 保存到存储
            await this.savePlugin(pluginInstance, pluginData.content)

            return {
                success: true,
                plugin: pluginInstance,
                message: '插件安装成功'
            }
        } catch (error) {
            console.error('插件安装失败:', error)
            return {
                success: false,
                error: error.message
            }
        }
    }

    async extractPluginZip(file) {
        const zip = new JSZip()
        const zipContent = await zip.loadAsync(file)

        // 读取插件清单
        const manifestContent = await zipContent.file('manifest.json').async('string')
        const manifest = JSON.parse(manifestContent)

        // 读取主入口文件
        const entryContent = await zipContent.file(manifest.entry).async('string')

        // 读取其他资源文件
        const assets = {}
        const assetFiles = zipContent.file(/\.(png|jpg|svg|css)$/)

        for (const assetFile of assetFiles) {
            const blob = await assetFile.async('blob')
            const url = URL.createObjectURL(blob)
            assets[assetFile.name] = url
        }

        return {
            manifest,
            entry: entryContent,
            assets,
            content: await zip.generateAsync({ type: 'blob' })
        }
    }

    validatePlugin(pluginData) {
        const { manifest } = pluginData

        // 检查必需字段
        const requiredFields = ['name', 'version', 'libraryName', 'entry']
        for (const field of requiredFields) {
            if (!manifest[field]) {
                throw new Error(`插件清单缺少必需字段: ${field}`)
            }
        }

        // 检查版本格式
        const versionRegex = /^\d+\.\d+\.\d+$/
        if (!versionRegex.test(manifest.version)) {
            throw new Error('插件版本号格式不正确')
        }

        // 检查名称格式
        const nameRegex = /^[a-z0-9-]+$/
        if (!nameRegex.test(manifest.name)) {
            throw new Error('插件名称只能包含小写字母、数字和连字符')
        }
    }

    async registerPlugin(pluginModule, pluginData) {
        const { manifest } = pluginData

        const pluginInstance = {
            id: this.generatePluginId(manifest.name),
            name: manifest.name,
            version: manifest.version,
            manifest,
            config: pluginModule.default?.config || {},
            enabled: true,
            installedAt: new Date(),
            vm: null
        }

        // 安装插件到 Vue 应用
        if (pluginModule.default && typeof pluginModule.default.install === 'function') {
            pluginModule.default.install(this.app, {
                router: this.router,
                store: usePluginStore()
            })
        }

        // 注册路由
        if (pluginInstance.config.routes) {
            this.pluginRouter.addRoutes(pluginInstance.config.routes)
        }

        // 注册菜单
        if (pluginInstance.config.menus) {
            this.updateMenus(pluginInstance.config.menus)
        }

        // 注册组件
        if (pluginInstance.config.components) {
            this.registerComponents(pluginInstance.config.components)
        }

        this.plugins.set(pluginInstance.id, pluginInstance)

        // 保存到状态管理
        const store = usePluginStore()
        store.addPlugin(pluginInstance)

        return pluginInstance
    }

    updateMenus(menus) {
        const store = usePluginStore()
        store.addMenus(menus)
    }

    registerComponents(components) {
        for (const [name, component] of Object.entries(components)) {
            this.app.component(name, component)
        }
    }

    generatePluginId(name) {
        return `${name}-${Date.now()}`
    }

    async savePlugin(pluginInstance, pluginContent) {
        // 保存到 localStorage
        const store = usePluginStore()
        store.savePlugin(pluginInstance)

        // 如果需要，可以保存插件代码到 localStorage
        // localStorage.setItem(`plugin_${pluginInstance.id}`, pluginContent)
    }

    getPlugin(id) {
        return this.plugins.get(id)
    }

    getPlugins() {
        return Array.from(this.plugins.values())
    }

    async uninstallPlugin(id) {
        const plugin = this.plugins.get(id)
        if (!plugin) return false

        try {
            // 移除路由
            if (plugin.config.routes) {
                plugin.config.routes.forEach(route => {
                    this.pluginRouter.removeRoute(route.name)
                })
            }

            // 移除菜单
            const store = usePluginStore()
            store.removePluginMenus(id)

            // 移除插件实例
            this.plugins.delete(id)

            // 从存储中移除
            store.removePlugin(id)

            return true
        } catch (error) {
            console.error('卸载插件失败:', error)
            return false
        }
    }

    async enablePlugin(id) {
        const plugin = this.plugins.get(id)
        if (plugin) {
            plugin.enabled = true
            const store = usePluginStore()
            store.updatePlugin(id, { enabled: true })
        }
    }

    async disablePlugin(id) {
        const plugin = this.plugins.get(id)
        if (plugin) {
            plugin.enabled = false
            const store = usePluginStore()
            store.updatePlugin(id, { enabled: false })
        }
    }
}