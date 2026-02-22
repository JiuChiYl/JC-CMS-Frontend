// src/plugins/utils/security.js
// 简单的XSS过滤
export function sanitizeHtml(html) {
    const div = document.createElement('div')
    div.textContent = html
    return div.innerHTML
}

// 验证URL安全性
export function isSafeUrl(url) {
    try {
        const parsed = new URL(url)
        const safeProtocols = ['http:', 'https:', 'data:']
        return safeProtocols.includes(parsed.protocol)
    } catch {
        return false
    }
}

// 创建安全的上下文
export function createSafeContext(allowedApis = []) {
    const context = {}

    // 基本的安全API
    const safeApis = {
        console: {
            log: (...args) => console.log('[Safe]', ...args),
            error: (...args) => console.error('[Safe]', ...args),
            warn: (...args) => console.warn('[Safe]', ...args)
        },
        Math: Math,
        JSON: JSON,
        Date: Date
    }

    // 添加允许的API
    allowedApis.forEach(api => {
        if (window[api] && typeof window[api] === 'function') {
            safeApis[api] = window[api].bind(window)
        }
    })

    return new Proxy(context, {
        get(target, prop) {
            if (prop in safeApis) {
                return safeApis[prop]
            }
            throw new Error(`不允许访问: ${prop}`)
        },
        set() {
            throw new Error('不允许修改上下文')
        }
    })
}