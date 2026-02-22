// src/plugins/store/pluginStore.js
import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

import HomeView from '../views/HomeView.vue'
import EventLog from '@/views/EventLog.vue'
import CalendaryDate from '@/views/CalendaryDate.vue'
import PageExpansion from '@/views/PageExpansion.vue'

export const usePluginStore = defineStore('plugin', () => {
    // 插件列表
    const plugins = ref([])

    // 菜单项
    const menus = ref([])

    // 路由列表
    const routes = ref([])

    // 添加插件
    const addPlugin = (plugin) => {
        const exists = plugins.value.find(p => p.id === plugin.id)
        if (!exists) {
            plugins.value.push(plugin)
            saveToStorage()
        }
    }

    // 获取插件
    const getPlugins = () => {
        return plugins.value
    }

    // 更新插件
    const updatePlugin = (id, updates) => {
        const index = plugins.value.findIndex(p => p.id === id)
        if (index !== -1) {
            plugins.value[index] = { ...plugins.value[index], ...updates }
            saveToStorage()
        }
    }

    // 移除插件
    const removePlugin = (id) => {
        const index = plugins.value.findIndex(p => p.id === id)
        if (index !== -1) {
            plugins.value.splice(index, 1)
            saveToStorage()
        }
    }

    // 添加菜单
    const addMenus = (newMenus) => {
        newMenus.forEach(menu => {
            const exists = menus.value.find(m => m.path === menu.path)
            if (!exists) {
                menus.value.push(menu)
            }
        })
        menus.value.sort((a, b) => (a.order || 0) - (b.order || 0))
        saveToStorage()
    }

    // 移除插件菜单
    const removePluginMenus = (pluginId) => {
        menus.value = menus.value.filter(menu => !menu.pluginId || menu.pluginId !== pluginId)
        saveToStorage()
    }

    // 添加路由
    const addRoute = (route) => {
        const exists = routes.value.find(r => r.name === route.name)
        if (!exists) {
            routes.value.push(route)
        }
    }

    // 移除路由
    const removeRoute = (routeName) => {
        const index = routes.value.findIndex(r => r.name === routeName)
        if (index !== -1) {
            routes.value.splice(index, 1)
        }
    }

    // 保存到 localStorage
    const saveToStorage = () => {
        const data = {
            plugins: plugins.value,
            menus: menus.value,
            routes: routes.value
        }
        localStorage.setItem('vue-plugins', JSON.stringify(data))
    }

    // 从 localStorage 加载
    const loadFromStorage = () => {
        const data = localStorage.getItem('vue-plugins')
        if (data) {
            try {
                const parsed = JSON.parse(data)
                plugins.value = parsed.plugins || []
                menus.value = parsed.menus || []
                routes.value = parsed.routes || []
            } catch (error) {
                console.error('加载插件数据失败:', error)
            }
        }
    }

    // 初始化时加载
    loadFromStorage()

    return {
        plugins,
        menus,
        routes,
        addPlugin,
        getPlugins,
        updatePlugin,
        removePlugin,
        addMenus,
        removePluginMenus,
        addRoute,
        removeRoute,
        saveToStorage,
        loadFromStorage
    }
})