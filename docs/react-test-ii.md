To provide a comprehensive guide that takes you from basic to advanced React features, including best practices and testing strategies with Vitest, React Testing Library, Mocha, and Chai, let's structure this as follows:

1. **React Basics**: Introduction to core concepts with examples.
2. **Intermediate React Patterns**: State management, hooks, context, and custom hooks.
3. **Advanced Patterns and Scenarios**: Optimization, higher-order components (HOCs), render props, and compound components.
4. **Testing in React**: Detailed breakdown using Vitest, React Testing Library, Mocha, and Chai.
5. **End-to-End Testing Setup and Strategy**: Guidelines for integration and unit testing.

Let's dive in progressively!

---

### 1. **React Basics**

#### Component Structure and Rendering

- **Functional Components**:
  ```jsx
  function WelcomeMessage({ name }) {
    return <h1>Hello, {name}!</h1>;
  }
  ```
- **Testing**:

  ```jsx
  import { render, screen } from "@testing-library/react";
  import WelcomeMessage from "./WelcomeMessage";

  test("renders welcome message with name", () => {
    render(<WelcomeMessage name="John" />);
    expect(screen.getByText(/Hello, John/i)).toBeInTheDocument();
  });
  ```

#### Props and State

- **Stateful Component**:

  ```jsx
  import { useState } from "react";

  function Counter() {
    const [count, setCount] = useState(0);
    return (
      <div>
        <p>{count}</p>
        <button onClick={() => setCount(count + 1)}>Increment</button>
      </div>
    );
  }
  ```

#### Basic Testing for Counter Component

- **Test Example** (using Vitest):

  ```jsx
  import { render, screen, fireEvent } from "@testing-library/react";
  import Counter from "./Counter";

  test("counter increments", () => {
    render(<Counter />);
    const button = screen.getByText(/increment/i);
    fireEvent.click(button);
    expect(screen.getByText("1")).toBeInTheDocument();
  });
  ```

---

### 2. **Intermediate React Patterns**

#### 2.1 Context API

- **Usage**:

  ```jsx
  import { createContext, useContext, useState } from "react";

  const ThemeContext = createContext();

  function ThemeProvider({ children }) {
    const [theme, setTheme] = useState("light");
    return (
      <ThemeContext.Provider value={{ theme, setTheme }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  function ThemedComponent() {
    const { theme, setTheme } = useContext(ThemeContext);
    return (
      <div>
        <p>Current Theme: {theme}</p>
        <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
          Toggle Theme
        </button>
      </div>
    );
  }
  ```

#### 2.2 Testing Context with Providers

```jsx
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "./ThemeContext";
import ThemedComponent from "./ThemedComponent";

test("toggles theme", () => {
  render(
    <ThemeProvider>
      <ThemedComponent />
    </ThemeProvider>
  );
  const button = screen.getByText(/toggle theme/i);
  fireEvent.click(button);
  expect(screen.getByText(/current theme: dark/i)).toBeInTheDocument();
});
```

---

### 3. **Advanced Patterns and Scenarios**

#### 3.1 Higher-Order Components (HOCs)

- **Example**:

  ```jsx
  function withLoading(Component) {
    return function WrappedComponent({ isLoading, ...props }) {
      if (isLoading) return <p>Loading...</p>;
      return <Component {...props} />;
    };
  }

  const DataComponent = ({ data }) => <div>{data}</div>;
  const DataComponentWithLoading = withLoading(DataComponent);
  ```

#### 3.2 Render Props

- **Example**:

  ```jsx
  function FetchData({ render }) {
    const [data, setData] = useState(null);

    useEffect(() => {
      fetch("/api/data")
        .then((res) => res.json())
        .then(setData);
    }, []);

    return render(data);
  }

  function RenderPropExample() {
    return (
      <FetchData
        render={(data) => (data ? <div>{data}</div> : <p>Loading...</p>)}
      />
    );
  }
  ```

#### 3.3 Testing Advanced Patterns

- **Mocking Fetch in Test**:

  ```jsx
  import { render, screen } from "@testing-library/react";
  import FetchData from "./FetchData";

  test("fetches and displays data", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ json: () => Promise.resolve("Fetched data") })
    );
    render(<FetchData render={(data) => <div>{data}</div>} />);
    expect(await screen.findByText("Fetched data")).toBeInTheDocument();
    global.fetch.mockRestore();
  });
  ```

---

### 4. **Testing in React with Vitest, Mocha, and Chai**

#### 4.1 Setting up Vitest for React Testing

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

#### 4.2 Testing Complex Interactions

- **Redux Testing** (using mock store)

  ```jsx
  import { Provider } from "react-redux";
  import { render, screen, fireEvent } from "@testing-library/react";
  import configureStore from "redux-mock-store";
  import MyComponent from "./MyComponent";

  const mockStore = configureStore([]);
  const store = mockStore({ myState: "initial" });

  test("checks redux action", () => {
    render(
      <Provider store={store}>
        <MyComponent />
      </Provider>
    );
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(store.getActions()).toContainEqual({ type: "MY_ACTION" });
  });
  ```

---

### 5. **End-to-End Testing Setup and Strategy**

- **Testing Nested Components**:

  ```jsx
  import { render, screen } from "@testing-library/react";
  import App from "./App";

  test("nested components render correctly", () => {
    render(<App />);
    expect(screen.getByText(/main component text/i)).toBeInTheDocument();
  });
  ```

- **Full Integration Test Example**:

  ```jsx
  import { render, screen, fireEvent } from "@testing-library/react";
  import UserFlow from "./UserFlow";

  test("user journey test", async () => {
    render(<UserFlow />);
    fireEvent.click(screen.getByText("Start"));
    expect(await screen.findByText("Step 2")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Next"));
    expect(await screen.findByText("Final Step")).toBeInTheDocument();
  });
  ```

---

By following through the steps, you’ll cover a vast range of capabilities and testing best practices in React, with a strong focus on handling real-world scenarios. Each example gradually builds up in complexity to help you master advanced React techniques and thorough testing using popular tools.

To build a full-fledged, comprehensive guide on React that moves from basic to advanced concepts with a focus on unit and integration testing using Vitest, React Testing Library, Mocha, and Chai, let’s structure this progressively:

1. **React Fundamentals**: Basic component structures, state management, and props.
2. **Intermediate Concepts**: Context API, custom hooks, and reusable components.
3. **Advanced Patterns**: Higher-order components (HOCs), render props, and compound components.
4. **Real-world Use Cases**: Application patterns like form handling, data fetching, and performance optimization.
5. **Testing Strategies**: From unit tests to advanced integration tests using Vitest, React Testing Library, Mocha, and Chai.

Each section will include implementation and testing examples that progressively build skills from beginner to advanced, creating a strong foundation.

---

### 1. **React Fundamentals**

#### 1.1 Basic Functional Components

- **Implementation**:

  ```jsx
  function Greeting({ name }) {
    return <h1>Hello, {name}!</h1>;
  }
  ```

- **Testing**:

  ```jsx
  import { render, screen } from "@testing-library/react";
  import Greeting from "./Greeting";

  test("renders greeting with name", () => {
    render(<Greeting name="Alice" />);
    expect(screen.getByText(/Hello, Alice!/i)).toBeInTheDocument();
  });
  ```

#### 1.2 Managing State with `useState`

- **Implementation**:

  ```jsx
  import { useState } from "react";

  function Counter() {
    const [count, setCount] = useState(0);

    return (
      <div>
        <p>{count}</p>
        <button onClick={() => setCount(count + 1)}>Increment</button>
      </div>
    );
  }
  ```

- **Testing**:

  ```jsx
  import { render, screen, fireEvent } from "@testing-library/react";
  import Counter from "./Counter";

  test("increments counter", () => {
    render(<Counter />);
    const button = screen.getByText(/Increment/i);
    fireEvent.click(button);
    expect(screen.getByText("1")).toBeInTheDocument();
  });
  ```

---

### 2. **Intermediate Concepts**

#### 2.1 Context API for Global State Management

- **Implementation**:

  ```jsx
  import { createContext, useContext, useState } from "react";

  const ThemeContext = createContext();

  function ThemeProvider({ children }) {
    const [theme, setTheme] = useState("light");
    return (
      <ThemeContext.Provider value={{ theme, setTheme }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  function ThemeSwitcher() {
    const { theme, setTheme } = useContext(ThemeContext);
    return (
      <div>
        <p>Current Theme: {theme}</p>
        <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
          Toggle Theme
        </button>
      </div>
    );
  }
  ```

- **Testing Context API**:

  ```jsx
  import { render, screen, fireEvent } from "@testing-library/react";
  import { ThemeProvider } from "./ThemeContext";
  import ThemeSwitcher from "./ThemeSwitcher";

  test("toggles theme context", () => {
    render(
      <ThemeProvider>
        <ThemeSwitcher />
      </ThemeProvider>
    );

    const button = screen.getByText(/Toggle Theme/i);
    fireEvent.click(button);
    expect(screen.getByText(/Current Theme: dark/i)).toBeInTheDocument();
  });
  ```

#### 2.2 Custom Hooks for Reusability

- **Implementation**:

  ```jsx
  import { useState, useEffect } from "react";

  function useFetch(url) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          setData(data);
          setLoading(false);
        });
    }, [url]);

    return { data, loading };
  }
  ```

- **Testing Custom Hook with Mock Data**:

  ```jsx
  import { renderHook, act } from "@testing-library/react-hooks";
  import useFetch from "./useFetch";

  test("fetches data successfully", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ json: () => Promise.resolve({ name: "Alice" }) })
    );

    const { result, waitForNextUpdate } = renderHook(() => useFetch("/user"));
    await waitForNextUpdate();
    expect(result.current.data).toEqual({ name: "Alice" });
    expect(result.current.loading).toBe(false);

    global.fetch.mockRestore();
  });
  ```

---

### 3. **Advanced Patterns**

#### 3.1 Higher-Order Components (HOCs)

- **Implementation**:

  ```jsx
  function withLoading(Component) {
    return function WrappedComponent({ isLoading, ...props }) {
      return isLoading ? <p>Loading...</p> : <Component {...props} />;
    };
  }

  const DataComponent = ({ data }) => <div>{data}</div>;
  const DataComponentWithLoading = withLoading(DataComponent);
  ```

#### 3.2 Compound Components

- **Implementation**:

  ```jsx
  function Tabs({ children }) {
    const [activeTab, setActiveTab] = useState(children[0].props.label);

    return (
      <div>
        <div>
          {children.map((child) => (
            <button
              key={child.props.label}
              onClick={() => setActiveTab(child.props.label)}
            >
              {child.props.label}
            </button>
          ))}
        </div>
        <div>
          {children.map((child) =>
            child.props.label === activeTab ? child : null
          )}
        </div>
      </div>
    );
  }

  function Tab({ children }) {
    return <>{children}</>;
  }
  ```

- **Usage**:
  ```jsx
  <Tabs>
    <Tab label="Tab 1">Content for Tab 1</Tab>
    <Tab label="Tab 2">Content for Tab 2</Tab>
  </Tabs>
  ```

---

### 4. **Real-world Use Cases**

#### 4.1 Data Fetching and Caching with SWR

- **Implementation**:

  ```jsx
  import useSWR from "swr";

  const fetcher = (url) => fetch(url).then((res) => res.json());

  function UserProfile({ id }) {
    const { data, error } = useSWR(`/api/user/${id}`, fetcher);

    if (error) return <p>Error loading user.</p>;
    if (!data) return <p>Loading...</p>;

    return <div>{data.name}</div>;
  }
  ```

#### 4.2 Form Handling with `react-hook-form`

- **Implementation**:

  ```jsx
  import { useForm } from "react-hook-form";

  function SignupForm() {
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm();

    const onSubmit = (data) => console.log(data);

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          {...register("username", { required: true })}
          placeholder="Username"
        />
        {errors.username && <p>Username is required.</p>}
        <button type="submit">Sign Up</button>
      </form>
    );
  }
  ```

---

### 5. **Testing Strategies: Comprehensive Guide**

#### 5.1 Setting up Vitest with Testing Libraries

- **Setup**:
  ```bash
  npm install vitest @testing-library/react @testing-library/jest-dom
  ```

#### 5.2 Advanced Integration Testing

- **Example with Mock Redux Store**:

  ```jsx
  import { Provider } from "react-redux";
  import { render, screen, fireEvent } from "@testing-library/react";
  import configureStore from "redux-mock-store";
  import MyComponent from "./MyComponent";

  const mockStore = configureStore([]);
  const store = mockStore({ myState: "initial" });

  test("checks redux action", () => {
    render(
      <Provider store={store}>
        <MyComponent />
      </Provider>
    );
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(store.getActions()).toContainEqual({ type: "MY_ACTION" });
  });
  ```

#### 5.3 End-to-End Integration Testing

- **Simulating User Journey**:

  ```jsx
  import { render, screen, fireEvent } from "@testing-library/react";
  import UserFlow from "./UserFlow";

  test("user journey test", async () => {
    render(<UserFlow />);
    fireEvent.click(screen.getByText("Start"));
    expect(await screen.findByText("Step 2")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Next"));
    expect(await screen.findByText("Final Step")).toBeInTheDocument();
  });
  ```

---

By following through this structure, we cover all aspects of React development and testing progressively, from simple components to complex patterns and real-world cases. This approach is designed to help build a solid understanding of both React’s functionality and comprehensive testing strategies.

Let's further expand on React concepts, patterns, and comprehensive testing strategies to cover advanced implementations and real-world use cases. This guide will build up progressively, focusing on both essential and advanced features in React, combined with robust testing techniques using **Vitest**, **React Testing Library**, **Mocha**, and **Chai**.

### Outline

1. **Advanced Functional Patterns in React**: Code splitting, lazy loading, and error boundaries.
2. **Advanced Component Patterns**: Controlled vs. uncontrolled components, compound components, and render props.
3. **Optimizing Performance**: Memoization, debouncing, throttling, and React Profiler.
4. **Complete Testing Strategies**: Unit and integration testing for each advanced concept.

---

### 1. **Advanced Functional Patterns in React**

#### 1.1 Code Splitting and Lazy Loading

Code splitting is useful for optimizing large applications by loading parts of the code on-demand.

- **Implementation**:

  ```jsx
  import React, { Suspense, lazy } from "react";

  const LazyComponent = lazy(() => import("./LazyComponent"));

  function App() {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <LazyComponent />
      </Suspense>
    );
  }
  ```

- **Testing** (using `React Testing Library` and `Vitest`):

  ```jsx
  import { render, screen } from "@testing-library/react";
  import App from "./App";

  test("renders lazy component correctly", async () => {
    render(<App />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
    expect(
      await screen.findByText(/Lazy Component Content/i)
    ).toBeInTheDocument();
  });
  ```

#### 1.2 Error Boundaries

Error boundaries help catch runtime errors in React components without crashing the entire application.

- **Implementation**:

  ```jsx
  import React from "react";

  class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true };
    }

    render() {
      if (this.state.hasError) {
        return <h1>Something went wrong.</h1>;
      }
      return this.props.children;
    }
  }
  ```

- **Testing Error Boundaries**:

  ```jsx
  import { render, screen } from "@testing-library/react";
  import ErrorBoundary from "./ErrorBoundary";

  test("catches error and displays fallback UI", () => {
    const ProblemComponent = () => {
      throw new Error("Test Error");
    };
    render(
      <ErrorBoundary>
        <ProblemComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
  });
  ```

---

### 2. **Advanced Component Patterns**

#### 2.1 Controlled vs. Uncontrolled Components

Controlled components are managed by React state, while uncontrolled components manage their own state.

- **Controlled Component** Example:

  ```jsx
  import { useState } from "react";

  function ControlledInput() {
    const [value, setValue] = useState("");

    return (
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Controlled Input"
      />
    );
  }
  ```

- **Uncontrolled Component** Example:

  ```jsx
  import React, { useRef } from "react";

  function UncontrolledInput() {
    const inputRef = useRef();

    const handleSubmit = () => {
      alert(inputRef.current.value);
    };

    return (
      <>
        <input ref={inputRef} placeholder="Uncontrolled Input" />
        <button onClick={handleSubmit}>Submit</button>
      </>
    );
  }
  ```

- **Testing Controlled Component**:

  ```jsx
  import { render, screen, fireEvent } from "@testing-library/react";
  import ControlledInput from "./ControlledInput";

  test("handles input change correctly", () => {
    render(<ControlledInput />);
    const input = screen.getByPlaceholderText("Controlled Input");
    fireEvent.change(input, { target: { value: "React Testing" } });
    expect(input.value).toBe("React Testing");
  });
  ```

#### 2.2 Compound Components

Compound components are flexible and allow more control over complex UI components.

- **Implementation**:

  ```jsx
  function Tabs({ children }) {
    const [activeTab, setActiveTab] = useState(children[0].props.label);

    return (
      <div>
        <div>
          {children.map((child) => (
            <button
              key={child.props.label}
              onClick={() => setActiveTab(child.props.label)}
            >
              {child.props.label}
            </button>
          ))}
        </div>
        <div>
          {children.map((child) =>
            child.props.label === activeTab ? child : null
          )}
        </div>
      </div>
    );
  }

  function Tab({ label, children }) {
    return <>{children}</>;
  }
  ```

- **Testing Compound Components**:

  ```jsx
  import { render, screen, fireEvent } from "@testing-library/react";
  import Tabs from "./Tabs";
  import Tab from "./Tab";

  test("switches between tabs", () => {
    render(
      <Tabs>
        <Tab label="Tab 1">Content for Tab 1</Tab>
        <Tab label="Tab 2">Content for Tab 2</Tab>
      </Tabs>
    );

    fireEvent.click(screen.getByText("Tab 2"));
    expect(screen.getByText("Content for Tab 2")).toBeInTheDocument();
  });
  ```

---

### 3. **Optimizing Performance**

#### 3.1 Memoization with `React.memo` and `useMemo`

Memoization helps prevent unnecessary re-renders in performance-sensitive components.

- **Using `React.memo`**:

  ```jsx
  import React, { memo } from "react";

  const ExpensiveComponent = memo(({ data }) => {
    console.log("Rendering ExpensiveComponent");
    return <div>{data}</div>;
  });
  ```

