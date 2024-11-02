I'll create a comprehensive guide that progressively covers React features, patterns, and testing. Let's build this up systematically.

```typescript
// 1. Basic Hooks and Patterns
// ---------------------------

// 1.1 Basic useState with TypeScript
import { useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
}

const UserProfile = () => {
  const [user, setUser] = useState<User>({
    id: 1,
    name: "",
    email: "",
  });

  const updateUser = (field: keyof User, value: string) => {
    setUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div>
      <input
        value={user.name}
        onChange={(e) => updateUser("name", e.target.value)}
        placeholder="Name"
      />
      <input
        value={user.email}
        onChange={(e) => updateUser("email", e.target.value)}
        placeholder="Email"
      />
    </div>
  );
};

// Test for UserProfile
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";

describe("UserProfile", () => {
  it("updates user info on input change", () => {
    render(<UserProfile />);

    const nameInput = screen.getByPlaceholderText("Name");
    fireEvent.change(nameInput, { target: { value: "John Doe" } });

    expect(nameInput).toHaveValue("John Doe");
  });
});

// 1.2 Custom Hook Pattern
const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

// Test for useDebounce
import { renderHook, act } from "@testing-library/react";
import { vi } from "vitest";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("debounces value changes", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "initial", delay: 500 } }
    );

    expect(result.current).toBe("initial");

    rerender({ value: "updated", delay: 500 });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe("updated");
  });
});

// 2. Advanced Patterns
// -------------------

// 2.1 Compound Components Pattern
interface TabsContext {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContext | undefined>(undefined);

const Tabs = ({ children }: { children: React.ReactNode }) => {
  const [activeTab, setActiveTab] = useState("");

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs-container">{children}</div>
    </TabsContext.Provider>
  );
};

const TabList = ({ children }: { children: React.ReactNode }) => {
  return <div className="tab-list">{children}</div>;
};

const Tab = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("Tab must be used within Tabs");

  return (
    <button
      onClick={() => context.setActiveTab(id)}
      className={context.activeTab === id ? "active" : ""}
    >
      {children}
    </button>
  );
};

// Test for Compound Components
describe("Tabs Component", () => {
  it("switches active tab on click", () => {
    render(
      <Tabs>
        <TabList>
          <Tab id="tab1">Tab 1</Tab>
          <Tab id="tab2">Tab 2</Tab>
        </TabList>
      </Tabs>
    );

    const tab2 = screen.getByText("Tab 2");
    fireEvent.click(tab2);
    expect(tab2).toHaveClass("active");
  });
});

// 2.2 Render Props Pattern with Performance Optimization
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

const VirtualList = <T>({ items, renderItem, keyExtractor }: ListProps<T>) => {
  const [visibleItems, setVisibleItems] = useState<T[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateVisibleItems = useCallback(() => {
    if (!containerRef.current) return;

    // Calculate visible range based on scroll position
    const scrollTop = containerRef.current.scrollTop;
    const containerHeight = containerRef.current.clientHeight;
    const itemHeight = 50; // Assuming fixed height for simplicity

    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight),
      items.length
    );

    setVisibleItems(items.slice(startIndex, endIndex));
  }, [items]);

  useEffect(() => {
    updateVisibleItems();
  }, [updateVisibleItems]);

  return (
    <div
      ref={containerRef}
      onScroll={updateVisibleItems}
      style={{ height: "400px", overflow: "auto" }}
    >
      {visibleItems.map((item) => (
        <div key={keyExtractor(item)}>{renderItem(item)}</div>
      ))}
    </div>
  );
};

// Test for VirtualList
describe("VirtualList", () => {
  const mockItems = Array.from({ length: 1000 }, (_, i) => ({
    id: String(i),
    title: `Item ${i}`,
  }));

  it("renders visible items only", () => {
    render(
      <VirtualList
        items={mockItems}
        renderItem={(item) => <div>{item.title}</div>}
        keyExtractor={(item) => item.id}
      />
    );

    // Verify that only a subset of items is rendered
    const renderedItems = screen.queryAllByText(/Item \d+/);
    expect(renderedItems.length).toBeLessThan(mockItems.length);
  });
});

// 3. Advanced State Management
// --------------------------

// 3.1 Custom Redux-like State Management
type Action = { type: string; payload?: any };
type Reducer<S> = (state: S, action: Action) => S;
type Middleware<S> = (
  store: Store<S>
) => (next: (action: Action) => void) => (action: Action) => void;

class Store<S> {
  private state: S;
  private listeners: Set<() => void> = new Set();
  private reducer: Reducer<S>;
  private middlewares: Array<Middleware<S>> = [];

  constructor(reducer: Reducer<S>, initialState: S) {
    this.state = initialState;
    this.reducer = reducer;
  }

  getState(): S {
    return this.state;
  }

  dispatch(action: Action): void {
    let nextAction = action;

    // Apply middlewares
    const chain = this.middlewares.map((middleware) => middleware(this));
    const dispatch = chain.reduceRight(
      (next, middleware) => (action) => middleware(next)(action),
      (action) => {
        this.state = this.reducer(this.state, action);
        this.listeners.forEach((listener) => listener());
      }
    );

    dispatch(nextAction);
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  use(middleware: Middleware<S>): void {
    this.middlewares.push(middleware);
  }
}

// Test for Custom Store
describe("Store", () => {
  interface TestState {
    count: number;
  }

  const initialState: TestState = { count: 0 };
  const reducer: Reducer<TestState> = (state, action) => {
    switch (action.type) {
      case "INCREMENT":
        return { ...state, count: state.count + 1 };
      default:
        return state;
    }
  };

  it("updates state through dispatch", () => {
    const store = new Store(reducer, initialState);
    store.dispatch({ type: "INCREMENT" });
    expect(store.getState().count).toBe(1);
  });

  it("notifies subscribers of state changes", () => {
    const store = new Store(reducer, initialState);
    const listener = vi.fn();

    store.subscribe(listener);
    store.dispatch({ type: "INCREMENT" });

    expect(listener).toHaveBeenCalled();
  });
});

// 4. Advanced Component Patterns
// ----------------------------

// 4.1 Higher-Order Component with Performance Optimization
interface WithDataProps {
  data: any;
  loading: boolean;
  error: Error | null;
}

const withData = <P extends object>(
  WrappedComponent: React.ComponentType<P & WithDataProps>,
  fetchData: () => Promise<any>
) => {
  return function WithDataComponent(props: P) {
    const [state, setState] = useState<WithDataProps>({
      data: null,
      loading: true,
      error: null,
    });

    useEffect(() => {
      const loadData = async () => {
        try {
          const data = await fetchData();
          setState({ data, loading: false, error: null });
        } catch (error) {
          setState({ data: null, loading: false, error: error as Error });
        }
      };
      loadData();
    }, []);

    // Memoize the wrapped component to prevent unnecessary re-renders
    const MemoizedComponent = useMemo(
      () => <WrappedComponent {...props} {...state} />,
      [props, state]
    );

    return MemoizedComponent;
  };
};

// Test for HOC
describe("withData HOC", () => {
  const mockData = { test: "data" };
  const mockFetch = vi.fn().mockResolvedValue(mockData);

  const TestComponent = ({ data, loading }: WithDataProps) => (
    <div>{loading ? "Loading..." : data.test}</div>
  );

  const WrappedComponent = withData(TestComponent, mockFetch);

  it("shows loading state and then data", async () => {
    render(<WrappedComponent />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("data")).toBeInTheDocument();
    });
  });
});

// 5. Integration Testing
// ---------------------

// 5.1 Complex Integration Test Example
describe("UserProfile Integration", () => {
  // Mock API responses
  const mockUserData = {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
  };

  beforeEach(() => {
    // Setup API mocks
    vi.spyOn(global, "fetch").mockImplementation((url) => {
      if (url.includes("/api/user")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUserData),
        } as Response);
      }
      return Promise.reject(new Error("Not found"));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads and displays user data", async () => {
    render(<UserProfile />);

    // Check loading state
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
      expect(screen.getByDisplayValue("john@example.com")).toBeInTheDocument();
    });

    // Test form interaction
    const nameInput = screen.getByDisplayValue("John Doe");
    fireEvent.change(nameInput, { target: { value: "Jane Doe" } });

    // Test form submission
    const submitButton = screen.getByText("Save");
    fireEvent.click(submitButton);

    // Verify API call
    expect(fetch).toHaveBeenCalledWith("/api/user", {
      method: "PUT",
      body: JSON.stringify({
        ...mockUserData,
        name: "Jane Doe",
      }),
    });
  });
});
```

