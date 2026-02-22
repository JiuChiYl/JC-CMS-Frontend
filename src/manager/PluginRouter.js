// src/plugins/manager/PluginRouter.js
import { usePluginStore } from '../store/pluginStore'

export class PluginRouter {
    constructor() {
        this.router = null
    }

    setRouter(router) {
        this.router = router
    }

    addRoutes(routes) {
        if (!this.router) {
            throw new Error('Router 未初始化')
        }

        routes.forEach(route => {
            try {
                // 添加路由
                this.router.addRoute(route)

                // 保存路由信息到 store
                const store = usePluginStore()
                store.addRoute(route)

                console.log(`路由添加成功: ${route.path}`)
            } catch (error) {
                console.error(`添加路由失败 ${route.path}:`, error)
            }
        })
    }

    removeRoute(routeName) {
        if (!this.router) return

        try {
            this.router.removeRoute(routeName)

            const store = usePluginStore()
            store.removeRoute(routeName)

            console.log(`路由移除成功: ${routeName}`)
        } catch (error) {
            console.error(`移除路由失败 ${routeName}:`, error)
        }
    }

    getRoutes() {
        return this.router ? this.router.getRoutes() : []
    }
}