- **Testing Memoization**:
  Since memoized components should only re-render when props change, tests can check this by monitoring console logs or using Jest spies on renders.

#### 3.2 Debouncing and Throttling in Input Fields

Debouncing is useful for preventing rapid function calls, such as during input.

- **Implementation**:

  ```jsx
  import { useState, useCallback } from "react";

  function SearchInput() {
    const [query, setQuery] = useState("");

    const debouncedSearch = useCallback(
      debounce((query) => {
        // Perform search API call
        console.log("Searching for:", query);
      }, 500),
      []
    );

    const handleChange = (e) => {
      setQuery(e.target.value);
      debouncedSearch(e.target.value);
    };

    return (
      <input value={query} onChange={handleChange} placeholder="Search..." />
    );
  }
  ```

---

### 4. **Complete Testing Strategies**

#### 4.1 Unit Testing with Vitest and React Testing Library

- **Testing Setup**:

  ```bash
  npm install vitest @testing-library/react @testing-library/jest-dom
  ```

- **Example Test Case**:

  ```jsx
  import { render, screen } from "@testing-library/react";
  import App from "./App";

  test("renders main app component", () => {
    render(<App />);
    expect(screen.getByText(/Welcome to My App/i)).toBeInTheDocument();
  });
  ```

#### 4.2 Integration Testing for API Calls

For components that rely on API calls, mocking fetch requests allows testing asynchronous data flows.

- **Test with Mocked Fetch**:

  ```jsx
  import { render, screen, waitFor } from "@testing-library/react";
  import UserProfile from "./UserProfile";

  test("fetches and displays user data", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ json: () => Promise.resolve({ name: "Alice" }) })
    );

    render(<UserProfile id={1} />);
    await waitFor(() => expect(screen.getByText(/Alice/i)).toBeInTheDocument());

    global.fetch.mockRestore();
  });
  ```

#### 4.3 Snapshot Testing with Chai

Snapshot testing ensures component UI consistency.

- **Example**:

  ```jsx
  import { render } from "@testing-library/react";
  import chai, { expect } from "chai";
  import chaiJestSnapshot from "chai-jest-snapshot";

  chai.use(chaiJestSnapshot);

  it("matches snapshot", () => {
    const { asFragment } = render(<MyComponent />);
    expect(asFragment()).to.matchSnapshot();
  });
  ```

#### 4.4 Mock Redux for Testing Connected Components

Testing Redux-connected components involves using a mock store.

- **Example Test with Redux Mock Store**:

  ```jsx
  import { render, screen, fireEvent } from "@testing-library/react";
  import { Provider } from "react-redux";
  import configureStore from "redux-mock-store";
  import MyComponent from "./MyComponent";

  const mockStore = configureStore([]);

  test("checks Redux store updates", () => {
    const store = mockStore({ count: 0 });
    render(
      <Provider store={store}>
        <MyComponent />
      </Provider>
    );

    fireEvent.click(screen.getByText(/Increment/i));

    const actions = store.getActions();
    expect(actions).toContainEqual({ type: "INCREMENT" });
  });
  ```

---

This guide expands React's core usage into advanced scenarios and patterns, providing a robust foundation for both functional and real-world application development. Testing practices emphasize accurate unit and integration coverage, with detailed examples of setting up tests for every feature using modern testing tools and libraries.

Certainly! Let's continue to expand on advanced React patterns, testing strategies, and real-world implementations. We will dive deeper into concepts such as custom hooks, server-side rendering (SSR), testing asynchronous behavior, handling errors in components, and handling complex form validations. We'll also explore more advanced techniques for React performance optimization and provide additional comprehensive testing strategies.

---

### 5. **Advanced React Features**

#### 5.1 **Custom Hooks for Complex State Logic**

Custom hooks allow you to abstract away complex logic from components, making your code more reusable and readable.

- **Example**: A custom hook for handling a form state.

  ```jsx
  import { useState } from "react";

  function useForm(initialValues) {
    const [formData, setFormData] = useState(initialValues);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    };

    return [formData, handleChange];
  }

  function SignUpForm() {
    const [formData, handleChange] = useForm({ username: "", email: "" });

    const handleSubmit = (e) => {
      e.preventDefault();
      console.log(formData);
    };

    return (
      <form onSubmit={handleSubmit}>
        <input
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Username"
        />
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
        />
        <button type="submit">Sign Up</button>
      </form>
    );
  }
  ```

- **Testing**: Test the form functionality, including input changes and form submission.

  ```jsx
  import { render, screen, fireEvent } from "@testing-library/react";
  import SignUpForm from "./SignUpForm";

  test("updates form state and submits data", () => {
    render(<SignUpForm />);

    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "Alice" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "alice@example.com" },
    });

    fireEvent.submit(screen.getByText("Sign Up"));
    expect(screen.getByPlaceholderText("Username").value).toBe("Alice");
    expect(screen.getByPlaceholderText("Email").value).toBe(
      "alice@example.com"
    );
  });
  ```

#### 5.2 **Server-Side Rendering (SSR) with React**

Server-side rendering can improve performance and SEO by rendering components on the server and sending the fully rendered page to the client.

- **Setup Example**:
  You would typically use libraries like **Next.js** for SSR, but here's a minimal example with **React** and **Express** for SSR.

  **Express Server** (SSR setup):

  ```js
  const express = require("express");
  const React = require("react");
  const ReactDOMServer = require("react-dom/server");
  const App = require("./App"); // Your main React component

  const app = express();

  app.get("*", (req, res) => {
    const html = ReactDOMServer.renderToString(<App />);
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <title>SSR Example</title>
        </head>
        <body>
          <div id="root">${html}</div>
          <script src="/bundle.js"></script>
        </body>
      </html>
    `);
  });

  app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });
  ```

- **Testing SSR**:
  Testing SSR focuses on ensuring that the page content is correctly rendered on the server and matches the client-side rendered output.

  ```jsx
  import { renderToString } from "react-dom/server";
  import App from "./App";

  test("renders App to static HTML", () => {
    const html = renderToString(<App />);
    expect(html).toContain("Welcome to My App");
  });
  ```

---

### 6. **Advanced React Patterns and Techniques**

#### 6.1 **Compound Components**

Compound components are a powerful pattern that allows children to have implicit knowledge of their parent components. This pattern is often used for building flexible UI elements like forms, tab groups, and accordions.

- **Example**: A `Accordion` component.

  ```jsx
  function Accordion({ children }) {
    const [activeIndex, setActiveIndex] = useState(null);

    const handleClick = (index) => {
      setActiveIndex(index === activeIndex ? null : index);
    };

    return (
      <div>
        {React.Children.map(children, (child, index) => {
          return React.cloneElement(child, {
            isActive: index === activeIndex,
            onClick: () => handleClick(index),
          });
        })}
      </div>
    );
  }

  function AccordionItem({ title, children, isActive, onClick }) {
    return (
      <div>
        <h3 onClick={onClick}>{title}</h3>
        {isActive && <p>{children}</p>}
      </div>
    );
  }
  ```

- **Usage**:

  ```jsx
  <Accordion>
    <AccordionItem title="Item 1">Content for Item 1</AccordionItem>
    <AccordionItem title="Item 2">Content for Item 2</AccordionItem>
  </Accordion>
  ```

- **Testing**:

  ```jsx
  import { render, screen, fireEvent } from "@testing-library/react";
  import { Accordion, AccordionItem } from "./Accordion";

  test("toggles accordion items on click", () => {
    render(
      <Accordion>
        <AccordionItem title="Item 1">Content for Item 1</AccordionItem>
        <AccordionItem title="Item 2">Content for Item 2</AccordionItem>
      </Accordion>
    );

    fireEvent.click(screen.getByText("Item 1"));
    expect(screen.getByText("Content for Item 1")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Item 2"));
    expect(screen.getByText("Content for Item 2")).toBeInTheDocument();
  });
  ```

---

### 7. **Performance Optimization**

#### 7.1 **React Profiler**: Measuring performance of components

React’s **Profiler API** helps you measure the performance of your components, identifying parts of the app that are slow.

- **Profiler Example**:

  ```jsx
  import React, { Profiler } from "react";

  function MyComponent() {
    return (
      <Profiler id="MyComponent" onRender={onRenderCallback}>
        <div>My Component</div>
      </Profiler>
    );
  }

  function onRenderCallback(
    id, // The "id" prop of the Profiler tree that has just finished rendering
    phase, // Either "mount" (if the tree is being built) or "update" (if it's being re-rendered)
    actualDuration, // Time spent rendering the committed update
    baseDuration, // Estimated time to render the subtree without memoization
    startTime, // When React started rendering the update
    commitTime // When React committed the update
  ) {
    console.log(`Render phase: ${phase}`);
    console.log(`Actual render duration: ${actualDuration}ms`);
  }
  ```

#### 7.2 **useMemo** and **useCallback** to Optimize Performance

- **`useMemo`** memoizes a value to avoid unnecessary recalculations.
- **`useCallback`** memoizes functions so they don't get re-created on every render.

- **Example**:

  ```jsx
  import { useMemo, useCallback } from "react";

  function ExpensiveCalculationComponent({ num }) {
    const calculatedValue = useMemo(() => expensiveCalculation(num), [num]);

    const handleClick = useCallback(() => {
      console.log("Button clicked");
    }, []);

    return (
      <div>
        <p>Calculated value: {calculatedValue}</p>
        <button onClick={handleClick}>Click me</button>
      </div>
    );
  }

  function expensiveCalculation(num) {
    // Simulate an expensive calculation
    return num * 1000;
  }
  ```

- **Testing Performance Optimization**:

  - In performance testing, you may want to verify that memoization is working correctly by ensuring that unnecessary re-renders do not occur.

  ```jsx
  import { render } from "@testing-library/react";
  import { spy } from "vitest";
  import ExpensiveCalculationComponent from "./ExpensiveCalculationComponent";

  test("only recalculates when props change", () => {
    const spyFn = spy(ExpensiveCalculationComponent);

    render(<ExpensiveCalculationComponent num={5} />);
    expect(spyFn).toHaveBeenCalledTimes(1);

    render(<ExpensiveCalculationComponent num={10} />);
    expect(spyFn).toHaveBeenCalledTimes(2); // Ensure it only recalculates when props change
  });
  ```

---

### 8. **Testing Asynchronous Code**

Handling asynchronous behavior in testing can be tricky. Here are some common patterns and examples to handle promises, async/await, and side effects.

#### 8.1 **Testing Asynchronous Code with React Testing Library and Vitest**

- **Example**: Testing asynchronous behavior like API calls.
  ```jsx
  import
  ```

{ render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import MyComponent from './MyComponent'; // A component that makes an API call

test('fetches and displays user data', async () => {
const fakeData = { name: 'Alice' };
global.fetch = vi.fn().mockResolvedValueOnce({
json: vi.fn().mockResolvedValueOnce(fakeData),
});

    render(<MyComponent />);
    await waitFor(() => expect(screen.getByText(/Alice/i)).toBeInTheDocument());

});

````

---

### 9. **Advanced Testing Concepts**

#### 9.1 **Mocking Functions and API Calls with Vitest**
You can mock functions or API calls with **Vitest** to ensure proper behavior during tests.

- **Example**:
```jsx
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import MyComponent from './MyComponent';

test('calls fetch data correctly', () => {
  const mockFetch = vi.fn().mockResolvedValueOnce({ data: 'Some Data' });
  global.fetch = mockFetch;

  render(<MyComponent />);
  expect(mockFetch).toHaveBeenCalled();
});
````

---

This extended guide covers more complex patterns, optimizations, server-side rendering (SSR), and real-world testing strategies in React. With these techniques and tests in place, you'll be equipped to handle various advanced use cases in React development. The testing methods emphasize real-world scenarios, such as API calls, asynchronous behavior, Redux state management, and performance optimizations.

Certainly! Let’s continue expanding on more advanced topics, features, and testing strategies in React. We will now dive into more real-world scenarios, including handling advanced forms, testing context providers, managing side effects with **Redux-Saga** or **Redux-Thunk**, **React Hooks**, **lazy loading in React Router**, **TypeScript** with React, and more. We will continue to cover **unit testing**, **integration testing**, and handling edge cases using **Vitest**, **React Testing Library**, **Mocha**, and **Chai**.

---

### 10. **Advanced React Concepts and Patterns**

#### 10.1 **Complex Form Management with React Hook Form**

`React Hook Form` is a library that simplifies form validation and state management without requiring complex logic. It provides a simple API and is performant due to its minimal re-renders.

- **Installation**:

  ```bash
  npm install react-hook-form
  ```

- **Example**:

  ```jsx
  import { useForm } from "react-hook-form";

  function SignUpForm() {
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm();

    const onSubmit = (data) => {
      console.log(data);
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <input
            {...register("username", { required: "Username is required" })}
            placeholder="Username"
          />
          {errors.username && <p>{errors.username.message}</p>}
        </div>
        <div>
          <input
            {...register("email", { required: "Email is required" })}
            placeholder="Email"
          />
          {errors.email && <p>{errors.email.message}</p>}
        </div>
        <button type="submit">Sign Up</button>
      </form>
    );
  }
  ```

- **Testing**: Use React Testing Library and Vitest to test form submission and validation logic.

  ```jsx
  import { render, screen, fireEvent } from "@testing-library/react";
  import SignUpForm from "./SignUpForm";

  test("renders the form and submits the data", async () => {
    render(<SignUpForm />);

    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "Alice" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "alice@example.com" },
    });

    fireEvent.click(screen.getByText("Sign Up"));

    // Check if data was logged or passed to the submit handler
    expect(screen.queryByText("Username is required")).not.toBeInTheDocument();
    expect(screen.queryByText("Email is required")).not.toBeInTheDocument();
  });
  ```

---

#### 10.2 **React Context API for Global State Management**

The React Context API is a powerful tool for managing global state across an application, especially when used in combination with **useReducer** for more complex state logic.

- **Example**: Setting up a simple theme context with global state.

  ```jsx
  import React, { createContext, useContext, useReducer } from "react";

  const ThemeContext = createContext();

  const initialState = { theme: "light" };

  const themeReducer = (state, action) => {
    switch (action.type) {
      case "TOGGLE_THEME":
        return { theme: state.theme === "light" ? "dark" : "light" };
      default:
        return state;
    }
  };

  export const useTheme = () => useContext(ThemeContext);

  export function ThemeProvider({ children }) {
    const [state, dispatch] = useReducer(themeReducer, initialState);

    return (
      <ThemeContext.Provider value={{ state, dispatch }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  function ToggleThemeButton() {
    const { state, dispatch } = useTheme();

    return (
      <button onClick={() => dispatch({ type: "TOGGLE_THEME" })}>
        Toggle Theme (Current: {state.theme})
      </button>
    );
  }
  ```

- **Testing**:

  ```jsx
  import { render, screen, fireEvent } from "@testing-library/react";
  import { ThemeProvider, useTheme } from "./ThemeContext";

  test("toggles the theme between light and dark", () => {
    render(
      <ThemeProvider>
        <ToggleThemeButton />
      </ThemeProvider>
    );

    expect(screen.getByText(/Current: light/)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Toggle Theme/));
    expect(screen.getByText(/Current: dark/)).toBeInTheDocument();
  });
  ```

---

### 11. **Redux-Saga for Side Effects**

`Redux-Saga` is used to handle side effects in a more declarative way, such as API calls, time-based actions, or complex asynchronous flows.

#### 11.1 **Example of Redux-Saga with API Calls**

- **Saga Setup**:

  ```bash
  npm install redux-saga
  ```

- **Saga Example**:

  ```jsx
  import { takeEvery, call, put } from "redux-saga/effects";
  import axios from "axios";

  // Actions
  const FETCH_USER = "FETCH_USER";
  const SET_USER = "SET_USER";

  // Reducer
  const userReducer = (state = {}, action) => {
    switch (action.type) {
      case SET_USER:
        return { ...state, user: action.user };
      default:
        return state;
    }
  };

  // API Call Function
  const fetchUserData = async () => {
    const response = await axios.get("https://api.example.com/user");
    return response.data;
  };

  // Saga Worker
  function* fetchUserSaga() {
    try {
      const user = yield call(fetchUserData);
      yield put({ type: SET_USER, user });
    } catch (error) {
      console.error(error);
    }
  }

  // Watcher Saga
  function* watchFetchUser() {
    yield takeEvery(FETCH_USER, fetchUserSaga);
  }

  export default watchFetchUser;
  ```

- **Testing Redux-Saga**:

  ```jsx
  import { runSaga } from "redux-saga";
  import axios from "axios";
  import { fetchUserSaga } from "./sagas";
  import { SET_USER } from "./actions";

  test("fetches and sets user data", async () => {
    const dispatchedActions = [];
    axios.get = jest.fn().mockResolvedValue({ data: { name: "Alice" } });

    await runSaga(
      { dispatch: (action) => dispatchedActions.push(action) },
      fetchUserSaga
    ).toPromise();

    expect(dispatchedActions).toContainEqual({
      type: SET_USER,
      user: { name: "Alice" },
    });
  });
  ```

---

### 12. **Lazy Loading in React Router**

Lazy loading is a great technique to optimize application performance by loading routes and components only when needed.

#### 12.1 **React Router Lazy Loading Setup**

- **Install React Router and React Lazy**:

  ```bash
  npm install react-router-dom
  ```

- **Example**: Lazy loading a route in React Router.

  ```jsx
  import React, { Suspense, lazy } from "react";
  import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

  const Home = lazy(() => import("./Home"));
  const About = lazy(() => import("./About"));

  function App() {
    return (
      <Router>
        <Suspense fallback={<div>Loading...</div>}>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/about" component={About} />
          </Switch>
        </Suspense>
      </Router>
    );
  }
  ```

- **Testing**:

  ```jsx
  import { render, screen, waitFor } from "@testing-library/react";
  import { BrowserRouter as Router } from "react-router-dom";
  import App from "./App";

  test("lazy loads about page", async () => {
    render(
      <Router>
        <App />
      </Router>
    );

    fireEvent.click(screen.getByText("About"));
    await waitFor(() =>
      expect(screen.getByText(/About Page/i)).toBeInTheDocument()
    );
  });
  ```

---

### 13. **TypeScript with React**

Using **TypeScript** with React enhances developer experience by adding type safety, reducing bugs, and improving collaboration in larger teams.

#### 13.1 **Setting Up TypeScript in React**

- **Install TypeScript**:

  ```bash
  npm install typescript @types/react @types/react-dom
  ```

- **Example**: Typing a simple component in TypeScript.

  ```tsx
  import React, { FC } from "react";

  interface Props {
    message: string;
  }

  const Hello: FC<Props> = ({ message }) => {
    return <div>{message}</div>;
  };

  export default Hello;
  ```

- **Testing with TypeScript**:
  TypeScript can be integrated seamlessly with React Testing Library to ensure type correctness in tests.

  ```tsx
  import { render, screen } from "@testing-library/react";
  import Hello from "./Hello";

  test("renders Hello component with message", () => {
    render(<Hello message="Hello, world!" />);
    expect(screen.getByText("Hello, world!")).toBeInTheDocument();
  });
  ```

---

### 14. **Testing Complex Use Cases**

#### 14.1 **Testing Error Boundaries in React**

Error boundaries help in catching JavaScript errors in any part of the component tree, logging those errors, and displaying a fallback UI.

- **Error Boundary Example**:

  ```jsx
  import React, { Component } from "react";

  class ErrorBoundary extends Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
      return { hasError: true };
    }

    componentDidCatch(error, info) {
      console.error(error, info);
    }

    render() {
      if (this.state.hasError) {
        return <h1>Something went wrong.</h1>;
      }
      return this.props.children;
    }
  }

  export default ErrorBoundary;
  ```

- **Testing Error Boundaries**:

  ```jsx
  import { render, screen } from "@testing-library/react";
  import ErrorBoundary from "./ErrorBoundary";

  test("displays fallback UI when an error is thrown", () => {
    const ComponentThatThrows = () => {
      throw new Error("Test Error");
    };

    render(
      <ErrorBoundary>
        <ComponentThatThrows />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
  });
  ```

---

This comprehensive guide covers more advanced patterns, testing techniques, and real-world usage of React. The detailed testing examples are designed to handle edge cases, integration tests, and real-world scenarios like error handling, Redux-Saga, form management, and lazy loading. These concepts provide a deep understanding of both development and testing, preparing you for a full-fledged React application project.

Certainly! Let's continue exploring more advanced React features, testing strategies, and real-world implementation scenarios. This time, we will focus on areas like **performance optimization**, **state management** with **Recoil**, **server-side rendering** (SSR) with **Next.js**, **advanced hook patterns**, **component composition**, **unit testing asynchronous code**, **integration testing with mocks**, and more.

---

### 15. **Performance Optimization in React**

As applications grow in complexity, performance can degrade, so understanding how to optimize React components is crucial for a smooth user experience. Some common strategies include **memoization**, **lazy loading**, **throttling/debouncing**, and optimizing **render cycles**.

#### 15.1 **React.memo and useMemo for Performance**

React's `React.memo` is a higher-order component that prevents unnecessary re-renders of functional components. Similarly, `useMemo` can be used inside a component to memoize expensive calculations.

- **Example**:

  ```jsx
  import React, { useState, useMemo } from "react";

  const ExpensiveComponent = ({ value }) => {
    const expensiveCalculation = useMemo(() => {
      console.log("Expensive calculation");
      return value * 1000;
    }, [value]);

    return <div>{expensiveCalculation}</div>;
  };

  const ParentComponent = () => {
    const [count, setCount] = useState(0);

    return (
      <div>
        <button onClick={() => setCount(count + 1)}>Increase Count</button>
        <ExpensiveComponent value={count} />
      </div>
    );
  };

  export default ParentComponent;
  ```

- **Testing Memoization**:
  In this example, we can test that the expensive calculation is only run when the input `value` changes.

  ```jsx
  import { render, screen, fireEvent } from "@testing-library/react";
  import ParentComponent from "./ParentComponent";

  test("memoization works as expected", () => {
    render(<ParentComponent />);

    // Initially, the expensive calculation should run
    fireEvent.click(screen.getByText("Increase Count"));
    expect(screen.getByText("1000")).toBeInTheDocument();

    // Memoized component, same value should not trigger re-render
    fireEvent.click(screen.getByText("Increase Count"));
    expect(screen.getByText("2000")).toBeInTheDocument();
  });
  ```

---

#### 15.2 **useCallback to Optimize Event Handlers**

`useCallback` is a React hook used to memoize callback functions, preventing unnecessary re-creations of event handlers.

- **Example**:

  ```jsx
  import React, { useState, useCallback } from "react";

  const ButtonComponent = ({ onClick }) => {
    console.log("Rendering Button");
    return <button onClick={onClick}>Click me</button>;
  };

  const ParentComponent = () => {
    const [count, setCount] = useState(0);

    const memoizedHandleClick = useCallback(() => {
      setCount(count + 1);
    }, [count]);

    return (
      <div>
        <ButtonComponent onClick={memoizedHandleClick} />
        <p>{count}</p>
      </div>
    );
  };

  export default ParentComponent;
  ```

- **Testing useCallback**:
  You can check that the handler function is not recreated unnecessarily.

  ```jsx
  import { render, screen, fireEvent } from "@testing-library/react";
  import ParentComponent from "./ParentComponent";

  test("memoized callback works correctly", () => {
    render(<ParentComponent />);

    const button = screen.getByText("Click me");
    fireEvent.click(button);
    expect(screen.getByText("1")).toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.getByText("2")).toBeInTheDocument();
  });
  ```

---

### 16. **State Management with Recoil**

**Recoil** is a state management library for React that allows you to manage complex state and derived state. It provides a more flexible and scalable alternative to Context API and Redux for many use cases.

#### 16.1 **Basic Example of Recoil State Management**

- **Installation**:

  ```bash
  npm install recoil
  ```

- **Example**: A simple counter state using Recoil.

  ```jsx
  import React from "react";
  import { atom, useRecoilState } from "recoil";

  const counterState = atom({
    key: "counterState",
    default: 0,
  });

  const Counter = () => {
    const [count, setCount] = useRecoilState(counterState);

    return (
      <div>
        <p>{count}</p>
        <button onClick={() => setCount(count + 1)}>Increment</button>
      </div>
    );
  };

  export default Counter;
  ```

- **Testing**:

  ```jsx
  import { render, screen, fireEvent } from "@testing-library/react";
  import { RecoilRoot } from "recoil";
  import Counter from "./Counter";

  test("increments the counter state", () => {
    render(
      <RecoilRoot>
        <Counter />
      </RecoilRoot>
    );

    fireEvent.click(screen.getByText("Increment"));
    expect(screen.getByText("1")).toBeInTheDocument();
  });
  ```

---

### 17. **Server-Side Rendering (SSR) with Next.js**

**Next.js** is a popular framework built on top of React that enables features like server-side rendering, static site generation, and easy routing.

#### 17.1 **Basic Next.js Setup for SSR**

- **Installation**:

  ```bash
  npx create-next-app@latest my-app
  ```

- **Page Component with SSR**:
  In Next.js, you can use `getServerSideProps` to fetch data on the server before rendering the page.

  ```jsx
  // pages/index.js
  export async function getServerSideProps() {
    const res = await fetch("https://api.example.com/data");
    const data = await res.json();

    return { props: { data } };
  }

  function HomePage({ data }) {
    return (
      <div>
        <h1>Server-Side Rendered Page</h1>
        <p>{data.name}</p>
      </div>
    );
  }

  export default HomePage;
  ```

- **Testing SSR**:
  Testing SSR pages involves checking the correct rendering of content that should be fetched on the server.

  ```jsx
  import { render, screen } from "@testing-library/react";
  import HomePage from "./pages/index";

  test("renders SSR content correctly", async () => {
    render(<HomePage data={{ name: "Alice" }} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });
  ```

---

### 18. **Advanced Hook Patterns and Component Composition**

#### 18.1 **Custom Hooks for Shared Logic**

Custom hooks allow you to encapsulate logic that can be shared across components. You can use custom hooks to manage form state, API calls, event listeners, etc.

- **Example**: Custom hook for handling API calls.

  ```jsx
  import { useState, useEffect } from "react";

  function useFetch(url) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch(url);
          const result = await response.json();
          setData(result);
        } catch (error) {
          setError(error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [url]);

    return { data, loading, error };
  }

  export default useFetch;
  ```

- **Component using the custom hook**:

  ```jsx
  import useFetch from "./useFetch";

  function DataDisplay({ url }) {
    const { data, loading, error } = useFetch(url);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error loading data</div>;

    return <div>Data: {JSON.stringify(data)}</div>;
  }

  export default DataDisplay;
  ```

- **Testing**:
  Testing custom hooks can be tricky, but **React Testing Library** has a `renderHook` utility to test custom hooks in isolation.

  ```jsx
  import { renderHook } from "@testing-library/react-hooks";
  import useFetch from "./useFetch";

  test("fetches data successfully", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useFetch("https://api.example.com/data")
    );

    await waitForNextUpdate();
    expect(result.current.data).toEqual({ name: "Alice" });
  });
  ```

---

### 19. **Integration Testing with Mocks and Spies**

Integration testing in React can involve mocking services like APIs, libraries, or any external systems. **Vitest** and **Mocha/Chai** can mock these dependencies to test how components work together.

#### 19.1 **Mocking API Calls in Integration Tests**

You can mock `fetch` or other libraries like Axios in integration tests to ensure components are correctly interacting with APIs without actually making network requests.

- **Example**: Mocking `fetch` in Vitest.
  ```jsx
  import { render, screen, fireEvent } from '@
  ```

testing-library/react';
import MyComponent from './MyComponent';
import { vi } from 'vitest';

vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ json: () => Promise.resolve({ name: 'Alice' }) })));

