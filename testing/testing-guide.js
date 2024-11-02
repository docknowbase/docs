// ==========================================
// 1. Basic Unit Tests with Jest
// ==========================================

// Simple function to test
function sum(a, b) {
  return a + b;
}

// Basic Jest test
describe('Basic Jest Tests', () => {
  test('adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
  });

  // Multiple assertions
  test('numeric operations', () => {
    expect(sum(1, 2)).toBe(3);
    expect(sum(-1, 1)).toBe(0);
    expect(sum(0, 0)).toBe(0);
  });
});

// ==========================================
// 2. Testing Asynchronous Code
// ==========================================

// Example async function
async function fetchUserData(id) {
  const response = await fetch(`https://api.example.com/users/${id}`);
  return response.json();
}

// Async test with Jest
describe('Async Tests', () => {
  // Using async/await
  test('fetches user data', async () => {
    const data = await fetchUserData(1);
    expect(data).toHaveProperty('name');
  });

  // Using promises
  test('fetches user data with promises', () => {
    return fetchUserData(1).then(data => {
      expect(data).toHaveProperty('name');
    });
  });

  // With done callback
  test('fetches user data with callback', done => {
    fetchUserData(1).then(data => {
      expect(data).toHaveProperty('name');
      done();
    });
  });
});

// ==========================================
// 3. Mocking with Jest
// ==========================================

// Function that depends on external service
const UserService = {
  async getUser(id) {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  }
};

// Mocking tests
describe('Mocking Tests', () => {
  // Mock entire module
  jest.mock('./UserService');

  // Mock specific function
  test('mocks getUser function', async () => {
    const mockUser = { id: 1, name: 'John' };
    jest.spyOn(UserService, 'getUser').mockResolvedValue(mockUser);

    const user = await UserService.getUser(1);
    expect(user).toEqual(mockUser);
    expect(UserService.getUser).toHaveBeenCalledWith(1);
  });

  // Mock API calls
  test('mocks fetch API', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ id: 1, name: 'John' })
      })
    );

    const user = await UserService.getUser(1);
    expect(user).toEqual({ id: 1, name: 'John' });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});

// ==========================================
// 4. React Component Testing with React Testing Library
// ==========================================

// Example React component
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <span data-testid="count">{count}</span>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

// Testing React components
import { render, fireEvent, screen } from '@testing-library/react';

describe('React Component Tests', () => {
  test('renders counter and increments', () => {
    render(<Counter />);
    
    // Get elements
    const countElement = screen.getByTestId('count');
    const incrementButton = screen.getByText('Increment');
    
    // Check initial state
    expect(countElement).toHaveTextContent('0');
    
    // Simulate user interaction
    fireEvent.click(incrementButton);
    
    // Check updated state
    expect(countElement).toHaveTextContent('1');
  });

  // Testing async component behavior
  test('loads and displays user data', async () => {
    const UserProfile = ({ userId }) => {
      const [user, setUser] = useState(null);
      
      useEffect(() => {
        UserService.getUser(userId).then(setUser);
      }, [userId]);
      
      if (!user) return <div>Loading...</div>;
      return <div data-testid="user-name">{user.name}</div>;
    };

    // Mock API call
    jest.spyOn(UserService, 'getUser').mockResolvedValue({ name: 'John' });

    render(<UserProfile userId={1} />);
    
    // Assert loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Wait for data to load
    const userName = await screen.findByTestId('user-name');
    expect(userName).toHaveTextContent('John');
  });
});

// ==========================================
// 5. Mocha and Chai Tests
// ==========================================

const { expect } = require('chai');

describe('Mocha and Chai Tests', () => {
  // Basic assertions
  it('should perform basic assertions', () => {
    expect(sum(2, 2)).to.equal(4);
    expect({ name: 'John' }).to.deep.equal({ name: 'John' });
    expect([1, 2, 3]).to.have.lengthOf(3);
    expect('hello').to.be.a('string');
  });

  // Async tests
  it('should handle async operations', async () => {
    const user = await UserService.getUser(1);
    expect(user).to.have.property('name');
    expect(user.id).to.equal(1);
  });

  // Chai plugins and extensions
  const sinon = require('sinon');
  const sinonChai = require('sinon-chai');
  chai.use(sinonChai);

  it('should work with sinon spies', () => {
    const spy = sinon.spy(UserService, 'getUser');
    UserService.getUser(1);
    expect(spy).to.have.been.calledWith(1);
    spy.restore();
  });
});

// ==========================================
// 6. Integration Tests
// ==========================================

describe('Integration Tests', () => {
  // Testing component with Redux
  import { Provider } from 'react-redux';
  import { createStore } from 'redux';
  import reducer from './reducer';

  test('component works with Redux store', () => {
    const store = createStore(reducer);
    render(
      <Provider store={store}>
        <UserList />
      </Provider>
    );

    // Test component interaction with store
    fireEvent.click(screen.getByText('Load Users'));
    expect(store.getState().users).toHaveLength(3);
  });

  // Testing routes
  import { MemoryRouter } from 'react-router-dom';
  
  test('navigation works correctly', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Go to Profile'));
    expect(screen.getByText('Profile Page')).toBeInTheDocument();
  });
});

// ==========================================
// 7. Advanced Testing Patterns
// ==========================================

describe('Advanced Testing Patterns', () => {
  // Custom matcher
  expect.extend({
    toBeWithinRange(received, floor, ceiling) {
      const pass = received >= floor && received <= ceiling;
      return {
        pass,
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`
      };
    }
  });

  // Snapshot testing
  test('component matches snapshot', () => {
    const { container } = render(<UserProfile user={{ name: 'John' }} />);
    expect(container).toMatchSnapshot();
  });

  // Testing error boundaries
  class ErrorBoundary extends React.Component {
    state = { hasError: false };
    
    static getDerivedStateFromError(error) {
      return { hasError: true };
    }
    
    render() {
      if (this.state.hasError) {
        return <div>Something went wrong</div>;
      }
      return this.props.children;
    }
  }

  test('error boundary catches errors', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  // Testing hooks
  function useCounter(initialValue = 0) {
    const [count, setCount] = useState(initialValue);
    const increment = () => setCount(prev => prev + 1);
    return { count, increment };
  }

  test('custom hook behavior', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
});
