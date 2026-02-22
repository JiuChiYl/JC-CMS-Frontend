// src/manager/PluginLoader.js
export class PluginLoader {
    constructor() {
        this.sandboxIframe = null
        this.createSandbox()
    }

    createSandbox() {
        // 创建沙箱 iframe 用于安全执行插件代码
        this.sandboxIframe = document.createElement('iframe')
        this.sandboxIframe.style.display = 'none'
        this.sandboxIframe.sandbox = 'allow-scripts'
        document.body.appendChild(this.sandboxIframe)
    }

    async loadPlugin(pluginData) {
        const { entry, manifest, assets } = pluginData

        try {
            console.log('开始加载插件:', manifest.name)

            // 方法1: 使用动态 import（推荐）
            const pluginModule = await this.loadWithDynamicImport(entry, manifest)

            // 方法2: 使用 eval（备用方案）
            // const pluginModule = await this.loadWithEval(entry, manifest)

            return pluginModule
        } catch (error) {
            console.error('加载插件模块失败:', error)
            throw new Error(`插件加载失败: ${error.message}`)
        }
    }

    // 使用动态 import 加载 ES6 模块
    async loadWithDynamicImport(code, manifest) {
        try {
            // 1. 创建一个包含模块代码的 Blob
            const moduleCode = this.wrapAsESModule(code, manifest)
            const blob = new Blob([moduleCode], { type: 'application/javascript' })
            const url = URL.createObjectURL(blob)

            // 2. 使用动态 import 导入模块
            const module = await import(/* webpackIgnore: true */ url)

            // 3. 清理 URL
            URL.revokeObjectURL(url)

            // 4. 验证模块结构
            return this.validateModule(module, manifest)
        } catch (error) {
            console.error('动态 import 失败:', error)

            // 如果动态 import 失败，尝试使用 eval
            return this.loadWithEval(code, manifest)
        }
    }

    // 将代码包装为 ES 模块
    wrapAsESModule(code, manifest) {
        // 检查代码是否已经是 ES 模块格式
        if (code.includes('export default') || code.includes('export const') || code.includes('export function')) {
            // 已经是 ES 模块，直接返回
            return code
        }

        // 检查是否是 CommonJS 格式
        if (code.includes('module.exports') || (code.includes('exports.') && code.includes('require('))) {
            // CommonJS 格式，转换为 ES 模块
            return `
        const module = { exports: {} };
        const exports = module.exports;
        
        ${code}
        
        export default module.exports;
      `
        }

        // 默认包装为 ES 模块
        return `
      // 插件: ${manifest.name} v${manifest.version}
      
      const plugin = (function() {
        ${code}
      })();
      
      export default plugin;
    `
    }

    // 使用 eval 加载（兼容方案）
    async loadWithEval(code, manifest) {
        try {
            // 包装代码为 CommonJS 风格
            const moduleCode = this.wrapAsCommonJS(code, manifest)
            const pluginModule = this.evaluateModule(moduleCode, manifest)
            return this.validateModule({ default: pluginModule }, manifest)
        } catch (error) {
            console.error('eval 加载失败:', error)
            throw new Error(`插件代码执行失败: ${error.message}`)
        }
    }

    // 包装为 CommonJS 格式
    wrapAsCommonJS(code, manifest) {
        return `
      (function() {
        const exports = {};
        const module = { exports };
        
        // 提供安全的 API
        const defineExposure = {
          console: {
            log: (...args) => console.log('[Plugin]', ...args),
            error: (...args) => console.error('[Plugin]', ...args),
            warn: (...args) => console.warn('[Plugin]', ...args),
            info: (...args) => console.info('[Plugin]', ...args)
          },
          manifest: ${JSON.stringify(manifest)},
          // 添加其他安全的全局变量
          Date: Date,
          Math: Math,
          JSON: JSON,
          Promise: Promise,
          setTimeout: setTimeout,
          clearTimeout: clearTimeout,
          setInterval: setInterval,
          clearInterval: clearInterval
        };
        
        // 注入安全的全局变量
        Object.keys(defineExposure).forEach(key => {
          globalThis[key] = defineExposure[key];
        });
        
        // 执行插件代码
        try {
          ${code}
        } catch (error) {
          console.error('插件执行错误:', error);
          throw error;
        }
        
        // 返回模块导出
        return module.exports;
      })()
    `
    }

