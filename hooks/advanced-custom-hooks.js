import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// 1. useInfiniteScroll - Advanced infinite scrolling with intersection observer
export const useInfiniteScroll = (fetchMore, options = {}) => {
  const { threshold = 0.5, rootMargin = '50px' } = options;
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef();
  const targetRef = useRef();

  useEffect(() => {
    const handleIntersect = async (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loading) {
        setLoading(true);
        try {
          const moreData = await fetchMore();
          setHasMore(moreData.length > 0);
        } catch (error) {
          console.error('Error fetching more items:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersect, {
      threshold,
      rootMargin,
    });

    if (targetRef.current) {
      observerRef.current.observe(targetRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [fetchMore, hasMore, loading, threshold, rootMargin]);

  return { targetRef, loading, hasMore };
};

// 2. useStateWithHistory - State management with undo/redo functionality
export const useStateWithHistory = (initialValue) => {
  const [state, setState] = useState(initialValue);
  const [history, setHistory] = useState([initialValue]);
  const [pointer, setPointer] = useState(0);

  const undo = useCallback(() => {
    if (pointer > 0) {
      setPointer(pointer - 1);
      setState(history[pointer - 1]);
    }
  }, [pointer, history]);

  const redo = useCallback(() => {
    if (pointer < history.length - 1) {
      setPointer(pointer + 1);
      setState(history[pointer + 1]);
    }
  }, [pointer, history]);

  const set = useCallback((newState) => {
    const resolvedState = typeof newState === 'function' ? newState(state) : newState;
    setState(resolvedState);
    
    // Truncate future history and add new state
    const newHistory = [...history.slice(0, pointer + 1), resolvedState];
    setHistory(newHistory);
    setPointer(newHistory.length - 1);
  }, [state, history, pointer]);

  return [state, set, { undo, redo, history, pointer }];
};

// 3. useDragAndDrop - Advanced drag and drop functionality
export const useDragAndDrop = (initialItems) => {
  const [items, setItems] = useState(initialItems);
  const [draggedItem, setDraggedItem] = useState(null);

  const handleDragStart = useCallback((item) => {
    setDraggedItem(item);
  }, []);

  const handleDragOver = useCallback((event, targetItem) => {
    event.preventDefault();
    if (!draggedItem || draggedItem.id === targetItem.id) return;

    setItems((currentItems) => {
      const draggedIndex = currentItems.findIndex(item => item.id === draggedItem.id);
      const targetIndex = currentItems.findIndex(item => item.id === targetItem.id);
      
      const newItems = [...currentItems];
      newItems.splice(draggedIndex, 1);
      newItems.splice(targetIndex, 0, draggedItem);
      
      return newItems;
    });
  }, [draggedItem]);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
  }, []);

  return {
    items,
    setItems,
    draggedItem,
    handleDragStart,
    handleDragOver,
    handleDragEnd
  };
};

// 4. useWebSocket - Advanced WebSocket management with reconnection
export const useWebSocket = (url, options = {}) => {
  const {
    reconnectAttempts = 5,
    reconnectInterval = 1500,
    onMessage,
    onError,
    onClose,
    onOpen
  } = options;

  const [readyState, setReadyState] = useState(WebSocket.CONNECTING);
  const [messageHistory, setMessageHistory] = useState([]);
  const ws = useRef(null);
  const reconnectCount = useRef(0);

  const connect = useCallback(() => {
    ws.current = new WebSocket(url);

    ws.current.onopen = (event) => {
      setReadyState(WebSocket.OPEN);
      reconnectCount.current = 0;
      if (onOpen) onOpen(event);
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessageHistory(prev => [...prev, message]);
      if (onMessage) onMessage(message);
    };

    ws.current.onerror = (error) => {
      if (onError) onError(error);
    };

    ws.current.onclose = (event) => {
      setReadyState(WebSocket.CLOSED);
      if (onClose) onClose(event);

      if (reconnectCount.current < reconnectAttempts) {
        setTimeout(() => {
          reconnectCount.current += 1;
          connect();
        }, reconnectInterval);
      }
    };
  }, [url, reconnectAttempts, reconnectInterval, onMessage, onError, onClose, onOpen]);

  useEffect(() => {
    connect();
    return () => {
      ws.current?.close();
    };
  }, [connect]);

  const send = useCallback((data) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    }
  }, []);

  return { readyState, messageHistory, send };
};