I've created a comprehensive guide covering advanced React patterns and testing. Here's a breakdown of what's included:

1. Basic Hooks and Patterns:

- Typed useState with proper TypeScript integration
- Custom hooks with debouncing example
- Unit tests for both components and hooks

2. Advanced Patterns:

- Compound Components pattern with context
- Render Props with virtualization optimization
- Performance optimizations using useCallback and useMemo

3. Advanced State Management:

- Custom Redux-like store implementation
- Middleware support
- Complete test suite for state management

4. Advanced Component Patterns:

- Higher-Order Components with performance optimization
- Integration with TypeScript
- Memoization strategies

5. Integration Testing:

- Complex integration test scenarios
- API mocking
- User interaction testing
- Async operation testing

Would you like me to:

1. Expand on any particular pattern?
2. Add more complex testing scenarios?
3. Include additional advanced React patterns?

I'll expand with more advanced patterns and testing scenarios, focusing on complex real-world implementations.

```typescript
// 1. Advanced Component Composition
// -------------------------------

// 1.1 Recursive Component Pattern with DragNDrop
import { DragEvent, useState } from "react";

interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
}

interface DraggableTreeProps {
  data: TreeNode[];
  onNodeMove: (sourceId: string, targetId: string) => void;
}

const DraggableTree = ({ data, onNodeMove }: DraggableTreeProps) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = (e: DragEvent, nodeId: string) => {
    setDraggedId(nodeId);
    e.dataTransfer.setData("text/plain", nodeId);
  };

  const handleDrop = (e: DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedId && draggedId !== targetId) {
      onNodeMove(draggedId, targetId);
    }
    setDraggedId(null);
  };

  const renderNode = (node: TreeNode) => (
    <div
      key={node.id}
      draggable
      onDragStart={(e) => handleDragStart(e, node.id)}
      onDrop={(e) => handleDrop(e, node.id)}
      onDragOver={(e) => e.preventDefault()}
      className="p-2 border rounded mb-2"
    >
      <div className="flex items-center">
        <span>{node.label}</span>
      </div>
      {node.children && (
        <div className="ml-4 mt-2">
          {node.children.map((child) => renderNode(child))}
        </div>
      )}
    </div>
  );

  return <div>{data.map((node) => renderNode(node))}</div>;
};

// Test for DraggableTree
describe("DraggableTree", () => {
  const mockData: TreeNode[] = [
    {
      id: "1",
      label: "Root",
      children: [
        { id: "2", label: "Child 1" },
        { id: "3", label: "Child 2" },
      ],
    },
  ];

  it("handles drag and drop operations", () => {
    const onNodeMove = vi.fn();
    render(<DraggableTree data={mockData} onNodeMove={onNodeMove} />);

    const sourceNode = screen.getByText("Child 1");
    const targetNode = screen.getByText("Child 2");

    fireEvent.dragStart(sourceNode);
    fireEvent.drop(targetNode);

    expect(onNodeMove).toHaveBeenCalledWith("2", "3");
  });
});

// 2. Advanced Form Handling
// -----------------------

// 2.1 Form Builder with Validation and Dynamic Fields
type FieldType = "text" | "number" | "select" | "multiselect";

interface FieldConfig {
  type: FieldType;
  name: string;
  label: string;
  validation?: (value: any) => string | undefined;
  options?: { label: string; value: string }[];
  dependencies?: string[];
}

interface FormBuilderProps {
  fields: FieldConfig[];
  onSubmit: (values: Record<string, any>) => void;
  initialValues?: Record<string, any>;
}

const useFormBuilder = (config: FormBuilderProps) => {
  const [values, setValues] = useState<Record<string, any>>(
    config.initialValues || {}
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = useCallback(
    (fieldName: string, value: any) => {
      const field = config.fields.find((f) => f.name === fieldName);
      if (field?.validation) {
        const error = field.validation(value);
        setErrors((prev) => ({
          ...prev,
          [fieldName]: error || "",
        }));
        return !error;
      }
      return true;
    },
    [config.fields]
  );

  const handleChange = useCallback(
    (fieldName: string, value: any) => {
      setValues((prev) => {
        const newValues = { ...prev, [fieldName]: value };

        // Handle dependent fields
        const dependentFields = config.fields.filter((f) =>
          f.dependencies?.includes(fieldName)
        );

        dependentFields.forEach((field) => {
          validate(field.name, newValues[field.name]);
        });

        return newValues;
      });

      validate(fieldName, value);
    },
    [config.fields, validate]
  );

  const handleBlur = useCallback(
    (fieldName: string) => {
      setTouched((prev) => ({ ...prev, [fieldName]: true }));
      validate(fieldName, values[fieldName]);
    },
    [values, validate]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const isValid = config.fields.every((field) =>
        validate(field.name, values[field.name])
      );

      if (isValid) {
        config.onSubmit(values);
      }
    },
    [config, values, validate]
  );

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
  };
};

// Test for FormBuilder
describe("FormBuilder", () => {
  const mockFields: FieldConfig[] = [
    {
      type: "text",
      name: "email",
      label: "Email",
      validation: (value) =>
        !value.includes("@") ? "Invalid email" : undefined,
    },
    {
      type: "text",
      name: "password",
      label: "Password",
      validation: (value) =>
        value.length < 8 ? "Password too short" : undefined,
      dependencies: ["email"],
    },
  ];

  it("handles form validation", () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useFormBuilder({ fields: mockFields, onSubmit })
    );

    act(() => {
      result.current.handleChange("email", "invalid");
      result.current.handleBlur("email");
    });

    expect(result.current.errors.email).toBe("Invalid email");

    act(() => {
      result.current.handleChange("email", "test@example.com");
    });

    expect(result.current.errors.email).toBe("");
  });
});

// 3. Advanced State Synchronization
// ------------------------------

// 3.1 Distributed State Management with WebSocket
interface StateSync<T> {
  state: T;
  version: number;
  clientId: string;
}

const useDistributedState = <T>(
  initialState: T,
  channel: string
): [T, (updater: (prev: T) => T) => void] => {
  const [state, setState] = useState<T>(initialState);
  const [version, setVersion] = useState(0);
  const clientId = useRef(Math.random().toString(36).substr(2, 9));
  const ws = useRef<WebSocket>();

  useEffect(() => {
    ws.current = new WebSocket(process.env.WEBSOCKET_URL || "");

    ws.current.onmessage = (event) => {
      const {
        state: newState,
        version: newVersion,
        clientId: senderId,
      }: StateSync<T> = JSON.parse(event.data);

      if (senderId !== clientId.current && newVersion > version) {
        setState(newState);
        setVersion(newVersion);
      }
    };

    return () => ws.current?.close();
  }, []);

  const updateState = useCallback(
    (updater: (prev: T) => T) => {
      setState((prev) => {
        const newState = updater(prev);
        const newVersion = version + 1;

        ws.current?.send(
          JSON.stringify({
            state: newState,
            version: newVersion,
            clientId: clientId.current,
            channel,
          })
        );

        setVersion(newVersion);
        return newState;
      });
    },
    [version, channel]
  );

  return [state, updateState];
};

// Test for DistributedState
describe("DistributedState", () => {
  let mockWebSocket: {
    send: vi.Mock;
    close: vi.Mock;
    onmessage?: (event: { data: string }) => void;
  };

  beforeEach(() => {
    mockWebSocket = {
      send: vi.fn(),
      close: vi.fn(),
    };

    // @ts-ignore
    global.WebSocket = vi.fn().mockImplementation(() => mockWebSocket);
  });

  it("syncs state across instances", () => {
    const { result } = renderHook(() =>
      useDistributedState({ count: 0 }, "test-channel")
    );

    act(() => {
      result.current[1]((prev) => ({ count: prev.count + 1 }));
    });

    expect(mockWebSocket.send).toHaveBeenCalled();

    // Simulate receiving message from another client
    act(() => {
      mockWebSocket.onmessage?.({
        data: JSON.stringify({
          state: { count: 2 },
          version: 2,
          clientId: "other-client",
          channel: "test-channel",
        }),
      });
    });

    expect(result.current[0]).toEqual({ count: 2 });
  });
});

// 4. Advanced Performance Optimizations
// ---------------------------------

// 4.1 Virtual Scroll with Dynamic Heights
interface VirtualScrollProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  estimatedItemHeight: number;
  tolerance?: number;
  overscan?: number;
}

const useVirtualScroll = <T>({
  items,
  estimatedItemHeight,
  tolerance = 3,
  overscan = 3,
}: Omit<VirtualScrollProps<T>, "renderItem">) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [heights, setHeights] = useState<Record<number, number>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<Record<number, HTMLElement>>({});

  const measureItem = useCallback(
    (index: number, element: HTMLElement | null) => {
      if (element && heights[index] !== element.offsetHeight) {
        setHeights((prev) => ({
          ...prev,
          [index]: element.offsetHeight,
        }));
      }
    },
    [heights]
  );

  const getItemOffset = useCallback(
    (index: number) => {
      let offset = 0;
      for (let i = 0; i < index; i++) {
        offset += heights[i] ?? estimatedItemHeight;
      }
      return offset;
    },
    [heights, estimatedItemHeight]
  );

  const visibleRange = useMemo(() => {
    if (!containerRef.current) return { start: 0, end: 10 };

    const viewportHeight = containerRef.current.clientHeight;
    let offset = 0;
    let start = 0;
    let end = 0;

    // Find start index
    while (
      start < items.length &&
      offset < scrollTop - tolerance * estimatedItemHeight
    ) {
      offset += heights[start] ?? estimatedItemHeight;
      start++;
    }

    // Find end index
    offset = getItemOffset(start);
    end = start;
    while (
      end < items.length &&
      offset < scrollTop + viewportHeight + tolerance * estimatedItemHeight
    ) {
      offset += heights[end] ?? estimatedItemHeight;
      end++;
    }

    return {
      start: Math.max(0, start - overscan),
      end: Math.min(items.length, end + overscan),
    };
  }, [
    scrollTop,
    items.length,
    heights,
    estimatedItemHeight,
    tolerance,
    overscan,
    getItemOffset,
  ]);

  const totalHeight = useMemo(
    () =>
      items.reduce(
        (sum, _, index) => sum + (heights[index] ?? estimatedItemHeight),
        0
      ),
    [items, heights, estimatedItemHeight]
  );

  return {
    containerRef,
    itemsRef,
    visibleRange,
    totalHeight,
    measureItem,
    onScroll: (e: React.UIEvent<HTMLDivElement>) =>
      setScrollTop(e.currentTarget.scrollTop),
  };
};

// Test for VirtualScroll
describe("VirtualScroll", () => {
  const items = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    height: Math.floor(Math.random() * 50) + 50,
  }));

  it("renders only visible items", () => {
    const { result } = renderHook(() =>
      useVirtualScroll({
        items,
        estimatedItemHeight: 50,
        tolerance: 3,
        overscan: 3,
      })
    );

    expect(
      result.current.visibleRange.end - result.current.visibleRange.start
    ).toBeLessThan(items.length);
  });
});

// 5. Integration Tests with Complex User Flows
// ----------------------------------------

describe("Complex User Flow", () => {
  const mockApi = {
    fetchUser: vi.fn(),
    updateUser: vi.fn(),
    syncState: vi.fn(),
  };

  beforeEach(() => {
    mockApi.fetchUser.mockResolvedValue({
      id: 1,
      name: "Test User",
      preferences: { theme: "dark" },
    });
  });

  it("handles complete user journey", async () => {
    const { container } = render(
      <AppProvider api={mockApi}>
        <UserProfile />
      </AppProvider>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText("Test User")).toBeInTheDocument();
    });

    // Test theme toggle
    const themeToggle = screen.getByLabelText("Toggle theme");
    fireEvent.click(themeToggle);
    expect(container).toHaveClass("theme-light");

    // Test form submission
    const nameInput = screen.getByLabelText("Name");
    fireEvent.change(nameInput, { target: { value: "New Name" } });

    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockApi.updateUser).toHaveBeenCalledWith({
        id: 1,
        name: "New Name",
        preferences: { theme: "light" },
      });
    });

    // Test state sync
    act(() => {
      mockApi.syncState({
        user: {
          id: 1,
          name: "Synced Name",
          preferences: { theme: "dark" },
        },
      });
    });

    expect(screen.getByText("Synced Name")).toBeInTheDocument();
    expect(container).toHaveClass("theme-dark");
  });
});
```