    // 执行模块代码
    evaluateModule(code, manifest) {
        try {
            // 使用 Function 构造函数创建执行上下文
            const execute = new Function('globalThis', `
        "use strict";
        
        // 创建安全的上下文
        const safeContext = Object.create(null);
        
        // 允许的安全 API
        const allowedGlobals = {
          console: {
            log: (...args) => console.log('[Plugin]', ...args),
            error: (...args) => console.error('[Plugin]', ...args),
            warn: (...args) => console.warn('[Plugin]', ...args),
            info: (...args) => console.info('[Plugin]', ...args)
          },
          Date: Date,
          Math: Math,
          JSON: JSON,
          Array: Array,
          Object: Object,
          String: String,
          Number: Number,
          Boolean: Boolean,
          RegExp: RegExp,
          Error: Error,
          TypeError: TypeError,
          RangeError: RangeError,
          Promise: Promise,
          setTimeout: setTimeout,
          clearTimeout: clearTimeout,
          setInterval: setInterval,
          clearInterval: clearInterval,
          manifest: ${JSON.stringify(manifest)}
        };
        
        // 将允许的全局变量添加到安全上下文
        Object.keys(allowedGlobals).forEach(key => {
          safeContext[key] = allowedGlobals[key];
        });
        
        // 使用 with 语句限制作用域（注意：严格模式下不能使用 with）
        // 改为将安全上下文作为变量注入
        const __safeContext__ = safeContext;
        
        // 执行代码
        return (function(__safeContext__) {
          // 将安全上下文中的变量作为局部变量
          const console = __safeContext__.console;
          const Date = __safeContext__.Date;
          const Math = __safeContext__.Math;
          const JSON = __safeContext__.JSON;
          const Array = __safeContext__.Array;
          const Object = __safeContext__.Object;
          const String = __safeContext__.String;
          const Number = __safeContext__.Number;
          const Boolean = __safeContext__.Boolean;
          const RegExp = __safeContext__.RegExp;
          const Error = __safeContext__.Error;
          const TypeError = __safeContext__.TypeError;
          const RangeError = __safeContext__.RangeError;
          const Promise = __safeContext__.Promise;
          const setTimeout = __safeContext__.setTimeout;
          const clearTimeout = __safeContext__.clearTimeout;
          const setInterval = __safeContext__.setInterval;
          const clearInterval = __safeContext__.clearInterval;
          const manifest = __safeContext__.manifest;
          
          // 执行插件代码
          ${code}
        })(__safeContext__);
      `)

            // 执行代码
            const result = execute(globalThis)
            return result
        } catch (error) {
            console.error('执行模块代码失败:', error)
            throw error
        }
    }

    // 验证模块结构
    validateModule(module, manifest) {
        // 检查模块是否有默认导出
        if (!module.default) {
            // 如果没有默认导出，尝试查找可能的导出
            const possibleExports = Object.keys(module)

            if (possibleExports.length === 1) {
                // 如果只有一个导出，使用它作为默认导出
                const key = possibleExports[0]
                return { default: module[key] }
            } else if (possibleExports.length > 1) {
                // 如果有多个导出，检查是否有符合插件结构的导出
                const pluginKeys = ['install', 'config', 'manifest']
                const pluginExport = possibleExports.find(key => {
                    const value = module[key]
                    return value &&
                        (typeof value === 'object' || typeof value === 'function') &&
                        pluginKeys.some(k => value[k] !== undefined)
                })

                if (pluginExport) {
                    return { default: module[pluginExport] }
                }
            }

            throw new Error('插件必须有一个默认导出')
        }

        // 检查默认导出是否包含必需的插件结构
        const plugin = module.default

        if (typeof plugin !== 'object' && typeof plugin !== 'function') {
            throw new Error('插件默认导出必须是对象或函数')
        }

        // 如果是函数，假设它是安装函数
        if (typeof plugin === 'function') {
            return {
                default: {
                    install: plugin,
                    config: {},
                    manifest: manifest
                }
            }
        }

        // 如果是对象，确保它有 install 方法或 config
        if (typeof plugin === 'object') {
            const enhancedPlugin = { ...plugin }

            // 确保有 manifest
            if (!enhancedPlugin.manifest) {
                enhancedPlugin.manifest = manifest
            }

            // 确保有 config
            if (!enhancedPlugin.config) {
                enhancedPlugin.config = {}
            }

            return { default: enhancedPlugin }
        }

        return module
    }

    // 从代码加载插件（用于从存储加载）
    async loadPluginFromCode(code, manifest) {
        try {
            return await this.loadWithDynamicImport(code, manifest)
        } catch (error) {
            console.error('从代码加载插件失败:', error)
            throw new Error(`从代码加载插件失败: ${error.message}`)
        }
    }

    // 验证代码安全性
    validateCodeSafety(code) {
        // 简单的代码安全检查
        const dangerousPatterns = [
            /document\.cookie/i,
            /localStorage\.setItem/i,
            /sessionStorage\.setItem/i,
            /eval\s*\(/i,
            /Function\s*\(/i,
            /script\.src/i,
            /<iframe/i,
            /window\.open/i,
            /fetch\s*\([^)]*['"][^'"]*['"][^)]*\)/i,
            /XMLHttpRequest/i,
            /new ActiveXObject/i,
            /<script[^>]*>/i,
            /<\/script>/i,
            /javascript:/i,
            /data:/i,
            /vbscript:/i
        ]

        const issues = []

        for (const pattern of dangerousPatterns) {
            if (pattern.test(code)) {
                issues.push(`插件代码包含危险操作: ${pattern}`)
            }
        }

        if (issues.length > 0) {
            console.warn('代码安全检查发现以下问题:', issues)
            // 在生产环境中，可以抛出错误
            // throw new Error(`插件代码包含危险操作: ${issues.join(', ')}`)
        }

        return {
            safe: issues.length === 0,
            issues
        }
    }
}