// 5. useResponsiveGrid - Dynamic grid layout management
export const useResponsiveGrid = (items, containerWidth, minItemWidth = 200) => {
  const layout = useMemo(() => {
    const columns = Math.max(1, Math.floor(containerWidth / minItemWidth));
    const rows = Math.ceil(items.length / columns);
    const itemWidth = containerWidth / columns;
    
    return items.map((item, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;
      
      return {
        ...item,
        position: {
          x: col * itemWidth,
          y: row * itemWidth, // Assuming square items
          width: itemWidth,
          height: itemWidth
        }
      };
    });
  }, [items, containerWidth, minItemWidth]);

  return layout;
};

// 6. useAnimationFrame - Advanced animation frame management
export const useAnimationFrame = (callback, deps = []) => {
  const requestRef = useRef();
  const previousTimeRef = useRef();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const animate = (time) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;
        callbackRef.current(deltaTime);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, deps);
};

// 7. useCacheQuery - Sophisticated data caching with TTL
export const useCacheQuery = (queryFn, key, options = {}) => {
  const { ttl = 5 * 60 * 1000, staleTime = 0 } = options;
  const cache = useRef(new Map());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const cached = cache.current.get(key);
      const now = Date.now();

      if (cached && now - cached.timestamp < ttl) {
        if (now - cached.timestamp > staleTime) {
          // Stale-while-revalidate pattern
          setData(cached.data);
          try {
            const fresh = await queryFn();
            cache.current.set(key, { data: fresh, timestamp: now });
            setData(fresh);
          } catch (err) {
            console.error('Background refresh failed:', err);
          }
        } else {
          setData(cached.data);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const fresh = await queryFn();
        cache.current.set(key, { data: fresh, timestamp: now });
        setData(fresh);
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [queryFn, key, ttl, staleTime]);

  const invalidate = useCallback(() => {
    cache.current.delete(key);
  }, [key]);

  return { data, loading, error, invalidate };
};

// 8. useVirtualList - Virtual scrolling for large lists
export const useVirtualList = (items, options = {}) => {
  const { itemHeight = 50, overscan = 3, viewportHeight = 400 } = options;
  const [scrollTop, setScrollTop] = useState(0);
  
  const virtualItems = useMemo(() => {
    const visibleItems = Math.ceil(viewportHeight / itemHeight);
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(items.length, start + visibleItems + 2 * overscan);
    
    return items.slice(start, end).map((item, index) => ({
      item,
      index: start + index,
      offsetTop: (start + index) * itemHeight
    }));
  }, [items, itemHeight, overscan, viewportHeight, scrollTop]);

  const totalHeight = items.length * itemHeight;
  
  const onScroll = useCallback((event) => {
    setScrollTop(event.target.scrollTop);
  }, []);

  return {
    virtualItems,
    totalHeight,
    onScroll
  };
};

// 9. useBreakpoints - Advanced responsive design management
export const useBreakpoints = (breakpoints = {}) => {
  const defaultBreakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
    ...breakpoints
  };

  const getMatches = useCallback(() => {
    return Object.entries(defaultBreakpoints).reduce((acc, [key, value]) => {
      acc[key] = window.matchMedia(`(min-width: ${value}px)`).matches;
      return acc;
    }, {});
  }, [defaultBreakpoints]);

  const [matches, setMatches] = useState(getMatches());

  useEffect(() => {
    const handlers = [];
    
    Object.entries(defaultBreakpoints).forEach(([key, value]) => {
      const query = window.matchMedia(`(min-width: ${value}px)`);
      const handler = (e) => {
        setMatches(prev => ({
          ...prev,
          [key]: e.matches
        }));
      };
      
      query.addListener(handler);
      handlers.push({ query, handler });
    });

    return () => {
      handlers.forEach(({ query, handler }) => {
        query.removeListener(handler);
      });
    };
  }, [defaultBreakpoints]);

  return matches;
};

// 10. useKeyboardShortcuts - Advanced keyboard shortcuts management
export const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyPress = (event) => {
      const { key, ctrlKey, shiftKey, altKey } = event;
      
      for (const [shortcut, callback] of Object.entries(shortcuts)) {
        const keys = shortcut.toLowerCase().split('+');
        const modifiers = {
          ctrl: keys.includes('ctrl'),
          shift: keys.includes('shift'),
          alt: keys.includes('alt')
        };
        
        const mainKey = keys.find(k => !['ctrl', 'shift', 'alt'].includes(k));
        
        if (
          key.toLowerCase() === mainKey &&
          ctrlKey === modifiers.ctrl &&
          shiftKey === modifiers.shift &&
          altKey === modifiers.alt
        ) {
          event.preventDefault();
          callback(event);
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [shortcuts]);
};