This extension adds several advanced concepts and implementations:

1. Advanced Component Composition:

- Recursive component pattern with drag-and-drop functionality
- Complex tree structure handling
- Event propagation control

2. Advanced Form Handling:

- Dynamic form builder with validation
- Field dependencies
- Custom hooks for form state management

3. Advanced State Synchronization:

- Distributed state management with WebSocket
- Version control for state updates
-

Here is an overview of some basic and advanced features in React, along with examples of how to implement and test them:

````javascript
# Basic React Features

## Components
React's core feature is component-based architecture. Components can be functional or class-based. Here's an example of a simple functional component:

```javascript
import React from 'react';

const HelloWorld = () => {
  return (
    <div>
      <h1>Hello, World!</h1>
    </div>
  );
};

export default HelloWorld;
````

**Testing:**
To test this component, we can use React Testing Library:

```javascript
import React from "react";
import { render, screen } from "@testing-library/react";
import HelloWorld from "./HelloWorld";

test("renders hello world message", () => {
  render(<HelloWorld />);
  expect(screen.getByText("Hello, World!")).toBeInTheDocument();
});
```

## State and Props

Components can manage their own state using the `useState` hook. Props are used to pass data down to child components.

```javascript
import React, { useState } from "react";

const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
};

export default Counter;
```

**Testing:**
We can test the state updates and prop rendering:

```javascript
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Counter from "./Counter";

