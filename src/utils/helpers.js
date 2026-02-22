// src/plugins/utils/helpers.js
// 生成唯一ID
export function generateId(prefix = 'plugin') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// 深拷贝
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj))
}

// 防抖函数
export function debounce(fn, delay) {
    let timer = null
    return function (...args) {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
            fn.apply(this, args)
        }, delay)
    }
}

// 节流函数
export function throttle(fn, delay) {
    let lastTime = 0
    return function (...args) {
        const now = Date.now()
        if (now - lastTime >= delay) {
            fn.apply(this, args)
            lastTime = now
        }
    }
}

// 验证对象结构
export function validateObject(obj, schema) {
    for (const key in schema) {
        if (schema[key].required && !obj.hasOwnProperty(key)) {
            return { valid: false, message: `缺少必需字段: ${key}` }
        }
        if (obj[key] && typeof obj[key] !== schema[key].type) {
            return { valid: false, message: `字段 ${key} 类型错误` }
        }
    }
    return { valid: true }
}