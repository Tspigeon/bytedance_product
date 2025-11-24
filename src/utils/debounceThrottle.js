/**
 * 防抖函数 - 在事件触发后等待一段时间才执行，如果在等待期间再次触发则重新计时
 * @param {Function} func - 需要防抖的函数
 * @param {number} delay - 延迟时间，单位毫秒
 * @param {boolean} immediate - 是否立即执行一次
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, delay = 300, immediate = false) {
  let timeoutId;
  
  return function (...args) {
    const context = this;
    
    // 清除之前的定时器
    if (timeoutId) clearTimeout(timeoutId);
    
    // 立即执行情况
    if (immediate) {
      const callNow = !timeoutId;
      timeoutId = setTimeout(() => {
        timeoutId = null;
      }, delay);
      if (callNow) func.apply(context, args);
    } else {
      // 非立即执行情况
      timeoutId = setTimeout(() => {
        func.apply(context, args);
      }, delay);
    }
  };
}

/**
 * 节流函数 - 在一定时间内只执行一次函数
 * @param {Function} func - 需要节流的函数
 * @param {number} limit - 限制时间，单位毫秒
 * @returns {Function} 节流后的函数
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  
  return function (...args) {
    const context = this;
    
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * 带尾调用的节流函数 - 确保最后一次调用也会执行
 * @param {Function} func - 需要节流的函数
 * @param {number} limit - 限制时间，单位毫秒
 * @returns {Function} 节流后的函数
 */
export function throttleWithTrailing(func, limit = 300) {
  let inThrottle, lastFunc, lastRan;
  
  return function (...args) {
    const context = this;
    
    if (!inThrottle) {
      func.apply(context, args);
      lastRan = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, Math.max(0, limit - (Date.now() - lastRan)));
    }
  };
}