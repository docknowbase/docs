// ==========================================
// 1. Advanced Component Testing Patterns
// ==========================================

// Complex form testing with validation
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  
  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.includes('@')) {
      newErrors.email = 'Invalid email';
    }
    if (formData.password.length < 8) {
      newErrors.password = 'Password too short';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      await api.register(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};

describe('Complex Form Testing', () => {
  // Testing form validation
  test('validates form fields correctly', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm />);

    // Type invalid email
    await user.type(screen.getByLabelText(/email/i), 'invalid-email');
    await user.tab(); // Trigger blur event

    // Assert validation message
    expect(screen.getByText('Invalid email')).toBeInTheDocument();

    // Test password mismatch
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password124');
    
    await user.click(screen.getByRole('button', { name: /submit/i }));
    
    // Assert multiple validation messages
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
  });

  // Testing form submission with API mock
  test('submits form successfully', async () => {
    const mockRegister = jest.spyOn(api, 'register').mockResolvedValue();
    
    const user = userEvent.setup();
    render(<RegistrationForm />);

    // Fill form correctly
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');
    
    await user.click(screen.getByRole('button', { name: /submit/i }));
    
    // Assert API called with correct data
    expect(mockRegister).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });
  });
});

// ==========================================
// 2. Advanced State Management Testing
// ==========================================

// Redux Toolkit with TypeScript
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

interface TodoState {
  items: Todo[];
  loading: boolean;
  error: string | null;
}

const todoSlice = createSlice({
  name: 'todos',
  initialState: { items: [], loading: false, error: null } as TodoState,
  reducers: {
    // Reducers
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      });
  }
});

describe('Redux Integration Testing', () => {
  // Testing async thunks
  test('handles async thunk actions', async () => {
    const store = configureStore({
      reducer: { todos: todoSlice.reducer }
    });

    // Mock API
    const mockTodos = [{ id: 1, title: 'Test Todo' }];
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: () => Promise.resolve(mockTodos)
    } as Response);

    // Dispatch async action
    await store.dispatch(fetchTodos());

    // Assert state changes
    expect(store.getState().todos.items).toEqual(mockTodos);
    expect(store.getState().todos.loading).toBe(false);
  });

  // Testing connected components
  test('connected component updates with state', async () => {
    const store = configureStore({
      reducer: { todos: todoSlice.reducer }
    });

    render(
      <Provider store={store}>
        <TodoList />
      </Provider>
    );

    // Assert loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Todo')).toBeInTheDocument();
    });
  });
});

// ==========================================
// 3. Custom Testing Hooks and Utilities
// ==========================================

// Custom render function with providers
const AllTheProviders = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <Router>
          {children}
        </Router>
      </Provider>
    </ThemeProvider>
  );
};

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Custom async utilities
const waitForLoadingToFinish = () =>
  waitFor(
    () => {
      const loader = screen.queryByTestId('loader');
      if (loader) {
        throw new Error('Still loading');
      }
    },
    { timeout: 4000 }
  );

// ==========================================
// 4. Advanced Mocking Patterns
// ==========================================

// Mock Implementations with behaviors
describe('Advanced Mocking', () => {
  // Stateful mock
  test('mock maintains state between calls', () => {
    let storage = {};
    
    const localStorageMock = {
      getItem: jest.fn(key => storage[key]),
      setItem: jest.fn((key, value) => {
        storage[key] = value;
      }),
      clear: jest.fn(() => {
        storage = {};
      })
    };
    
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });
  });

  // Mock with conditional behavior
  test('mock with dynamic responses', async () => {
    const mockApi = jest.fn()
      .mockImplementation(async (url, options) => {
        if (url.includes('/users')) {
          if (options.method === 'GET') {
            return { data: [{ id: 1, name: 'John' }] };
          }
          if (options.method === 'POST') {
            return { data: { id: 2, ...options.body } };
          }
        }
        throw new Error('Not found');
      });
  });
});

// ==========================================
// 5. Testing Complex UI Interactions
// ==========================================

describe('Complex UI Interactions', () => {
  // Testing drag and drop
  test('handles drag and drop', async () => {
    const dataTransfer = new DataTransfer();
    
    render(<DragDropList items={['Item 1', 'Item 2']} />);
    
    const item = screen.getByText('Item 1');
    const dropZone = screen.getByTestId('drop-zone');
    
    fireEvent.dragStart(item, { dataTransfer });
    fireEvent.dragOver(dropZone);
    fireEvent.drop(dropZone, { dataTransfer });
    
    expect(dropZone).toContainElement(item);
  });

  // Testing infinite scroll
  test('loads more items on scroll', async () => {
    render(<InfiniteList />);
    
    const list = screen.getByRole('list');
    
    // Simulate scroll to bottom
    fireEvent.scroll(window, { target: { scrollY: 1000 } });
    
    await waitFor(() => {
      expect(list.children.length).toBeGreaterThan(20);
    });
  });
});

// ==========================================
// 6. Performance Testing
// ==========================================

describe('Performance Tests', () => {
  // Testing render performance
  test('component renders without excessive re-renders', () => {
    const renderCount = jest.fn();
    
    function TestComponent() {
      useEffect(renderCount);
      return <div>Test</div>;
    }
    
    render(<TestComponent />);
    
    // Trigger state updates
    act(() => {
      // Multiple state updates
    });
    
    expect(renderCount).toHaveBeenCalledTimes(1);
  });

  // Memory leak testing
  test('no memory leaks on unmount', () => {
    const wrapper = render(<ComplexComponent />);
    
    // Store initial memory usage
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Unmount and mount multiple times
    for (let i = 0; i < 100; i++) {
      wrapper.unmount();
      wrapper.rerender(<ComplexComponent />);
    }
    
    const finalMemory = process.memoryUsage().heapUsed;
    expect(finalMemory - initialMemory).toBeLessThan(1000000); // 1MB threshold
  });
});

// ==========================================
// 7. Testing Error Scenarios
// ==========================================

describe('Error Handling', () => {
  // Network error simulation
  test('handles network errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));
    
    render(<DataFetcher />);
    
    await waitFor(() => {
      expect(screen.getByText(/error occurred/i)).toBeInTheDocument();
    });
    
    expect(consoleSpy).toHaveBeenCalled();
  });

  // Race condition testing
  test('handles concurrent requests correctly', async () => {
    const slowRequest = new Promise(resolve => 
      setTimeout(() => resolve({ data: 'slow' }), 1000)
    );
    const fastRequest = Promise.resolve({ data: 'fast' });
    
    render(<ConcurrentRequests />);
    
    // Trigger both requests
    await Promise.all([
      slowRequest,
      fastRequest
    ]);
    
    // Only the latest data should be displayed
    expect(screen.getByText('fast')).toBeInTheDocument();
    expect(screen.queryByText('slow')).not.toBeInTheDocument();
  });
});

// ==========================================
// 8. Test Coverage and Quality
// ==========================================

// Jest coverage configuration
module.exports = {
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
  // Custom reporters
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'reports/junit',
      outputName: 'js-test-results.xml',
    }],
  ],
};