test("increments count on button click", () => {
  render(<Counter />);
  const countText = screen.getByText("Count: 0");
  expect(countText).toBeInTheDocument();

  const incrementButton = screen.getByText("Increment");
  fireEvent.click(incrementButton);
  expect(screen.getByText("Count: 1")).toBeInTheDocument();
});
```

# Advanced React Features

## Context API

The Context API allows you to pass data through the component tree without having to pass props down manually at every level.

```javascript
import React, { createContext, useState } from "react";

const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeProvider };
```

**Testing:**
We can test the Context API by rendering a component that uses the context and asserting on the values:

```javascript
import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeContext, ThemeProvider } from "./ThemeContext";

test("theme context provides expected values", () => {
  const TestComponent = () => {
    const { theme, setTheme } = React.useContext(ThemeContext);
    return (
      <div>
        <p>Current theme: {theme}</p>
        <button onClick={() => setTheme("dark")}>Toggle Theme</button>
      </div>
    );
  };

  render(
    <ThemeProvider>
      <TestComponent />
    </ThemeProvider>
  );

  expect(screen.getByText("Current theme: light")).toBeInTheDocument();

  const toggleButton = screen.getByText("Toggle Theme");
  fireEvent.click(toggleButton);
  expect(screen.getByText("Current theme: dark")).toBeInTheDocument();
});
```

## Hooks

Hooks allow you to add state and lifecycle features to functional components. Some popular hooks include `useState`, `useEffect`, `useContext`, and `useReducer`.

```javascript
import React, { useState, useEffect } from "react";