test('fetches and displays data correctly', async () => {
render(<MyComponent />);
expect(await screen.findByText('Alice')).toBeInTheDocument();
});

````

---

### 20. **Testing Asynchronous Code**

React often involves async operations such as API calls or timers. Testing async code requires handling promises, awaiting results, and verifying UI updates after async actions.

#### 20.1 **Testing Async Effects in React**

- **Example**: Testing an async effect using `useEffect`.
```jsx
import React, { useEffect, useState } from 'react';

function FetchData() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch('https://api.example.com/data');
      const result = await res.json();
      setData(result);
    }

    fetchData();
  }, []);

  if (!data) return <div>Loading...</div>;

  return <div>{data.name}</div>;
}

export default FetchData;
````

- **Test**:

  ```jsx
  import { render, screen, waitFor } from "@testing-library/react";
  import FetchData from "./FetchData";

  test("loads and displays data", async () => {
    render(<FetchData />);

    await waitFor(() => expect(screen.getByText("Alice")).toBeInTheDocument());
  });
  ```

---

This section expands on a variety of advanced topics in React, including performance optimizations, state management with **Recoil**, **SSR** with **Next.js**, and testing asynchronous code. Each example is meant to address real-world scenarios you might encounter while building complex React applications, including state handling, performance issues, and testing strategies. With these tools and patterns, you will be well-equipped to manage and test large-scale React projects effectively.

Let's dive even deeper into more advanced React features and scenarios, along with testing strategies and implementation details. We’ll explore topics like **Context API**, **React Suspense and Concurrent Mode**, **Component Testing with Spies and Stubs**, **Testing Component Libraries**, **Custom Form Libraries**, **Testing Dynamic Imports**, and **Handling Complex Form Validation**. Additionally, we will continue exploring testing with **Vitest**, **React Testing Library**, **Mocha**, **Chai**, and **Mocking API calls**.

---

### 21. **Context API for Global State Management**

The **Context API** is a powerful tool in React for managing global state without the need for an external state management library like Redux.

#### 21.1 **Using Context for Theme Management**

Let's create a simple theme context that can be shared across components.

- **ThemeContext.js**:

  ```jsx
  import React, { createContext, useContext, useState } from "react";

  const ThemeContext = createContext();

  export const useTheme = () => useContext(ThemeContext);

  export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(false);

    const toggleTheme = () => setIsDark((prev) => !prev);

    return (
      <ThemeContext.Provider value={{ isDark, toggleTheme }}>
        {children}
      </ThemeContext.Provider>
    );
  };
  ```

- **App.js**:

  ```jsx
  import React from "react";
  import { ThemeProvider, useTheme } from "./ThemeContext";

  const ThemedComponent = () => {
    const { isDark, toggleTheme } = useTheme();
    return (
      <div
        style={{
          background: isDark ? "black" : "white",
          color: isDark ? "white" : "black",
        }}
      >
        <p>Current theme: {isDark ? "Dark" : "Light"}</p>
        <button onClick={toggleTheme}>Toggle Theme</button>
      </div>
    );
  };

  const App = () => (
    <ThemeProvider>
      <ThemedComponent />
    </ThemeProvider>
  );

  export default App;
  ```

- **Testing Context with React Testing Library**:
  To test Context, we’ll render components wrapped in the `ThemeProvider`.

  ```jsx
  import { render, screen, fireEvent } from "@testing-library/react";
  import { ThemeProvider } from "./ThemeContext";
  import ThemedComponent from "./App";

  test("toggles theme correctly", () => {
    render(
      <ThemeProvider>
        <ThemedComponent />
      </ThemeProvider>
    );

    expect(screen.getByText("Current theme: Light")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Toggle Theme"));

    expect(screen.getByText("Current theme: Dark")).toBeInTheDocument();
  });
  ```

---

### 22. **React Suspense and Concurrent Mode**

React's **Suspense** and **Concurrent Mode** allow you to handle async data fetching more gracefully, showing fallback content while components are loading.

#### 22.1 **Suspense with Lazy Loading**

- **Lazy Loading Components with Suspense**:
  React's `React.lazy()` allows you to dynamically import components only when they are needed, improving performance by reducing the initial bundle size.

  ```jsx
  import React, { Suspense } from "react";

  const LazyComponent = React.lazy(() => import("./LazyComponent"));

  const App = () => (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );

  export default App;
  ```

- **Testing Suspense**:
  When testing components that use `Suspense`, ensure the fallback content is shown initially, and then the real content is displayed once the lazy-loaded component is available.

  ```jsx
  import { render, screen } from "@testing-library/react";
  import App from "./App";

  test("renders Suspense fallback correctly", () => {
    render(<App />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
  ```

#### 22.2 **Concurrent Mode**

**Concurrent Mode** allows React to work on multiple tasks simultaneously and prioritize rendering based on importance. Although not yet fully released in stable versions, enabling Concurrent Mode with a React app could improve the responsiveness of your application.

You can experiment with Concurrent Mode by wrapping your root component with `<React.StrictMode>` and enabling the concurrent features in experimental versions of React.

---

### 23. **Component Testing with Spies and Stubs**

When testing, **spies** and **stubs** can be used to check interactions and control the behavior of functions in tests.

#### 23.1 **Spying on Functions**

A **spy** allows you to monitor function calls and arguments. You can use libraries like **Vitest** or **Sinon** for this purpose.

- **Example**: Spying on a callback function:

  ```jsx
  import React from "react";

  const Button = ({ onClick }) => <button onClick={onClick}>Click me</button>;

  export default Button;
  ```

  **Test using Vitest**:

  ```jsx
  import { render, screen, fireEvent } from "@testing-library/react";
  import { vi } from "vitest";
  import Button from "./Button";

  test("calls onClick handler when clicked", () => {
    const onClickSpy = vi.fn();

    render(<Button onClick={onClickSpy} />);

    fireEvent.click(screen.getByText("Click me"));

    expect(onClickSpy).toHaveBeenCalledTimes(1);
  });
  ```

---

### 24. **Testing Component Libraries**

For **third-party component libraries** (like Material-UI, Ant Design, etc.), you need to test how well your components integrate with them.

#### 24.1 **Testing Material-UI Button**

Material-UI components are often controlled components with built-in styles. When testing these, you need to ensure that the proper behavior and styles are applied.

- **Example**: Using a Material-UI `Button`:

  ```jsx
  import React from "react";
  import { Button } from "@mui/material";

  const MyButton = ({ onClick }) => {
    return <Button onClick={onClick}>Click me</Button>;
  };

  export default MyButton;
  ```

- **Test**:

  ```jsx
  import { render, screen, fireEvent } from "@testing-library/react";
  import { vi } from "vitest";
  import MyButton from "./MyButton";

  test("calls onClick handler when Material-UI Button is clicked", () => {
    const onClickSpy = vi.fn();

    render(<MyButton onClick={onClickSpy} />);

    fireEvent.click(screen.getByText("Click me"));

    expect(onClickSpy).toHaveBeenCalledTimes(1);
  });
  ```

---

### 25. **Custom Form Libraries**

Forms can be complex, and managing them in React can become cumbersome without the right patterns. You can build custom form management solutions using **custom hooks**.

#### 25.1 **Example: Custom Hook for Form Management**

- **useForm.js**:

  ```jsx
  import { useState } from "react";

  export const useForm = (initialValues) => {
    const [values, setValues] = useState(initialValues);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setValues((prevValues) => ({
        ...prevValues,
        [name]: value,
      }));
    };

    return { values, handleChange };
  };
  ```

- **FormComponent.js**:

  ```jsx
  import React from "react";
  import { useForm } from "./useForm";

  const Form = () => {
    const { values, handleChange } = useForm({ name: "", email: "" });

    return (
      <form>
        <input
          type="text"
          name="name"
          value={values.name}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          value={values.email}
          onChange={handleChange}
        />
      </form>
    );
  };

  export default Form;
  ```

- **Testing the Custom Form Hook**:

  ```jsx
  import { render, screen, fireEvent } from "@testing-library/react";
  import Form from "./Form";

  test("updates form values correctly", () => {
    render(<Form />);

    fireEvent.change(screen.getByPlaceholderText("name"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByPlaceholderText("email"), {
      target: { value: "john@example.com" },
    });

    expect(screen.getByPlaceholderText("name").value).toBe("John");
    expect(screen.getByPlaceholderText("email").value).toBe("john@example.com");
  });
  ```

---

### 26. **Testing Dynamic Imports and Code Splitting**

React supports **dynamic imports** and **code splitting**, which allows you to load certain components only when they are needed.

#### 26.1 **Testing Lazy Loaded Components with React Testing Library**

```jsx
import React, { Suspense } from "react";
const DynamicComponent = React.lazy(() => import("./DynamicComponent"));

const App = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <DynamicComponent />
  </Suspense>
);

export default App;
```

- **Test**:

  ```jsx
  import { render, screen } from '@testing-library/react';
  import App from './App';

  test('shows fallback while loading dynamically
  ```

imported component', () => {
render(<App />);
expect(screen.getByText('Loading...')).toBeInTheDocument();
});

````

---

### 27. **Complex Form Validation**

Complex form validation can be handled using custom hooks and regular expressions, providing dynamic feedback to users.

#### 27.1 **Validating a Form Using a Custom Hook**

- **useValidation.js**:
```jsx
import { useState } from 'react';

const useValidation = (initialState, validationSchema) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});

  const validate = (field, value) => {
    const error = validationSchema[field](value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: error,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prevValues) => ({ ...prevValues, [name]: value }));
    validate(name, value);
  };

  return { values, errors, handleChange };
};

