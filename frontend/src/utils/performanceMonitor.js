import { onCLS, onLCP, onFCP, onTTFB, onINP } from 'web-vitals'

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      webVitals: {},
      memory: {},
      network: {},
      bundle: {},
      react: {
        renderCount: 0,
        slowRenders: []
      }
    }
    this.listeners = []
    this.initialized = false
  }

  initialize() {
    if (this.initialized) return
    this.initialized = true

    // Track Web Vitals
    this.trackWebVitals()

    // Track memory usage
    this.trackMemory()

    // Track network performance
    this.trackNetwork()

    // Track bundle size
    this.trackBundle()
  }

  trackWebVitals() {
    onCLS((metric) => {
      this.metrics.webVitals.cls = {
        value: metric.value,
        rating: metric.rating,
        name: 'Cumulative Layout Shift'
      }
      this.notifyListeners()
    })

    onLCP((metric) => {
      this.metrics.webVitals.lcp = {
        value: metric.value,
        rating: metric.rating,
        name: 'Largest Contentful Paint'
      }
      this.notifyListeners()
    })

    onFCP((metric) => {
      this.metrics.webVitals.fcp = {
        value: metric.value,
        rating: metric.rating,
        name: 'First Contentful Paint'
      }
      this.notifyListeners()
    })

    onTTFB((metric) => {
      this.metrics.webVitals.ttfb = {
        value: metric.value,
        rating: metric.rating,
        name: 'Time to First Byte'
      }
      this.notifyListeners()
    })

    onINP((metric) => {
      this.metrics.webVitals.inp = {
        value: metric.value,
        rating: metric.rating,
        name: 'Interaction to Next Paint'
      }
      this.notifyListeners()
    })
  }

  trackMemory() {
    if (performance.memory) {
      const updateMemory = () => {
        this.metrics.memory = {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
          usedMB: (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2),
          totalMB: (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2),
          limitMB: (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2),
          percentUsed: ((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100).toFixed(1)
        }
        this.notifyListeners()
      }

      updateMemory()
      setInterval(updateMemory, 5000) // Update every 5 seconds
    } else {
      this.metrics.memory = {
        supported: false,
        message: 'Memory API not available (try Chrome with --enable-precise-memory-info)'
      }
    }
  }

  trackNetwork() {
    if (performance.getEntriesByType) {
      const navigation = performance.getEntriesByType('navigation')[0]
      if (navigation) {
        this.metrics.network = {
          dnsLookup: (navigation.domainLookupEnd - navigation.domainLookupStart).toFixed(2),
          tcpConnection: (navigation.connectEnd - navigation.connectStart).toFixed(2),
          requestTime: (navigation.responseEnd - navigation.requestStart).toFixed(2),
          responseTime: (navigation.responseEnd - navigation.responseStart).toFixed(2),
          domLoad: (navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart).toFixed(2),
          pageLoad: (navigation.loadEventEnd - navigation.loadEventStart).toFixed(2),
          totalLoadTime: (navigation.loadEventEnd - navigation.fetchStart).toFixed(2)
        }
        this.notifyListeners()
      }
    }
  }

  trackBundle() {
    if (performance.getEntriesByType) {
      const resources = performance.getEntriesByType('resource')
      const jsResources = resources.filter(r => r.name.endsWith('.js'))
      const cssResources = resources.filter(r => r.name.endsWith('.css'))

      const totalJSSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0)
      const totalCSSSize = cssResources.reduce((sum, r) => sum + (r.transferSize || 0), 0)

      this.metrics.bundle = {
        jsFiles: jsResources.length,
        cssFiles: cssResources.length,
        totalJS: (totalJSSize / 1024).toFixed(2) + ' KB',
        totalCSS: (totalCSSSize / 1024).toFixed(2) + ' KB',
        totalSize: ((totalJSSize + totalCSSSize) / 1024).toFixed(2) + ' KB',
        largestJS: jsResources.length > 0
          ? (Math.max(...jsResources.map(r => r.transferSize || 0)) / 1024).toFixed(2) + ' KB'
          : '0 KB'
      }
      this.notifyListeners()
    }
  }

  trackReactRender(componentName, duration) {
    this.metrics.react.renderCount++

    if (duration > 16) { // Slower than 60fps (16.67ms per frame)
      this.metrics.react.slowRenders.push({
        component: componentName,
        duration: duration.toFixed(2),
        timestamp: Date.now()
      })

      // Keep only last 10 slow renders
      if (this.metrics.react.slowRenders.length > 10) {
        this.metrics.react.slowRenders.shift()
      }
    }

    this.notifyListeners()
  }

  getMetrics() {
    return this.metrics
  }

  subscribe(listener) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.metrics))
  }

  getRating(value, thresholds) {
    if (value <= thresholds.good) return 'good'
    if (value <= thresholds.needs_improvement) return 'needs-improvement'
    return 'poor'
  }

  getRecommendations() {
    const recommendations = []

    // Check Web Vitals
    if (this.metrics.webVitals.lcp?.value > 2500) {
      recommendations.push({
        type: 'warning',
        metric: 'LCP',
        message: 'Largest Contentful Paint is slow. Consider optimizing images and reducing server response time.',
        value: `${(this.metrics.webVitals.lcp.value / 1000).toFixed(2)}s`
      })
    }

    if (this.metrics.webVitals.inp?.value > 200) {
      recommendations.push({
        type: 'warning',
        metric: 'INP',
        message: 'Interaction to Next Paint is high. Reduce JavaScript execution time and split long tasks.',
        value: `${this.metrics.webVitals.inp.value.toFixed(0)}ms`
      })
    }

    if (this.metrics.webVitals.cls?.value > 0.1) {
      recommendations.push({
        type: 'warning',
        metric: 'CLS',
        message: 'Cumulative Layout Shift detected. Add size attributes to images and reserve space for dynamic content.',
        value: this.metrics.webVitals.cls.value.toFixed(3)
      })
    }

    // Check Memory
    if (this.metrics.memory.percentUsed > 80) {
      recommendations.push({
        type: 'error',
        metric: 'Memory',
        message: 'High memory usage detected. Consider unmounting unused components and clearing cached data.',
        value: `${this.metrics.memory.percentUsed}%`
      })
    } else if (this.metrics.memory.percentUsed > 60) {
      recommendations.push({
        type: 'warning',
        metric: 'Memory',
        message: 'Moderate memory usage. Monitor for memory leaks in long-running sessions.',
        value: `${this.metrics.memory.percentUsed}%`
      })
    }

    // Check slow renders
    if (this.metrics.react.slowRenders.length > 5) {
      recommendations.push({
        type: 'warning',
        metric: 'React Performance',
        message: `${this.metrics.react.slowRenders.length} slow renders detected. Consider memoization or component splitting.`,
        value: `${this.metrics.react.slowRenders.length} components`
      })
    }

    // Check bundle size
    const bundleSizeKB = parseFloat(this.metrics.bundle.totalSize)
    if (bundleSizeKB > 1000) {
      recommendations.push({
        type: 'warning',
        metric: 'Bundle Size',
        message: 'Large bundle size detected. Consider code splitting and lazy loading more components.',
        value: this.metrics.bundle.totalSize
      })
    }

    // If everything is good
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'success',
        metric: 'Overall',
        message: 'All client-side performance metrics are within acceptable ranges.',
        value: '✓'
      })
    }

    return recommendations
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor()

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  performanceMonitor.initialize()
}

export default performanceMonitor
