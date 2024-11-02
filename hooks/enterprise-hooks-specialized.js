import { useState, useEffect, useRef, useCallback, useMemo, useLayoutEffect } from 'react';

// 1. useTransactionalState - Atomic state updates with rollback capability
export const useTransactionalState = (initialState, options = {}) => {
  const {
    maxHistory = 50,
    persistenceKey,
    optimisticUpdates = true
  } = options;

  const [state, setState] = useState(initialState);
  const transactionLog = useRef([]);
  const pendingTransactions = useRef(new Map());
  const snapshot = useRef(null);

  const createTransaction = useCallback((changes) => {
    const transactionId = crypto.randomUUID();
    const timestamp = Date.now();

    // Create transaction record
    const transaction = {
      id: transactionId,
      changes,
      timestamp,
      previousState: structuredClone(state),
      status: 'pending'
    };

    // Apply optimistic updates if enabled
    if (optimisticUpdates) {
      setState(prevState => ({
        ...prevState,
        ...changes
      }));
    }

    pendingTransactions.current.set(transactionId, transaction);
    return transactionId;
  }, [state, optimisticUpdates]);

  const commitTransaction = useCallback(async (transactionId) => {
    const transaction = pendingTransactions.current.get(transactionId);
    if (!transaction) throw new Error('Transaction not found');

    try {
      // Persist changes if needed
      if (persistenceKey) {
        await localStorage.setItem(
          `${persistenceKey}_${transactionId}`,
          JSON.stringify(transaction.changes)
        );
      }

      // Update state if not already updated optimistically
      if (!optimisticUpdates) {
        setState(prevState => ({
          ...prevState,
          ...transaction.changes
        }));
      }

      // Update transaction status
      transaction.status = 'committed';
      transactionLog.current = [
        transaction,
        ...transactionLog.current
      ].slice(0, maxHistory);

      pendingTransactions.current.delete(transactionId);

      return true;
    } catch (error) {
      await rollbackTransaction(transactionId);
      throw error;
    }
  }, [persistenceKey, optimisticUpdates, maxHistory]);

  const rollbackTransaction = useCallback(async (transactionId) => {
    const transaction = pendingTransactions.current.get(transactionId);
    if (!transaction) throw new Error('Transaction not found');

    // Restore previous state
    setState(transaction.previousState);

    // Clean up persistence if needed
    if (persistenceKey) {
      await localStorage.removeItem(`${persistenceKey}_${transactionId}`);
    }

    transaction.status = 'rolled_back';
    transactionLog.current = [
      transaction,
      ...transactionLog.current
    ].slice(0, maxHistory);

    pendingTransactions.current.delete(transactionId);
  }, [persistenceKey, maxHistory]);

  const createSnapshot = useCallback(() => {
    snapshot.current = {
      state: structuredClone(state),
      timestamp: Date.now()
    };
  }, [state]);

  const restoreSnapshot = useCallback(() => {
    if (snapshot.current) {
      setState(snapshot.current.state);
      return true;
    }
    return false;
  }, []);

  return {
    state,
    createTransaction,
    commitTransaction,
    rollbackTransaction,
    pendingTransactions: Array.from(pendingTransactions.current.values()),
    transactionHistory: transactionLog.current,
    createSnapshot,
    restoreSnapshot
  };
};