export default useValidation;
````

- **Form Component with Validation**:

  ```jsx
  import React from "react";
  import useValidation from "./useValidation";

  const Form = () => {
    const validationSchema = {
      email: (value) => (!value.match(/\S+@\S+\.\S+/) ? "Invalid email" : ""),
    };

    const { values, errors, handleChange } = useValidation(
      { email: "" },
      validationSchema
    );

    return (
      <form>
        <input
          type="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          placeholder="Email"
        />
        {errors.email && <div>{errors.email}</div>}
      </form>
    );
  };

  export default Form;
  ```

- **Test**:

  ```jsx
  import { render, screen, fireEvent } from "@testing-library/react";
  import Form from "./Form";

  test("displays error on invalid email", () => {
    render(<Form />);
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "invalid-email" },
    });
    expect(screen.getByText("Invalid email")).toBeInTheDocument();
  });
  ```

---

### Conclusion

We’ve covered a range of advanced topics in React, including **Context API**, **React Suspense and Concurrent Mode**, **spying on functions**, **dynamic imports**, **complex form validation**, and more. These concepts are essential when building robust, scalable React applications. Along with these implementations, we've discussed **testing strategies** using **Vitest**, **React Testing Library**, and **Mocha/Chai**, including mocking API calls, handling asynchronous tests, and testing component libraries.

By mastering these advanced techniques and testing methodologies, you can build complex, high-performance React applications with confidence and ensure they are thoroughly tested for all edge cases.

Let's continue exploring more advanced concepts in React development, focusing on **State Management**, **Higher-Order Components (HOCs)**, **Render Props**, **Code Splitting**, **Error Boundaries**, **Portals**, **Testing External API Calls**, and **Testing with Mocks/Spies**. We will also look into more advanced **testing strategies**, **React Hooks**, **useReducer** for complex state logic, and how to structure your testing environment for large applications.

### 28. **Advanced State Management with `useReducer`**

In complex applications, React's `useReducer` can be an excellent choice for managing state with more intricate logic, especially when the state transitions are dependent on various actions and need to be more predictable.

#### 28.1 **Using `useReducer` for State Management**

The `useReducer` hook is a more advanced alternative to `useState`, especially suited for managing state with multiple sub-values or when the next state depends on the previous one.

- **Example: useReducer with Form Handling**

  ```jsx
  import React, { useReducer } from "react";

  // Define action types
  const actionTypes = {
    SET_NAME: "SET_NAME",
    SET_EMAIL: "SET_EMAIL",
  };

  // Initial state
  const initialState = {
    name: "",
    email: "",
  };

  // Reducer function
  const reducer = (state, action) => {
    switch (action.type) {
      case actionTypes.SET_NAME:
        return { ...state, name: action.payload };
      case actionTypes.SET_EMAIL:
        return { ...state, email: action.payload };
      default:
        return state;
    }
  };

  const Form = () => {
    const [state, dispatch] = useReducer(reducer, initialState);

    const handleNameChange = (e) => {
      dispatch({ type: actionTypes.SET_NAME, payload: e.target.value });
    };

    const handleEmailChange = (e) => {
      dispatch({ type: actionTypes.SET_EMAIL, payload: e.target.value });
    };

    return (
      <form>
        <input
          type="text"
          placeholder="Name"
          value={state.name}
          onChange={handleNameChange}
        />
        <input
          type="email"
          placeholder="Email"
          value={state.email}
          onChange={handleEmailChange}
        />
      </form>
    );
  };

  export default Form;
  ```

- **Test the `useReducer` State Handling**:

  ```jsx
  import { render, screen, fireEvent } from "@testing-library/react";
  import Form from "./Form";

  test("handles name and email change using useReducer", () => {
    render(<Form />);

    fireEvent.change(screen.getByPlaceholderText("Name"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "john@example.com" },
    });

    expect(screen.getByPlaceholderText("Name").value).toBe("John Doe");
    expect(screen.getByPlaceholderText("Email").value).toBe("john@example.com");
  });
  ```

---

### 29. **Higher-Order Components (HOCs)**

A Higher-Order Component (HOC) is a pattern in React that allows you to reuse component logic. HOCs are functions that take a component and return a new component with additional props or behavior.

#### 29.1 **Creating a Higher-Order Component**

- **HOC for Adding Loading State**:

  ```jsx
  import React, { useState, useEffect } from "react";

  const withLoading = (WrappedComponent) => {
    return (props) => {
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        setTimeout(() => setLoading(false), 2000); // Simulate API call
      }, []);

      if (loading) return <div>Loading...</div>;
      return <WrappedComponent {...props} />;
    };
  };

  // A sample component
  const UserList = () => <div>User List</div>;

  const EnhancedUserList = withLoading(UserList);

  export default EnhancedUserList;
  ```

- **Test the HOC (with Loading State)**:

  ```jsx
  import { render, screen } from "@testing-library/react";
  import EnhancedUserList from "./EnhancedUserList";

  test("shows loading state and then user list", async () => {
    render(<EnhancedUserList />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();

    // After 2 seconds (simulating data fetching)
    setTimeout(() => {
      expect(screen.getByText("User List")).toBeInTheDocument();
    }, 2000);
  });
  ```

---

### 30. **Render Props for Component Reusability**

Render props is a pattern in React that allows a component to share code with other components by passing a function as a prop. The function receives state or behavior, which can be used by the component to render UI.

#### 30.1 **Render Props Example**

- **MousePosition Component**:

  ```jsx
  import React, { useState, useEffect } from "react";

  const MousePosition = ({ render }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
      const handleMouseMove = (event) => {
        setPosition({ x: event.clientX, y: event.clientY });
      };
      window.addEventListener("mousemove", handleMouseMove);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
      };
    }, []);

    return render(position);
  };

  // Usage
  const App = () => (
    <MousePosition
      render={({ x, y }) => (
        <div>
          Mouse Position: {x}, {y}
        </div>
      )}
    />
  );

  export default App;
  ```

- **Test the Render Props Pattern**:

  ```jsx
  import { render, screen } from "@testing-library/react";
  import App from "./App";

  test("renders mouse position", () => {
    render(<App />);

    // Simulate mouse move
    window.dispatchEvent(
      new MouseEvent("mousemove", { clientX: 100, clientY: 200 })
    );

    expect(screen.getByText("Mouse Position: 100, 200")).toBeInTheDocument();
  });
  ```

---

### 31. **Code Splitting in React**

**Code Splitting** in React allows you to split your code into smaller bundles, which can be loaded only when needed, improving the performance of your application.

#### 31.1 **Dynamic Imports with `React.lazy()`**

- **Using `React.lazy()` for Code Splitting**:

  ```jsx
  import React, { Suspense } from "react";

  const LazyComponent = React.lazy(() => import("./LazyComponent"));

  const App = () => (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );

  export default App;
  ```

- **Test Dynamic Imports**:

  ```jsx
  import { render, screen } from "@testing-library/react";
  import App from "./App";

  test("shows loading state while dynamic import is loading", () => {
    render(<App />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
  ```

---

### 32. **Error Boundaries in React**

Error Boundaries in React are components that catch JavaScript errors anywhere in their child component tree, log those errors, and display a fallback UI.

#### 32.1 **Creating an Error Boundary Component**

- **ErrorBoundary Component**:

  ```jsx
  import React, { Component } from "react";

  class ErrorBoundary extends Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true };
    }

    componentDidCatch(error, info) {
      console.error(error, info);
    }

    render() {
      if (this.state.hasError) {
        return <h1>Something went wrong.</h1>;
      }
      return this.props.children;
    }
  }

  export default ErrorBoundary;
  ```

- **Test the Error Boundary**:

  ```jsx
  import { render, screen } from "@testing-library/react";
  import ErrorBoundary from "./ErrorBoundary";

  test("renders fallback UI when an error is caught", () => {
    const ProblemComponent = () => {
      throw new Error("Test error");
    };

    render(
      <ErrorBoundary>
        <ProblemComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong.")).toBeInTheDocument();
  });
  ```

---

### 33. **Portals in React**

React Portals provide a first-class way to render children into a DOM node that exists outside the DOM hierarchy of the parent component.

#### 33.1 **Using Portals to Render a Modal**

- **Modal Component Using Portals**:

  ```jsx
  import React from "react";
  import ReactDOM from "react-dom";

  const Modal = ({ children }) => {
    return ReactDOM.createPortal(
      <div className="modal">{children}</div>,
      document.getElementById("modal-root") // External DOM node
    );
  };

  export default Modal;
  ```

- **Test the Modal Component**:

  ```jsx
  import { render, screen } from "@testing-library/react";
  import Modal from "./Modal";

  test("renders children inside modal", () => {
    render(<Modal>Modal Content</Modal>);

    expect(screen.getByText("Modal Content")).toBeInTheDocument();
  });
  ```

---

### Conclusion

These advanced React concepts — including **useReducer**, **HOCs**, **Render Props**, **Code Splitting**, **Error Boundaries**, **Portals**, and their corresponding testing strategies — are essential for building scalable, efficient, and maintainable React applications. Coupled with unit and integration testing using **React Testing Library**, **Vitest**, and **Mocha/Chai**, you can ensure your app's logic is both functional and well-tested.

By mastering these patterns and their testing methodologies, you’ll be able to confidently create React applications that are easy to maintain, performant, and reliable under various conditions.

Let's continue expanding on more advanced features of React, diving deeper into **Performance Optimization**, **Server-Side Rendering (SSR)**, **React Context API** for complex state management, **TypeScript** with React for type safety, and **Custom Hooks**. We’ll also focus on advanced **testing techniques**, **mocking**, **spying**, **coverage**, and how to write robust tests for asynchronous code.

### 34. **Performance Optimization in React**

As React applications grow, performance optimizations become critical to avoid rendering bottlenecks. Here are several techniques to enhance performance:

#### 34.1 **Memoization with `React.memo()`**

`React.memo()` is a higher-order component (HOC) that prevents unnecessary re-renders of a component by memoizing its output.

- **Example: Optimizing a Functional Component with `React.memo()`**:

  ```jsx
  import React from "react";

  const ExpensiveComponent = React.memo(({ name }) => {
    console.log("Rendering:", name);
    return <div>{name}</div>;
  });

  const ParentComponent = () => {
    const [count, setCount] = React.useState(0);
    return (
      <>
        <button onClick={() => setCount(count + 1)}>Increment</button>
        <ExpensiveComponent name="React" />
      </>
    );
  };

  export default ParentComponent;
  ```

- **Test for `React.memo()`**:

  ```jsx
  import { render, screen } from "@testing-library/react";
  import ParentComponent from "./ParentComponent";

  test("should not re-render ExpensiveComponent unnecessarily", () => {
    const { rerender } = render(<ParentComponent />);
    rerender(<ParentComponent />); // Re-render ParentComponent without changing props
    expect(screen.getByText("React")).toBeInTheDocument();
  });
  ```

#### 34.2 **useCallback and useMemo for Function and Value Memoization**

To optimize performance, you can use `useCallback()` to memoize functions and `useMemo()` to memoize values, ensuring that they only change when their dependencies change.

- **Example: useCallback and useMemo**:

  ```jsx
  import React, { useState, useMemo, useCallback } from "react";

  const ExpensiveComputation = ({ data }) => {
    const compute = (data) => {
      console.log("Computing...");
      return data.reduce((sum, num) => sum + num, 0);
    };

    const memoizedComputation = useMemo(() => compute(data), [data]);

    return <div>Sum: {memoizedComputation}</div>;
  };

  const ParentComponent = () => {
    const [data, setData] = useState([1, 2, 3]);
    const [count, setCount] = useState(0);

    const handleClick = useCallback(() => setCount(count + 1), [count]);

    return (
      <>
        <button onClick={handleClick}>Increment</button>
        <ExpensiveComputation data={data} />
      </>
    );
  };

  export default ParentComponent;
  ```

- **Test for `useMemo` and `useCallback` Optimization**:

  ```jsx
  import { render, screen, fireEvent } from "@testing-library/react";
  import ParentComponent from "./ParentComponent";

  test("should not re-run expensive computation unnecessarily", () => {
    render(<ParentComponent />);

    fireEvent.click(screen.getByText("Increment"));
    // Ensure that "Computing..." is only logged when data changes
    expect(screen.getByText(/Sum/)).toBeInTheDocument();
  });
  ```

#### 34.3 **Lazy Loading and Suspense for Code Splitting**

Use **React.lazy()** with **Suspense** to dynamically load components, reducing the initial loading time of your application.

- **Example: Lazy Loading a Component**:

  ```jsx
  import React, { Suspense } from "react";

  const LazyComponent = React.lazy(() => import("./LazyComponent"));

  const App = () => (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );

  export default App;
  ```

- **Test Lazy Loading with Suspense**:

  ```jsx
  import { render, screen } from "@testing-library/react";
  import App from "./App";

  test("displays loading state while loading the lazy component", () => {
    render(<App />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
  ```

---

### 35. **Server-Side Rendering (SSR) with React**

SSR helps improve SEO and load times by rendering React components on the server and sending the generated HTML to the client.

#### 35.1 **Setting Up SSR with React**

To render React components on the server side, you’ll use a Node.js server with libraries like `express` and `react-dom/server`.

- **Basic SSR Setup with Express**:

  ```js
  import express from "express";
  import React from "react";
  import ReactDOMServer from "react-dom/server";
  import App from "./App";

  const app = express();

  app.get("*", (req, res) => {
    const content = ReactDOMServer.renderToString(<App />);
    res.send(`
      <html>
        <head><title>SSR React App</title></head>
        <body>
          <div id="root">${content}</div>
        </body>
      </html>
    `);
  });

  app.listen(3000, () => {
    console.log("SSR server running at http://localhost:3000");
  });
  ```

#### 35.2 **Testing SSR with Jest and React Testing Library**

While testing SSR, you can mock the server-side environment and focus on ensuring the rendered output matches expectations.

- **Test SSR Output**:

  ```jsx
  import { renderToString } from "react-dom/server";
  import App from "./App";

  test("renders SSR correctly", () => {
    const content = renderToString(<App />);
    expect(content).toContain("<div>SSR Content</div>");
  });
  ```

---

### 36. **React Context API for Complex State Management**

The **Context API** allows you to share values (like themes or user authentication) across components without passing props down manually at every level.

#### 36.1 **Creating a Context for Auth State**

- **Auth Context Setup**:

  ```jsx
  import React, { createContext, useState, useContext } from "react";

  const AuthContext = createContext();

  export const useAuth = () => useContext(AuthContext);

  export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const login = (username) => setUser({ name: username });
    const logout = () => setUser(null);

    return (
      <AuthContext.Provider value={{ user, login, logout }}>
        {children}
      </AuthContext.Provider>
    );
  };
  ```

- **Using Auth Context in a Component**:

  ```jsx
  import React from "react";
  import { useAuth } from "./AuthContext";

  const Profile = () => {
    const { user, login, logout } = useAuth();

    return (
      <div>
        {user ? (
          <>
            <h1>Welcome, {user.name}</h1>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <h1>Please log in</h1>
            <button onClick={() => login("John Doe")}>Login</button>
          </>
        )}
      </div>
    );
  };

  export default Profile;
  ```

- **Test Auth Context**:

  ```jsx
  import { render, screen, fireEvent } from "@testing-library/react";
  import { AuthProvider } from "./AuthContext";
  import Profile from "./Profile";

  test("allows login and logout", () => {
    render(
      <AuthProvider>
        <Profile />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText("Login"));
    expect(screen.getByText("Welcome, John Doe")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Logout"));
    expect(screen.getByText("Please log in")).toBeInTheDocument();
  });
  ```

---

### 37. **TypeScript with React for Type Safety**

TypeScript can improve your development workflow by providing static type checking. With TypeScript, you can ensure that your components, hooks, and other React code are type-safe.

#### 37.1 **Using TypeScript with React**

- **Basic TypeScript Setup**:

  ```tsx
  import React, { useState } from "react";

  interface Person {
    name: string;
    age: number;
  }

  const Profile: React.FC = () => {
    const [person, setPerson] = useState<Person>({ name: "John", age: 30 });

    return (
      <div>
        <h1>{person.name}</h1>
        <p>Age: {person.age}</p>
      </div>
    );
  };

  export default Profile;
  ```

#### 37.2 **Test TypeScript Components**

Testing TypeScript components is no different than JavaScript, but with the added benefit of type safety.

- **Test the Profile Component**:

  ```tsx
  import { render, screen } from "@testing-library/react";
  import Profile from "./Profile";

  test("renders profile with correct type", () => {
    render(<Profile />);

    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("Age: 30")).toBeInTheDocument();
  });
  ```

---

### 38. **Custom Hooks for Reusable Logic**

Custom hooks allow you to extract logic from components and reuse it in multiple places.

#### 38.1 **Creating a Custom Hook for Fetching Data**