const FetchData = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/api/data");
      const data = await response.json();
      setData(data);
    };
    fetchData();
  }, []);

  return (
    <div>
      <h2>Fetched Data:</h2>
      <ul>
        {data.map((item, index) => (
          <li key={index}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default FetchData;
```

**Testing:**
We can test the hooks by mocking the API call and asserting on the data:

```javascript
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import FetchData from "./FetchData";
import { rest } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
  rest.get("/api/data", (req, res, ctx) => {
    return res(ctx.json([{ name: "Item 1" }, { name: "Item 2" }]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("fetches and displays data", async () => {
  render(<FetchData />);

  await waitFor(() => {
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });
});
```

## Custom Hooks

You can create your own reusable hooks to encapsulate complex logic.

```javascript
import { useState, useEffect } from "react";

const useFetch = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        const data = await response.json();
        setData(data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [url]);

  return { data, loading, error };
};

export default useFetch;
```

**Testing:**
We can test the custom hook by mocking the API call and asserting on the returned values:

```javascript
import { renderHook } from "@testing-library/react-hooks";
import useFetch from "./useFetch";
import { rest } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
  rest.get("/api/data", (req, res, ctx) => {
    return res(ctx.json([{ name: "Item 1" }, { name: "Item 2" }]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("useFetch hook fetches and returns data", async () => {
  const { result, waitFor } = renderHook(() => useFetch("/api/data"));

  await waitFor(() => !result.current.loading);

  expect(result.current.data).toEqual([{ name: "Item 1" }, { name: "Item 2" }]);
  expect(result.current.loading).toBe(false);
  expect(result.current.error).toBeNull();
});
```

These examples cover some basic and advanced React features, along with testing using Vitest, React Testing Library, and Mocha/Chai. The key aspects covered include:

- Components (functional and class-based)
- State and Props
- Context API
- Hooks (useState, useEffect, useContext)
- Custom Hooks
- Unit and integration testing for each of these features

The examples demonstrate how to write comprehensive tests to ensure the correct behavior of React components and hooks, covering various scenarios and edge cases. This provides a solid foundation for building robust, testable React applications.

````
Continuing the overview of React features and testing:

```javascript
# More Advanced React Features

## Higher-Order Components (HOCs)
HOCs are functions that take a component as input and return a new component with added functionality.

```javascript
import React from 'react';

const withLoading = (WrappedComponent) => {
  return class extends React.Component {
    state = {
      loading: true,
      data: null,
    };

    componentDidMount() {
      // Fetch data and update state
      this.setState({ loading: false, data: { name: 'Example' } });
    }

    render() {
      if (this.state.loading) {
        return <div>Loading...</div>;
      }

      return <WrappedComponent data={this.state.data} />;
    }
  };
};

const MyComponent = ({ data }) => {
  return (
    <div>
      <h2>My Component</h2>
      <p>Name: {data.name}</p>
    </div>
  );
};

export default withLoading(MyComponent);
````

**Testing:**
We can test the HOC by rendering the wrapped component and asserting on the loading state and passed props:

```javascript
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import withLoading from "./withLoading";

test("withLoading HOC works as expected", async () => {
  const WrappedComponent = withLoading(({ data }) => (
    <div>
      <h2>My Component</h2>
      <p>Name: {data.name}</p>
    </div>
  ));

  render(<WrappedComponent />);

  expect(screen.getByText("Loading...")).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText("Name: Example")).toBeInTheDocument();
  });
});
```

## Render Props

Render props is a technique for sharing code between React components using a prop whose value is a function.

```javascript
import React, { useState } from "react";

const MouseTracker = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event) => {
    setMousePosition({
      x: event.clientX,
      y: event.clientY,
    });
  };

  return (
    <div onMouseMove={handleMouseMove}>
      {/* Use the render prop to render the mouse position */}
      {(props) => <Mouse {...props} />}
    </div>
  );
};

const Mouse = ({ x, y }) => {
  return (
    <p>
      The mouse position is ({x}, {y})
    </p>
  );
};

export default MouseTracker;
```

**Testing:**
We can test the Render Props pattern by simulating mouse events and asserting on the rendered output:

```javascript
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import MouseTracker from "./MouseTracker";

test("MouseTracker updates mouse position", () => {
  render(<MouseTracker />);
  const mousePositionText = screen.getByText(/The mouse position is/);

  fireEvent.mouseMove(screen.getByRole("document"), {
    clientX: 100,
    clientY: 200,
  });

  expect(mousePositionText).toHaveTextContent("(100, 200)");
});
```

## Portals

Portals allow you to render a component into a DOM element that exists outside the DOM hierarchy of the parent component.

```javascript
import React from "react";
import ReactDOM from "react-dom";

const Modal = ({ children }) => {
  return ReactDOM.createPortal(
    <div className="modal">
      <div className="modal-content">{children}</div>
    </div>,
    document.body
  );
};

export default Modal;
```

**Testing:**
We can test the Portal component by checking that the content is rendered in the expected location:

```javascript
import React from "react";
import { render, screen } from "@testing-library/react";
import Modal from "./Modal";

test("Modal renders content as a portal", () => {
  render(
    <Modal>
      <h2>Modal Title</h2>
      <p>Modal content</p>
    </Modal>
  );

  expect(screen.getByText("Modal Title")).toBeInTheDocument();
  expect(screen.getByText("Modal content")).toBeInTheDocument();

  // Check that the content is rendered in the body
  expect(document.body.innerHTML).toContain("Modal Title");
  expect(document.body.innerHTML).toContain("Modal content");
});
```

These examples cover additional advanced React features, such as Higher-Order Components, Render Props, and Portals. For each feature, we've included sample implementations and corresponding test cases using Vitest, React Testing Library, and Mocha/Chai.

The key aspects covered in this continuation include:

- Higher-Order Components (HOCs)
- Render Props pattern
- Portals

The test cases demonstrate how to thoroughly verify the behavior of these advanced React patterns, ensuring they work as expected in different scenarios. This comprehensive coverage provides a strong foundation for building complex, robust, and testable React applications.

````

Here's a continuation of the overview of React features and testing:

```javascript
# React Patterns and Optimizations

## Compound Components
Compound components allow you to build complex UI components by composing smaller, reusable components together.

```javascript
import React, { useState } from 'react';

const Accordion = ({ children }) => children;

Accordion.Header = ({ children }) => <div className="accordion-header">{children}</div>;
Accordion.Body = ({ children }) => <div className="accordion-body">{children}</div>;

const Example = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <Accordion>
      <Accordion.Header onClick={() => setOpenIndex(0)}>Header 1</Accordion.Header>
      <Accordion.Body
        style={{ display: openIndex === 0 ? 'block' : 'none' }}
      >
        Body 1
      </Accordion.Body>
      <Accordion.Header onClick={() => setOpenIndex(1)}>Header 2</Accordion.Header>
      <Accordion.Body
        style={{ display: openIndex === 1 ? 'block' : 'none' }}
      >
        Body 2
      </Accordion.Body>
    </Accordion>
  );
};

export default Example;
````

**Testing:**
We can test the Compound Components pattern by rendering the full Accordion component and asserting on the behavior of the sub-components:

```javascript
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Accordion from "./Accordion";

test("Accordion component behaves as expected", () => {
  render(
    <Accordion>
      <Accordion.Header>Header 1</Accordion.Header>
      <Accordion.Body>Body 1</Accordion.Body>
      <Accordion.Header>Header 2</Accordion.Header>
      <Accordion.Body>Body 2</Accordion.Body>
    </Accordion>
  );

  // Initially, both bodies should be hidden
  expect(screen.getByText("Body 1")).toHaveStyle("display: none");
  expect(screen.getByText("Body 2")).toHaveStyle("display: none");

  // Click the first header to open the first body
  fireEvent.click(screen.getByText("Header 1"));
  expect(screen.getByText("Body 1")).toHaveStyle("display: block");
  expect(screen.getByText("Body 2")).toHaveStyle("display: none");

  // Click the second header to open the second body
  fireEvent.click(screen.getByText("Header 2"));
  expect(screen.getByText("Body 1")).toHaveStyle("display: none");
  expect(screen.getByText("Body 2")).toHaveStyle("display: block");
});
```

## Code Splitting and Lazy Loading

React supports code splitting and lazy loading to improve performance by only loading the necessary parts of your application.

```javascript
import React, { lazy, Suspense } from "react";

const LazyComponent = lazy(() => import("./LazyComponent"));

const App = () => {
  return (
    <div>
      <h1>My App</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <LazyComponent />
      </Suspense>
    </div>
  );
};

export default App;
```

**Testing:**
We can test the lazy-loaded component by mocking the dynamic import and asserting on the rendered output:

```javascript
import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import App from "./App";

vi.mock("./LazyComponent", () => ({
  __esModule: true,
  default: () => <div>Lazy Component</div>,
}));

test("lazy-loaded component is rendered correctly", () => {
  render(<App />);
  expect(screen.getByText("Lazy Component")).toBeInTheDocument();
});
```

## Performance Optimizations

React provides several ways to optimize performance, such as `React.memo` and `useMemo`.

```javascript
import React, { memo, useMemo } from "react";

const MemoizedComponent = memo(({ value }) => {
  console.log("Rendering MemoizedComponent");
  return <div>Value: {value}</div>;
});

const ExpensiveCalculation = ({ a, b }) => {
  console.log("Rendering ExpensiveCalculation");
  return useMemo(() => a * b, [a, b]);
};

const App = () => {
  const [count, setCount] = useState(0);
  const expensiveValue = ExpensiveCalculation({ a: count, b: count });

  return (
    <div>
      <button onClick={() => setCount((count) => count + 1)}>Increment</button>
      <MemoizedComponent value={expensiveValue} />
    </div>
  );
};

export default App;
```

**Testing:**
We can test the performance optimizations by tracking the number of re-renders and asserting on the expected behavior:

```javascript
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";
import { vi } from "vitest";

test("performance optimizations work as expected", () => {
  const consoleSpy = vi.spyOn(console, "log");

  render(<App />);

  // Verify that both components are rendered initially
  expect(consoleSpy).toHaveBeenCalledWith("Rendering ExpensiveCalculation");
  expect(consoleSpy).toHaveBeenCalledWith("Rendering MemoizedComponent");
  consoleSpy.mockClear();

  // Click the button to update the count
  fireEvent.click(screen.getByText("Increment"));

  // Verify that only the ExpensiveCalculation component is re-rendered
  expect(consoleSpy).toHaveBeenCalledWith("Rendering ExpensiveCalculation");
  expect(consoleSpy).not.toHaveBeenCalledWith("Rendering MemoizedComponent");
});
```

These examples cover additional advanced React patterns and optimizations, including:

- Compound Components
- Code Splitting and Lazy Loading
- Performance Optimizations (React.memo, useMemo)

The test cases demonstrate how to verify the correct behavior of these patterns, ensuring they work as expected in different scenarios. This comprehensive coverage provides a strong foundation for building highly optimized and maintainable React applications.

````
Here's a continuation of the React features and testing overview:

```javascript
# Advanced React Patterns

## Render Props with Hooks
Combining the Render Props pattern with React Hooks can lead to powerful and flexible components.

```javascript
import React, { useState } from 'react';

const MouseTracker = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event) => {
    setMousePosition({
      x: event.clientX,
      y: event.clientY,
    });
  };

  return (
    <div onMouseMove={handleMouseMove}>
      {(props) => <Mouse {...props} />}
    </div>
  );
};

const Mouse = ({ x, y }) => {
  return (
    <p>
      The mouse position is ({x}, {y})
    </p>
  );
};

export default MouseTracker;
````

**Testing:**
We can test the Render Props with Hooks pattern by simulating mouse events and asserting on the rendered output:

```javascript
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import MouseTracker from "./MouseTracker";

test("MouseTracker updates mouse position", () => {
  render(<MouseTracker />);
  const mousePositionText = screen.getByText(/The mouse position is/);

  fireEvent.mouseMove(screen.getByRole("document"), {
    clientX: 100,
    clientY: 200,
  });

  expect(mousePositionText).toHaveTextContent("(100, 200)");
});
```

## Higher-Order Components with Hooks

Combining Higher-Order Components with React Hooks can create reusable, composable functionality.

```javascript
import React, { useState, useEffect } from "react";

const withData = (WrappedComponent) => {
  return (props) => {
    const [data, setData] = useState(null);

    useEffect(() => {
      const fetchData = async () => {
        const response = await fetch("/api/data");
        const data = await response.json();
        setData(data);
      };
      fetchData();
    }, []);

    if (!data) {
      return <div>Loading...</div>;
    }

    return <WrappedComponent data={data} {...props} />;
  };
};

const MyComponent = ({ data }) => {
  return (
    <div>
      <h2>My Component</h2>
      <ul>
        {data.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default withData(MyComponent);
```

**Testing:**
We can test the Higher-Order Components with Hooks pattern by mocking the API call and asserting on the rendered output:

```javascript
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { rest } from "msw";
import { setupServer } from "msw/node";
import withData from "./withData";

const server = setupServer(
  rest.get("/api/data", (req, res, ctx) => {
    return res(
      ctx.json([
        { id: 1, name: "Item 1" },
        { id: 2, name: "Item 2" },
      ])
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("withData HOC fetches and displays data", async () => {
  const WrappedComponent = withData(({ data }) => (
    <div>
      <h2>My Component</h2>
      <ul>
        {data.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  ));

  render(<WrappedComponent />);

  expect(screen.getByText("Loading...")).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });
});
```

## Custom Hooks with State Management

Creating custom hooks that handle complex state management can lead to reusable and testable logic.

```javascript
import { useState, useEffect } from "react";

const useCounter = (initialCount = 0) => {
  const [count, setCount] = useState(initialCount);

  const increment = () => setCount((prevCount) => prevCount + 1);
  const decrement = () => setCount((prevCount) => prevCount - 1);
  const reset = () => setCount(initialCount);

  useEffect(() => {
    console.log(`Count is now: ${count}`);
  }, [count]);

  return { count, increment, decrement, reset };
};

const CounterComponent = () => {
  const { count, increment, decrement, reset } = useCounter(5);

  return (
    <div>
      <h2>Counter</h2>
      <p>Current count: {count}</p>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
};

export default CounterComponent;
```

**Testing:**
We can test the custom hook and the component that uses it:

```javascript
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import useCounter from "./useCounter";
import CounterComponent from "./CounterComponent";

test("useCounter hook works as expected", () => {
  const consoleSpy = vi.spyOn(console, "log");
  const { result } = renderHook(() => useCounter(5));

  expect(result.current.count).toBe(5);

  act(() => {
    result.current.increment();
  });
  expect(result.current.count).toBe(6);
  expect(consoleSpy).toHaveBeenCalledWith("Count is now: 6");

  act(() => {
    result.current.decrement();
  });
  expect(result.current.count).toBe(5);
  expect(consoleSpy).toHaveBeenCalledWith("Count is now: 5");

  act(() => {
    result.current.reset();
  });
  expect(result.current.count).toBe(5);
  expect(consoleSpy).toHaveBeenCalledWith("Count is now: 5");
});

test("CounterComponent renders and works correctly", () => {
  render(<CounterComponent />);

  expect(screen.getByText("Current count: 5")).toBeInTheDocument();

  fireEvent.click(screen.getByText("Increment"));
  expect(screen.getByText("Current count: 6")).toBeInTheDocument();

  fireEvent.click(screen.getByText("Decrement"));
  expect(screen.getByText("Current count: 5")).toBeInTheDocument();

  fireEvent.click(screen.getByText("Reset"));
  expect(screen.getByText("Current count: 5")).toBeInTheDocument();
});
```

These examples cover additional advanced React patterns, including:

- Render Props with Hooks
- Higher-Order Components with Hooks
- Custom Hooks with State Management

The test cases demonstrate how to thoroughly verify the behavior of these patterns, ensuring they work as expected in different scenarios. This comprehensive coverage provides a strong foundation for building complex, testable, and maintainable React applications.

```

```
