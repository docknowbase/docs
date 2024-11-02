### Unit Testing with `pytest` in Python

Unit testing focuses on testing individual units of code (usually functions or methods) to ensure they work as expected. `pytest` is a popular testing framework in Python due to its simplicity and powerful features.

#### Scenario 1: Unit Testing with `pytest`

Let's start by writing a simple Python function and then writing unit tests for it.

#### Code to be tested (`math_operations.py`):

```python
# math_operations.py

def add(a, b):
    """Returns the sum of two numbers."""
    return a + b

def subtract(a, b):
    """Returns the difference of two numbers."""
    return a - b

def multiply(a, b):
    """Returns the product of two numbers."""
    return a * b

def divide(a, b):
    """Returns the division of two numbers. Raises an error if dividing by zero."""
    if b == 0:
        raise ValueError("Cannot divide by zero!")
    return a / b
```

#### Unit Test for the `add` function (`test_math_operations.py`):

```python
# test_math_operations.py

import pytest
from math_operations import add, subtract, multiply, divide

# Unit tests for add function
def test_add_positive_numbers():
    result = add(3, 4)
    assert result == 7

def test_add_negative_numbers():
    result = add(-3, -4)
    assert result == -7

def test_add_mixed_numbers():
    result = add(3, -4)
    assert result == -1

# Unit tests for subtract function
def test_subtract():
    result = subtract(10, 5)
    assert result == 5

# Unit tests for multiply function
def test_multiply():
    result = multiply(3, 4)
    assert result == 12

# Unit tests for divide function
def test_divide():
    result = divide(10, 2)
    assert result == 5

def test_divide_by_zero():
    with pytest.raises(ValueError):
        divide(10, 0)
```

#### Running Unit Tests

To run the unit tests, use the following command:

```bash
pytest test_math_operations.py
```

### Explanation of Unit Testing:

1. **Test Functions**: Each function tests a single unit of the code, for example, the `add` function.
2. **Assertions**: We use `assert` to verify that the output of the function matches the expected result.
3. **Error Handling**: We use `pytest.raises()` to check if the function raises the appropriate error (like in the case of division by zero).

### Integration Testing with `pytest`

Integration testing ensures that different parts of the application work together as expected. In integration tests, you often test the interaction between multiple components or systems.

#### Scenario 2: Integration Testing with `pytest`

Let's assume we have a simple system that interacts with an external database. We want to test how the functions interact with each other and with a simulated database.

#### Code to be tested (`database_operations.py`):

```python
# database_operations.py

class Database:
    """A mock database class."""
    def __init__(self):
        self.data = {}

    def insert(self, key, value):
        """Inserts a key-value pair into the database."""
        self.data[key] = value

    def retrieve(self, key):
        """Retrieves a value by key from the database."""
        return self.data.get(key, None)

    def delete(self, key):
        """Deletes a key-value pair from the database."""
        if key in self.data:
            del self.data[key]
```

#### Code for integrating with the database (`user_service.py`):

```python
# user_service.py
from database_operations import Database

class UserService:
    def __init__(self, database):
        self.database = database

    def add_user(self, user_id, user_name):
        """Adds a user to the database."""
        self.database.insert(user_id, user_name)

    def get_user(self, user_id):
        """Retrieves a user from the database."""
        return self.database.retrieve(user_id)

    def remove_user(self, user_id):
        """Removes a user from the database."""
        self.database.delete(user_id)
```

#### Integration Test (`test_user_service.py`):

```python
# test_user_service.py
import pytest
from user_service import UserService
from database_operations import Database

@pytest.fixture
def database():
    """Fixture that provides a fresh Database instance for each test."""
    return Database()

@pytest.fixture
def user_service(database):
    """Fixture that provides a UserService instance."""
    return UserService(database)

# Integration test for adding a user
def test_add_user(user_service, database):
    user_service.add_user(1, "John Doe")
    assert database.retrieve(1) == "John Doe"

# Integration test for retrieving a user
def test_get_user(user_service, database):
    user_service.add_user(2, "Jane Smith")
    assert user_service.get_user(2) == "Jane Smith"

# Integration test for removing a user
def test_remove_user(user_service, database):
    user_service.add_user(3, "Mike Johnson")
    user_service.remove_user(3)
    assert database.retrieve(3) is None
```

#### Running Integration Tests

You can run the integration tests with the same command as unit tests:

```bash
pytest test_user_service.py
```

### Explanation of Integration Testing:

1. **Fixtures**: `pytest.fixture` is used to set up shared resources for tests. For example, the `database` fixture provides a fresh `Database` instance for each test, and the `user_service` fixture provides an instance of the `UserService` class.
2. **Integration of Components**: The tests check that the `UserService` interacts correctly with the `Database` class, simulating the integration of multiple components.
3. **Assertions**: We assert that the interactions between the `UserService` and the `Database` lead to the correct changes in the database.

### Key Differences Between Unit and Integration Testing:

- **Unit Testing**:

  - Focuses on testing a small piece of functionality (usually a function or method).
  - Uses mocks or stubs to isolate the unit under test from external dependencies.
  - Example: Testing individual functions like `add()`, `subtract()`, etc.

- **Integration Testing**:
  - Focuses on testing how different units or components work together.
  - Involves real or simulated interactions between components, databases, APIs, etc.
  - Example: Testing how the `UserService` class interacts with the `Database`.

### Summary

- **Unit tests** are typically isolated, testing individual components in isolation with assertions on the output.
- **Integration tests** verify that multiple components work together as expected. Fixtures are often used to set up the environment and shared resources for these tests.

Both types of tests are important for ensuring that your code works correctly at different levels of the system.