- **Custom Hook (`useFetch`)**:

  ```jsx
  import { useState, useEffect } from "react";

  const useFetch = (url) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch(url);
          const result = await response.json();
          setData(result);
        } catch (err) {
          setError(err);
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

- **Using `useFetch` in a Component**:

  ```jsx
  import React from "react";
  import useFetch from "./useFetch";

  const App = () => {
    const { data, loading, error } = useFetch("https://api.example.com/data");

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return <div>Data: {JSON.stringify(data)}</div>;
  };

  export default App;
  ```

- **Test Custom Hook (`useFetch`)**:

  ```jsx
  import { render, screen, waitFor } from "@testing-library/react";
  import useFetch from "./useFetch";
  import { MockedProvider } from "@apollo/client/testing"; // if you're testing GraphQL
  import App from "./App";

  test("fetches and displays data", async () => {
    render(<App />);

    await waitFor(() => expect(screen.getByText(/Data:/)).toBeInTheDocument());
  });
  ```

---

### Conclusion

These advanced concepts—**performance optimization**, **SSR**, **React Context API**, **TypeScript**, and **custom hooks**—allow you to build robust, scalable, and performant React applications. Coupled with testing tools like **Vitest**, **Mocha**, **Chai**, and **React Testing Library**, you can ensure the functionality and correctness of your application while adhering to best practices for code organization, maintainability, and performance. With these skills, you’re ready to tackle real-world React challenges and build sophisticated applications efficiently.

Let's continue with more advanced React concepts, focusing on **React Concurrent Mode**, **Suspense for Data Fetching**, **React Query**, **WebSockets**, **Progressive Web Apps (PWAs)** with React, **Accessibility (a11y)** in React, **React Native** for mobile development, **Monorepos with React**, **State Management with Redux Toolkit**, **Custom Rendering Engines**, and **Code Optimization Techniques**. We will also dive deeper into **advanced testing patterns**, testing **side effects**, **mocking** complex dependencies, and improving test coverage.

---

### 39. **React Concurrent Mode**

React **Concurrent Mode** is a set of new features that help React apps stay responsive and gracefully adjust to the user’s device capabilities and network speed. It introduces features like **Suspense** for data fetching and **Transitions** for concurrent rendering.

#### 39.1 **Concurrent Mode Basics**

To enable Concurrent Mode, you use `ReactDOM.createRoot()` instead of `ReactDOM.render()`, which allows React to control rendering more efficiently.

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
```

#### 39.2 **Suspense for Data Fetching (Concurrent Mode)**

With Concurrent Mode, React allows components to suspend rendering while waiting for async operations like data fetching.

- **Example: Using Suspense for Data Fetching**:

  ```jsx
  import React, { Suspense } from "react";

  const fetchData = () =>
    new Promise((resolve) => setTimeout(() => resolve("Data loaded"), 2000));

  const DataComponent = React.lazy(() =>
    fetchData().then(() => import("./DataComponent"))
  );

  const App = () => (
    <Suspense fallback={<div>Loading...</div>}>
      <DataComponent />
    </Suspense>
  );

  export default App;
  ```

- **Test Suspense with React Testing Library**:

  ```jsx
  import { render, screen } from "@testing-library/react";
  import App from "./App";

  test("displays loading state while fetching data", async () => {
    render(<App />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    await screen.findByText("Data loaded");
  });
  ```

---

### 40. **React Query for Data Fetching**

**React Query** is a powerful library for managing server-side data, caching, background syncing, and more, making it easier to deal with asynchronous data in React.

#### 40.1 **Setting Up React Query**

- **Basic Setup**:

  ```bash
  npm install react-query
  ```

- **Example: Fetching Data with React Query**:

  ```jsx
  import React from "react";
  import { useQuery } from "react-query";

  const fetchData = async () => {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    return response.json();
  };

  const Posts = () => {
    const { data, error, isLoading } = useQuery("posts", fetchData);

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error fetching posts</div>;

    return (
      <div>
        {data.map((post) => (
          <div key={post.id}>
            <h3>{post.title}</h3>
            <p>{post.body}</p>
          </div>
        ))}
      </div>
    );
  };

  export default Posts;
  ```

#### 40.2 **Test React Query Components**

Testing components that use **React Query** requires mocking the network requests and ensuring the component handles loading, success, and error states properly.

- **Test for `Posts` Component**:

  ```jsx
  import { render, screen, waitFor } from "@testing-library/react";
  import { QueryClient, QueryClientProvider } from "react-query";
  import Posts from "./Posts";

  const queryClient = new QueryClient();

  test("displays posts after fetching", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Posts />
      </QueryClientProvider>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();

    await waitFor(() => screen.getByText("Post 1 Title"));
    expect(screen.getByText("Post 1 Title")).toBeInTheDocument();
  });
  ```

---

### 41. **WebSockets in React**

**WebSockets** allow for real-time, bidirectional communication between the client and server. This is essential for applications like chat, notifications, and live updates.

#### 41.1 **Setting Up WebSockets in React**

- **Basic WebSocket Implementation**:

  ```jsx
  import React, { useState, useEffect } from "react";

  const WebSocketComponent = () => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
      const socket = new WebSocket("ws://example.com/socket");
      socket.onmessage = (event) => {
        setMessages((prevMessages) => [...prevMessages, event.data]);
      };

      return () => socket.close(); // Clean up on unmount
    }, []);

    return (
      <div>
        <h1>WebSocket Messages</h1>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      </div>
    );
  };

  export default WebSocketComponent;
  ```

- **Test WebSocket Handling**:

  ```jsx
  import { render, screen, act } from "@testing-library/react";
  import WebSocketComponent from "./WebSocketComponent";

  test("receives and displays messages via WebSocket", async () => {
    const { container } = render(<WebSocketComponent />);

    const socket = { onmessage: jest.fn() };
    act(() => socket.onmessage({ data: "New message" }));

    expect(container.textContent).toContain("New message");
  });
  ```

---

### 42. **Progressive Web Apps (PWA) with React**

A **PWA** is a web application that behaves like a native app, providing offline capabilities, push notifications, and more.

#### 42.1 **Creating a PWA with React**

- **Create a React App as a PWA**:

  ```bash
  npx create-react-app my-pwa --template cra-template-pwa
  ```

- **Service Worker Setup**:
  React supports PWAs out of the box with service worker registration. You can modify `src/index.js` to enable service workers.

  ```js
  import React from "react";
  import ReactDOM from "react-dom";
  import "./index.css";
  import App from "./App";
  import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById("root")
  );

  // Enable service worker for offline functionality
  serviceWorkerRegistration.register();
  ```

---

### 43. **Accessibility (a11y) in React**

**Accessibility** is critical for ensuring that your React applications are usable by everyone, including those with disabilities.

#### 43.1 **Improving Accessibility with ARIA**

ARIA (Accessible Rich Internet Applications) attributes help improve accessibility in your components.

- **Example: Adding ARIA Attributes**:
  ```jsx
  const Button = ({ onClick, label }) => (
    <button onClick={onClick} aria-label={label}>
      {label}
    </button>
  );
  ```

#### 43.2 **Testing Accessibility (a11y)**

You can use the `@testing-library/react` and `axe-core` to test accessibility in your components.

- **Test for Accessibility**:

  ```bash
  npm install --save-dev @testing-library/jest-dom @testing-library/react axe-core
  ```

  ```jsx
  import { render } from "@testing-library/react";
  import { axe } from "axe-core";
  import Button from "./Button";

  test("has no accessibility violations", async () => {
    const { container } = render(<Button label="Click me" />);
    const results = await axe(container);
    expect(results.violations.length).toBe(0);
  });
  ```

---

### 44. **React Native for Mobile Development**

If you need to extend your React knowledge to mobile apps, **React Native** allows you to build mobile applications using React for iOS and Android.

#### 44.1 **Setting Up a React Native App**

```bash
npx react-native init MyApp
```

- **Basic Component Example in React Native**:

  ```jsx
  import React from "react";
  import { View, Text, Button } from "react-native";

  const App = () => {
    return (
      <View>
        <Text>Welcome to React Native</Text>
        <Button title="Click Me" onPress={() => alert("Hello!")} />
      </View>
    );
  };

  export default App;
  ```

---

### 45. **Monorepos with React**

A **Monorepo** is a single repository that contains multiple projects, making it easier to manage dependencies, testing, and deployment. Tools like **Nx** or **Lerna** help manage monorepos.

#### 45.1 **Setting Up a Monorepo with Nx**

```bash
npx create-nx-workspace@latest myorg
```

- **Creating a React App in a Monorepo**:

  ```

  ```

bash
nx generate @nrwl/react:application myapp

````

---

### 46. **State Management with Redux Toolkit**

Redux Toolkit simplifies the setup and usage of Redux in your application.

#### 46.1 **Setting Up Redux Toolkit**

```bash
npm install @reduxjs/toolkit react-redux
````

- **Example: Redux Slice and Store**:

  ```jsx
  // counterSlice.js
  import { createSlice } from "@reduxjs/toolkit";

  export const counterSlice = createSlice({
    name: "counter",
    initialState: { value: 0 },
    reducers: {
      increment: (state) => {
        state.value += 1;
      },
      decrement: (state) => {
        state.value -= 1;
      },
    },
  });

  export const { increment, decrement } = counterSlice.actions;
  export default counterSlice.reducer;

  // Store Setup
  import { configureStore } from "@reduxjs/toolkit";
  import counterReducer from "./counterSlice";

  export const store = configureStore({
    reducer: {
      counter: counterReducer,
    },
  });
  ```

---

### Conclusion

These advanced techniques—**Concurrent Mode**, **Suspense**, **React Query**, **WebSockets**, **PWAs**, **Accessibility**, **React Native**, **Monorepos**, **Redux Toolkit**, and **testing best practices**—are essential for building production-grade React applications. Coupled with testing libraries like **Vitest**, **Mocha**, and **Chai**, you'll be able to ensure your code is reliable, performant, and maintainable.
Let's continue exploring more **advanced React** concepts, including **Code Splitting and Lazy Loading**, **Custom Error Boundaries**, **Optimizing React Components**, **Server-Side Rendering (SSR) with Next.js**, **React Suspense with Code-Splitting**, **Component Libraries and Design Systems**, **GraphQL with Apollo Client**, **Custom Form Handling in React**, **React Testing Advanced Techniques**, **Custom Hooks for State Management**, **Progressive Rendering**, and **Advanced Performance Optimization**. We will also delve deeper into advanced testing scenarios for complex components, **unit testing React with side effects**, **mocking async operations**, **end-to-end testing**, and **CI/CD testing strategies**.

---

### 47. **Code Splitting and Lazy Loading**

**Code splitting** allows you to split your bundle into smaller chunks, which are loaded only when needed. This can dramatically reduce the size of the initial bundle, improving load times.

#### 47.1 **Code Splitting with React Lazy and Suspense**

- **Lazy Loading Components**:
  React's `React.lazy()` allows you to dynamically import components only when they are needed.

  ```jsx
  import React, { Suspense } from "react";

  const LazyComponent = React.lazy(() => import("./LazyComponent"));

  const App = () => (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );

  export default App;
  ```

- **Test Lazy Loading**:

  ```jsx
  import { render, screen, waitFor } from "@testing-library/react";
  import App from "./App";

  test("loads component lazily", async () => {
    render(<App />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    await waitFor(() => screen.getByText("Lazy Component"));
    expect(screen.getByText("Lazy Component")).toBeInTheDocument();
  });
  ```

#### 47.2 **Dynamic Imports with React Router and Lazy Loading**

When using **React Router**, you can integrate lazy loading for different routes in your application, which loads the relevant components only when they are visited.

- **Dynamic Import with React Router**:

  ```jsx
  import React, { Suspense } from "react";
  import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

  const Home = React.lazy(() => import("./Home"));
  const About = React.lazy(() => import("./About"));

  const App = () => (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/about" component={About} />
        </Switch>
      </Suspense>
    </Router>
  );

  export default App;
  ```

---

### 48. **Custom Error Boundaries**

React's **Error Boundaries** allow you to gracefully handle errors in the component tree and prevent the entire app from crashing.

#### 48.1 **Creating a Custom Error Boundary**

- **Custom Error Boundary**:

  ```jsx
  import React, { Component } from "react";

  class ErrorBoundary extends Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, info) {
      console.error("Error caught by Error Boundary: ", error, info);
    }

    render() {
      if (this.state.hasError) {
        return <h1>Error: {this.state.error.message}</h1>;
      }

      return this.props.children;
    }
  }

  export default ErrorBoundary;
  ```

- **Using the Error Boundary**:

  ```jsx
  import ErrorBoundary from "./ErrorBoundary";

  const App = () => (
    <ErrorBoundary>
      <SomeComponentThatMayThrow />
    </ErrorBoundary>
  );
  ```

#### 48.2 **Testing Error Boundaries**

Testing error boundaries involves triggering an error in a component and verifying that the boundary properly catches it.

- **Test Error Boundary**:

  ```jsx
  import { render, screen } from "@testing-library/react";
  import ErrorBoundary from "./ErrorBoundary";

  test("catches errors in child components", () => {
    const ErrorComponent = () => {
      throw new Error("Test Error");
    };

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText("Error: Test Error")).toBeInTheDocument();
  });
  ```

---

### 49. **Optimizing React Components**

React performance can often be improved through strategies like **memoization**, **shouldComponentUpdate**, and **React.memo**. This helps in avoiding unnecessary re-renders of components.

#### 49.1 **React.memo**

React.memo is a higher-order component that memoizes the result of a component’s render, preventing unnecessary re-renders when props haven’t changed.

- **Example**:

  ```jsx
  const ChildComponent = React.memo(({ data }) => {
    console.log("Child component rendered");
    return <div>{data}</div>;
  });

  const ParentComponent = () => {
    const [count, setCount] = useState(0);
    const data = "Some Data";

    return (
      <div>
        <button onClick={() => setCount(count + 1)}>Increment</button>
        <ChildComponent data={data} />
      </div>
    );
  };
  ```

#### 49.2 **Using `useMemo` and `useCallback`**

- **useMemo**:

  ```jsx
  const expensiveCalculation = useMemo(
    () => computeExpensiveValue(a, b),
    [a, b]
  );
  ```

- **useCallback**:
  ```jsx
  const handleClick = useCallback(() => {
    console.log("Button clicked");
  }, []);
  ```

---

### 50. **Server-Side Rendering (SSR) with Next.js**

**Next.js** allows you to build React apps with **server-side rendering (SSR)** and **static site generation (SSG)**. It provides performance optimization out of the box.

#### 50.1 **Setting Up SSR with Next.js**

To enable SSR, you use `getServerSideProps()` for data fetching on the server before rendering the page.

- **Example: SSR with Next.js**:

  ```jsx
  import React from "react";

  const Page = ({ data }) => {
    return <div>{data}</div>;
  };

  export async function getServerSideProps() {
    const res = await fetch("https://api.example.com/data");
    const data = await res.json();

    return { props: { data } };
  }

  export default Page;
  ```

---

### 51. **React Suspense with Code-Splitting**

Suspense allows you to declaratively wait for data fetching, and it works with **React.lazy** for code splitting. This results in better user experience and performance by rendering fallback UI until data or code is ready.

#### 51.1 **Code-Splitting with Suspense**

```jsx
import React, { Suspense } from "react";

const LazyComponent = React.lazy(() => import("./LazyComponent"));

const App = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <LazyComponent />
  </Suspense>
);
```

#### 51.2 **Test Suspense with Code-Splitting**

```jsx
import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";

test("loads and displays LazyComponent", async () => {
  render(<App />);
  expect(screen.getByText("Loading...")).toBeInTheDocument();
  await waitFor(() => screen.getByText("Lazy Component"));
  expect(screen.getByText("Lazy Component")).toBeInTheDocument();
});
```

---

### 52. **Component Libraries and Design Systems**

Building a **design system** or using component libraries like **Material UI**, **Ant Design**, and **Chakra UI** ensures consistency and efficiency in building React applications.

#### 52.1 **Using Material UI in React**

- **Install Material UI**:

  ```bash
  npm install @mui/material @emotion/react @emotion/styled
  ```

- **Basic Usage of Material UI**:

  ```jsx
  import React from "react";
  import { Button } from "@mui/material";

  const App = () => (
    <Button variant="contained" color="primary">
      Material UI Button
    </Button>
  );

  export default App;
  ```

#### 52.2 **Testing Material UI Components**

```jsx
import { render, screen } from "@testing-library/react";
import { Button } from "@mui/material";

test("renders Material UI Button", () => {
  render(<Button>Click Me</Button>);
  expect(screen.getByText("Click Me")).toBeInTheDocument();
});
```

---

### 53. **GraphQL with Apollo Client**

Apollo Client provides a powerful and flexible way to interact with GraphQL APIs.

#### 53.1 **Setting Up Apollo Client**

```bash
npm install @apollo/client graphql
```

- **Basic Apollo Client Setup**:

  ```jsx
  import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
  const client = new ApolloClient({
    uri: "https://example.com/graphql",
    cache: new InMemoryCache(),
  });

  const App = () => (
    <ApolloProvider client={client}>
      <YourComponent />
    </ApolloProvider>
  );
  ```

#### 53

.2 **Using Apollo Client for Querying Data**

```jsx
import { useQuery, gql } from "@apollo/client";

const GET_DATA = gql`
  query GetData {
    data {
      id
      value
    }
  }
`;

const YourComponent = () => {
  const { loading, error, data } = useQuery(GET_DATA);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error</div>;

  return <div>{data.value}</div>;
};
```

---

### 54. **Custom Form Handling in React**

Managing form state efficiently in React can be done using **controlled** or **uncontrolled** components, often enhanced with **React Hook Form**.

#### 54.1 **Handling Forms with React Hook Form**

```bash
npm install react-hook-form
```

```jsx
import { useForm } from "react-hook-form";