// 2. useVirtualizedTree - Advanced tree visualization with dynamic loading
export const useVirtualizedTree = (options = {}) => {
  const {
    itemHeight = 30,
    overscan = 5,
    loadChildren,
    cacheSize = 500,
    preloadDepth = 2
  } = options;

  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [virtualItems, setVirtualItems] = useState([]);
  const [totalHeight, setTotalHeight] = useState(0);
  const nodeCache = useRef(new Map());
  const loadingNodes = useRef(new Set());
  const flattenedNodes = useRef([]);

  const calculateVisibleNodes = useCallback((scrollTop, viewportHeight) => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      flattenedNodes.current.length - 1,
      Math.ceil((scrollTop + viewportHeight) / itemHeight) + overscan
    );

    return flattenedNodes.current
      .slice(startIndex, endIndex + 1)
      .map((node, index) => ({
        ...node,
        index: startIndex + index,
        offsetTop: (startIndex + index) * itemHeight
      }));
  }, [itemHeight, overscan]);

  const preloadNode = useCallback(async (nodeId, depth = 0) => {
    if (depth >= preloadDepth || loadingNodes.current.has(nodeId)) return;
    
    loadingNodes.current.add(nodeId);
    try {
      const children = await loadChildren(nodeId);
      nodeCache.current.set(nodeId, children);
      
      // Preload next level
      await Promise.all(
        children.map(child => preloadNode(child.id, depth + 1))
      );
    } finally {
      loadingNodes.current.delete(nodeId);
    }
  }, [loadChildren, preloadDepth]);

  const toggleNode = useCallback(async (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
      
      // Load children if not in cache
      if (!nodeCache.current.has(nodeId)) {
        await preloadNode(nodeId);
      }
    }
    
    setExpandedNodes(newExpanded);
  }, [expandedNodes, preloadNode]);

  // Cache maintenance
  useEffect(() => {
    if (nodeCache.current.size > cacheSize) {
      const entries = Array.from(nodeCache.current.entries());
      const sortedEntries = entries.sort((a, b) => b[1].lastAccessed - a[1].lastAccessed);
      
      const entriesToRemove = sortedEntries.slice(cacheSize);
      entriesToRemove.forEach(([key]) => nodeCache.current.delete(key));
    }
  }, [cacheSize]);

  return {
    virtualItems,
    totalHeight,
    toggleNode,
    isExpanded: (nodeId) => expandedNodes.has(nodeId),
    isLoading: (nodeId) => loadingNodes.current.has(nodeId),
    getChildren: (nodeId) => nodeCache.current.get(nodeId),
    updateScroll: (scrollTop, viewportHeight) => {
      setVirtualItems(calculateVisibleNodes(scrollTop, viewportHeight));
    }
  };
};

// 3. useMetricsCollector - Advanced performance and usage metrics collection
export const useMetricsCollector = (options = {}) => {
  const {
    sampleRate = 0.1,
    metricsEndpoint,
    bufferSize = 100,
    flushInterval = 5000,
    dimensions = {}
  } = options;

  const metricsBuffer = useRef([]);
  const performanceMarks = useRef(new Map());
  const customMetrics = useRef(new Map());

  const shouldSample = useCallback(() => {
    return Math.random() < sampleRate;
  }, [sampleRate]);

  const addMetric = useCallback((name, value, tags = {}) => {
    if (!shouldSample()) return;

    const metric = {
      name,
      value,
      timestamp: Date.now(),
      tags: { ...dimensions, ...tags }
    };

    metricsBuffer.current.push(metric);

    if (metricsBuffer.current.length >= bufferSize) {
      flushMetrics();
    }
  }, [shouldSample, dimensions, bufferSize]);

  const startMeasurement = useCallback((name) => {
    performanceMarks.current.set(name, performance.now());
  }, []);

  const endMeasurement = useCallback((name, tags = {}) => {
    const startTime = performanceMarks.current.get(name);
    if (startTime) {
      const duration = performance.now() - startTime;
      addMetric(`${name}_duration`, duration, tags);
      performanceMarks.current.delete(name);
    }
  }, [addMetric]);

  const trackCustomMetric = useCallback((name, value) => {
    const metric = customMetrics.current.get(name) || {
      count: 0,
      sum: 0,
      min: Infinity,
      max: -Infinity
    };

    metric.count++;
    metric.sum += value;
    metric.min = Math.min(metric.min, value);
    metric.max = Math.max(metric.max, value);
    
    customMetrics.current.set(name, metric);
  }, []);

  const flushMetrics = useCallback(async () => {
    if (metricsBuffer.current.length === 0) return;

    const metrics = [...metricsBuffer.current];
    metricsBuffer.current = [];

    // Add custom metrics aggregates
    customMetrics.current.forEach((metric, name) => {
      metrics.push({
        name: `${name}_avg`,
        value: metric.sum / metric.count,
        timestamp: Date.now(),
        tags: dimensions
      });
      metrics.push({
        name: `${name}_count`,
        value: metric.count,
        timestamp: Date.now(),
        tags: dimensions
      });
    });

    if (metricsEndpoint) {
      try {
        await fetch(metricsEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(metrics)
        });
      } catch (error) {
        console.error('Failed to flush metrics:', error);
      }
    }
  }, [metricsEndpoint, dimensions]);

  // Set up periodic flushing
  useEffect(() => {
    const intervalId = setInterval(flushMetrics, flushInterval);
    return () => {
      clearInterval(intervalId);
      flushMetrics();
    };
  }, [flushMetrics, flushInterval]);

  return {
    addMetric,
    startMeasurement,
    endMeasurement,
    trackCustomMetric,
    flushMetrics,
    getMetricsSnapshot: () => ({
      bufferedMetrics: [...metricsBuffer.current],
      customMetrics: new Map(customMetrics.current)
    })
  };
};