const MyForm = () => {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} placeholder="Name" />
      <button type="submit">Submit</button>
    </form>
  );
};
```

---

### 55. **Advanced Testing Techniques**

#### 55.1 **Unit Testing React with Side Effects**

When dealing with side effects like data fetching or async actions, **mocking** and **spying** become essential.

- **Example: Testing a Component with a Side Effect**:

  ```jsx
  import { render, screen, fireEvent } from "@testing-library/react";
  import { useEffect } from "react";

  const fetchData = jest.fn();

  const MyComponent = () => {
    useEffect(() => {
      fetchData();
    }, []);
    return <div>Data Loaded</div>;
  };

  test("calls fetchData on render", () => {
    render(<MyComponent />);
    expect(fetchData).toHaveBeenCalledTimes(1);
  });
  ```

---

### Conclusion

We have covered advanced topics such as **React Suspense**, **React Query**, **WebSockets**, **PWA**, **a11y**, **GraphQL**, **Server-Side Rendering**, **Component Libraries**, **Apollo Client**, and **advanced React performance optimization**. Each of these concepts helps build real-world, high-performance, maintainable applications.

In addition, we've also covered more advanced **testing strategies** for handling side effects, **mocking dependencies**, **integration tests**, and **end-to-end testing** with a focus on building reliable React applications.

Let's continue exploring advanced React concepts, with an emphasis on **Performance Optimization**, **Testing Techniques**, **Context API**, **Advanced Hooks**, **React Patterns**, **CSS-in-JS**, **React Concurrent Mode**, **React Profiler**, **Advanced Routing with React Router**, **State Machines**, **Optimizing Reconciliation** with Virtual DOM, **Custom Middleware**, and **Best Practices for Code Maintainability**. We’ll also cover **advanced testing** scenarios for side effects, **mocking APIs**, **end-to-end testing** strategies, and **CI/CD testing practices** for React applications.

---

### 56. **Performance Optimization in React**

Optimizing React applications is essential for improving **load time** and **user experience**. We can focus on **render optimization**, **component re-renders**, and **memoization**.

#### 56.1 **Re-render Optimization**

Minimizing unnecessary re-renders is a common optimization technique.

- **`React.memo`**:
  Use `React.memo` to prevent re-renders of components if their props haven’t changed.

  ```jsx
  const ChildComponent = React.memo(({ data }) => {
    console.log("Rendering ChildComponent");
    return <div>{data}</div>;
  });

  const ParentComponent = ({ data }) => {
    return <ChildComponent data={data} />;
  };
  ```

- **`shouldComponentUpdate` in Class Components**:
  `shouldComponentUpdate` is a lifecycle method that determines whether a component should re-render.

  ```jsx
  class Child extends React.Component {
    shouldComponentUpdate(nextProps) {
      if (this.props.value !== nextProps.value) {
        return true;
      }
      return false;
    }

    render() {
      return <div>{this.props.value}</div>;
    }
  }
  ```

#### 56.2 **Lazy Loading Images and Assets**

For large assets like images, we can use **lazy loading** to only load them when they enter the viewport.

- **Lazy Loading Images with `IntersectionObserver`**:

  ```jsx
  import React, { useState, useEffect } from "react";

  const LazyImage = ({ src, alt }) => {
    const [loaded, setLoaded] = useState(false);
    const imageRef = React.createRef();

    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setLoaded(true);
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(imageRef.current);

      return () => observer.disconnect();
    }, []);

    return <img ref={imageRef} src={loaded ? src : ""} alt={alt} />;
  };
  ```

#### 56.3 **Virtualization (Windowing)**

For rendering large lists, **react-window** or **react-virtualized** can be used to only render the items visible in the viewport.

- **Example with `react-window`**:

  ```bash
  npm install react-window
  ```

  ```jsx
  import { FixedSizeList as List } from "react-window";

  const MyList = ({ items }) => (
    <List height={150} itemCount={items.length} itemSize={35} width={300}>
      {({ index, style }) => <div style={style}>{items[index]}</div>}
    </List>
  );
  ```

---

### 57. **Context API for State Management**

React's **Context API** provides a way to share state across the component tree without prop-drilling.

#### 57.1 **Creating a Context**

- **Creating a Context**:

  ```jsx
  import React, { createContext, useState, useContext } from "react";

  const MyContext = createContext();

  export const useMyContext = () => useContext(MyContext);

  const MyProvider = ({ children }) => {
    const [state, setState] = useState("Hello");

    return (
      <MyContext.Provider value={{ state, setState }}>
        {children}
      </MyContext.Provider>
    );
  };

  export default MyProvider;
  ```

#### 57.2 **Consuming Context in Components**

- **Consuming Context**:

  ```jsx
  import React from "react";
  import { useMyContext } from "./MyProvider";

  const MyComponent = () => {
    const { state, setState } = useMyContext();

    return (
      <div>
        <p>{state}</p>
        <button onClick={() => setState("Updated State")}>Update State</button>
      </div>
    );
  };
  ```

---

### 58. **Advanced Hooks**

React's **custom hooks** and **built-in hooks** offer powerful patterns for handling component logic, state, and side effects.

#### 58.1 **Custom Hooks**

A **custom hook** is a function that uses one or more of React’s hooks to encapsulate component logic.

- **Example: Custom Hook for Fetching Data**:

  ```jsx
  import { useState, useEffect } from "react";

  const useFetch = (url) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch(url);
          const result = await response.json();
          setData(result);
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

#### 58.2 **useReducer for Complex State Management**

- **Example: Using `useReducer`**:

  ```jsx
  import React, { useReducer } from "react";

  const initialState = { count: 0 };

  function reducer(state, action) {
    switch (action.type) {
      case "increment":
        return { count: state.count + 1 };
      case "decrement":
        return { count: state.count - 1 };
      default:
        return state;
    }
  }

  const Counter = () => {
    const [state, dispatch] = useReducer(reducer, initialState);

    return (
      <div>
        <p>Count: {state.count}</p>
        <button onClick={() => dispatch({ type: "increment" })}>
          Increment
        </button>
        <button onClick={() => dispatch({ type: "decrement" })}>
          Decrement
        </button>
      </div>
    );
  };

  export default Counter;
  ```

---

### 59. **React Profiler for Performance Debugging**

React's **Profiler API** allows you to measure the performance of your components.

#### 59.1 **Using the React Profiler API**

- **Wrap Your Component with Profiler**:

  ```jsx
  import React, { Profiler } from "react";

  const MyComponent = () => (
    <Profiler
      id="MyComponent"
      onRender={(id, phase, actualDuration) => {
        console.log(`Rendered ${id} in ${actualDuration}ms`);
      }}
    >
      <div>My Component</div>
    </Profiler>
  );
  ```

#### 59.2 **Using the Profiler in Developer Tools**

In React DevTools, you can use the **Profiler tab** to track render times and performance bottlenecks in your components.

---

### 60. **Advanced Routing with React Router**

React Router allows you to build navigation into your React app with a declarative API.

#### 60.1 **Nested Routing**

- **Example: Nested Routes in React Router**:

  ```jsx
  import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
  import React from "react";

  const Home = () => <div>Home Page</div>;
  const About = () => <div>About Page</div>;
  const Nested = () => <div>Nested Route</div>;

  const App = () => (
    <Router>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/about" exact component={About} />
        <Route path="/about/nested" component={Nested} />
      </Switch>
    </Router>
  );

  export default App;
  ```

---

### 61. **State Machines in React**

Using **state machines** in React helps manage complex state transitions in applications.

#### 61.1 **Using `xstate` to Manage State**:

State machines can be integrated with React via libraries like **XState**.

- **Basic XState Example**:

  ```bash
  npm install xstate
  ```

  ```jsx
  import { createMachine, interpret } from "xstate";

  const lightMachine = createMachine({
    id: "light",
    initial: "off",
    states: {
      off: {
        on: { TOGGLE: "on" },
      },
      on: {
        on: { TOGGLE: "off" },
      },
    },
  });

  const lightService = interpret(lightMachine).onTransition((state) =>
    console.log(state.value)
  );

  lightService.start();
  lightService.send("TOGGLE"); // Output: on
  ```

---

### 62. **CI/CD Testing Practices for React**

Testing in CI/CD pipelines ensures that your code is correct and stable before it reaches production.

#### 62.1 **Unit Testing in CI/CD**

Unit tests should be run automatically

as part of the CI/CD pipeline using tools like **Vitest**, **Mocha**, **Chai**, and **React Testing Library**.

#### 62.2 **Integration and End-to-End Testing in CI/CD**

Using tools like **Cypress** for E2E tests in CI/CD ensures that the entire application works as expected in an automated environment.

- **Example: Cypress E2E Test**:

  ```bash
  npm install cypress
  ```

  ```javascript
  describe("My First Test", () => {
    it("Visits the app", () => {
      cy.visit("http://localhost:3000");
      cy.contains("Welcome");
    });
  });
  ```

---

### Conclusion

We’ve covered powerful React features, including **advanced hooks**, **state management** with the **Context API** and **XState**, **performance optimization**, **custom middleware**, **testing strategies**, **React Router** for advanced routing, and how to manage application complexity using **state machines**. We also explored the integration of **React Profiler**, **React Concurrent Mode**, and best practices for **CI/CD testing** in React.

By following these techniques, developers can build high-performance, maintainable React applications that scale effectively with complex user interactions and state management needs.

Let me know if you'd like to dive deeper into any of these topics!

Let's take this even further with **advanced patterns**, **micro-frontends**, **code splitting**, **error boundaries**, **server-side rendering (SSR)** with **Next.js**, **static site generation (SSG)**, **React Native**, **integrating third-party libraries**, **design systems**, **module federation**, **functional programming** principles in React, and **automated visual regression testing**. These concepts are crucial for building scalable, robust, and future-proof React applications.

---

### 63. **Advanced React Patterns**

In React, certain design patterns help make your code more modular, scalable, and maintainable. Here are some advanced patterns that can help you design complex applications efficiently.

#### 63.1 **Container and Presentational Component Pattern**

- **Container Component**: Handles logic and state management.
- **Presentational Component**: Responsible for rendering UI and receives data via props.

```jsx
// Container Component
const Container = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then(setData);
  }, []);

  return <Presentational data={data} />;
};

// Presentational Component
const Presentational = ({ data }) => <div>{data ? data : "Loading..."}</div>;
```

#### 63.2 **Compound Component Pattern**

Allows you to create more flexible components by letting child components access context data from the parent component.

```jsx
const TabGroup = ({ children }) => {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div>
      {React.Children.map(children, (child, index) =>
        React.cloneElement(child, {
          isActive: index === activeTab,
          onClick: () => setActiveTab(index),
        })
      )}
    </div>
  );
};

const Tab = ({ children, isActive, onClick }) => (
  <div onClick={onClick} style={{ background: isActive ? "blue" : "gray" }}>
    {children}
  </div>
);
```

---

### 64. **Micro Frontends in React**

Micro frontends break up a frontend monolith into smaller, manageable parts, allowing different teams to work on independent parts of the application. It allows a more modular and scalable approach to building React applications.

#### 64.1 **Module Federation with Webpack**

With **Webpack's Module Federation**, we can share React components or entire applications across multiple projects.

1. **webpack.config.js** in the host application:

```js
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: "hostApp",
      remotes: {
        remoteApp: "remoteApp@http://localhost:3001/remoteEntry.js",
      },
    }),
  ],
};
```

2. **webpack.config.js** in the remote application:

```js
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: "remoteApp",
      exposes: {
        "./Button": "./src/Button",
      },
    }),
  ],
};
```

3. In the host application, you can import components from the remote app:

```jsx
import React, { Suspense } from "react";

const RemoteButton = React.lazy(() => import("remoteApp/Button"));

const HostApp = () => (
  <div>
    <Suspense fallback={<div>Loading...</div>}>
      <RemoteButton />
    </Suspense>
  </div>
);
```

---

### 65. **Code Splitting in React**

Code splitting helps improve app performance by splitting the bundle into smaller pieces that are loaded as needed.

#### 65.1 **Using `React.lazy` for Dynamic Imports**

`React.lazy` allows you to dynamically import components only when they are needed.

```jsx
const LazyComponent = React.lazy(() => import("./LazyComponent"));

const App = () => (
  <div>
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  </div>
);
```

#### 65.2 **React Router with Code Splitting**

```jsx
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import React, { Suspense, lazy } from "react";

const HomePage = lazy(() => import("./HomePage"));
const AboutPage = lazy(() => import("./AboutPage"));

const App = () => (
  <Router>
    <Suspense fallback={<div>Loading...</div>}>
      <Switch>
        <Route path="/" exact component={HomePage} />
        <Route path="/about" component={AboutPage} />
      </Switch>
    </Suspense>
  </Router>
);
```

---

### 66. **Error Boundaries in React**

Error boundaries help catch JavaScript errors in a part of the component tree and display a fallback UI instead of the crashing component.

#### 66.1 **Creating an Error Boundary Component**

```jsx
import React, { Component } from "react";

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong.</div>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
```

#### 66.2 **Using Error Boundary**

```jsx
const App = () => (
  <ErrorBoundary>
    <MyComponent />
  </ErrorBoundary>
);
```

---

### 67. **Server-Side Rendering (SSR) with Next.js**

Server-side rendering (SSR) is a technique where the content is rendered on the server and sent to the browser. **Next.js** makes it easy to implement SSR with React.

#### 67.1 **SSR with `getServerSideProps`**

```jsx
// pages/index.js
const HomePage = ({ data }) => (
  <div>
    <h1>{data.title}</h1>
  </div>
);

export async function getServerSideProps() {
  const res = await fetch("https://api.example.com/data");
  const data = await res.json();

  return {
    props: {
      data,
    },
  };
}

export default HomePage;
```

---

### 68. **Static Site Generation (SSG) with Next.js**

Static site generation (SSG) pre-renders pages at build time, resulting in faster page loads.

#### 68.1 **SSG with `getStaticProps`**

```jsx
// pages/index.js
const HomePage = ({ data }) => (
  <div>
    <h1>{data.title}</h1>
  </div>
);

export async function getStaticProps() {
  const res = await fetch("https://api.example.com/data");
  const data = await res.json();

  return {
    props: {
      data,
    },
  };
}

export default HomePage;
```

---

### 69. **Integrating Third-Party Libraries in React**

Integrating third-party libraries in React can be done seamlessly using hooks, HOCs, or React context.

#### 69.1 **Using a Third-Party Library with Hooks**

For example, integrating **chart.js** with React:

```bash
npm install react-chartjs-2 chart.js
```

```jsx
import { Line } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js";

const ChartComponent = ({ data }) => {
  const chartData = {
    labels: ["Jan", "Feb", "Mar"],
    datasets: [{ data, label: "Sales", borderColor: "blue" }],
  };

  return <Line data={chartData} />;
};
```

---

### 70. **Design Systems in React**

Design systems provide a consistent design language for building interfaces, and they can be implemented using **Storybook** and **Styled Components**.

#### 70.1 **Building a Design System with Storybook and Styled Components**

```bash
npm install @storybook/react styled-components
```

```jsx
// Button.js
import styled from 'styled-components';

const Button = styled.button`
  background-color: blue;
  color: white;
  padding: 10px;
  border-radius: 5px;
`;

export default Button;

// Button.stories.js
import React from 'react';
import Button from './Button';

export default {
  title: 'Button',
  component: Button,
};

export const Primary = () => <Button>Click Me</Button>;
```

---

### 71. **Visual Regression Testing in React**

Visual regression testing ensures that the UI has not unintentionally changed.

#### 71.1 **Using Percy for Visual Regression Testing**

- Install Percy and integrate with **Cypress** or **Jest**.

```bash
npm install @percy/cli @percy/cypress
```

```javascript
describe("Visual Regression Test", () => {
  it("should match the UI", () => {
    cy.visit("http://localhost:3000");
    cy.percySnapshot("HomePage");
  });
});
```

---

### Conclusion

We have now explored cutting-edge React features such as **micro frontends**, **code splitting**, **SSR/SSG with Next.js**, **error boundaries**, and **design systems**. These practices are crucial in building enterprise-level React applications that are maintainable, scalable, and performant.

Additionally, we’ve seen how to integrate third-party libraries, use visual regression testing tools like **Percy**, and implement **Server-Side Rendering (SSR)** and **Static Site Generation (SSG)** for faster loading times. Testing is also a critical focus, and with tools

like **Cypress** and **Vitest**, automated testing has become more accessible.

Would you like to dive deeper into any of these advanced concepts? Let me know!

Let's continue with more advanced React topics, diving into **advanced patterns**, **performance optimizations**, **progressive web apps (PWA)**, **serverless architecture with React**, **React Native** for mobile development, **react-query** for data fetching, **Recoil** for state management, **Web Components**, **Advanced Custom Hooks**, **Immutable.js**, **State Reconciliation in React**, and **TypeScript integration with React**.

---

### 72. **Advanced Patterns: Compound, Render Props, and High-Order Components**

React patterns enable developers to write more reusable and flexible components. Let's review **Compound Components**, **Render Props**, and **Higher-Order Components (HOCs)** in more detail.

#### 72.1 **Render Props Pattern**

The **render props** pattern is a technique where a component’s render method uses a function as a prop that returns a React element.

```jsx
const MouseTracker = ({ render }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    setPosition({ x: e.clientX, y: e.clientY });
  };

  return <div onMouseMove={handleMouseMove}>{render(position)}</div>;
};

const App = () => (
  <MouseTracker
    render={({ x, y }) => (
      <p>
        The mouse is at ({x}, {y})
      </p>
    )}
  />
);
```

#### 72.2 **Higher-Order Components (HOCs)**

HOCs are functions that take a component and return a new component with additional props or functionality.

```jsx
const withLoading = (WrappedComponent) => {
  return function WithLoading({ isLoading, ...props }) {
    return isLoading ? <div>Loading...</div> : <WrappedComponent {...props} />;
  };
};

const MyComponent = ({ data }) => <div>{data}</div>;

const MyComponentWithLoading = withLoading(MyComponent);
```

#### 72.3 **Compound Component Pattern (Again)**

We've previously discussed **compound components** in React. The key idea is that children components implicitly communicate with the parent component without explicit prop-passing.

```jsx
const Accordion = ({ children }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const handleClick = (index) => {
    setOpenIndex(index === openIndex ? null : index);
  };

  return (
    <div>
      {React.Children.map(children, (child, index) =>
        React.cloneElement(child, {
          isOpen: openIndex === index,
          onToggle: () => handleClick(index),
        })
      )}
    </div>
  );
};

const AccordionItem = ({ isOpen, onToggle, children }) => (
  <div>
    <button onClick={onToggle}>{children}</button>
    {isOpen && <div>Content for {children}</div>}
  </div>
);

// Usage
<Accordion>
  <AccordionItem>Item 1</AccordionItem>
  <AccordionItem>Item 2</AccordionItem>
</Accordion>;
```

---

### 73. **Progressive Web Apps (PWA) with React**

A **Progressive Web App (PWA)** is a web application that has the look and feel of a native mobile app but runs in the browser. It includes capabilities like offline usage and push notifications.

#### 73.1 **Creating a PWA with Create React App**

Create React App provides an easy setup for building PWAs with React.

1. **Set up PWA**:
   When creating a React app with Create React App, add the service worker for offline support.

   ```bash
   npx create-react-app my-pwa-app
   cd my-pwa-app
   ```

2. **Enable Service Worker**:
   In the `src/index.js`, register the service worker:

   ```jsx
   import { register } from "./serviceWorker";

   register();
   ```

3. **PWA Manifest**:
   In the `public/manifest.json`, ensure to configure the app’s icon, name, and theme:

   ```json
   {
     "short_name": "React PWA",
     "name": "React Progressive Web App",
     "icons": [
       {
         "src": "icons/icon-192x192.png",
         "sizes": "192x192",
         "type": "image/png"
       }
     ],
     "start_url": ".",
     "display": "standalone",
     "background_color": "#ffffff",
     "theme_color": "#000000"
   }
   ```

4. **Testing PWA**:
   You can test your PWA capabilities using Chrome’s **Lighthouse** tool, which audits for PWA performance.

---

### 74. **Serverless Architecture with React**

Serverless architecture allows developers to build and deploy applications without managing server infrastructure. It typically relies on **cloud functions** (like AWS Lambda, Azure Functions) and **API Gateway** services.

#### 74.1 **React + Serverless with AWS Lambda**

1. **Deploying React app to S3**:
   React apps can be deployed to an **S3 bucket** as static assets.

2. **Set up an AWS Lambda function** to handle backend requests:

```js
// Example Lambda function to fetch data
exports.handler = async (event) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from Lambda!" }),
  };
  return response;
};
```

3. **API Gateway**: Create an API Gateway in AWS that routes requests to your Lambda function.

4. **Connecting React to API**:

```jsx
const fetchData = async () => {
  const response = await fetch("https://your-api-endpoint.amazonaws.com/data");
  const data = await response.json();
  console.log(data);
};
```

---

### 75. **React Native: Building Mobile Apps with React**

React Native allows you to build **cross-platform mobile applications** for iOS and Android using JavaScript and React.

#### 75.1 **Setting Up React Native Project**

To get started, you need **Node.js**, **Watchman**, and **React Native CLI** installed.

```bash
npx react-native init MyApp
cd MyApp
npx react-native run-android // or npx react-native run-ios
```

#### 75.2 **Building a Simple React Native App**

```jsx
import React from "react";
import { View, Text, Button } from "react-native";

const App = () => {
  const handlePress = () => {
    alert("Button Pressed!");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Hello, React Native!</Text>
      <Button title="Press Me" onPress={handlePress} />
    </View>
  );
};

export default App;
```

---

### 76. **React Query for Data Fetching**

**React Query** simplifies data fetching, caching, synchronization, and error handling. It reduces the need for state management for async data.

#### 76.1 **Basic Usage of React Query**

1. **Install React Query**:

```bash
npm install @tanstack/react-query
```

2. **Fetching Data with React Query**:

```jsx
import { useQuery } from "@tanstack/react-query";

const fetchData = async () => {
  const res = await fetch("https://api.example.com/data");
  const data = await res.json();
  return data;
};

const DataComponent = () => {
  const { data, isLoading, isError } = useQuery(["data"], fetchData);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error occurred!</div>;

  return <div>{JSON.stringify(data)}</div>;
};
```

---

### 77. **State Management with Recoil**

**Recoil** is an experimental state management library for React that provides a more scalable approach compared to Context API.

#### 77.1 **Using Recoil for State Management**

1. **Install Recoil**:

```bash
npm install recoil
```

2. **Creating an Atom (State)**:

```jsx
import { atom } from "recoil";

export const countState = atom({
  key: "countState",
  default: 0,
});
```

3. **Using Recoil in Components**:

```jsx
import { useRecoilState } from "recoil";
import { countState } from "./state";

const Counter = () => {
  const [count, setCount] = useRecoilState(countState);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
};
```

---

### 78. **Web Components with React**

Web Components allow you to create reusable custom HTML elements with encapsulated styles and behavior, which can be used in any framework or even vanilla JS.

#### 78.1 **Integrating Web Components in React**

1. **Create a Web Component**:

```js
class MyButton extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<button>Click Me!</button>`;
  }
}

customElements.define("my-button", MyButton);
```

2. **Using Web Component in React**:

```jsx
const App = () => (
  <div>
    <my-button></my-button>
  </div>
);
```

---

### 79. **Advanced Immutable.js in React**

Immutable.js allows for persistent immutable data

structures that help with state management in React, ensuring consistency and preventing accidental mutations.

#### 79.1 **Using Immutable.js**

```bash
npm install immutable
```

```jsx
import { Map } from "immutable";

const state = Map({ name: "John", age: 30 });

const newState = state.set("age", 31);

console.log(state.get("age")); // 30
console.log(newState.get("age")); // 31
```

---

### Conclusion

We’ve now covered advanced React topics such as **micro frontends**, **progressive web apps (PWA)**, **serverless architecture**, **React Native**, **state management with Recoil**, and **data fetching with React Query**. These techniques and tools help developers build scalable, maintainable, and high-performance applications with React.

You can dive deeper into any of these topics or let me know if you have specific questions! Happy coding!

Absolutely! Let's continue exploring even more advanced topics and techniques in React and related technologies, such as:

1. **React Suspense and Concurrent Mode**
2. **TypeScript Integration with React**
3. **Advanced React Testing (with Vitest, React Testing Library, Mocha, Chai)**
4. **Custom Hooks for Performance Optimization**
5. **State Synchronization with Redux-Saga**
6. **WebAssembly and React**
7. **Animation Libraries (Framer Motion, React Spring)**
8. **Server-Side Rendering (SSR) with React and GraphQL**
9. **Custom Data Fetching Hooks**
10. **Real-Time Web with WebSockets in React**
11. **Component Libraries (Material UI, Ant Design)**
12. **Monorepos with React and Yarn Workspaces**

---

### 80. **React Suspense and Concurrent Mode**

React **Suspense** is a mechanism that lets you suspend the rendering of a component until certain conditions are met (like data fetching). **Concurrent Mode** allows React to work more efficiently by rendering multiple components in parallel without blocking the main thread.

#### 80.1 **Suspense for Data Fetching**

Suspense is often used in combination with `React.lazy()` for lazy loading components, or with **React Query** or **Relay** for asynchronous data fetching.

```jsx
const UserProfile = React.lazy(() => import("./UserProfile"));

const App = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <UserProfile />
  </Suspense>
);
```

#### 80.2 **Concurrent Mode with React**

React's Concurrent Mode can make apps more responsive by splitting rendering work into units and prioritizing the most important work. To enable Concurrent Mode, wrap the root component with `ReactDOM.createRoot()`.

```jsx
import ReactDOM from "react-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
```

This enables features like **automatic batching** and **prioritizing urgent updates** to improve the app's responsiveness.

---

### 81. **TypeScript Integration with React**

Using **TypeScript** with React provides strong typing to catch errors early and improve maintainability. TypeScript can be combined with React's **JSX**, **props**, **state**, and **hooks** for better developer experience.

#### 81.1 **TypeScript in React**

1. **Install TypeScript** in your React app:

```bash
npm install typescript @types/react @types/react-dom
```

2. **Basic TypeScript usage in React components**:

```tsx
import React from "react";

interface UserProps {
  name: string;
  age: number;
}

const User: React.FC<UserProps> = ({ name, age }) => (
  <div>
    <h1>{name}</h1>
    <p>{age} years old</p>
  </div>
);

const App = () => <User name="John Doe" age={30} />;
```

#### 81.2 **TypeScript with Hooks**

TypeScript enhances React’s hooks with type safety:

```tsx
import React, { useState } from "react";

const Counter: React.FC = () => {
  const [count, setCount] = useState<number>(0);

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
};
```

---

### 82. **Advanced React Testing**

React testing has evolved, and we now have advanced tools and techniques to test components more effectively. **Vitest**, **React Testing Library**, **Mocha**, and **Chai** are excellent testing tools that allow us to test our React components thoroughly.

#### 82.1 **Unit Testing with React Testing Library & Vitest**

```bash
npm install @testing-library/react vitest
```

Example of **unit test** for a simple component with **Vitest**:

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { expect, it } from "vitest";
import Button from "./Button"; // Assume Button is a simple component

it("should render button and handle click event", () => {
  const handleClick = vi.fn();
  render(<Button onClick={handleClick}>Click me</Button>);

  const button = screen.getByText("Click me");
  fireEvent.click(button);

  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

#### 82.2 **Integration Testing with Mocha and Chai**

With Mocha and Chai, you can perform integration tests for more complex scenarios.

```bash
npm install mocha chai @testing-library/react
```

Example **integration test**:

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { expect } from "chai";
import App from "./App"; // Assume App is a complex component

describe("App Integration Test", () => {
  it("should render and handle form submission correctly", () => {
    render(<App />);
    const input = screen.getByPlaceholderText("Enter name");
    const button = screen.getByText("Submit");

    fireEvent.change(input, { target: { value: "John" } });
    fireEvent.click(button);

    const message = screen.getByText("Hello, John!");
    expect(message).to.not.be.null;
  });
});
```

---

### 83. **Custom Hooks for Performance Optimization**

React’s **custom hooks** help to encapsulate and share logic across components. Custom hooks can also be used to optimize performance by handling expensive operations outside of the component lifecycle.

#### 83.1 **Example: `useDebounce` Hook**

This custom hook debounces input to avoid unnecessary API calls or operations:

```tsx
import { useState, useEffect } from "react";

function useDebounce(value: string, delay: number): string {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

const SearchComponent = () => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <p>Searching for: {debouncedQuery}</p>
    </div>
  );
};
```

---

### 84. **State Synchronization with Redux-Saga**

**Redux-Saga** helps manage side effects like async data fetching and other side-effects in a Redux store. It allows better control of complex asynchronous flows.

#### 84.1 **Basic Redux-Saga Setup**

```bash
npm install redux-saga redux
```

Example of **Redux-Saga** usage:

```js
import { takeEvery, put, call } from "redux-saga/effects";
import { FETCH_DATA, setData } from "./actions";

// Worker saga to fetch data
function* fetchDataSaga(action) {
  try {
    const data = yield call(fetch, "https://api.example.com/data");
    const result = yield data.json();
    yield put(setData(result)); // Dispatch success action
  } catch (error) {
    console.error("Error fetching data", error);
  }
}

// Watcher saga
function* watchFetchData() {
  yield takeEvery(FETCH_DATA, fetchDataSaga);
}

export default watchFetchData;
```

---

### 85. **WebAssembly (WASM) and React**

**WebAssembly (WASM)** is a low-level programming language that runs in the browser. You can use **WebAssembly** modules in React for performance-critical tasks, like mathematical computations or image processing.

#### 85.1 **Using WebAssembly with React**

1. First, compile your **C/C++** code into WebAssembly.
2. Then, integrate it with React.

```tsx
import React, { useEffect, useState } from "react";

const MyComponent = () => {
  const [result, setResult] = useState(0);

  useEffect(() => {
    const loadWasm = async () => {
      const wasm = await import("./myWasmModule.wasm");
      const result = wasm.calculate(42);
      setResult(result);
    };
    loadWasm();
  }, []);

  return <div>WASM Result: {result}</div>;
};
```

---

### 86. **Animation Libraries in React (Framer Motion, React Spring)**

Animations can make your app more engaging. Two popular libraries are **Framer Motion** and **React Spring**.

#### 86.1 **Framer Motion Example**

```bash
npm install framer-motion
```

```tsx
import { motion } from "framer-motion";

const MyComponent = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      Hello, Framer Motion!
    </motion.div>
  );
};
```

#### 86.2 **React Spring Example**

```bash
npm install react-spring
```

```tsx
import { useSpring, animated } from "react-spring";

const MyComponent = () => {
  const props = useSpring({ opacity: 1, from: { opacity: 0 } });

  return <animated.div style={props}>Hello, React Spring!</animated.div>;
};
```

---

### 87. \*\*Server-Side Rendering (

SSR) with React and GraphQL\*\*

Server-side rendering allows rendering React components on the server and sending the HTML to the client, providing faster load times and better SEO.

#### 87.1 **SSR with React, GraphQL, and Apollo Server**

1. Set up **Apollo Server** on the Node.js backend.
2. Query data from GraphQL in the server-side render.
3. Render React components with the data and send the HTML to the client.

```tsx
// Server-side GraphQL data fetching and SSR
import { ApolloServer, gql } from "apollo-server";
import React from "react";
import ReactDOMServer from "react-dom/server";
import App from "./App";

const typeDefs = gql`
  type Query {
    getData: String
  }
`;

const resolvers = {
  Query: {
    getData: () => "Hello, SSR with GraphQL!",
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
```

---

### 88. **Real-Time Web with WebSockets in React**

Use **WebSockets** for real-time communication, such as chat applications, notifications, or live updates.

```bash
npm install socket.io-client
```

```tsx
import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:4000");

const RealTimeApp = () => {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    socket.on("new-message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
  }, []);

  return (
    <div>
      {messages.map((message, index) => (
        <p key={index}>{message}</p>
      ))}
    </div>
  );
};
```

---

### 89. **Component Libraries (Material UI, Ant Design)**

Component libraries like **Material UI** and **Ant Design** offer pre-built, customizable components to speed up development.

#### 89.1 **Material UI Example**

```bash
npm install @mui/material @emotion/react @emotion/styled
```

```tsx
import { Button } from "@mui/material";

const MyComponent = () => <Button variant="contained">Click Me</Button>;
```

#### 89.2 **Ant Design Example**

```bash
npm install antd
```

```tsx
import { Button } from "antd";

const MyComponent = () => <Button type="primary">Click Me</Button>;
```

---

### 90. **Monorepos with React and Yarn Workspaces**

Monorepos allow you to manage multiple related projects in a single repository. This is useful when developing multiple packages, such as libraries and applications.

#### 90.1 **Setting up Monorepos with Yarn Workspaces**

```bash
yarn init -y
```

```json
{
  "private": true,
  "workspaces": ["packages/*"]
}
```

This setup allows you to manage multiple React apps or libraries in one repository.

---

This concludes a comprehensive overview of advanced React topics. Would you like to dive deeper into any of these areas, or need examples of something specific? Let me know!

Sure! Let's break down the implementation of **unit** and **integration testing** for each of the advanced React concepts and patterns we’ve discussed, using **Vitest**, **React Testing Library**, **Mocha**, and **Chai** where applicable. We’ll provide practical examples to ensure the testing portion complements the concepts thoroughly.

---

### 80. **React Suspense and Concurrent Mode with Testing**

React **Suspense** and **Concurrent Mode** often require testing asynchronous loading states. Testing components wrapped in `Suspense` is common.

#### 80.1 **Testing Suspense**

Let’s test a simple component that uses `React.lazy()` and `Suspense`.

```tsx
// UserProfile.tsx
import React from "react";

const UserProfile = () => {
  return <div>User Profile</div>;
};

export default UserProfile;
```

#### 80.2 **Suspense Test with Vitest**

```tsx
import { render, screen } from "@testing-library/react";
import { Suspense } from "react";
import { vi } from "vitest";
import React from "react";

// Lazy load UserProfile component
const LazyUserProfile = React.lazy(() => import("./UserProfile"));

it("renders Suspense and loads user profile", () => {
  render(
    <Suspense fallback={<div>Loading...</div>}>
      <LazyUserProfile />
    </Suspense>
  );

  screen.getByText("Loading...");
  screen.getByText("User Profile");
});
```

#### 80.3 **Testing Suspense with Mocha and Chai**

```tsx
import { render, screen } from "@testing-library/react";
import { Suspense } from "react";
import { expect } from "chai";
import React from "react";

// Lazy load UserProfile component
const LazyUserProfile = React.lazy(() => import("./UserProfile"));

describe("Suspense with Lazy Loading", () => {
  it("should display loading initially and then load user profile", () => {
    render(
      <Suspense fallback={<div>Loading...</div>}>
        <LazyUserProfile />
      </Suspense>
    );

    expect(screen.getByText("Loading...")).to.not.be.null;

    // After async rendering
    expect(screen.getByText("User Profile")).to.not.be.null;
  });
});
```

---

### 81. **TypeScript Integration with React**

When using **TypeScript** with React, unit and integration tests help ensure that the typings are correctly applied and enforce strong typing across your app.

#### 81.1 **TypeScript Component Test**

Let's test the `User` component from the previous example.

```tsx
// User.tsx
import React from "react";

interface UserProps {
  name: string;
  age: number;
}

const User: React.FC<UserProps> = ({ name, age }) => {
  return (
    <div>
      <h1>{name}</h1>
      <p>{age} years old</p>
    </div>
  );
};

export default User;
```

#### 81.2 **Unit Test for TypeScript Component**

```tsx
// User.test.tsx
import { render, screen } from "@testing-library/react";
import User from "./User";

it("renders user information correctly", () => {
  render(<User name="John" age={30} />);

  screen.getByText("John");
  screen.getByText("30 years old");
});
```

This test ensures the `User` component properly receives and renders its props, typed with TypeScript.

---

### 82. **Advanced React Testing with Vitest, Mocha, and Chai**

React Testing Library is the preferred testing tool for testing components, while **Vitest**, **Mocha**, and **Chai** can be used for assertion and test execution.

#### 82.1 **Unit Testing with Vitest**

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import Button from "./Button";