// 4. useDynamicStylesheet - Dynamic CSS-in-JS with optimized updates
export const useDynamicStylesheet = (options = {}) => {
  const {
    prefix = 'dynamic',
    optimizationLevel = 1,
    maxRules = 1000,
    useStyleTags = false
  } = options;

  const styleSheet = useRef(null);
  const ruleCache = useRef(new Map());
  const insertQueue = useRef([]);
  const styleElement = useRef(null);

  // Initialize stylesheet
  useLayoutEffect(() => {
    if (useStyleTags) {
      styleElement.current = document.createElement('style');
      document.head.appendChild(styleElement.current);
    } else {
      const style = document.createElement('style');
      document.head.appendChild(style);
      styleSheet.current = style.sheet;
    }

    return () => {
      if (styleElement.current) {
        styleElement.current.remove();
      }
    };
  }, [useStyleTags]);

  const generateClassName = useCallback((rules) => {
    const hash = Object.entries(rules).sort().reduce((acc, [key, value]) => {
      return acc + key + value;
    }, '');

    return `${prefix}-${hash.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0) | 0;
    }, 0).toString(36)}`;
  }, [prefix]);

  const optimizeRules = useCallback((rules) => {
    if (optimizationLevel === 0) return rules;

    const optimized = { ...rules };

    if (optimizationLevel >= 1) {
      // Combine margin/padding
      const directions = ['top', 'right', 'bottom', 'left'];
      ['margin', 'padding'].forEach(property => {
        const values = directions.map(dir => optimized[`${property}-${dir}`]);
        if (values.every(v => v !== undefined)) {
          optimized[property] = values.join(' ');
          directions.forEach(dir => delete optimized[`${property}-${dir}`]);
        }
      });
    }

    if (optimizationLevel >= 2) {
      // Shorthand properties
      const borderProps = ['border-width', 'border-style', 'border-color'];
      if (borderProps.every(prop => optimized[prop])) {
        optimized.border = borderProps.map(prop => optimized[prop]).join(' ');
        borderProps.forEach(prop => delete optimized[prop]);
      }
    }

    return optimized;
  }, [optimizationLevel]);

  const insertRule = useCallback((className, rules) => {
    const optimizedRules = optimizeRules(rules);
    const ruleString = `.${className} { ${Object.entries(optimizedRules)
      .map(([key, value]) => `${key}: ${value};`)
      .join(' ')} }`;

    if (useStyleTags) {
      styleElement.current.textContent += ruleString;
    } else {
      try {
        const index = styleSheet.current.insertRule(ruleString, styleSheet.current.cssRules.length);
        ruleCache.current.set(className, index);
      } catch (error) {
        console.error('Failed to insert CSS rule:', error);
      }
    }
  }, [optimizeRules, useStyleTags]);

  const createStyles = useCallback((rules) => {
    const className = generateClassName(rules);

    if (!ruleCache.current.has(className)) {
      if (ruleCache.current.size >= maxRules) {
        // Remove oldest rules
        const entries = Array.from(ruleCache.current.entries());
        entries.slice(0, Math.floor(maxRules * 0.2)).forEach(([class_, index]) => {
          if (!useStyleTags) {
            styleSheet.current.deleteRule(index);
          }
          ruleCache.current.delete(class_);
        });
      }

      insertRule(className, rules);
    }

    return className;
  }, [generateClassName, maxRules, insertRule, useStyleTags]);

  return {
    createStyles,
    flush: () => {
      ruleCache.current.clear();
      if (useStyleTags) {
        styleElement.current.textContent = '';
      } else {
        while (styleSheet.current.cssRules.length > 0) {
          styleSheet.current.deleteRule(0);
        }
      }
    }
  };
};

export {
  useTransactionalState,
  useVirtualizedTree,
  useMetricsCollector,
  useDynamicStylesheet
};