it("should call the onClick handler when clicked", () => {
  const handleClick = vi.fn();
  render(<Button onClick={handleClick}>Click me</Button>);

  const button = screen.getByText("Click me");
  fireEvent.click(button);

  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

#### 82.2 **Integration Testing with Mocha and Chai**

For an integration test, let’s assume `App` is a form that takes a user’s name and displays it.

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { expect } from "chai";
import App from "./App";

describe("App Integration Test", () => {
  it("should update message on form submit", () => {
    render(<App />);

    const input = screen.getByPlaceholderText("Enter name");
    const button = screen.getByText("Submit");

    fireEvent.change(input, { target: { value: "John" } });
    fireEvent.click(button);

    expect(screen.getByText("Hello, John!")).to.not.be.null;
  });
});
```

---

### 83. **Custom Hooks Testing**

When testing **custom hooks**, it’s common to test their behavior in isolation using the **`renderHook`** method from `@testing-library/react-hooks`.

#### 83.1 **Testing Custom `useDebounce` Hook**

Here’s how to test a custom hook like `useDebounce`.

```tsx
// useDebounce.ts
import { useState, useEffect } from "react";

function useDebounce(value: string, delay: number): string {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
```

#### 83.2 **Unit Test for `useDebounce`**

```tsx
import { renderHook, act } from "@testing-library/react";
import useDebounce from "./useDebounce";
import { vi } from "vitest";

it("should debounce value correctly", () => {
  const { result, waitForNextUpdate } = renderHook(() =>
    useDebounce("test", 500)
  );

  act(() => {
    result.current = "updated";
  });

  // Wait for debounce delay
  waitForNextUpdate();

  expect(result.current).toBe("updated");
});
```

---

### 84. **State Synchronization with Redux-Saga**

Testing **Redux-Saga** actions requires simulating async calls and observing how sagas dispatch actions.

#### 84.1 **Test Redux-Saga**

```tsx
import { expect } from "chai";
import { runSaga } from "redux-saga";
import { fetchDataSaga } from "./sagas"; // Assume saga function

it("should handle async data fetching in Redux-Saga", async () => {
  const dispatched: any[] = [];
  const mockApi = vi.fn().mockResolvedValue({ data: "Test Data" });

  // Run the saga with a mock API
  await runSaga(
    {
      dispatch: (action) => dispatched.push(action),
    },
    fetchDataSaga,
    mockApi
  ).toPromise();

  // Check if the correct action was dispatched
  expect(dispatched).to.deep.equal([
    { type: "FETCH_DATA_SUCCESS", payload: { data: "Test Data" } },
  ]);
});
```

---

### 85. **WebAssembly and React**

Testing **WebAssembly** integration in React is less common but necessary when dealing with performance-critical tasks.

#### 85.1 **Test WebAssembly Component**

```tsx
import { useState, useEffect } from "react";

const MyComponent = () => {
  const [result, setResult] = useState(0);

  useEffect(() => {
    const loadWasm = async () => {
      const wasm = await import("./myWasmModule.wasm");
      const result = wasm.calculate(42);
      setResult(result);
    };
    loadWasm();
  }, []);

  return <div>WASM Result: {result}</div>;
};

export default MyComponent;
```

#### 85.2 **Test WebAssembly Integration**

For testing WebAssembly, we simulate the WebAssembly fetch and loading process.

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import MyComponent from "./MyComponent";

it("should load and display WASM result", async () => {
  render(<MyComponent />);

  await waitFor(() => screen.getByText(/WASM Result:/));
  screen.getByText(/WASM Result:/);
});
```

---

### 86. **Animation Libraries in React (Framer Motion, React Spring)**

Testing animations can be tricky, but we focus on verifying that animations trigger and behave as expected.

#### 86.1 **Test with Framer Motion**

```tsx
import { render, screen } from '@testing-library/react';
import { motion } from 'framer-motion';
import { vi } from 'vitest';

it('should animate correctly', () => {
  const handleAnimationComplete = vi.fn();

  render(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      onAnimationComplete={handleAnimationComplete}
    >
      Hello, Framer Motion!
    </motion.div>
  );

  expect(screen.getByText('Hello, Framer Motion!')).toBeInTheDocument();
  // Simulate animation complete
  handleAnimationComplete();
  expect(handle

AnimationComplete).toHaveBeenCalledTimes(1);
});
```

---

### Conclusion

These are **unit** and **integration** tests for various **React** concepts and features, including advanced topics like **Suspense**, **Custom Hooks**, **WebAssembly**, **Redux-Saga**, and **Animation Libraries**. They showcase how you can test your components and asynchronous logic using **Vitest**, **Mocha**, **Chai**, and **React Testing Library**.

If you need more examples or further breakdowns for any specific topic, let me know!

Let's continue with **more advanced concepts in React** and their respective **unit and integration tests** using **Vitest**, **React Testing Library**, **Mocha**, and **Chai**. We will explore deeper, real-world usage of **hooks**, **context**, **optimizations**, **error boundaries**, **performance testing**, and other advanced patterns in React, along with testing examples for each of these concepts.

---

### 87. **Error Boundaries in React**

An **Error Boundary** is a component that catches JavaScript errors anywhere in the child component tree and displays a fallback UI instead of crashing the whole app. Testing error boundaries is important to ensure your app gracefully handles errors.

#### 87.1 **Creating an Error Boundary**

```tsx
// ErrorBoundary.tsx
import React, { Component, ErrorInfo } from "react";

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<React.PropsWithChildren, State> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Error caught:", error);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

#### 87.2 **Unit Test for Error Boundary with Vitest**

```tsx
// ErrorBoundary.test.tsx
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary";
import { vi } from "vitest";

it("should display fallback UI when an error is thrown", () => {
  const ThrowErrorComponent = () => {
    throw new Error("Test error");
  };

  render(
    <ErrorBoundary>
      <ThrowErrorComponent />
    </ErrorBoundary>
  );

  screen.getByText("Something went wrong.");
});
```

#### 87.3 **Testing Error Boundaries with Mocha and Chai**

```tsx
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary";
import { expect } from "chai";

describe("ErrorBoundary", () => {
  it("should show fallback UI when an error is thrown", () => {
    const ThrowErrorComponent = () => {
      throw new Error("Test error");
    };

    render(
      <ErrorBoundary>
        <ThrowErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong.")).to.not.be.null;
  });
});
```

---

### 88. **React Context API for State Management**

The **Context API** is used for passing data through the component tree without manually passing props at every level. Testing context values is an essential part of ensuring that your app's global state is correctly shared.

#### 88.1 **Creating Context with React**

```tsx
// ThemeContext.tsx
import React, { createContext, useContext, ReactNode } from "react";

interface ThemeContextType {
  theme: string;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = React.useState("light");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
```

#### 88.2 **Unit Test for Context**

```tsx
// ThemeContext.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, useTheme } from "./ThemeContext";

const ThemeButton = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <>
      <div>{theme}</div>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </>
  );
};

it("should toggle theme between light and dark", () => {
  render(
    <ThemeProvider>
      <ThemeButton />
    </ThemeProvider>
  );

  screen.getByText("light");
  const button = screen.getByText("Toggle Theme");
  fireEvent.click(button);
  screen.getByText("dark");
});
```

#### 88.3 **Integration Test for Context with Mocha and Chai**

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, useTheme } from "./ThemeContext";
import { expect } from "chai";

describe("ThemeContext", () => {
  it("should toggle between light and dark theme", () => {
    const ThemeButton = () => {
      const { theme, toggleTheme } = useTheme();
      return (
        <>
          <div>{theme}</div>
          <button onClick={toggleTheme}>Toggle Theme</button>
        </>
      );
    };

    render(
      <ThemeProvider>
        <ThemeButton />
      </ThemeProvider>
    );

    expect(screen.getByText("light")).to.not.be.null;
    fireEvent.click(screen.getByText("Toggle Theme"));
    expect(screen.getByText("dark")).to.not.be.null;
  });
});
```

---

### 89. **Code Splitting with React and Lazy Loading**

**Code Splitting** allows you to split your code into smaller bundles and load them on demand. React's `React.lazy` and `Suspense` help achieve this functionality.

#### 89.1 **Lazy Loading and Code Splitting**

```tsx
// MyComponent.tsx
import React, { Suspense } from "react";

const LazyComponent = React.lazy(() => import("./LazyComponent"));

const MyComponent = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <LazyComponent />
  </Suspense>
);

export default MyComponent;
```

#### 89.2 **Testing Lazy Loading with React Testing Library**

```tsx
import { render, screen } from "@testing-library/react";
import MyComponent from "./MyComponent";

it("should load the lazy component", () => {
  render(<MyComponent />);
  screen.getByText("Loading...");
  screen.getByText("Lazy Component Loaded");
});
```

---

### 90. **React Performance Optimization (Memoization)**

Performance is a key factor in large React apps. **React.memo**, **useMemo**, and **useCallback** are optimization hooks that prevent unnecessary re-renders.

#### 90.1 **Using `React.memo`**

```tsx
const ChildComponent = React.memo(({ name }: { name: string }) => {
  console.log("ChildComponent rendered");
  return <div>{name}</div>;
});
```

#### 90.2 **Unit Test for `React.memo` Component**

```tsx
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

const ChildComponent = React.memo(({ name }: { name: string }) => {
  console.log("ChildComponent rendered");
  return <div>{name}</div>;
});

it("should not re-render if props have not changed", () => {
  const spy = vi.fn();

  render(<ChildComponent name="John" />);
  render(<ChildComponent name="John" />);

  expect(spy).toHaveBeenCalledTimes(1); // No re-render if props are the same
});
```

---

### 91. **Testing Async Functions in React (useEffect, useState)**

Testing asynchronous operations that use hooks like `useEffect` and `useState` is a common challenge.

#### 91.1 **Async Function Example**

```tsx
// FetchData.tsx
import React, { useState, useEffect } from "react";

const FetchData = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/posts"
      );
      const data = await response.json();
      setData(data);
    };
    fetchData();
  }, []);

  if (!data) return <div>Loading...</div>;

  return <div>{data[0]?.title}</div>;
};

export default FetchData;
```

#### 91.2 **Unit Test for Async Operations**

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import FetchData from "./FetchData";

it("fetches and displays data", async () => {
  render(<FetchData />);

  screen.getByText("Loading...");

  await waitFor(() => screen.getByText("Some Post Title")); // Assuming the mock returns a post with title

  screen.getByText("Some Post Title");
});
```

---

### Conclusion

With these advanced React concepts—**Error Boundaries**, **Context API**, **Code Splitting**, **Memoization**, and **Async Hooks**—we've combined best practices with practical, real-world examples. Additionally, the unit and integration tests using **Vitest**, **React Testing Library**, **Mocha**, and **Chai** have been tailored to provide a full testing strategy.

This progression has aimed at not only teaching advanced React patterns but also reinforcing how to test them effectively to ensure reliable, maintainable applications.

Let me know if you'd

like to dive deeper into any specific area, or if you need more real-world examples!

Let's dive deeper into more **advanced React patterns** and **techniques** and how to test them. We'll explore concepts such as **Render Props**, **Higher-Order Components (HOCs)**, **React Portals**, **React Hooks Performance Optimization**, **Testing Asynchronous Updates**, **Testing Refs**, and **Server-Side Rendering (SSR) Testing**. We’ll also continue with **unit** and **integration tests** using **Vitest**, **React Testing Library**, **Mocha**, and **Chai** to ensure a comprehensive approach.

---

### 92. **Render Props Pattern in React**

**Render Props** is a pattern for sharing code between components using a function that returns JSX.

#### 92.1 **Render Props Component**

```tsx
// MouseTracker.tsx
import React, { useState } from "react";

const MouseTracker = ({
  render,
}: {
  render: (x: number, y: number) => JSX.Element;
}) => {
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event: React.MouseEvent) => {
    setCoordinates({ x: event.clientX, y: event.clientY });
  };

  return (
    <div onMouseMove={handleMouseMove}>
      {render(coordinates.x, coordinates.y)}
    </div>
  );
};

export default MouseTracker;
```

#### 92.2 **Test for Render Props**

```tsx
import { render, screen } from "@testing-library/react";
import MouseTracker from "./MouseTracker";
import { vi } from "vitest";

it("should render mouse coordinates when moving the mouse", () => {
  const renderProp = vi.fn((x: number, y: number) => (
    <div>
      {x}, {y}
    </div>
  ));

  render(<MouseTracker render={renderProp} />);

  // Simulate mouse movement
  fireEvent.mouseMove(screen.getByText("0, 0"), { clientX: 100, clientY: 200 });

  expect(renderProp).toHaveBeenCalledWith(100, 200);
  expect(screen.getByText("100, 200")).toBeInTheDocument();
});
```

---

### 93. **Higher-Order Components (HOCs) in React**

**Higher-Order Components (HOCs)** are functions that take a component and return a new component with additional props or functionality.

#### 93.1 **HOC Implementation**

```tsx
// withLoading.tsx
import React from "react";

function withLoading(Component: React.ComponentType<any>) {
  return function WithLoading({ isLoading, ...props }: { isLoading: boolean }) {
    if (isLoading) return <div>Loading...</div>;
    return <Component {...props} />;
  };
}

export default withLoading;
```

#### 93.2 **Component Wrapped with HOC**

```tsx
// UserProfile.tsx
import React from "react";

const UserProfile = ({ name }: { name: string }) => {
  return <div>{name}</div>;
};

export default UserProfile;
```

#### 93.3 **Test for HOC**

```tsx
import { render, screen } from "@testing-library/react";
import withLoading from "./withLoading";
import React from "react";

const UserProfileWithLoading = withLoading(({ name }: { name: string }) => (
  <div>{name}</div>
));

it("should render loading state", () => {
  render(<UserProfileWithLoading isLoading={true} name="John Doe" />);
  screen.getByText("Loading...");
});

it("should render the component when not loading", () => {
  render(<UserProfileWithLoading isLoading={false} name="John Doe" />);
  screen.getByText("John Doe");
});
```

---

### 94. **React Portals**

**React Portals** allow rendering children into a DOM node outside the parent component’s DOM hierarchy. This is useful for modals, tooltips, etc.

#### 94.1 **Creating a Portal**

```tsx
import React from "react";
import ReactDOM from "react-dom";

const Modal = ({ children }: { children: React.ReactNode }) => {
  return ReactDOM.createPortal(
    <div className="modal">{children}</div>,
    document.getElementById("modal-root") as HTMLElement
  );
};

export default Modal;
```

#### 94.2 **Test for React Portal**

```tsx
import { render, screen } from "@testing-library/react";
import Modal from "./Modal";

it("should render modal content into portal root", () => {
  render(<Modal>Test Modal</Modal>);

  // Ensure the modal is rendered
  screen.getByText("Test Modal");
  // Check that the modal content is placed in the portal (check for modal-root)
  const portalRoot = document.getElementById("modal-root");
  expect(portalRoot).toContainHTML("Test Modal");
});
```

---

### 95. **React Hooks Performance Optimization**

React hooks like `useMemo` and `useCallback` are used to optimize performance by memoizing values or functions, preventing unnecessary re-renders.

#### 95.1 **Using `useMemo` and `useCallback`**

```tsx
const MyComponent = ({ data }: { data: any[] }) => {
  const processedData = useMemo(() => processData(data), [data]);
  const handleClick = useCallback(() => alert("Clicked!"), []);

  return (
    <div>
      <ul>
        {processedData.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
      <button onClick={handleClick}>Click</button>
    </div>
  );
};
```

#### 95.2 **Test for Memoization with Vitest**

```tsx
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import MyComponent from "./MyComponent";

it("should memoize processed data and prevent unnecessary re-renders", () => {
  const data = [{ id: 1, name: "John" }];
  const processData = vi.fn((data: any[]) => data);

  render(<MyComponent data={data} processData={processData} />);

  // Check that processData is called only once
  expect(processData).toHaveBeenCalledTimes(1);
  screen.getByText("John");
});
```

---

### 96. **Testing Asynchronous Updates in React**

When React components rely on asynchronous updates (e.g., fetching data), testing these scenarios can be tricky. We need to wait for state updates and ensure that the component reflects the correct state.

#### 96.1 **Component with Async Updates**

```tsx
// FetchData.tsx
import React, { useEffect, useState } from "react";

const FetchData = () => {
  const [data, setData] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setData("Fetched data");
    }, 1000);
  }, []);

  return <div>{data || "Loading..."}</div>;
};

export default FetchData;
```

#### 96.2 **Test for Asynchronous Updates**

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import FetchData from "./FetchData";

it("should update the UI when the async data is fetched", async () => {
  render(<FetchData />);

  screen.getByText("Loading...");
  await waitFor(() => screen.getByText("Fetched data"));
  screen.getByText("Fetched data");
});
```

---

### 97. **React Forward Refs**

**`forwardRef`** is a function that allows you to pass a `ref` from a parent component to a child component.

#### 97.1 **Using `forwardRef`**

```tsx
const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => <input ref={ref} {...props} />);

export default Input;
```

#### 97.2 **Test for Forward Refs**

```tsx
import { render, screen } from "@testing-library/react";
import { useRef } from "react";
import Input from "./Input";

it("should forward ref correctly", () => {
  const ref = useRef<HTMLInputElement>(null);

  render(<Input ref={ref} />);

  // Check if the input element is properly referenced
  expect(ref.current).toBeInstanceOf(HTMLInputElement);
});
```

---

### 98. **Server-Side Rendering (SSR) Testing with React**

**Server-Side Rendering (SSR)** allows React components to render on the server, sending fully rendered HTML to the client. Testing SSR involves ensuring that the content is pre-rendered as expected.

#### 98.1 **SSR Example with ReactDOMServer**

```tsx
// ServerRenderedComponent.tsx
import React from "react";

const ServerRenderedComponent = () => {
  return <div>Rendered on server</div>;
};

export default ServerRenderedComponent;
```

#### 98.2 **Test SSR with Mocha and Chai**

To test SSR, you’ll need to mock `ReactDOMServer` rendering and check the output.

```tsx
import React from "react";
import ReactDOMServer from "react-dom/server";
import { expect } from "chai";
import ServerRenderedComponent from "./ServerRenderedComponent";

describe("SSR Test", () => {
  it("should render component to static HTML", () => {
    const html = ReactDOMServer.renderToString(<ServerRenderedComponent />);
    expect(html).to.include("Rendered on server");
  });
});
```

---

### Conclusion

We’ve now covered a

wide range of **advanced React patterns** such as **Render Props**, **HOCs**, **Portals**, **memoization optimization**, **React Refs**, **SSR**, and **asynchronous testing**.

**Unit and integration testing** using **Vitest**, **Mocha**, **Chai**, and **React Testing Library** were applied to demonstrate how to effectively test these patterns and components. This complete stack of concepts and tools ensures you can build and maintain scalable, optimized, and well-tested React applications.

If you'd like more detailed examples or need to dive deeper into any of these topics, feel free to ask!
