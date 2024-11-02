To demonstrate Python's built-in constructs in a real-world scenario and show how to write unit and integration tests using `pytest`, I'll create a small example where we build a simple **Task Management System**. This system will handle tasks, support adding/removing tasks, and allow users to mark tasks as completed or not.

We will use various Python built-ins like lists, dictionaries, sets, functions, exceptions, and loops. I'll walk through the constructs as part of the implementation and provide tests using `pytest`.

### 1. **Task Management System:**

We will implement a `Task` class that has methods to add, remove, and update tasks. The tasks will be stored in a list of dictionaries, which will allow us to demonstrate the use of lists, dictionaries, and basic logic.

### Task Class:

```python
from typing import List, Dict, Union

class Task:
    def __init__(self):
        # A task will have an ID, a description, and a status
        self.tasks: List[Dict[str, Union[int, str, bool]]] = []

    def add_task(self, description: str) -> None:
        """ Adds a new task """
        task_id = len(self.tasks) + 1  # Automatically assign an incremental task ID
        self.tasks.append({'id': task_id, 'description': description, 'completed': False})

    def remove_task(self, task_id: int) -> bool:
        """ Removes a task by its ID """
        task = next((task for task in self.tasks if task['id'] == task_id), None)
        if task:
            self.tasks.remove(task)
            return True
        return False

    def mark_completed(self, task_id: int) -> bool:
        """ Marks a task as completed by its ID """
        task = next((task for task in self.tasks if task['id'] == task_id), None)
        if task:
            task['completed'] = True
            return True
        return False

    def get_incomplete_tasks(self) -> List[Dict[str, Union[int, str, bool]]]:
        """ Returns a list of incomplete tasks """
        return [task for task in self.tasks if not task['completed']]

    def get_completed_tasks(self) -> List[Dict[str, Union[int, str, bool]]]:
        """ Returns a list of completed tasks """
        return [task for task in self.tasks if task['completed']]
```

### Real-World Scenario

- **Add Tasks**: A user might want to add a new task to the task management system.
- **Remove Tasks**: If a task is no longer needed, it can be removed.
- **Mark Tasks as Completed**: Users can mark tasks as completed when they're done.
- **Get Incomplete/Completed Tasks**: We need to filter out incomplete and completed tasks separately.

### 2. **Writing Unit Tests using `pytest`**

Let's now create some unit tests for each method of the `Task` class.

#### Test File: `test_task.py`

```python
import pytest
from task_manager import Task  # Assuming the Task class is in task_manager.py

@pytest.fixture
def task_manager():
    """Fixture that creates a fresh Task manager before each test."""
    return Task()

def test_add_task(task_manager):
    """Test for adding a task."""
    task_manager.add_task("Buy groceries")
    assert len(task_manager.tasks) == 1
    assert task_manager.tasks[0]['description'] == "Buy groceries"
    assert task_manager.tasks[0]['completed'] is False

def test_remove_task(task_manager):
    """Test for removing a task."""
    task_manager.add_task("Buy groceries")
    assert len(task_manager.tasks) == 1
    result = task_manager.remove_task(1)
    assert result is True
    assert len(task_manager.tasks) == 0

def test_remove_task_not_found(task_manager):
    """Test removing a non-existent task."""
    result = task_manager.remove_task(999)
    assert result is False
    assert len(task_manager.tasks) == 0

def test_mark_completed(task_manager):
    """Test marking a task as completed."""
    task_manager.add_task("Buy groceries")
    task_manager.mark_completed(1)
    assert task_manager.tasks[0]['completed'] is True

def test_mark_completed_task_not_found(task_manager):
    """Test marking a non-existent task as completed."""
    result = task_manager.mark_completed(999)
    assert result is False

def test_get_incomplete_tasks(task_manager):
    """Test retrieving incomplete tasks."""
    task_manager.add_task("Buy groceries")
    task_manager.add_task("Clean house")
    assert len(task_manager.get_incomplete_tasks()) == 2
    task_manager.mark_completed(1)
    assert len(task_manager.get_incomplete_tasks()) == 1

def test_get_completed_tasks(task_manager):
    """Test retrieving completed tasks."""
    task_manager.add_task("Buy groceries")
    task_manager.add_task("Clean house")
    task_manager.mark_completed(1)
    completed_tasks = task_manager.get_completed_tasks()
    assert len(completed_tasks) == 1
    assert completed_tasks[0]['description'] == "Buy groceries"
```

### 3. **Explanation of the Tests**

- **Test Setup with Fixtures**: We use the `@pytest.fixture` decorator to create a fresh instance of `Task` before each test. This ensures that tests do not interfere with each other.
- **Test Case Examples**:
  - `test_add_task`: Verifies that a new task is correctly added to the system.
  - `test_remove_task`: Checks if removing a task works correctly.
  - `test_remove_task_not_found`: Ensures that trying to remove a non-existent task returns `False`.
  - `test_mark_completed`: Validates that a task can be marked as completed.
  - `test_get_incomplete_tasks`: Tests that we can correctly retrieve all incomplete tasks.
  - `test_get_completed_tasks`: Verifies that completed tasks are returned correctly.

### 4. **Running the Tests**

To run the tests, you will need to have `pytest` installed. You can install it using:

```bash
pip install pytest
```

Once `pytest` is installed, you can run the tests from the terminal:

```bash
pytest test_task.py
```

### 5. **Integration Tests**

You can also write integration tests to check if all components of your system work together. For instance, testing a sequence of adding, completing, and removing tasks could be an integration test:

```python
def test_integration(task_manager):
    """Test adding, completing, and removing tasks."""
    task_manager.add_task("Buy groceries")
    task_manager.add_task("Clean house")

    # Mark the first task as completed
    task_manager.mark_completed(1)

    # Check that we have 1 completed task and 1 incomplete task
    assert len(task_manager.get_completed_tasks()) == 1
    assert len(task_manager.get_incomplete_tasks()) == 1

    # Now remove the completed task
    task_manager.remove_task(1)
    assert len(task_manager.get_completed_tasks()) == 0
    assert len(task_manager.get_incomplete_tasks()) == 1
```

### 6. **Summary of Built-ins Used**

- **Lists**: To store tasks.
- **Dictionaries**: To store task details like ID, description, and status.
- **Loops (list comprehensions)**: To filter incomplete/completed tasks.
- **Functions**: To encapsulate task-related operations.
- **Assertions**: To verify behavior in tests.

This demonstrates how to implement and test basic Python constructs in a real-world application.

Let's create another real-world example that demonstrates Python's built-in constructs in a more comprehensive way, with a focus on how to implement, test, and validate them using `pytest`.

### Example Scenario: **Inventory Management System**

In this example, we’ll build an **Inventory Management System** for a small store that tracks products, manages stock levels, and handles inventory operations like adding, updating, and removing products.

We'll use the following basic Python constructs:

- **Lists**: To store products.
- **Dictionaries**: To store product information such as name, quantity, and price.
- **Functions**: For inventory operations like adding or removing products.
- **Control Flow (if-else)**: To handle edge cases (e.g., trying to remove more products than available).
- **Exceptions**: To handle errors (e.g., trying to remove a product that doesn't exist).
- **Loops**: For iterating over products (e.g., for generating reports).
- **Set operations**: For efficient lookup and uniqueness checks.

### 1. **Inventory Management System Implementation**

#### Inventory Class:

```python
from typing import List, Dict

class Inventory:
    def __init__(self):
        self.products: List[Dict[str, str]] = []  # List to store products as dictionaries

    def add_product(self, name: str, quantity: int, price: float) -> None:
        """Adds a new product to the inventory."""
        # Check if the product already exists, if it does, just update the quantity
        existing_product = next((p for p in self.products if p['name'] == name), None)
        if existing_product:
            existing_product['quantity'] += quantity
        else:
            self.products.append({'name': name, 'quantity': quantity, 'price': price})

    def remove_product(self, name: str, quantity: int) -> bool:
        """Removes the given quantity of a product from the inventory."""
        product = next((p for p in self.products if p['name'] == name), None)
        if product:
            if product['quantity'] >= quantity:
                product['quantity'] -= quantity
                if product['quantity'] == 0:
                    self.products.remove(product)  # Remove the product if stock hits zero
                return True
            else:
                raise ValueError(f"Not enough stock for product {name}.")
        else:
            raise ValueError(f"Product {name} not found.")

    def update_price(self, name: str, new_price: float) -> bool:
        """Updates the price of a product."""
        product = next((p for p in self.products if p['name'] == name), None)
        if product:
            product['price'] = new_price
            return True
        else:
            raise ValueError(f"Product {name} not found.")

    def get_stock_value(self) -> float:
        """Calculates the total stock value (quantity * price for each product)."""
        return sum(p['quantity'] * p['price'] for p in self.products)

    def get_product(self, name: str) -> Dict[str, str]:
        """Returns the product details."""
        product = next((p for p in self.products if p['name'] == name), None)
        if product:
            return product
        else:
            raise ValueError(f"Product {name} not found.")

    def list_products(self) -> List[Dict[str, str]]:
        """Returns a list of all products."""
        return self.products
```

### 2. **Test Cases Using `pytest`**

We will create unit tests to verify that each function behaves as expected and integration tests to verify the entire flow of adding, updating, and removing products.

#### Test File: `test_inventory.py`

```python
import pytest
from inventory_manager import Inventory  # Assuming Inventory is in inventory_manager.py

# Fixture to set up a fresh inventory instance for each test
@pytest.fixture
def inventory():
    return Inventory()

def test_add_product(inventory):
    """Test adding a new product to the inventory."""
    inventory.add_product("Apple", 50, 0.5)
    product = inventory.get_product("Apple")
    assert product['name'] == "Apple"
    assert product['quantity'] == 50
    assert product['price'] == 0.5

def test_add_existing_product(inventory):
    """Test adding an existing product and updating its quantity."""
    inventory.add_product("Apple", 50, 0.5)
    inventory.add_product("Apple", 30, 0.5)
    product = inventory.get_product("Apple")
    assert product['quantity'] == 80

def test_remove_product(inventory):
    """Test removing a product."""
    inventory.add_product("Apple", 50, 0.5)
    result = inventory.remove_product("Apple", 30)
    assert result is True
    product = inventory.get_product("Apple")
    assert product['quantity'] == 20

def test_remove_more_than_available(inventory):
    """Test removing more products than are available."""
    inventory.add_product("Apple", 50, 0.5)
    with pytest.raises(ValueError, match="Not enough stock for product Apple."):
        inventory.remove_product("Apple", 60)

def test_remove_non_existing_product(inventory):
    """Test trying to remove a non-existing product."""
    with pytest.raises(ValueError, match="Product Banana not found."):
        inventory.remove_product("Banana", 10)

def test_update_price(inventory):
    """Test updating the price of a product."""
    inventory.add_product("Apple", 50, 0.5)
    result = inventory.update_price("Apple", 0.6)
    assert result is True
    product = inventory.get_product("Apple")
    assert product['price'] == 0.6

def test_get_stock_value(inventory):
    """Test calculating the total stock value."""
    inventory.add_product("Apple", 50, 0.5)
    inventory.add_product("Banana", 30, 0.3)
    stock_value = inventory.get_stock_value()
    assert stock_value == 30.0  # (50 * 0.5) + (30 * 0.3)

def test_list_products(inventory):
    """Test listing all products."""
    inventory.add_product("Apple", 50, 0.5)
    inventory.add_product("Banana", 30, 0.3)
    products = inventory.list_products()
    assert len(products) == 2
    assert any(p['name'] == "Apple" for p in products)
    assert any(p['name'] == "Banana" for p in products)

# Integration Test
def test_integration(inventory):
    """Test adding, removing, updating, and listing products together."""
    # Add products
    inventory.add_product("Apple", 50, 0.5)
    inventory.add_product("Banana", 30, 0.3)

    # Update price of Apple
    inventory.update_price("Apple", 0.6)

    # Remove some Apples
    inventory.remove_product("Apple", 20)

    # List products and check values
    products = inventory.list_products()
    assert len(products) == 2
    assert any(p['name'] == "Apple" and p['quantity'] == 30 for p in products)
    assert any(p['name'] == "Banana" for p in products)

    # Check stock value
    stock_value = inventory.get_stock_value()
    assert stock_value == 28.0  # (30 * 0.6) + (30 * 0.3)
```

### 3. **Explanation of Tests**

- **Unit Tests**: Each method in the `Inventory` class is tested with unit tests:

  - **Adding Products**: Verifying that new products are correctly added and existing products have their quantities updated.
  - **Removing Products**: Ensuring that products can be removed correctly and handling edge cases like trying to remove more than the available stock.
  - **Updating Price**: Testing that prices are updated correctly.
  - **Stock Value**: Ensuring that the total value of the inventory is calculated correctly.
  - **Listing Products**: Verifying that products are correctly listed in the inventory.

- **Integration Test**: The integration test simulates a real-world scenario where products are added, updated, removed, and then checked for consistency. It also verifies the overall flow of interactions.

### 4. **Running the Tests**

To run the tests, ensure that `pytest` is installed:

```bash
pip install pytest
```

Then, run the tests:

```bash
pytest test_inventory.py
```

### 5. **Summary of Built-ins Used**

- **Lists**: To store the inventory of products.
- **Dictionaries**: To store details of each product (name, quantity, price).
- **Functions**: To perform actions like adding, removing, and updating products.
- **Control Flow (if-else)**: To handle conditions (e.g., checking if a product exists before removing it).
- **Exceptions**: To handle errors (e.g., trying to remove a product that doesn't exist).
- **Loops**: For iterating over products when updating or listing them.
- **Set operations**: Not directly used, but could be considered for product uniqueness checks.

This example covers a broader range of Python constructs while showing how to write unit and integration tests using `pytest`.

In this example, we will create a **Library Management System** that focuses on **Python Dunder Methods (Magic Methods)**. This real-world example will use a collection of books and allow the user to manage them. The main focus will be on the **dunder methods** (methods with double underscores like `__init__`, `__str__`, `__repr__`, `__eq__`, `__lt__`, etc.) to enhance the functionality and flexibility of the `Book` and `Library` classes.

### Use Case: **Library Management System**

We will build the system such that we can:

1. **Add and remove books** from the library.
2. **Compare books** by different attributes (e.g., by title or by publication year).
3. **Display books** in a human-readable format.
4. **Sort books** by title or by year of publication.
5. **Check if two books are the same** based on their attributes.

We'll implement several dunder methods, including:

- `__init__`: For initialization.
- `__repr__` & `__str__`: For string representation.
- `__eq__` & `__lt__`: For comparison.
- `__add__`: For adding books.
- `__len__`: To get the number of books in the library.

We will also write tests for each of the features using `pytest` to ensure everything works correctly.

### 1. **Library and Book Classes with Dunder Methods**

#### Book Class

```python
class Book:
    def __init__(self, title: str, author: str, publication_year: int):
        self.title = title
        self.author = author
        self.publication_year = publication_year

    def __repr__(self):
        return f"Book({self.title!r}, {self.author!r}, {self.publication_year!r})"

    def __str__(self):
        return f"'{self.title}' by {self.author} ({self.publication_year})"

    def __eq__(self, other):
        if isinstance(other, Book):
            return self.title == other.title and self.author == other.author
        return False

    def __lt__(self, other):
        if isinstance(other, Book):
            return self.publication_year < other.publication_year
        return False

    def __add__(self, other):
        if isinstance(other, Book):
            return f"Cannot add two books directly, but you can add their details: {self.title} + {other.title}"
        return NotImplemented

    def __len__(self):
        return len(self.title)
```

#### Library Class

```python
class Library:
    def __init__(self):
        self.books = []

    def add_book(self, book: Book) -> None:
        """Adds a book to the library."""
        self.books.append(book)

    def remove_book(self, book: Book) -> bool:
        """Removes a book from the library."""
        if book in self.books:
            self.books.remove(book)
            return True
        return False

    def get_books(self):
        """Returns all books in the library."""
        return self.books

    def __len__(self):
        return len(self.books)

    def __repr__(self):
        return f"Library({self.books!r})"

    def __str__(self):
        return "\n".join(str(book) for book in self.books)
```

### 2. **Explanation of Dunder Methods**

- **`__init__`**: Constructor for initializing an object. In `Book`, it initializes the title, author, and publication year.
- **`__repr__`**: Returns a machine-readable string representation of the object. Useful for debugging.
- **`__str__`**: Returns a human-readable string representation of the object.
- **`__eq__`**: Compares two objects for equality. Here, we compare books based on title and author.
- **`__lt__`**: Compares objects for "less than". In our case, we compare books based on publication year.
- **`__add__`**: Handles addition. Here, it returns a message when trying to add two books.
- **`__len__`**: Returns the length of the book (in this case, the length of the title).

### 3. **Writing Tests with `pytest`**

We will create unit tests to validate each method's behavior, including all dunder methods.

#### Test File: `test_library.py`

```python
import pytest
from library_manager import Book, Library  # Assuming these classes are in library_manager.py

# Fixtures
@pytest.fixture
def book1():
    return Book("The Great Gatsby", "F. Scott Fitzgerald", 1925)

@pytest.fixture
def book2():
    return Book("Moby Dick", "Herman Melville", 1851)

@pytest.fixture
def library(book1, book2):
    library = Library()
    library.add_book(book1)
    library.add_book(book2)
    return library

def test_book_repr(book1):
    """Test __repr__ method of Book"""
    assert repr(book1) == "Book('The Great Gatsby', 'F. Scott Fitzgerald', 1925)"

def test_book_str(book1):
    """Test __str__ method of Book"""
    assert str(book1) == "'The Great Gatsby' by F. Scott Fitzgerald (1925)"

def test_book_eq(book1, book2):
    """Test __eq__ method of Book"""
    book3 = Book("The Great Gatsby", "F. Scott Fitzgerald", 1925)
    assert book1 == book3
    assert book1 != book2

def test_book_lt(book1, book2):
    """Test __lt__ method of Book"""
    assert book2 < book1  # Moby Dick was published earlier than The Great Gatsby

def test_book_add(book1, book2):
    """Test __add__ method of Book"""
    assert book1 + book2 == "Cannot add two books directly, but you can add their details: The Great Gatsby + Moby Dick"

def test_book_len(book1):
    """Test __len__ method of Book"""
    assert len(book1) == len(book1.title)

def test_library_add_book(library, book1):
    """Test adding a book to the library"""
    new_book = Book("1984", "George Orwell", 1949)
    library.add_book(new_book)
    assert len(library) == 3
    assert new_book in library.get_books()

def test_library_remove_book(library, book1):
    """Test removing a book from the library"""
    assert library.remove_book(book1) is True
    assert len(library) == 1
    assert book1 not in library.get_books()

def test_library_remove_non_existent_book(library):
    """Test removing a book not in the library"""
    book3 = Book("War and Peace", "Leo Tolstoy", 1869)
    assert library.remove_book(book3) is False

def test_library_repr(library):
    """Test __repr__ method of Library"""
    assert repr(library) == "Library([Book('The Great Gatsby', 'F. Scott Fitzgerald', 1925), Book('Moby Dick', 'Herman Melville', 1851)])"

def test_library_str(library):
    """Test __str__ method of Library"""
    assert str(library) == "'The Great Gatsby' by F. Scott Fitzgerald (1925)\n'Moby Dick' by Herman Melville (1851)"
```

### 4. **Explanation of the Tests**

- **Test Book Class**:

  - **`test_book_repr`**: Verifies the machine-readable representation of a `Book`.
  - **`test_book_str`**: Checks the human-readable string representation of a `Book`.
  - **`test_book_eq`**: Validates the equality comparison of `Book` objects based on title and author.
  - **`test_book_lt`**: Ensures the comparison by publication year is correct (i.e., comparing if one book was published before the other).
  - **`test_book_add`**: Tests the addition functionality (we check if adding two books gives a specific message).
  - **`test_book_len`**: Ensures the `__len__` method returns the correct length (based on the title's length).

- **Test Library Class**:
  - **`test_library_add_book`**: Verifies that books can be added to the library correctly.
  - **`test_library_remove_book`**: Ensures a book can be removed from the library.
  - **`test_library_remove_non_existent_book`**: Handles the case where a non-existent book is removed.
  - **`test_library_repr`**: Checks the machine-readable representation of the `Library` class.
  - **`test_library_str`**: Verifies the human-readable string representation of the `Library` class.

### 5. **Running the Tests**

To run the tests, ensure you have `pytest` installed:

```bash
pip install pytest
```

Then, run the tests using:

```bash
pytest test_library.py
```

### 6. **Summary of Dunder Methods**

- **`__init__`**: Initializes objects.
- **`__repr__`**: Machine-readable string representation for debugging.
- **`__str__`**: Human-readable string representation for user-friendly output.
- **`__eq__`**: Checks if two objects are equal (based on title and author in the `Book` class).
- **`__lt__`**: Less-than comparison, useful for sorting (based on publication year).

- **`__add__`**: Handles addition between objects, in this case, providing a custom message.
- **`__len__`**: Returns the length of an object, here it’s the length of the book title.

This example focuses purely on **dunder methods** and shows how to use them effectively to build a flexible and maintainable class, while also using **pytest** for comprehensive unit and integration testing.

### Real World Use Case: **Task Manager with Context Managers**

In this example, we'll create a **Task Manager** application, where we will define a **Task** and a **TaskManager** class to manage a list of tasks. We will focus on **Context Managers**, both built-in and custom, to handle resources like opening/closing files or logging activities during the lifecycle of a task.

Context Managers are useful for scenarios where you need to allocate and release resources (e.g., file handling, database connections) safely. In Python, context managers are implemented using `with` statements. We will:

1. Create a **custom context manager** for logging task management activities.
2. Use **built-in context managers** (like `open()` for file operations).
3. Write unit and integration tests using **pytest** to verify correct behavior.

### 1. **Task Manager Application**

The **TaskManager** system will:

- Manage a list of tasks.
- Add, remove, and list tasks.
- Log each task operation using a custom context manager for logging.
- Perform some actions (like writing to a file) when tasks are completed.

#### Task and TaskManager Classes

```python
import os
from contextlib import contextmanager
from typing import List

# Custom context manager for logging task operations
@contextmanager
def task_logger(task_name: str):
    """Logs the start and end of a task operation."""
    print(f"Starting task: {task_name}")
    yield  # This is where the task's code will run
    print(f"Completed task: {task_name}")

# Task class to represent a task
class Task:
    def __init__(self, name: str, description: str, status: str = "pending"):
        self.name = name
        self.description = description
        self.status = status

    def __repr__(self):
        return f"Task(name={self.name!r}, status={self.status!r})"

    def __str__(self):
        return f"Task: {self.name}, Status: {self.status}"

# TaskManager to handle a list of tasks
class TaskManager:
    def __init__(self):
        self.tasks: List[Task] = []

    def add_task(self, task: Task):
        """Adds a task to the manager."""
        self.tasks.append(task)

    def remove_task(self, task: Task):
        """Removes a task from the manager."""
        self.tasks.remove(task)

    def complete_task(self, task: Task):
        """Marks a task as complete."""
        task.status = 'completed'

    def list_tasks(self):
        """Lists all tasks."""
        return self.tasks

    def save_to_file(self, filename: str):
        """Saves task list to a file."""
        with open(filename, 'w') as file:
            for task in self.tasks:
                file.write(f"{task.name}: {task.status}\n")

    def __repr__(self):
        return f"TaskManager({self.tasks!r})"

    def __str__(self):
        return "\n".join(str(task) for task in self.tasks)
```

### 2. **Key Features and Context Manager Usage**

- **Custom Context Manager (`task_logger`)**:
  - This context manager logs the start and completion of a task operation (like adding, removing, or completing a task).
  - It is used with the `with` statement to ensure that task operations are logged before and after the task manipulation.
- **Built-in Context Manager (`open`)**:
  - We use the `open()` function (a built-in context manager) to handle file operations when saving tasks to a file. This ensures that the file is properly closed after writing the task list.

### 3. **Testing with `pytest`**

We will write unit tests and integration tests to verify the behavior of the `TaskManager` class, focusing on ensuring that the custom context manager is working properly and that tasks are managed correctly.

#### Test File: `test_task_manager.py`

```python
import pytest
from task_manager import Task, TaskManager, task_logger
from unittest.mock import patch
import os

# Fixtures
@pytest.fixture
def task1():
    return Task("Write Code", "Complete the task manager feature", "pending")

@pytest.fixture
def task2():
    return Task("Test Code", "Test the task manager feature", "pending")

@pytest.fixture
def task_manager(task1, task2):
    manager = TaskManager()
    manager.add_task(task1)
    manager.add_task(task2)
    return manager

def test_task_repr(task1):
    """Test __repr__ method of Task"""
    assert repr(task1) == "Task(name='Write Code', status='pending')"

def test_task_str(task1):
    """Test __str__ method of Task"""
    assert str(task1) == "Task: Write Code, Status: pending"

def test_task_manager_add_task(task_manager, task1):
    """Test adding a task to the TaskManager"""
    new_task = Task("Deploy Code", "Deploy the task manager feature", "pending")
    task_manager.add_task(new_task)
    assert len(task_manager.tasks) == 3
    assert new_task in task_manager.tasks

def test_task_manager_remove_task(task_manager, task1):
    """Test removing a task from the TaskManager"""
    task_manager.remove_task(task1)
    assert len(task_manager.tasks) == 1
    assert task1 not in task_manager.tasks

def test_task_manager_complete_task(task_manager, task1):
    """Test completing a task in TaskManager"""
    task_manager.complete_task(task1)
    assert task1.status == "completed"

def test_task_manager_list_tasks(task_manager):
    """Test listing all tasks in TaskManager"""
    tasks = task_manager.list_tasks()
    assert len(tasks) == 2
    assert tasks[0].name == "Write Code"
    assert tasks[1].name == "Test Code"

def test_task_logger_context_manager(task1):
    """Test custom task_logger context manager"""
    with patch('builtins.print') as mock_print:
        with task_logger(task1.name):
            pass
        mock_print.assert_any_call(f"Starting task: {task1.name}")
        mock_print.assert_any_call(f"Completed task: {task1.name}")

def test_task_manager_save_to_file(task_manager):
    """Test saving tasks to a file using the save_to_file method"""
    filename = 'tasks.txt'
    task_manager.save_to_file(filename)
    assert os.path.exists(filename)

    with open(filename, 'r') as file:
        lines = file.readlines()
        assert len(lines) == 2
        assert "Write Code: pending\n" in lines
        assert "Test Code: pending\n" in lines

    # Clean up
    os.remove(filename)

# Integration Test: Adding, completing, and saving tasks
def test_integration(task_manager, task1, task2):
    """Test adding, completing, and saving tasks"""
    task_manager.complete_task(task1)

    # Verify that task1 is completed and task2 is still pending
    assert task1.status == 'completed'
    assert task2.status == 'pending'

    # Verify that tasks are saved to the file
    filename = 'tasks_integration.txt'
    task_manager.save_to_file(filename)

    with open(filename, 'r') as file:
        lines = file.readlines()
        assert "Write Code: completed\n" in lines
        assert "Test Code: pending\n" in lines

    # Clean up
    os.remove(filename)
```

### 4. **Explanation of the Tests**

- **Unit Tests**:

  - **Task Methods**: We verify the `__repr__` and `__str__` methods of the `Task` class to ensure proper string representation.
  - **Task Manager Methods**: We test core functionalities of the `TaskManager` class:
    - **Add Task**: Verifying that tasks are added to the manager.
    - **Remove Task**: Ensuring tasks can be removed correctly.
    - **Complete Task**: Checking that tasks' status changes as expected.
    - **List Tasks**: Ensuring that the task list is accurate.
  - **Custom Context Manager**: We test the `task_logger` context manager by using `patch` from `unittest.mock` to intercept calls to `print`. This ensures that the logger prints the expected start and completion messages.

- **Integration Test**:
  - The integration test ensures that tasks can be added, completed, and saved correctly to a file. It verifies that after completing a task, its status is updated, and when saving tasks to a file, they are written correctly. We clean up by removing the file after the test.

### 5. **Running the Tests**

To run the tests, ensure `pytest` is installed:

```bash
pip install pytest
```

Then run the tests with:

```bash
pytest test_task_manager.py
```

### 6. **Summary of Dunder Methods and Context Managers**

- **Context Manager**:
  - We created a custom context manager `task_logger` to log task operations, ensuring that start and end logs are printed properly during the task lifecycle.
  - We used Python’s built-in context manager `open` to handle file operations (like saving tasks to a file) safely.
- **Unit and Integration Tests**:
  - We used `pytest` for unit tests to verify individual methods (like adding/removing tasks and task status updates) and integration tests to verify end-to-end behavior (like saving tasks to a file).
  - We used `unittest.mock.patch` to verify the custom context manager’s behavior without actually printing to the console.

This example demonstrates **context managers** in a real-world scenario and how

to test them effectively with `pytest`.

In this example, we will focus on building a **real-world task manager system**, which will:

1. Use **context managers** to manage resources like opening and closing files.
2. Use **class-based custom context managers** to log task operations.
3. Incorporate advanced Python features such as **unit tests** and **integration tests** using `pytest`.

The system will:

- Track tasks (including task names, descriptions, and statuses).
- Perform operations like adding, completing, and removing tasks.
- Use context managers to log these operations.
- Use context managers to manage file operations.

### 1. **Task Manager System with Class-Based Context Manager**

We'll use a **class-based context manager** to handle logging operations whenever tasks are added, completed, or removed. Additionally, we'll incorporate file management using context managers.

#### Task Class

The `Task` class will represent an individual task, and it will contain the following features:

- A name.
- A description.
- A status that defaults to "pending".

#### TaskManager Class

The `TaskManager` class will manage a collection of tasks. It will be responsible for:

- Adding tasks.
- Removing tasks.
- Marking tasks as completed.
- Listing all tasks.
- Saving tasks to a file.

#### Custom Context Manager for Logging

We'll create a custom context manager to log the start and completion of operations on tasks.

#### Implementation

```python
from contextlib import ContextDecorator
from typing import List

# Task class to represent a task
class Task:
    def __init__(self, name: str, description: str, status: str = "pending"):
        self.name = name
        self.description = description
        self.status = status

    def __repr__(self):
        return f"Task(name={self.name!r}, status={self.status!r})"

    def __str__(self):
        return f"Task: {self.name}, Status: {self.status}"

# Custom context manager for logging task operations (class-based)
class TaskLogger(ContextDecorator):
    def __init__(self, action: str, task_name: str):
        self.action = action
        self.task_name = task_name

    def __enter__(self):
        print(f"Starting {self.action} for task: {self.task_name}")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        print(f"Completed {self.action} for task: {self.task_name}")
        if exc_type:
            print(f"Error during {self.action}: {exc_val}")

# TaskManager class to handle a list of tasks
class TaskManager:
    def __init__(self):
        self.tasks: List[Task] = []

    def add_task(self, task: Task):
        """Adds a task to the manager."""
        with TaskLogger("adding", task.name):
            self.tasks.append(task)

    def remove_task(self, task: Task):
        """Removes a task from the manager."""
        with TaskLogger("removing", task.name):
            if task in self.tasks:
                self.tasks.remove(task)

    def complete_task(self, task: Task):
        """Marks a task as complete."""
        with TaskLogger("completing", task.name):
            task.status = 'completed'

    def list_tasks(self):
        """Lists all tasks."""
        return self.tasks

    def save_to_file(self, filename: str):
        """Saves task list to a file."""
        with open(filename, 'w') as file:
            for task in self.tasks:
                file.write(f"{task.name}: {task.status}\n")

    def __repr__(self):
        return f"TaskManager({self.tasks!r})"

    def __str__(self):
        return "\n".join(str(task) for task in self.tasks)
```

### 2. **Key Features and Context Manager Usage**

- **Custom Context Manager (`TaskLogger`)**:
  - This is a **class-based context manager** that logs task operations, such as adding, completing, and removing tasks.
  - It uses `__enter__` and `__exit__` methods to handle the "start" and "end" of the task operation, logging when the operation starts and finishes.
- **Built-in Context Manager (`open`)**:
  - We use the `open` context manager to handle file operations, ensuring that files are properly closed after writing task information.

### 3. **Writing Tests with `pytest`**

We will write **unit tests** and **integration tests** to verify the behavior of the `TaskManager` and ensure that the context managers behave as expected. We'll also use **mocking** to verify logging behavior without printing to the console.

#### Test File: `test_task_manager.py`

```python
import pytest
from task_manager import Task, TaskManager, TaskLogger
from unittest.mock import patch
import os

# Fixtures
@pytest.fixture
def task1():
    return Task("Write Code", "Complete the task manager feature", "pending")

@pytest.fixture
def task2():
    return Task("Test Code", "Test the task manager feature", "pending")

@pytest.fixture
def task_manager(task1, task2):
    manager = TaskManager()
    manager.add_task(task1)
    manager.add_task(task2)
    return manager

# Unit Tests
def test_task_repr(task1):
    """Test __repr__ method of Task"""
    assert repr(task1) == "Task(name='Write Code', status='pending')"

def test_task_str(task1):
    """Test __str__ method of Task"""
    assert str(task1) == "Task: Write Code, Status: pending"

def test_task_manager_add_task(task_manager, task1):
    """Test adding a task to the TaskManager"""
    new_task = Task("Deploy Code", "Deploy the task manager feature", "pending")
    task_manager.add_task(new_task)
    assert len(task_manager.tasks) == 3
    assert new_task in task_manager.tasks

def test_task_manager_remove_task(task_manager, task1):
    """Test removing a task from the TaskManager"""
    task_manager.remove_task(task1)
    assert len(task_manager.tasks) == 1
    assert task1 not in task_manager.tasks

def test_task_manager_complete_task(task_manager, task1):
    """Test completing a task in TaskManager"""
    task_manager.complete_task(task1)
    assert task1.status == "completed"

def test_task_manager_list_tasks(task_manager):
    """Test listing all tasks in TaskManager"""
    tasks = task_manager.list_tasks()
    assert len(tasks) == 2
    assert tasks[0].name == "Write Code"
    assert tasks[1].name == "Test Code"

# Mock Test: Testing the custom TaskLogger context manager
def test_task_logger_context_manager(task1):
    """Test custom TaskLogger context manager"""
    with patch('builtins.print') as mock_print:
        with TaskLogger("adding", task1.name):
            pass
        mock_print.assert_any_call(f"Starting adding for task: {task1.name}")
        mock_print.assert_any_call(f"Completed adding for task: {task1.name}")

# Test: Saving tasks to a file
def test_task_manager_save_to_file(task_manager):
    """Test saving tasks to a file using the save_to_file method"""
    filename = 'tasks.txt'
    task_manager.save_to_file(filename)
    assert os.path.exists(filename)

    with open(filename, 'r') as file:
        lines = file.readlines()
        assert len(lines) == 2
        assert "Write Code: pending\n" in lines
        assert "Test Code: pending\n" in lines

    # Clean up
    os.remove(filename)

# Integration Test: Adding, completing, and saving tasks
def test_integration(task_manager, task1, task2):
    """Test adding, completing, and saving tasks"""
    task_manager.complete_task(task1)

    # Verify that task1 is completed and task2 is still pending
    assert task1.status == 'completed'
    assert task2.status == 'pending'

    # Verify that tasks are saved to the file
    filename = 'tasks_integration.txt'
    task_manager.save_to_file(filename)

    with open(filename, 'r') as file:
        lines = file.readlines()
        assert "Write Code: completed\n" in lines
        assert "Test Code: pending\n" in lines

    # Clean up
    os.remove(filename)
```

### 4. **Explanation of the Tests**

- **Unit Tests**:

  - **Task Methods**: We verify the `__repr__` and `__str__` methods of the `Task` class to ensure proper string representation.
  - **Task Manager Methods**: We test core functionalities of the `TaskManager` class:
    - **Add Task**: Verifying that tasks are added to the manager.
    - **Remove Task**: Ensuring tasks can be removed correctly.
    - **Complete Task**: Checking that tasks' status changes as expected.
    - **List Tasks**: Ensuring that the task list is accurate.
  - **Custom Context Manager**: We test the `TaskLogger` context manager by using `patch` from `unittest.mock` to intercept calls to `print`. This ensures that the logger prints the expected start and completion messages.

- **Integration Test**:
  - The integration test ensures that tasks can be added, completed, and saved correctly to a file. It verifies that after completing a task, its status is updated, and when saving tasks to a file, they are written correctly. We clean up by removing the file after the test.

### 5. **Running the Tests**

To run the tests, ensure `pytest` is installed:

```bash
pip install pytest
```

Then run

the tests with:

```bash
pytest test_task_manager.py
```

### 6. **Summary of Dunder Methods, Context Managers, and Testing**

- **Class-based Context Manager**:

  - We created a class-based custom context manager (`TaskLogger`) to log task operations (e.g., adding, completing, and removing tasks).
  - The context manager uses `__enter__` and `__exit__` to manage the logging before and after a task operation.

- **Built-in Context Manager**:

  - We used Python’s built-in `open` context manager to handle file operations, ensuring that files are properly closed after writing task information.

- **Unit and Integration Tests**:
  - We used `pytest` for unit tests to verify individual methods (like adding/removing tasks and task status updates) and integration tests to verify end-to-end behavior (like saving tasks to a file).
  - We used `unittest.mock.patch` to verify the custom context manager’s behavior without actually printing to the console.

This example demonstrates **class-based context managers** in a real-world task management scenario and how to test them effectively with `pytest`.

### Real-World Scenario: **Async Task Manager with Class-Based Async Context Manager**

In this example, we will implement an **Async Task Manager** application. This system will:

1. Manage tasks asynchronously.
2. Use an **async class-based context manager** to log asynchronous task operations.
3. Use **pytest** to test the functionalities of the application, including async features and the custom context manager.

We will create:

- A **Task** class to represent tasks.
- An **AsyncTaskManager** class to manage tasks asynchronously.
- An **AsyncTaskLogger** class-based async context manager for logging asynchronous operations.
- Async functionality for adding, completing, and removing tasks.
- Unit and integration tests using **pytest** to test the system.

### 1. **Async Task Manager System**

#### Task Class

This class represents a task and has the following attributes:

- `name`: The name of the task.
- `description`: A description of the task.
- `status`: The status of the task (default is `pending`).

#### AsyncTaskManager Class

This class will manage tasks asynchronously. The operations will be asynchronous to simulate real-world scenarios where tasks may involve I/O operations.

#### AsyncTaskLogger Class (Async Context Manager)

This context manager will handle logging for asynchronous task operations. It will be a **class-based async context manager**.

#### Implementation

```python
import asyncio
from typing import List
from contextlib import asynccontextmanager

# Task class to represent a task
class Task:
    def __init__(self, name: str, description: str, status: str = "pending"):
        self.name = name
        self.description = description
        self.status = status

    def __repr__(self):
        return f"Task(name={self.name!r}, status={self.status!r})"

    def __str__(self):
        return f"Task: {self.name}, Status: {self.status}"

# Async class-based context manager for logging task operations
class AsyncTaskLogger:
    def __init__(self, action: str, task_name: str):
        self.action = action
        self.task_name = task_name

    async def __aenter__(self):
        print(f"Starting {self.action} for task: {self.task_name}")
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        print(f"Completed {self.action} for task: {self.task_name}")
        if exc_type:
            print(f"Error during {self.action}: {exc_val}")

# AsyncTaskManager class to manage a list of tasks
class AsyncTaskManager:
    def __init__(self):
        self.tasks: List[Task] = []

    async def add_task(self, task: Task):
        """Adds a task to the manager."""
        async with AsyncTaskLogger("adding", task.name):
            await asyncio.sleep(0.1)  # Simulating async I/O
            self.tasks.append(task)

    async def remove_task(self, task: Task):
        """Removes a task from the manager."""
        async with AsyncTaskLogger("removing", task.name):
            await asyncio.sleep(0.1)  # Simulating async I/O
            if task in self.tasks:
                self.tasks.remove(task)

    async def complete_task(self, task: Task):
        """Marks a task as completed."""
        async with AsyncTaskLogger("completing", task.name):
            await asyncio.sleep(0.1)  # Simulating async I/O
            task.status = 'completed'

    async def list_tasks(self):
        """Lists all tasks."""
        return self.tasks

    async def save_to_file(self, filename: str):
        """Saves task list to a file."""
        async with AsyncTaskLogger("saving to file", filename):
            await asyncio.sleep(0.1)  # Simulating async I/O
            with open(filename, 'w') as file:
                for task in self.tasks:
                    file.write(f"{task.name}: {task.status}\n")

    def __repr__(self):
        return f"AsyncTaskManager({self.tasks!r})"

    def __str__(self):
        return "\n".join(str(task) for task in self.tasks)
```

### 2. **Key Features and Context Manager Usage**

- **Custom Async Context Manager (`AsyncTaskLogger`)**:
  - This is an **async class-based context manager** that logs task operations asynchronously (such as adding, completing, and removing tasks).
  - The `__aenter__` and `__aexit__` methods handle the start and end of the task operation, logging these events asynchronously.
- **Async Operations**:
  - The `add_task`, `remove_task`, `complete_task`, and `save_to_file` methods are asynchronous, using `await asyncio.sleep(0.1)` to simulate asynchronous operations such as I/O.

### 3. **Writing Tests with `pytest` and `pytest-asyncio`**

To test the asynchronous task manager, we need the **`pytest-asyncio`** plugin to handle async tests.

#### Install `pytest-asyncio`

```bash
pip install pytest pytest-asyncio
```

#### Test File: `test_async_task_manager.py`

```python
import pytest
import asyncio
from unittest.mock import patch
from task_manager import Task, AsyncTaskManager, AsyncTaskLogger
import os

# Fixtures
@pytest.fixture
def task1():
    return Task("Write Code", "Complete the task manager feature", "pending")

@pytest.fixture
def task2():
    return Task("Test Code", "Test the task manager feature", "pending")

@pytest.fixture
def async_task_manager(task1, task2):
    manager = AsyncTaskManager()
    asyncio.run(manager.add_task(task1))  # Add task 1 asynchronously
    asyncio.run(manager.add_task(task2))  # Add task 2 asynchronously
    return manager

# Unit Tests
@pytest.mark.asyncio
async def test_task_repr(task1):
    """Test __repr__ method of Task"""
    assert repr(task1) == "Task(name='Write Code', status='pending')"

@pytest.mark.asyncio
async def test_task_str(task1):
    """Test __str__ method of Task"""
    assert str(task1) == "Task: Write Code, Status: pending"

@pytest.mark.asyncio
async def test_task_manager_add_task(async_task_manager, task1):
    """Test adding a task to the AsyncTaskManager"""
    new_task = Task("Deploy Code", "Deploy the task manager feature", "pending")
    await async_task_manager.add_task(new_task)
    assert len(async_task_manager.tasks) == 3
    assert new_task in async_task_manager.tasks

@pytest.mark.asyncio
async def test_task_manager_remove_task(async_task_manager, task1):
    """Test removing a task from the AsyncTaskManager"""
    await async_task_manager.remove_task(task1)
    assert len(async_task_manager.tasks) == 1
    assert task1 not in async_task_manager.tasks

@pytest.mark.asyncio
async def test_task_manager_complete_task(async_task_manager, task1):
    """Test completing a task in AsyncTaskManager"""
    await async_task_manager.complete_task(task1)
    assert task1.status == "completed"

@pytest.mark.asyncio
async def test_task_manager_list_tasks(async_task_manager):
    """Test listing all tasks in AsyncTaskManager"""
    tasks = await async_task_manager.list_tasks()
    assert len(tasks) == 2
    assert tasks[0].name == "Write Code"
    assert tasks[1].name == "Test Code"

# Mock Test: Testing the custom AsyncTaskLogger context manager
@pytest.mark.asyncio
async def test_async_task_logger_context_manager(task1):
    """Test custom AsyncTaskLogger async context manager"""
    with patch('builtins.print') as mock_print:
        async with AsyncTaskLogger("adding", task1.name):
            pass
        mock_print.assert_any_call(f"Starting adding for task: {task1.name}")
        mock_print.assert_any_call(f"Completed adding for task: {task1.name}")

# Test: Saving tasks to a file
@pytest.mark.asyncio
async def test_async_task_manager_save_to_file(async_task_manager):
    """Test saving tasks to a file asynchronously"""
    filename = 'tasks.txt'
    await async_task_manager.save_to_file(filename)
    assert os.path.exists(filename)

    with open(filename, 'r') as file:
        lines = file.readlines()
        assert len(lines) == 2
        assert "Write Code: pending\n" in lines
        assert "Test Code: pending\n" in lines

    # Clean up
    os.remove(filename)

# Integration Test: Adding, completing, and saving tasks
@pytest.mark.asyncio
async def test_integration(async_task_manager, task1, task2):
    """Test adding, completing, and saving tasks asynchronously"""
    await async_task_manager.complete_task(task1)

    # Verify that task1 is completed and task2 is still pending
    assert task1.status == 'completed'
    assert task2.status == 'pending'

    # Verify that tasks are saved to the file asynchronously
    filename = 'tasks_integration.txt'
    await async_task_manager.save_to_file(filename)

    with open(filename, 'r') as file:
        lines = file.readlines()
        assert "Write Code: completed\n" in lines
        assert "Test Code: pending\n" in lines

    # Clean up
    os.remove(filename)
```

### 4. **Explanation of the Tests**

- **Unit Tests**:
  - **Task Methods**: We verify the `__repr__` and `__str__` methods of the `Task` class to ensure proper string representation.
  - \*\*Async Task

Manager Methods**: We test core functionalities of the `AsyncTaskManager` class: - **Add Task**: Verifying that tasks are added to the manager asynchronously. - **Remove Task**: Ensuring tasks can be removed asynchronously. - **Complete Task**: Checking that tasks' status changes as expected asynchronously. - **List Tasks\*\*: Ensuring that the task list is accurate.

- **Custom Async Context Manager**: We test the `AsyncTaskLogger` context manager by using `patch` to intercept calls to `print`. This ensures that the logger prints the expected start and completion messages asynchronously.

- **Integration Test**:
  - The integration test ensures that tasks can be added, completed, and saved asynchronously to a file. It verifies that after completing a task, its status is updated and tasks are written correctly to a file. The test is asynchronous, and we clean up by removing the file after the test.

### 5. **Running the Tests**

To run the tests, ensure `pytest-asyncio` is installed:

```bash
pip install pytest pytest-asyncio
```

Then run the tests with:

```bash
pytest test_async_task_manager.py
```

### 6. **Summary**

- **Class-based Async Context Manager**:
  - We created an async class-based custom context manager (`AsyncTaskLogger`) to log asynchronous task operations.
- **Async Operations**:

  - The `AsyncTaskManager` class supports asynchronous operations for managing tasks, such as adding, completing, and removing tasks.

- **Testing Async Features**:
  - We used **`pytest-asyncio`** to test async methods and custom context managers asynchronously.

This example demonstrates how to implement and test **asynchronous task management** with **async class-based context managers** and how to effectively test async code using `pytest`.

### Real-World Scenario: **File Management System with Custom Iterators**

In this example, we'll create a **File Management System** that interacts with files in a directory. We'll focus on:

1. **Custom Iterators**: To iterate over files in a directory and perform operations on them.
2. **Using Built-in Python Features**: For file handling, string manipulation, and list operations.
3. **Testing with `pytest`**: To perform unit and integration testing.

This system will:

- Scan a directory for files.
- Filter files based on a given pattern.
- Read content from files and perform transformations.
- Use a **custom iterator** to traverse files in a directory.

We'll also use **pytest** to write unit and integration tests for the system.

### 1. **File Management System Implementation**

#### Step 1: Create a `FileManager` Class

This class will have the following functionalities:

- Scanning a directory for files.
- Filtering files by extension or name pattern.
- Reading file content.

We will also implement a **custom iterator** to allow for iterating over files in the directory.

#### Implementation

```python
import os
import re
from typing import List, Iterator

# FileManager class to manage files in a directory
class FileManager:
    def __init__(self, directory: str):
        self.directory = directory

    def get_files(self) -> List[str]:
        """Returns a list of files in the directory."""
        if not os.path.exists(self.directory):
            raise FileNotFoundError(f"Directory '{self.directory}' not found.")
        return [f for f in os.listdir(self.directory) if os.path.isfile(os.path.join(self.directory, f))]

    def filter_files(self, pattern: str) -> List[str]:
        """Filters files in the directory based on the given pattern."""
        files = self.get_files()
        return [file for file in files if re.match(pattern, file)]

    def read_file(self, filename: str) -> str:
        """Reads the content of a file."""
        file_path = os.path.join(self.directory, filename)
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File '{filename}' not found in directory.")
        with open(file_path, 'r') as file:
            return file.read()

    def count_lines(self, filename: str) -> int:
        """Counts the number of lines in a file."""
        content = self.read_file(filename)
        return len(content.splitlines())

    def __repr__(self):
        return f"FileManager(directory={self.directory!r})"

    def __str__(self):
        return f"FileManager managing files in {self.directory}"

# Custom iterator to iterate through files
class DirectoryIterator:
    def __init__(self, directory: str):
        self.directory = directory
        self.files = os.listdir(directory)
        self.index = 0

    def __iter__(self) -> Iterator[str]:
        """Iterates over files in the directory."""
        return self

    def __next__(self) -> str:
        """Returns the next file in the directory."""
        if self.index < len(self.files):
            file = self.files[self.index]
            self.index += 1
            return file
        else:
            raise StopIteration
```

### 2. **Explanation of Features**

- **`FileManager` Class**:
  - **`get_files`**: This method lists all files in the given directory.
  - **`filter_files`**: This method filters files based on a regex pattern.
  - **`read_file`**: This method reads the contents of a file.
  - **`count_lines`**: This method counts the number of lines in a file.
- **Custom Iterator (`DirectoryIterator`)**:
  - This iterator allows for iterating through all files in the given directory.
  - The iterator uses `__iter__` and `__next__` methods, which are standard for custom iterators in Python.

### 3. **Testing with `pytest`**

Now let's write tests for the `FileManager` class and the `DirectoryIterator` custom iterator.

#### Test File: `test_file_manager.py`

```python
import pytest
import os
from unittest.mock import patch
from file_manager import FileManager, DirectoryIterator

# Fixture for setting up a temporary directory with files
@pytest.fixture
def temp_directory(tmp_path):
    # Create some test files in a temporary directory
    files = ["test1.txt", "test2.txt", "data.csv", "README.md"]
    for filename in files:
        file_path = tmp_path / filename
        file_path.write_text(f"Content of {filename}")
    return tmp_path

# Unit Tests
def test_get_files(temp_directory):
    """Test if FileManager correctly lists files in a directory."""
    fm = FileManager(str(temp_directory))
    files = fm.get_files()
    assert len(files) == 4
    assert "test1.txt" in files
    assert "test2.txt" in files
    assert "data.csv" in files
    assert "README.md" in files

def test_filter_files(temp_directory):
    """Test filtering files based on a pattern."""
    fm = FileManager(str(temp_directory))
    txt_files = fm.filter_files(r'.*\.txt$')
    assert len(txt_files) == 2
    assert "test1.txt" in txt_files
    assert "test2.txt" in txt_files

def test_read_file(temp_directory):
    """Test reading a file's content."""
    fm = FileManager(str(temp_directory))
    content = fm.read_file("test1.txt")
    assert "Content of test1.txt" in content

def test_read_file_not_found(temp_directory):
    """Test reading a non-existent file."""
    fm = FileManager(str(temp_directory))
    with pytest.raises(FileNotFoundError):
        fm.read_file("nonexistent.txt")

def test_count_lines(temp_directory):
    """Test counting the number of lines in a file."""
    fm = FileManager(str(temp_directory))
    line_count = fm.count_lines("test1.txt")
    assert line_count == 1  # Each file has 1 line

def test_directory_iterator(temp_directory):
    """Test the custom DirectoryIterator."""
    iterator = DirectoryIterator(str(temp_directory))
    files = list(iterator)
    assert len(files) == 4
    assert "test1.txt" in files
    assert "test2.txt" in files
    assert "data.csv" in files
    assert "README.md" in files

# Integration Test: Using FileManager and DirectoryIterator together
def test_integration(temp_directory):
    """Test integrating FileManager and DirectoryIterator together."""
    fm = FileManager(str(temp_directory))

    # Verify that FileManager returns the correct files
    files = fm.get_files()
    assert len(files) == 4

    # Verify that DirectoryIterator can iterate over the files
    iterator = DirectoryIterator(str(temp_directory))
    iterator_files = list(iterator)
    assert set(files) == set(iterator_files)
```

### 4. **Explanation of the Tests**

- **Unit Tests**:

  - **`test_get_files`**: Verifies that `FileManager.get_files()` correctly lists the files in the directory.
  - **`test_filter_files`**: Ensures `FileManager.filter_files()` correctly filters files based on a regex pattern (e.g., `.txt` files).
  - **`test_read_file`**: Tests reading a file’s content with `FileManager.read_file()`.
  - **`test_read_file_not_found`**: Ensures that an exception is raised if a file does not exist.
  - **`test_count_lines`**: Verifies the correct line count for a file using `FileManager.count_lines()`.
  - **`test_directory_iterator`**: Verifies the behavior of the custom `DirectoryIterator` by converting it to a list and comparing the results.

- **Integration Test**:
  - **`test_integration`**: Integrates both `FileManager` and `DirectoryIterator`. It verifies that the `FileManager` lists the files correctly and that the custom iterator can iterate over them in the same order.

### 5. **Running the Tests**

To run the tests, ensure that `pytest` is installed:

```bash
pip install pytest
```

Then run the tests using:

```bash
pytest test_file_manager.py
```

### 6. **Summary**

In this scenario:

- We created a **FileManager** class that interacts with files in a directory.
- We implemented a **custom iterator** (`DirectoryIterator`) to iterate over the files in a directory.
- We wrote **unit and integration tests** using **pytest**:
  - We tested file listing, filtering, reading, and counting lines.
  - We tested the behavior of the custom iterator.
  - We performed integration tests to ensure the components work together as expected.

This example demonstrates the use of **custom iterators** and file handling in Python, along with writing unit and integration tests using **pytest**.

### Real-World Scenario: **Database Connection Pool Management with Custom Decorators**

In this example, we'll build a **Database Connection Pool Manager** system. We'll focus on the following advanced features:

1. **Using built-in Python features** like decorators, context managers, and iterators.
2. **Custom Decorators**: We'll create a decorator to ensure a database connection is properly handled before executing a database operation.
3. **Context Managers**: To manage database connections within a block of code.
4. **Testing**: We'll perform unit and integration testing using **`pytest`**.

The scenario will involve:

- Creating a connection pool that simulates database connections.
- Using a custom decorator to manage database connections in operations.
- Testing the system using **unit tests** and **integration tests**.

---

### 1. **Database Connection Pool Manager Implementation**

#### Step 1: Create the Connection Pool System

We will simulate a database connection pool, a custom decorator for managing database connections, and a custom context manager for ensuring that connections are properly handled.

#### Implementation

```python
import random
import time
from contextlib import contextmanager
from typing import Callable

# Simulate a database connection
class DBConnection:
    def __init__(self, id: int):
        self.id = id
        self.is_open = False

    def open(self):
        """Simulate opening the connection"""
        if not self.is_open:
            print(f"Opening connection {self.id}")
            self.is_open = True

    def close(self):
        """Simulate closing the connection"""
        if self.is_open:
            print(f"Closing connection {self.id}")
            self.is_open = False

# ConnectionPool to manage multiple database connections
class ConnectionPool:
    def __init__(self, size: int):
        self.pool = [DBConnection(i) for i in range(size)]

    def get_connection(self) -> DBConnection:
        """Simulate getting a connection from the pool"""
        available_connections = [conn for conn in self.pool if not conn.is_open]
        if available_connections:
            conn = random.choice(available_connections)
            conn.open()
            return conn
        else:
            raise Exception("No available connections in the pool.")

    def release_connection(self, conn: DBConnection):
        """Release a connection back to the pool"""
        conn.close()

# Custom decorator to ensure database connection is managed
def manage_connection(func: Callable):
    def wrapper(*args, **kwargs):
        pool = args[0]  # Assume the pool is the first argument
        conn = pool.get_connection()
        try:
            result = func(conn, *args, **kwargs)
            return result
        finally:
            pool.release_connection(conn)
    return wrapper

# Custom context manager to manage the database connection
@contextmanager
def db_connection_manager(pool: ConnectionPool):
    """Context manager for handling database connections"""
    conn = pool.get_connection()
    try:
        yield conn
    finally:
        pool.release_connection(conn)

# A class to simulate some database operations
class DatabaseOperations:
    def __init__(self, pool: ConnectionPool):
        self.pool = pool

    @manage_connection
    def perform_query(self, conn: DBConnection, query: str) -> str:
        """Simulates performing a database query"""
        print(f"Performing query '{query}' on connection {conn.id}")
        time.sleep(1)  # Simulating query time
        return f"Results for query: {query}"

    def perform_query_with_context(self, query: str) -> str:
        """Simulates performing a database query using context manager"""
        with db_connection_manager(self.pool) as conn:
            print(f"Performing query '{query}' on connection {conn.id}")
            time.sleep(1)  # Simulating query time
            return f"Results for query: {query}"
```

### 2. **Explanation of Features**

- **DBConnection**: Represents a database connection that can be opened and closed.
- **ConnectionPool**: Manages a pool of `DBConnection` instances, providing a connection when requested and ensuring the connection is returned after use.
- **Custom Decorator (`manage_connection`)**: Ensures that the database connection is opened before the operation and closed afterward. This decorator wraps database query operations.
- **Context Manager (`db_connection_manager`)**: Provides a context manager that ensures the database connection is opened at the start of a block of code and closed afterward.
- **DatabaseOperations**: Contains methods that simulate database query operations. These methods demonstrate both the decorator and context manager usage.

### 3. **Testing with `pytest`**

Let's write tests for the **Database Connection Pool** system. We will test:

1. **Unit tests**: Test individual components like database connection pooling, query execution, and connection management.
2. **Integration tests**: Test the full flow of database operations using both the decorator and context manager.

#### Test File: `test_db_operations.py`

```python
import pytest
from unittest.mock import patch
from database_operations import ConnectionPool, DBConnection, DatabaseOperations, manage_connection, db_connection_manager

# Unit Test: Test ConnectionPool functionality
def test_get_connection():
    pool = ConnectionPool(3)
    conn = pool.get_connection()
    assert conn.is_open
    assert isinstance(conn, DBConnection)

def test_release_connection():
    pool = ConnectionPool(3)
    conn = pool.get_connection()
    assert conn.is_open
    pool.release_connection(conn)
    assert not conn.is_open

def test_no_available_connections():
    pool = ConnectionPool(1)
    pool.get_connection()  # This will take the only connection
    with pytest.raises(Exception):
        pool.get_connection()  # Should raise exception because no connection is available

# Unit Test: Test DatabaseOperations with Decorator
def test_database_operations_decorator():
    pool = ConnectionPool(2)
    db_ops = DatabaseOperations(pool)

    with patch("builtins.print") as mock_print:
        result = db_ops.perform_query("SELECT * FROM users")
        mock_print.assert_any_call("Performing query 'SELECT * FROM users' on connection")
        assert "Results for query" in result

# Unit Test: Test DatabaseOperations with Context Manager
def test_database_operations_with_context():
    pool = ConnectionPool(2)
    db_ops = DatabaseOperations(pool)

    with patch("builtins.print") as mock_print:
        result = db_ops.perform_query_with_context("SELECT * FROM products")
        mock_print.assert_any_call("Performing query 'SELECT * FROM products' on connection")
        assert "Results for query" in result

# Integration Test: Test Full Integration of Database Operations
def test_integration_db_operations():
    pool = ConnectionPool(3)
    db_ops = DatabaseOperations(pool)

    # Perform query using decorator
    result_decorator = db_ops.perform_query("SELECT * FROM orders")
    assert "Results for query" in result_decorator

    # Perform query using context manager
    result_context = db_ops.perform_query_with_context("SELECT * FROM inventory")
    assert "Results for query" in result_context

    # Verify connection release after operations
    assert len(pool.pool) == 3  # Ensure all connections are returned to the pool
```

### 4. **Explanation of the Tests**

- **Unit Tests**:

  - **`test_get_connection`**: Verifies that a connection is properly opened when requested from the pool.
  - **`test_release_connection`**: Tests that a connection is properly closed when released back to the pool.
  - **`test_no_available_connections`**: Ensures that an exception is raised when no available connections are in the pool.
  - **`test_database_operations_decorator`**: Tests the `perform_query` method using the custom decorator, ensuring the database connection is properly managed.
  - **`test_database_operations_with_context`**: Tests the `perform_query_with_context` method using the context manager, ensuring the connection is properly managed within the context.

- **Integration Test**:
  - **`test_integration_db_operations`**: This test verifies the full workflow by performing database operations using both the decorator and context manager. It also checks that connections are released back to the pool after the operations.

### 5. **Running the Tests**

To run the tests, make sure **`pytest`** is installed:

```bash
pip install pytest
```

Then, you can run the tests with the following command:

```bash
pytest test_db_operations.py
```

### 6. **Summary**

In this example:

- We created a **ConnectionPool** system to manage database connections.
- We implemented a **custom decorator** (`manage_connection`) and a **context manager** (`db_connection_manager`) to handle database connections for operations.
- We wrote **unit tests** and **integration tests** using **pytest** to verify:
  - Correct connection management.
  - Proper handling of database queries.
  - Full integration of both decorator and context manager functionalities.

This example demonstrates how to use advanced Python features like **decorators**, **context managers**, and **custom connection pooling**, and how to write thorough tests for these components using **pytest**.

### Real-World Scenario: **E-Commerce Order Processing System with Logging and Caching**

In this example, we will build a **E-Commerce Order Processing System** where we:

1. **Process customer orders**.
2. **Cache order results** for better performance.
3. Use **logging** to track order status and processing.
4. Perform **unit and integration testing** with **pytest**.

### Goals:

- **Use built-in Python features** like logging, decorators, caching, and exception handling.
- **Implement custom caching** using a dictionary (simple in-memory cache).
- Use **logging** to trace actions and issues.
- Write **unit tests** and **integration tests** using `pytest` to ensure correctness.

---

### 1. **E-Commerce Order Processing System Implementation**

We will create the following components:

- **OrderProcessor**: Processes orders, applies discounts, checks stock, and handles order completion.
- **Custom Caching**: A simple in-memory cache to store the results of expensive operations like checking available products.
- **Logging**: Logs key events during the order process.

#### Step 1: Define the System Components

```python
import logging
from functools import wraps
from typing import Dict, List

# Set up basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class Cache:
    """A simple cache to store results of expensive operations"""
    def __init__(self):
        self.cache = {}

    def get(self, key: str):
        """Return cached value if exists"""
        return self.cache.get(key)

    def set(self, key: str, value: any):
        """Store value in cache"""
        self.cache[key] = value

# Order class to simulate an order
class Order:
    def __init__(self, order_id: str, product_id: str, quantity: int):
        self.order_id = order_id
        self.product_id = product_id
        self.quantity = quantity
        self.status = 'Pending'

    def __repr__(self):
        return f"Order({self.order_id}, {self.product_id}, {self.quantity}, {self.status})"

# Inventory system for simulating product stock
class Inventory:
    def __init__(self):
        self.stock = {
            "product1": 100,
            "product2": 50,
            "product3": 0,  # Out of stock
        }

    def check_stock(self, product_id: str, quantity: int) -> bool:
        """Check if enough stock is available"""
        return self.stock.get(product_id, 0) >= quantity

# Order Processor with logging and caching
class OrderProcessor:
    def __init__(self, inventory: Inventory, cache: Cache):
        self.inventory = inventory
        self.cache = cache

    def _log_order_action(self, action: str, order: Order):
        """Logs key actions during the order process"""
        logging.info(f"Action: {action}, Order: {order}")

    def apply_discount(self, order: Order) -> float:
        """Apply a discount based on the product"""
        discount = 0.10 if order.product_id == "product1" else 0
        self._log_order_action(f"Applied {discount*100}% discount", order)
        return discount

    def process_order(self, order: Order) -> str:
        """Process the order: check stock, apply discount, and complete the order"""
        # Check stock availability (using cache if available)
        stock_key = f"stock_{order.product_id}"
        cached_stock = self.cache.get(stock_key)
        if cached_stock is None:
            cached_stock = self.inventory.check_stock(order.product_id, order.quantity)
            self.cache.set(stock_key, cached_stock)

        if not cached_stock:
            self._log_order_action("Insufficient stock", order)
            order.status = "Failed - Insufficient stock"
            return "Insufficient stock"

        # Apply discount
        discount = self.apply_discount(order)
        total_price = order.quantity * 10  # Assume a fixed price of $10 for simplicity
        total_price -= total_price * discount

        # Complete the order
        self._log_order_action("Order completed successfully", order)
        order.status = "Completed"
        return f"Order {order.order_id} completed. Total: ${total_price:.2f}"

    def cancel_order(self, order: Order):
        """Cancel an order"""
        self._log_order_action("Order cancelled", order)
        order.status = "Cancelled"
        return "Order cancelled"
```

### 2. **Explanation of Features**

- **`Cache`**: A simple caching system to store whether a product has enough stock. This avoids querying the inventory repeatedly for the same product.
- **`Order`**: Represents an order with a product ID, quantity, and status.
- **`Inventory`**: Manages product stock and simulates checking the availability of products.
- **`OrderProcessor`**:
  - **`apply_discount`**: Applies a discount to orders based on the product.
  - **`process_order`**: Main method to process the order by checking stock, applying discounts, and completing the order.
  - **`cancel_order`**: Allows cancellation of an order.
  - **Logging**: Tracks key actions such as applying discounts, stock checks, and order completion.

### 3. **Testing with `pytest`**

Now, we will write **unit tests** and **integration tests** using **pytest** for the following:

1. **Unit tests** for checking individual components like stock checks, order processing, and cache usage.
2. **Integration tests** for testing the complete flow of order processing.

#### Test File: `test_order_processing.py`

```python
import pytest
from unittest.mock import patch
from order_processing import OrderProcessor, Cache, Inventory, Order

# Unit Test: Test Cache functionality
def test_cache_set_get():
    cache = Cache()
    cache.set("stock_product1", True)
    assert cache.get("stock_product1") is True

def test_cache_miss():
    cache = Cache()
    assert cache.get("non_existent_key") is None

# Unit Test: Test Inventory system
def test_check_stock():
    inventory = Inventory()
    assert inventory.check_stock("product1", 10)  # Sufficient stock
    assert not inventory.check_stock("product3", 1)  # Out of stock

# Unit Test: Test OrderProcessor with Cache
def test_process_order_with_cache():
    inventory = Inventory()
    cache = Cache()
    order_processor = OrderProcessor(inventory, cache)

    order = Order(order_id="1", product_id="product1", quantity=10)
    result = order_processor.process_order(order)

    assert order.status == "Completed"
    assert "Order 1 completed" in result
    assert cache.get("stock_product1") is True  # Cached the stock result

def test_process_order_without_cache():
    inventory = Inventory()
    cache = Cache()
    order_processor = OrderProcessor(inventory, cache)

    order = Order(order_id="2", product_id="product2", quantity=60)  # More than available stock
    result = order_processor.process_order(order)

    assert order.status == "Failed - Insufficient stock"
    assert "Insufficient stock" in result

# Unit Test: Test Logging during order processing
def test_logging_on_order_processing():
    with patch("order_processing.logging.info") as mock_log:
        inventory = Inventory()
        cache = Cache()
        order_processor = OrderProcessor(inventory, cache)
        order = Order(order_id="3", product_id="product1", quantity=5)
        order_processor.process_order(order)
        mock_log.assert_any_call("Action: Applied 10.0% discount, Order: Order(3, product1, 5, Pending)")

# Integration Test: Full order processing flow
def test_full_order_processing():
    inventory = Inventory()
    cache = Cache()
    order_processor = OrderProcessor(inventory, cache)

    order1 = Order(order_id="1", product_id="product1", quantity=5)
    order2 = Order(order_id="2", product_id="product3", quantity=1)  # Out of stock

    result1 = order_processor.process_order(order1)
    result2 = order_processor.process_order(order2)

    assert order1.status == "Completed"
    assert "Order 1 completed" in result1

    assert order2.status == "Failed - Insufficient stock"
    assert "Insufficient stock" in result2

def test_cancel_order():
    inventory = Inventory()
    cache = Cache()
    order_processor = OrderProcessor(inventory, cache)

    order = Order(order_id="4", product_id="product2", quantity=2)
    result = order_processor.cancel_order(order)

    assert order.status == "Cancelled"
    assert "Order cancelled" in result
```

### 4. **Explanation of the Tests**

- **Unit Tests**:
  - **`test_cache_set_get`**: Verifies that values can be set and retrieved from the cache.
  - **`test_cache_miss`**: Ensures that a cache miss returns `None`.
  - **`test_check_stock`**: Verifies the stock checking functionality of the `Inventory` class.
  - **`test_process_order_with_cache`**: Tests order processing with cache being used to store stock information.
  - **`test_process_order_without_cache`**: Tests order processing when stock is insufficient and the cache is not used.
  - **`test_logging_on_order_processing`**: Verifies that logging occurs when processing an order.
- **Integration Test**:

- **`test_full_order_processing`**: Tests the full flow of processing two orders, one successful and one failing due to insufficient stock.
- **`test_cancel_order`**: Verifies that an order can be cancelled successfully.

### 5. **Running the Tests**

To run the tests, install **`pytest`** if not already installed:

```bash
pip install pytest
```

Then, run the tests using:

```bash
pytest test_order_processing.py
```

### 6. **Summary**

In this example:

- We built a **E-Commerce Order Processing System** with caching and logging.
- We used **Python's built-in logging** and **custom caching**.
- We wrote **unit tests** for individual components like the cache, inventory, and order processing.
- We wrote **integration tests** for testing the full order processing flow.
- **`pytest`** was used to test the system, ensuring the correctness of individual methods and their interaction.

This approach showcases how to use common Python built-in features like **logging**, **decorators**, and **exception handling** in a real-world scenario while writing **unit and integration tests** using **pytest**.

### Real-World Scenario: **Task Management System with Error Handling, Custom Exceptions, and Multiple Threads**

In this example, we will build a **Task Management System** where:

1. We create tasks that need to be processed.
2. Handle custom exceptions for different error scenarios (e.g., invalid task data).
3. Use **threads** to simulate asynchronous task processing.
4. Perform **unit tests** and **integration tests** using **pytest** to ensure correctness.
5. Integrate built-in **logging** and **threading** to handle the execution and errors effectively.

### Goals:

- **Use built-in Python features** such as **error handling**, **logging**, **threads**, and **custom exceptions**.
- Write **unit tests** for custom exceptions and threads.
- Write **integration tests** for simulating real-world task processing and error handling.

---

### 1. **Task Management System Implementation**

#### Key Components:

1. **Custom Exception**: We will create a custom exception for task errors.
2. **Logging**: Use logging to track task progress and errors.
3. **Threading**: Simulate asynchronous task processing using threads.

```python
import logging
import threading
import time
from typing import List, Optional

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class TaskError(Exception):
    """Custom exception for task-related errors"""
    def __init__(self, message: str):
        super().__init__(message)

class Task:
    """Task class representing a task to be processed"""
    def __init__(self, task_id: str, task_name: str, duration: int):
        self.task_id = task_id
        self.task_name = task_name
        self.duration = duration  # Duration in seconds
        self.status = 'Pending'

    def __repr__(self):
        return f"Task({self.task_id}, {self.task_name}, {self.status})"

class TaskProcessor:
    """Class that processes tasks"""
    def __init__(self):
        self.tasks: List[Task] = []
        self.completed_tasks: List[Task] = []
        self.failed_tasks: List[Task] = []

    def add_task(self, task: Task):
        """Add a task to the system"""
        self.tasks.append(task)
        logging.info(f"Task {task.task_id} added to the task queue.")

    def process_task(self, task: Task):
        """Simulate task processing"""
        logging.info(f"Started processing task {task.task_id}: {task.task_name}")
        try:
            time.sleep(task.duration)  # Simulate task processing
            if task.duration < 1:  # Simulate error for tasks that take less than 1 second
                raise TaskError(f"Task {task.task_id} failed: Task duration too short.")
            task.status = 'Completed'
            self.completed_tasks.append(task)
            logging.info(f"Task {task.task_id} completed successfully.")
        except TaskError as e:
            task.status = 'Failed'
            self.failed_tasks.append(task)
            logging.error(f"Error processing task {task.task_id}: {str(e)}")

    def process_all_tasks(self):
        """Process all tasks asynchronously (using threads)"""
        threads = []
        for task in self.tasks:
            thread = threading.Thread(target=self.process_task, args=(task,))
            threads.append(thread)
            thread.start()

        # Wait for all threads to finish
        for thread in threads:
            thread.join()

    def get_completed_tasks(self) -> List[Task]:
        """Return list of completed tasks"""
        return self.completed_tasks

    def get_failed_tasks(self) -> List[Task]:
        """Return list of failed tasks"""
        return self.failed_tasks
```

### 2. **Explanation of Features**

1. **TaskError (Custom Exception)**:
   - A custom exception `TaskError` is defined to handle task-specific errors (e.g., task duration too short).
2. **Logging**:

   - We use Python’s built-in **logging** module to log task addition, task start, task completion, and errors.

3. **Task Processor**:
   - `add_task`: Adds a task to the system.
   - `process_task`: Processes a task, simulating work with `time.sleep()`. Errors are raised for tasks with durations less than 1 second.
   - `process_all_tasks`: This method processes all tasks concurrently using **threads**.
   - **Threading**: Uses the `threading` module to process multiple tasks in parallel.

### 3. **Testing with `pytest`**

Now, we will write **unit tests** and **integration tests** using **pytest** for the following:

1. **Unit tests** for testing the behavior of individual components like tasks, task processor, and custom exception handling.
2. **Integration tests** to simulate the processing of multiple tasks with both success and failure scenarios.

#### Test File: `test_task_management.py`

```python
import pytest
import logging
from unittest.mock import patch
from task_management import Task, TaskProcessor, TaskError

# Unit Test: Test Task creation
def test_task_creation():
    task = Task(task_id="1", task_name="Task1", duration=2)
    assert task.task_id == "1"
    assert task.task_name == "Task1"
    assert task.status == "Pending"

# Unit Test: Test TaskError Exception
def test_task_error():
    with pytest.raises(TaskError, match="Task duration too short."):
        task = Task(task_id="2", task_name="Task2", duration=0)  # Should raise error
        processor = TaskProcessor()
        processor.process_task(task)

# Unit Test: Test TaskProcessor behavior (Adding tasks)
def test_add_task():
    processor = TaskProcessor()
    task = Task(task_id="3", task_name="Task3", duration=3)
    processor.add_task(task)
    assert len(processor.tasks) == 1

# Unit Test: Test TaskProcessor processing a valid task
def test_process_valid_task():
    task = Task(task_id="4", task_name="Task4", duration=2)
    processor = TaskProcessor()
    processor.process_task(task)
    assert task.status == "Completed"
    assert task in processor.completed_tasks

# Unit Test: Test TaskProcessor processing a failed task
def test_process_failed_task():
    task = Task(task_id="5", task_name="Task5", duration=0)  # Duration too short
    processor = TaskProcessor()
    processor.process_task(task)
    assert task.status == "Failed"
    assert task in processor.failed_tasks

# Unit Test: Test concurrent task processing with threads
def test_process_all_tasks():
    processor = TaskProcessor()
    task1 = Task(task_id="6", task_name="Task6", duration=2)
    task2 = Task(task_id="7", task_name="Task7", duration=0)  # Should fail
    processor.add_task(task1)
    processor.add_task(task2)

    processor.process_all_tasks()

    assert task1.status == "Completed"
    assert task2.status == "Failed"

# Integration Test: Test full processing flow with success and failure
def test_full_task_processing():
    processor = TaskProcessor()

    # Add valid and invalid tasks
    task1 = Task(task_id="8", task_name="Task8", duration=5)
    task2 = Task(task_id="9", task_name="Task9", duration=0)  # Should fail
    processor.add_task(task1)
    processor.add_task(task2)

    # Process tasks
    processor.process_all_tasks()

    # Check results
    assert len(processor.completed_tasks) == 1
    assert len(processor.failed_tasks) == 1
    assert task1.status == "Completed"
    assert task2.status == "Failed"

# Unit Test: Test logging during task processing
def test_logging_on_task_processing():
    with patch("task_management.logging.info") as mock_log:
        task = Task(task_id="10", task_name="Task10", duration=3)
        processor = TaskProcessor()
        processor.process_task(task)
        mock_log.assert_any_call(f"Started processing task {task.task_id}: {task.task_name}")
        mock_log.assert_any_call(f"Task {task.task_id} completed successfully.")
```

### 4. **Explanation of the Tests**

- **Unit Tests**:
  - **`test_task_creation`**: Verifies the creation of a task and checks its attributes.
  - **`test_task_error`**: Tests if a `TaskError` is raised when a task’s duration is too short.
  - **`test_add_task`**: Verifies that tasks can be added to the processor.
  - **`test_process_valid_task`**: Tests if a valid task gets processed successfully.
  - **`test_process_failed_task`**: Ensures a task with invalid duration is marked as failed.
  - **`test_process_all_tasks`**: Verifies that multiple tasks are processed concurrently using threads.
- **Integration Tests**:
  - **`test_full_task_processing`**: Simulates the full flow of adding valid and invalid tasks, processing them, and checking the results.
- **Logging Test**:
  - **`test_logging_on_task_processing`**: Verifies that logging is called at key points during task processing.

### 5. **Running the Tests**

To run the tests, install **`pytest`** if not already installed:

```bash
pip install pytest
```

Then, run the tests using:

```bash
pytest test_task_management.py
```

### 6. **Summary**

In this scenario:

- We built a **Task Management System** using built-in

  **logging** and **threading** for asynchronous task processing.

- We created **custom exceptions** to handle task errors.
- We wrote **unit tests** for individual components like tasks, exceptions, and processing logic.
- We wrote **integration tests** to simulate the processing of multiple tasks and their success/failure scenarios.

This example showcases how to leverage Python’s built-in features such as **error handling**, **logging**, and **threading** in a real-world use case, while also demonstrating how to write **unit and integration tests** using **pytest**.

Let's create a **real-world use case** where we implement basic Python constructs such as **file handling**, **iterators**, **custom context managers**, **decorators**, and **regular expressions**. We'll focus on these advanced Python features and then write both **unit tests** and **integration tests** using **pytest**.

### Real-World Scenario: **Log File Processor**

We’ll build a **log file processor** that:

1. **Reads log files**: Handles file I/O using built-in functions.
2. **Searches logs with regular expressions**: Utilizes the `re` module to search for specific patterns in the log.
3. **Iterates over log entries**: Uses iterators to process the logs efficiently.
4. **Manages resources with custom context managers**: We'll write a custom context manager for safe file operations.
5. **Applies a decorator for logging function calls**: Uses a decorator to track function execution.

We'll write unit tests for individual components (like file reading, regex matching, etc.) and integration tests for the entire system using `pytest`.

---

### 1. **Log File Processor Implementation**

We will implement a basic **log file processor** that:

- Reads logs from a file.
- Searches logs for certain keywords using **regular expressions**.
- Iterates over log entries efficiently.
- Uses a **custom context manager** to manage the file operations.
- Uses a **decorator** to log function execution times.

```python
import re
import logging
from typing import List, Iterator

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class LogFileManager:
    """Handles reading log files and searching for patterns."""
    def __init__(self, file_path: str):
        self.file_path = file_path

    def read_log(self) -> List[str]:
        """Reads the log file and returns a list of log entries."""
        with open(self.file_path, 'r') as file:
            return file.readlines()

    def search_logs(self, pattern: str) -> List[str]:
        """Searches the log entries for a given pattern."""
        log_entries = self.read_log()
        return [entry for entry in log_entries if re.search(pattern, entry)]

class LogIterator:
    """An iterator that processes logs line by line."""
    def __init__(self, log_file: str):
        self.log_file = log_file
        self.file = open(log_file, 'r')

    def __iter__(self) -> Iterator[str]:
        """Returns the iterator for reading lines in the log file."""
        return self

    def __next__(self) -> str:
        """Returns the next line in the log file."""
        line = self.file.readline()
        if not line:
            self.file.close()
            raise StopIteration
        return line

class LogContextManager:
    """A custom context manager for handling file operations."""
    def __init__(self, file_path: str):
        self.file_path = file_path

    def __enter__(self):
        """Opens the log file and returns the file object."""
        self.file = open(self.file_path, 'r')
        return self.file

    def __exit__(self, exc_type, exc_value, traceback):
        """Closes the log file."""
        if self.file:
            self.file.close()

# Decorator to log function calls and execution time
import time

def log_execution_time(func):
    """A decorator to log the execution time of a function."""
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        logging.info(f"Execution time for {func.__name__}: {end_time - start_time} seconds")
        return result
    return wrapper
```

### 2. **Explanation of Features**

- **LogFileManager**:

  - **`read_log()`**: Reads the log file and returns all entries as a list.
  - **`search_logs()`**: Uses the **`re`** module to search for patterns in the logs and returns matching entries.

- **LogIterator**:

  - Implements an iterator to process the log file line by line. This is memory-efficient and useful for large log files.

- **LogContextManager**:

  - A custom context manager to handle safe opening and closing of the log file.

- **log_execution_time**:
  - A **decorator** that logs the execution time of any function it wraps. This could be useful for performance tracking.

---

### 3. **Writing Tests with `pytest`**

Now, let's write **unit tests** and **integration tests** using **pytest**. We will write tests to validate:

1. Reading and searching the log file.
2. Iterating over log lines.
3. Custom context manager behavior.
4. Performance logging using the decorator.

#### Test File: `test_log_processor.py`

```python
import pytest
import os
import logging
from unittest.mock import patch
from log_processor import LogFileManager, LogIterator, LogContextManager, log_execution_time

# Sample log file for testing
TEST_LOG_FILE = "test_log.log"

# Setup a test log file
@pytest.fixture(scope="module")
def create_log_file():
    with open(TEST_LOG_FILE, "w") as f:
        f.write("INFO: Task started\n")
        f.write("ERROR: Task failed\n")
        f.write("INFO: Task completed\n")
    yield
    os.remove(TEST_LOG_FILE)

# Unit Test: Test reading the log file
def test_read_log(create_log_file):
    log_manager = LogFileManager(TEST_LOG_FILE)
    logs = log_manager.read_log()
    assert len(logs) == 3
    assert "Task started" in logs[0]

# Unit Test: Test searching logs with regex pattern
def test_search_logs(create_log_file):
    log_manager = LogFileManager(TEST_LOG_FILE)
    matching_logs = log_manager.search_logs(r"ERROR")
    assert len(matching_logs) == 1
    assert "Task failed" in matching_logs[0]

# Unit Test: Test LogIterator for line-by-line iteration
def test_log_iterator(create_log_file):
    log_iterator = LogIterator(TEST_LOG_FILE)
    logs = [log for log in log_iterator]
    assert len(logs) == 3
    assert "Task started" in logs[0]
    assert "Task failed" in logs[1]

# Unit Test: Test LogContextManager behavior
def test_log_context_manager(create_log_file):
    with LogContextManager(TEST_LOG_FILE) as file:
        logs = file.readlines()
    assert len(logs) == 3
    assert "Task started" in logs[0]

# Unit Test: Test decorator logs execution time
@patch("log_processor.logging.info")
def test_log_execution_time(mock_log):
    @log_execution_time
    def sample_function():
        time.sleep(1)

    sample_function()
    mock_log.assert_called_with("Execution time for sample_function: 1.0")
```

### 4. **Explanation of Tests**

- **Test Fixtures**:

  - **`create_log_file`**: A fixture that creates and cleans up a sample log file before and after the tests. This helps us maintain the environment consistently across tests.

- **Unit Tests**:
  - **`test_read_log`**: Verifies that we can read the log file and retrieve the correct number of lines.
  - **`test_search_logs`**: Tests that the log file search functionality works, using a regex pattern to find errors.
  - **`test_log_iterator`**: Verifies that the log iterator can process the file line by line.
  - **`test_log_context_manager`**: Tests the custom context manager for handling log file operations.
  - **`test_log_execution_time`**: Verifies that the decorator correctly logs the function execution time.

---

### 5. **Running the Tests**

To run the tests, ensure that **`pytest`** is installed:

```bash
pip install pytest
```

Then, run the tests using:

```bash
pytest test_log_processor.py
```

### 6. **Summary**

In this example:

- We built a **Log File Processor** that uses common Python built-in features like **file handling**, **regular expressions**, **iterators**, **context managers**, and **decorators**.
- We wrote **unit tests** for testing individual components such as reading logs, searching logs, iterating over logs, and testing the custom context manager.
- We used the **`pytest`** framework to write tests that verify the behavior of each component and the integration between them.
- This example showcases how to effectively combine advanced Python features with testing to build robust and maintainable software.

Let's create a **real-world scenario** where we leverage Python's built-in features such as **collections**, **datetime**, **csv**, **pathlib**, and **custom exceptions** in a **file processing** application. We’ll build a **task manager** that processes CSV files of tasks, calculates due dates, and groups tasks based on priority. We’ll use **pytest** to test the functionality through unit tests and integration tests.

### Scenario: **Task Manager**

We are building a **Task Manager** that:

1. Reads **CSV files** containing task details (like name, due date, and priority).
2. Calculates if the task is **overdue** or **upcoming** using **datetime**.
3. **Groups tasks by priority** using the **collections.Counter**.
4. Handles **path manipulation** using **pathlib** to read/write files.
5. Implements **custom exceptions** for handling errors (e.g., invalid CSV format, missing task details).

We’ll also write unit tests and integration tests using **pytest**.

---

### 1. **Task Manager Implementation**

We'll create a class `TaskManager` that can:

- **Load tasks** from a CSV file.
- **Calculate task status** (overdue, upcoming).
- **Group tasks by priority**.

```python
import csv
import datetime
from collections import Counter
from pathlib import Path
from typing import List

# Custom exceptions
class TaskManagerError(Exception):
    """Base class for exceptions in this module."""
    pass

class InvalidTaskFormat(TaskManagerError):
    """Raised when the task format in the CSV is invalid."""
    pass

# Task class to represent individual tasks
class Task:
    def __init__(self, name: str, due_date: str, priority: str):
        self.name = name
        self.due_date = datetime.datetime.strptime(due_date, "%Y-%m-%d")
        self.priority = priority

    def is_overdue(self) -> bool:
        """Checks if the task is overdue."""
        return self.due_date < datetime.datetime.now()

    def status(self) -> str:
        """Returns the status of the task: 'Overdue' or 'Upcoming'."""
        if self.is_overdue():
            return "Overdue"
        else:
            return "Upcoming"

# TaskManager class to manage task operations
class TaskManager:
    def __init__(self, file_path: str):
        self.file_path = Path(file_path)
        self.tasks: List[Task] = []

    def load_tasks(self) -> None:
        """Loads tasks from the given CSV file."""
        if not self.file_path.exists():
            raise FileNotFoundError(f"File {self.file_path} not found.")

        with self.file_path.open('r') as file:
            csv_reader = csv.reader(file)
            for row in csv_reader:
                try:
                    if len(row) != 3:
                        raise InvalidTaskFormat(f"Invalid task format: {row}")
                    name, due_date, priority = row
                    task = Task(name, due_date, priority)
                    self.tasks.append(task)
                except Exception as e:
                    raise InvalidTaskFormat(f"Error reading task: {row}") from e

    def group_tasks_by_priority(self) -> Counter:
        """Groups tasks by priority and returns the count of each priority."""
        priorities = [task.priority for task in self.tasks]
        return Counter(priorities)

    def get_overdue_tasks(self) -> List[Task]:
        """Returns a list of overdue tasks."""
        return [task for task in self.tasks if task.is_overdue()]
```

### 2. **Features of the Task Manager**

- **Task Class**:
  - Stores task name, due date, and priority.
  - Has methods `is_overdue()` and `status()` to determine if the task is overdue or upcoming.
- **TaskManager Class**:

  - **`load_tasks()`**: Reads a CSV file containing task details (name, due date, priority) and loads them into a list of Task objects.
  - **`group_tasks_by_priority()`**: Groups tasks by priority using the `collections.Counter`.
  - **`get_overdue_tasks()`**: Returns a list of overdue tasks.

- **Custom Exceptions**:
  - `InvalidTaskFormat`: Raised if the task format in the CSV is invalid.
- **File Handling**:
  - We use `pathlib.Path` for handling file paths in a platform-independent way.

---

### 3. **Writing Tests with `pytest`**

Now, we will write unit tests for each functionality:

1. Testing loading tasks from a CSV.
2. Testing task status (overdue or upcoming).
3. Grouping tasks by priority.
4. Handling exceptions for invalid formats.

#### Test File: `test_task_manager.py`

```python
import pytest
from datetime import datetime, timedelta
from pathlib import Path
from task_manager import TaskManager, Task, InvalidTaskFormat, TaskManagerError

# Sample CSV file content for testing
TEST_CSV_PATH = 'test_tasks.csv'

@pytest.fixture
def create_task_csv():
    """Fixture to create a sample CSV file for testing."""
    csv_content = [
        ['Task1', (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d'), 'High'],
        ['Task2', (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d'), 'Low'],
        ['Task3', (datetime.now() - timedelta(days=3)).strftime('%Y-%m-%d'), 'Medium'],
    ]
    with open(TEST_CSV_PATH, 'w', newline='') as file:
        writer = csv.writer(file)
        writer.writerows(csv_content)
    yield
    Path(TEST_CSV_PATH).unlink()  # Clean up after tests

# Unit Test: Test loading tasks from CSV
def test_load_tasks(create_task_csv):
    manager = TaskManager(TEST_CSV_PATH)
    manager.load_tasks()
    assert len(manager.tasks) == 3
    assert manager.tasks[0].name == 'Task1'
    assert manager.tasks[1].status() == 'Upcoming'

# Unit Test: Test invalid CSV format handling
def test_invalid_csv_format():
    invalid_csv_path = 'invalid_tasks.csv'
    with open(invalid_csv_path, 'w', newline='') as file:
        file.write("Task1,2024-01-01\n")  # Missing priority field

    manager = TaskManager(invalid_csv_path)
    with pytest.raises(InvalidTaskFormat):
        manager.load_tasks()

# Unit Test: Test task status for overdue and upcoming tasks
def test_task_status(create_task_csv):
    manager = TaskManager(TEST_CSV_PATH)
    manager.load_tasks()
    task1 = manager.tasks[0]  # Task1 is overdue
    task2 = manager.tasks[1]  # Task2 is upcoming
    assert task1.status() == 'Overdue'
    assert task2.status() == 'Upcoming'

# Unit Test: Grouping tasks by priority
def test_group_tasks_by_priority(create_task_csv):
    manager = TaskManager(TEST_CSV_PATH)
    manager.load_tasks()
    priority_count = manager.group_tasks_by_priority()
    assert priority_count['High'] == 1
    assert priority_count['Low'] == 1
    assert priority_count['Medium'] == 1

# Unit Test: Handling file not found error
def test_file_not_found():
    manager = TaskManager('non_existing_file.csv')
    with pytest.raises(FileNotFoundError):
        manager.load_tasks()

# Integration Test: Full task manager workflow
def test_task_manager_workflow(create_task_csv):
    manager = TaskManager(TEST_CSV_PATH)
    manager.load_tasks()
    overdue_tasks = manager.get_overdue_tasks()
    assert len(overdue_tasks) == 2  # Tasks that are overdue
    assert overdue_tasks[0].name == 'Task1'
    assert overdue_tasks[1].name == 'Task3'
    priority_count = manager.group_tasks_by_priority()
    assert priority_count['High'] == 1
    assert priority_count['Medium'] == 1
```

### 4. **Explanation of Tests**

- **Test Fixtures**:

  - **`create_task_csv`**: A fixture that creates a CSV file with sample task data before the tests and removes it afterward.

- **Unit Tests**:
  - **`test_load_tasks`**: Verifies that the task manager can load tasks from the CSV file correctly.
  - **`test_invalid_csv_format`**: Ensures that an invalid CSV format raises the correct exception (`InvalidTaskFormat`).
  - **`test_task_status`**: Verifies that tasks return the correct status (`Overdue` or `Upcoming`).
  - **`test_group_tasks_by_priority`**: Ensures that tasks are grouped correctly by priority using `collections.Counter`.
  - **`test_file_not_found`**: Verifies that a `FileNotFoundError` is raised when the CSV file is missing.
- **Integration Test**:
  - **`test_task_manager_workflow`**: This test simulates the entire task manager workflow, ensuring that tasks are loaded, grouped by priority, and overdue tasks are correctly identified.

---

### 5. **Running the Tests**

To run the tests, ensure **`pytest`** is installed:

```bash
pip install pytest
```

Then, run the tests using:

```bash
pytest test_task_manager.py
```

### 6. **Summary**

In this example:

- We created a **Task Manager** that processes CSV files containing task data, calculates task statuses, and groups tasks by priority.
- We utilized **built-in Python features** such as **datetime**, **collections**, **pathlib**, and **csv** to build the application.

- **Unit tests** were written for different functionalities like loading tasks, task statuses, priority grouping, and error handling.
- We performed **integration testing** for the entire workflow, ensuring all components work together.

### Real World Scenario: **Inventory Management System**

Let’s build an **Inventory Management System** using Python. The system will:

1. Maintain an inventory of products.
2. Handle **additions** and **removals** of products.
3. Track **product quantities** and update the inventory as items are sold.
4. Use **built-in Python constructs** like **collections**, **datetime**, **math**, **os.path**, and **custom exceptions**.

We will use **pytest** to test each feature thoroughly with **unit** and **integration tests**.

### Scenario Breakdown:

In our system:

- **Products** are added with a name, SKU, price, and quantity.
- **Stock levels** will be updated when products are sold.
- **Inventory reports** will be generated showing available products.
- We will implement **custom exceptions** to handle errors, like **insufficient stock**.

We will use Python’s built-in libraries such as:

- **collections.Counter** for tracking quantities.
- **datetime** for recording product addition dates.
- **os.path** for managing file paths.

---

### 1. **Inventory Management System Implementation**

```python
import os
import datetime
from collections import Counter
from typing import List

# Custom exceptions
class InventoryError(Exception):
    """Base class for exceptions in this module."""
    pass

class ProductNotFound(InventoryError):
    """Raised when a product is not found in the inventory."""
    pass

class InsufficientStock(InventoryError):
    """Raised when trying to sell more stock than available."""
    pass

class Product:
    def __init__(self, name: str, sku: str, price: float, quantity: int):
        self.name = name
        self.sku = sku
        self.price = price
        self.quantity = quantity
        self.added_on = datetime.datetime.now()

    def sell(self, quantity: int):
        """Sells a certain quantity of this product."""
        if self.quantity < quantity:
            raise InsufficientStock(f"Not enough stock of {self.name}. Available: {self.quantity}")
        self.quantity -= quantity

    def restock(self, quantity: int):
        """Restocks the product with additional quantity."""
        self.quantity += quantity

    def is_in_stock(self) -> bool:
        """Checks if the product is in stock."""
        return self.quantity > 0


class Inventory:
    def __init__(self):
        self.products: List[Product] = []

    def add_product(self, name: str, sku: str, price: float, quantity: int):
        """Adds a product to the inventory."""
        if any(product.sku == sku for product in self.products):
            raise ValueError(f"Product with SKU {sku} already exists.")
        product = Product(name, sku, price, quantity)
        self.products.append(product)

    def remove_product(self, sku: str):
        """Removes a product from the inventory by SKU."""
        product = self.find_product_by_sku(sku)
        self.products.remove(product)

    def find_product_by_sku(self, sku: str) -> Product:
        """Finds a product by SKU."""
        for product in self.products:
            if product.sku == sku:
                return product
        raise ProductNotFound(f"Product with SKU {sku} not found.")

    def get_inventory_report(self) -> List[dict]:
        """Generates a report of all products in inventory."""
        report = []
        for product in self.products:
            report.append({
                'name': product.name,
                'sku': product.sku,
                'price': product.price,
                'quantity': product.quantity,
                'added_on': product.added_on.strftime('%Y-%m-%d %H:%M:%S')
            })
        return report
```

### Key Features of the Inventory Management System:

1. **Product Class**:

   - Represents a product in the inventory with attributes: name, SKU, price, quantity, and the date added.
   - Methods: `sell()` (to reduce stock), `restock()` (to add stock), and `is_in_stock()` (to check availability).

2. **Inventory Class**:

   - Stores a list of products.
   - Methods include `add_product()` (to add new products), `remove_product()` (to delete a product), and `get_inventory_report()` (to generate a detailed inventory report).
   - Includes error handling for when products are not found or stock is insufficient.

3. **Custom Exceptions**:

   - `ProductNotFound` for when a product isn’t found in the inventory.
   - `InsufficientStock` for when trying to sell more than available stock.

4. **File Path Handling**:
   - We will use `os.path` for any file-related operations (though file interaction isn’t demonstrated here, it can be extended for persistent storage like CSV or JSON).

---

### 2. **Writing Tests with `pytest`**

We'll write **unit tests** for each method in our system to ensure everything works as expected:

1. **Adding and removing products**.
2. **Selling and restocking products**.
3. **Generating inventory reports**.
4. **Handling exceptions**.

#### Test File: `test_inventory.py`

```python
import pytest
from datetime import datetime
from inventory_manager import Inventory, Product, ProductNotFound, InsufficientStock

# Fixture for setting up an inventory
@pytest.fixture
def setup_inventory():
    inventory = Inventory()
    inventory.add_product("Laptop", "LAP123", 1200.00, 10)
    inventory.add_product("Phone", "PHN456", 800.00, 5)
    inventory.add_product("Tablet", "TAB789", 500.00, 0)  # Out of stock
    return inventory

# Unit Test: Test adding products to inventory
def test_add_product(setup_inventory):
    inventory = setup_inventory
    inventory.add_product("Monitor", "MON012", 300.00, 15)
    assert len(inventory.products) == 4  # Now 4 products should be in the inventory
    assert inventory.find_product_by_sku("MON012").name == "Monitor"

# Unit Test: Test selling products and reducing stock
def test_sell_product(setup_inventory):
    inventory = setup_inventory
    product = inventory.find_product_by_sku("LAP123")
    product.sell(2)  # Sell 2 units
    assert product.quantity == 8  # Stock should be reduced by 2
    with pytest.raises(InsufficientStock):
        product.sell(10)  # Trying to sell more than available

# Unit Test: Test restocking products
def test_restock_product(setup_inventory):
    inventory = setup_inventory
    product = inventory.find_product_by_sku("PHN456")
    product.restock(5)  # Restock 5 more units
    assert product.quantity == 10  # Stock should be 10 now

# Unit Test: Test generating an inventory report
def test_inventory_report(setup_inventory):
    inventory = setup_inventory
    report = inventory.get_inventory_report()
    assert len(report) == 3  # There should be 3 products in the inventory
    assert report[0]['name'] == "Laptop"  # Check if Laptop is in the report

# Unit Test: Test removing a product
def test_remove_product(setup_inventory):
    inventory = setup_inventory
    inventory.remove_product("LAP123")
    with pytest.raises(ProductNotFound):
        inventory.find_product_by_sku("LAP123")  # LAP123 should be removed

# Unit Test: Test product not found exception
def test_product_not_found(setup_inventory):
    inventory = setup_inventory
    with pytest.raises(ProductNotFound):
        inventory.find_product_by_sku("NONEXISTENT_SKU")  # Product should not exist

# Integration Test: Full workflow test for inventory
def test_inventory_workflow(setup_inventory):
    inventory = setup_inventory
    assert len(inventory.products) == 3  # Initially 3 products
    inventory.add_product("Monitor", "MON012", 300.00, 15)
    assert len(inventory.products) == 4  # Now 4 products
    product = inventory.find_product_by_sku("LAP123")
    product.sell(2)
    assert product.quantity == 8  # Stock should be reduced by 2
    report = inventory.get_inventory_report()
    assert len(report) == 4  # Inventory should have 4 products
    assert report[3]['name'] == "Monitor"  # Monitor should be in the report
```

### 3. **Explanation of Tests**

1. **Test Fixtures**:

   - **`setup_inventory`**: A fixture that sets up an inventory with some predefined products for testing.

2. **Unit Tests**:

   - **`test_add_product`**: Verifies that products are added correctly and checks if the SKU is unique.
   - **`test_sell_product`**: Tests the functionality of selling products and ensuring that insufficient stock raises an error.
   - **`test_restock_product`**: Verifies that the restock functionality works as expected by adding more units to the stock.
   - **`test_inventory_report`**: Ensures that the inventory report is generated correctly.
   - **`test_remove_product`**: Tests the functionality of removing a product and checking that it no longer exists in the inventory.
   - **`test_product_not_found`**: Verifies that the system raises an error when trying to find a product that doesn't exist.

3. **Integration Test**:
   - **`test_inventory_workflow`**: A complete test simulating adding, selling, restocking, and generating a report to ensure everything works together

.

### 4. **Running the Tests**

To run the tests, simply use the following command in the terminal:

```bash
pytest test_inventory.py
```

This will run all the unit and integration tests and show the results.

---

### 5. **Conclusion**

In this scenario, we’ve:

- Built an **Inventory Management System** that uses Python's built-in features like `collections.Counter`, `datetime`, and custom exceptions.
- Wrote **unit tests** to verify individual methods and behaviors (adding products, selling, restocking, etc.).
- Wrote an **integration test** to verify that all components work together smoothly.

By practicing with real-world applications and writing **unit and integration tests**, you can ensure your systems are robust and reliable.

### Real World Scenario: **Bookstore Inventory System**

Let’s build a **Bookstore Inventory System** using Python, focusing on **built-in constructs** and **advanced features** such as **exceptions, generators, context managers, and itertools**. We'll focus on handling various aspects of a bookstore's inventory and sales system.

This system will:

1. **Track books** with details like title, author, ISBN, price, and stock.
2. **Process sales** and **update inventory**.
3. Generate reports about **low-stock items** and **total sales**.
4. Handle **custom exceptions** like **book not found** or **insufficient stock**.
5. Utilize **advanced built-in Python features** like:
   - **`itertools`** to group books by genre.
   - **`datetime`** for tracking sale times.
   - **Generators** to manage large inventory lists.
   - **Custom context managers** for handling book checkout.

We'll also write **unit** and **integration tests** using **pytest** for each feature.

---

### 1. **Bookstore Inventory System Implementation**

```python
import datetime
from collections import defaultdict
from itertools import groupby
from typing import List, Dict

# Custom exceptions
class BookstoreError(Exception):
    """Base class for exceptions in the bookstore system."""
    pass

class BookNotFound(BookstoreError):
    """Raised when a book is not found in the bookstore inventory."""
    pass

class InsufficientStock(BookstoreError):
    """Raised when a sale exceeds available stock."""
    pass

# Book class to represent each book
class Book:
    def __init__(self, title: str, author: str, isbn: str, price: float, stock: int, genre: str):
        self.title = title
        self.author = author
        self.isbn = isbn
        self.price = price
        self.stock = stock
        self.genre = genre
        self.added_on = datetime.datetime.now()

    def sell(self, quantity: int):
        """Sell a specified quantity of this book."""
        if self.stock < quantity:
            raise InsufficientStock(f"Not enough stock for {self.title}. Available: {self.stock}")
        self.stock -= quantity

    def restock(self, quantity: int):
        """Restock the book with additional quantity."""
        self.stock += quantity

    def is_in_stock(self) -> bool:
        """Check if the book is in stock."""
        return self.stock > 0


# Bookstore class to manage inventory and sales
class Bookstore:
    def __init__(self):
        self.books: Dict[str, Book] = {}

    def add_book(self, title: str, author: str, isbn: str, price: float, stock: int, genre: str):
        """Add a new book to the bookstore inventory."""
        if isbn in self.books:
            raise ValueError(f"Book with ISBN {isbn} already exists.")
        book = Book(title, author, isbn, price, stock, genre)
        self.books[isbn] = book

    def remove_book(self, isbn: str):
        """Remove a book from the bookstore."""
        if isbn not in self.books:
            raise BookNotFound(f"Book with ISBN {isbn} not found.")
        del self.books[isbn]

    def find_book_by_isbn(self, isbn: str) -> Book:
        """Find a book by its ISBN."""
        if isbn not in self.books:
            raise BookNotFound(f"Book with ISBN {isbn} not found.")
        return self.books[isbn]

    def sell_book(self, isbn: str, quantity: int):
        """Sell a book and update stock."""
        book = self.find_book_by_isbn(isbn)
        book.sell(quantity)

    def get_inventory_report(self) -> List[dict]:
        """Generate a report of all books in the bookstore."""
        report = []
        for book in self.books.values():
            report.append({
                'title': book.title,
                'isbn': book.isbn,
                'author': book.author,
                'price': book.price,
                'stock': book.stock,
                'genre': book.genre,
                'added_on': book.added_on.strftime('%Y-%m-%d %H:%M:%S')
            })
        return report

    def get_books_by_genre(self) -> Dict[str, List[Book]]:
        """Group books by genre using itertools.groupby."""
        # Sorting books by genre before using groupby
        sorted_books = sorted(self.books.values(), key=lambda b: b.genre)
        grouped_books = groupby(sorted_books, key=lambda b: b.genre)
        return {genre: list(books) for genre, books in grouped_books}

    def low_stock_books(self, threshold: int) -> List[Book]:
        """Return books with stock less than the threshold."""
        return [book for book in self.books.values() if book.stock < threshold]

# Custom Context Manager for Book Checkout
from contextlib import contextmanager

@contextmanager
def book_checkout(bookstore: Bookstore, isbn: str, quantity: int):
    """Context manager for handling book checkout (selling process)."""
    book = bookstore.find_book_by_isbn(isbn)
    try:
        book.sell(quantity)  # Attempt to sell the book
        yield book  # Yield control to the block that uses the book
    except InsufficientStock:
        print(f"Error: Not enough stock for {book.title}")
    finally:
        print(f"Checkout completed for {quantity} copies of {book.title}")
```

### Features:

1. **`Book` class**: Handles book-related attributes (title, author, ISBN, price, stock, genre) and actions (selling, restocking).
2. **`Bookstore` class**: Manages the inventory, including adding/removing books, selling, and generating reports. It groups books by genre using `itertools.groupby`.
3. **Custom Context Manager**: `book_checkout` ensures that a book is checked out for sale, and if the stock is insufficient, it handles the exception gracefully.

### 2. **Writing Tests with `pytest`**

#### Test File: `test_bookstore.py`

```python
import pytest
from datetime import datetime
from bookstore import Bookstore, Book, BookNotFound, InsufficientStock

# Fixture to set up a bookstore
@pytest.fixture
def setup_bookstore():
    bookstore = Bookstore()
    bookstore.add_book("Python Basics", "John Doe", "1234567890", 39.99, 10, "Programming")
    bookstore.add_book("Learning AI", "Jane Smith", "0987654321", 59.99, 5, "AI")
    bookstore.add_book("Machine Learning", "Alice Brown", "1122334455", 49.99, 0, "AI")  # Out of stock
    return bookstore

# Unit Test: Test adding a new book
def test_add_book(setup_bookstore):
    bookstore = setup_bookstore
    bookstore.add_book("Data Science", "Tom White", "5566778899", 29.99, 15, "Data Science")
    assert len(bookstore.books) == 4  # Total 4 books now
    assert bookstore.find_book_by_isbn("5566778899").title == "Data Science"

# Unit Test: Test selling a book and updating stock
def test_sell_book(setup_bookstore):
    bookstore = setup_bookstore
    book = bookstore.find_book_by_isbn("1234567890")
    book.sell(3)  # Sell 3 copies
    assert book.stock == 7  # Stock should be 7 now
    with pytest.raises(InsufficientStock):
        book.sell(10)  # Trying to sell more than available stock

# Unit Test: Test low stock books
def test_low_stock_books(setup_bookstore):
    bookstore = setup_bookstore
    low_stock_books = bookstore.low_stock_books(5)
    assert len(low_stock_books) == 2  # Machine Learning and Learning AI should be low stock

# Unit Test: Test grouping books by genre using itertools.groupby
def test_books_by_genre(setup_bookstore):
    bookstore = setup_bookstore
    genre_groups = bookstore.get_books_by_genre()
    assert "AI" in genre_groups  # AI genre should exist
    assert len(genre_groups["AI"]) == 2  # There should be 2 books in AI genre

# Unit Test: Test custom context manager for book checkout
def test_book_checkout(setup_bookstore):
    bookstore = setup_bookstore
    with pytest.raises(InsufficientStock):
        with book_checkout(bookstore, "1122334455", 1):
            pass  # Trying to check out an out-of-stock book
    with book_checkout(bookstore, "1234567890", 2):
        book = bookstore.find_book_by_isbn("1234567890")
        assert book.stock == 8  # Stock should be reduced after checkout

# Integration Test: Full workflow for adding, selling, and reporting
def test_inventory_workflow(setup_bookstore):
    bookstore = setup_bookstore
    assert len(bookstore.books) == 3  # Initially 3 books
    bookstore.add_book("Advanced Python", "Sam Green", "6677889900", 79.99, 20, "Programming")
    assert len(bookstore.books) == 4  # 4 books after adding new one
    bookstore.sell_book("1234567890", 5)  # Sell 5 copies of Python Basics
    report = bookstore.get_inventory_report()
    assert len(report) == 4  # Report should have 4 books
    assert report[0]["title"] == "Python Basics"  # Python

 Basics should be first in report
```

### 3. **Running Tests**

To run the tests, use the following command in the terminal:

```bash
pytest test_bookstore.py
```

This will execute all tests, including unit and integration tests, and display the results.

### 4. **Conclusion**

In this scenario:

- We've implemented a **Bookstore Inventory System** using Python's **built-in constructs** and advanced features like **exceptions**, **`itertools`**, and **context managers**.
- We also created **unit tests** to verify individual components of the system and **integration tests** to validate the overall functionality.
- The tests include adding books, selling them, generating reports, handling exceptions, and using the context manager to ensure smooth book checkout.

By practicing these features and writing tests, you can ensure that your code is reliable, robust, and scalable in a real-world application.

### Real World Scenario: **Multithreaded Web Scraping System**

In this scenario, we’ll build a **multithreaded web scraping system** that uses Python’s **built-in features** such as **threading**, **queue**, **requests**, **BeautifulSoup**, and other standard libraries to scrape data from a set of URLs concurrently.

We'll focus on the following:

1. **Multithreading**: Using the `threading` module to perform concurrent web scraping.
2. **Queue**: Using `queue.Queue` to manage tasks between threads safely.
3. **Requests and BeautifulSoup**: For performing HTTP requests and parsing HTML data.
4. **Custom exceptions**: Handling errors that might arise during the scraping process.
5. **Unit and Integration Tests**: Testing the functionality of the multithreaded web scraper using `pytest`.

### Step-by-Step Implementation

---

### 1. **Web Scraping System Code Implementation**

```python
import threading
import requests
from queue import Queue
from bs4 import BeautifulSoup
import time
from typing import List

# Custom Exceptions
class WebScraperError(Exception):
    """Base class for exceptions in the web scraping system."""
    pass

class InvalidURL(WebScraperError):
    """Raised when an invalid URL is provided."""
    pass

class ScrapingError(WebScraperError):
    """Raised when there's an error scraping the web page."""
    pass

# Worker function to scrape individual URLs
def scrape_url(url: str, result_queue: Queue):
    """Function to scrape a single URL."""
    try:
        response = requests.get(url)
        if response.status_code != 200:
            raise ScrapingError(f"Failed to retrieve {url} with status code {response.status_code}")

        soup = BeautifulSoup(response.text, 'html.parser')
        title = soup.title.string if soup.title else 'No title found'
        result_queue.put((url, title))  # Put the result in the queue

    except requests.exceptions.RequestException as e:
        result_queue.put((url, f"Request failed: {str(e)}"))
    except Exception as e:
        result_queue.put((url, f"Error occurred: {str(e)}"))

# Thread class to manage each thread's work
class WebScraperThread(threading.Thread):
    def __init__(self, url: str, result_queue: Queue):
        super().__init__()
        self.url = url
        self.result_queue = result_queue

    def run(self):
        scrape_url(self.url, self.result_queue)

# Web Scraper Manager class to orchestrate the threads and task queue
class WebScraper:
    def __init__(self, urls: List[str]):
        self.urls = urls
        self.result_queue = Queue()
        self.threads = []

    def start_scraping(self):
        """Start the scraping process using multiple threads."""
        for url in self.urls:
            thread = WebScraperThread(url, self.result_queue)
            self.threads.append(thread)
            thread.start()

    def wait_for_threads(self):
        """Wait for all threads to complete."""
        for thread in self.threads:
            thread.join()

    def get_results(self):
        """Retrieve results from the queue."""
        results = []
        while not self.result_queue.empty():
            results.append(self.result_queue.get())
        return results

    def scrape(self):
        """Complete the scraping process."""
        self.start_scraping()
        self.wait_for_threads()
        return self.get_results()

```

---

### 2. **Writing Tests with `pytest`**

The goal is to write tests for this web scraping system, especially focusing on **multithreading** functionality, **error handling**, and ensuring that we correctly retrieve the results from the `Queue`.

#### Test File: `test_web_scraper.py`

```python
import pytest
from unittest.mock import patch
from queue import Queue
from time import sleep
from web_scraper import WebScraper, ScrapingError, InvalidURL, WebScraperThread, scrape_url

# Sample URLs for testing
urls = [
    "http://example.com",  # Valid URL
    "http://nonexistenturl.com",  # Invalid URL
    "https://httpbin.org/status/404",  # URL with a failed response
]

# Unit Test: Test if the WebScraperThread class works independently
def test_scrape_url_success():
    # Simulate a valid request response using unittest.mock
    result_queue = Queue()
    with patch('requests.get') as mock_get:
        mock_get.return_value.status_code = 200
        mock_get.return_value.text = "<html><head><title>Test Title</title></head><body></body></html>"
        scrape_url("http://example.com", result_queue)
        result = result_queue.get()
        assert result[0] == "http://example.com"
        assert result[1] == "Test Title"

def test_scrape_url_failure():
    # Simulate a failed request
    result_queue = Queue()
    with patch('requests.get') as mock_get:
        mock_get.side_effect = requests.exceptions.RequestException("Failed request")
        scrape_url("http://example.com", result_queue)
        result = result_queue.get()
        assert result[0] == "http://example.com"
        assert "Request failed" in result[1]

# Unit Test: Test for invalid URL handling
def test_invalid_url():
    result_queue = Queue()
    with patch('requests.get') as mock_get:
        mock_get.return_value.status_code = 404
        scrape_url("http://nonexistenturl.com", result_queue)
        result = result_queue.get()
        assert result[0] == "http://nonexistenturl.com"
        assert "Request failed" in result[1]

# Unit Test: Test Scraper with multiple threads
def test_multithreading_scraping():
    scraper = WebScraper(urls)
    results = scraper.scrape()  # Perform the scraping using threads
    assert len(results) == len(urls)  # We should have as many results as URLs
    assert all(result[0] in urls for result in results)  # Ensure each result URL is from the list of URLs

# Unit Test: Check if ScrapingError is raised properly when failing to scrape
def test_scraping_error():
    result_queue = Queue()
    with patch('requests.get') as mock_get:
        mock_get.return_value.status_code = 404
        mock_get.return_value.text = "Not Found"
        scrape_url("http://example.com", result_queue)
        result = result_queue.get()
        assert result[0] == "http://example.com"
        assert "Error occurred" in result[1]

# Integration Test: Full scraping workflow with multiple threads and valid/invalid URLs
def test_full_workflow():
    scraper = WebScraper([
        "http://example.com",
        "http://nonexistenturl.com",  # Invalid URL
        "https://httpbin.org/status/404",  # Invalid status code
    ])
    results = scraper.scrape()
    assert len(results) == 3  # Three URLs, three results
    assert "Test Title" in [result[1] for result in results if result[0] == "http://example.com"]
    assert "Request failed" in [result[1] for result in results if result[0] == "http://nonexistenturl.com"]
    assert "Error occurred" in [result[1] for result in results if result[0] == "https://httpbin.org/status/404"]
```

---

### 3. **Running Tests with `pytest`**

To run the tests for the **Web Scraping System**, simply use the following command:

```bash
pytest test_web_scraper.py
```

### 4. **Conclusion**

In this scenario:

- We've implemented a **multithreaded web scraping system** using Python's built-in libraries like `threading`, `requests`, `queue`, and `BeautifulSoup`.
- We created unit and integration tests to ensure:
  - **Correctness** of the scraping functionality.
  - **Error handling** when URLs are invalid or when scraping fails.
  - **Concurrency** of multithreading when scraping multiple URLs at the same time.
- The tests verify that the system can handle multiple threads scraping different URLs and report the results correctly, including error cases.

By practicing with **multithreading** and writing comprehensive **unit and integration tests**, you can ensure that your systems work efficiently and are robust against errors.

### Real World Scenario: **Multiprocessing File Processing System**

In this scenario, we will implement a **multiprocessing file processing system** that leverages Python's **built-in libraries** such as `multiprocessing`, `os`, and `pathlib` to process large sets of files concurrently.

We'll focus on the following:

1. **Multiprocessing**: Using the `multiprocessing` module to parallelize the file processing tasks.
2. **Queues**: Using `multiprocessing.Queue` to safely pass data between processes.
3. **File Operations**: Using `os` and `pathlib` for handling file paths and file I/O.
4. **Custom exceptions**: Handling errors that might arise during file processing.
5. **Unit and Integration Tests**: Testing the functionality of the multiprocessing file processor using `pytest`.

### Step-by-Step Implementation

---

### 1. **File Processing System Code Implementation**

```python
import multiprocessing
import os
from pathlib import Path
from typing import List
import time


# Custom Exception
class FileProcessorError(Exception):
    """Base class for exceptions in the file processing system."""
    pass

class InvalidFileType(FileProcessorError):
    """Raised when an invalid file type is encountered."""
    pass

class ProcessingError(FileProcessorError):
    """Raised when there's an error processing a file."""
    pass


# Function to process a file
def process_file(file_path: str, result_queue: multiprocessing.Queue):
    """Function to process a single file."""
    try:
        # Simulate file processing (for example, counting lines or words)
        if not Path(file_path).exists():
            raise ProcessingError(f"File {file_path} does not exist.")

        if not file_path.endswith('.txt'):
            raise InvalidFileType(f"Invalid file type for {file_path}. Only '.txt' files are allowed.")

        with open(file_path, 'r') as file:
            content = file.read()
            line_count = content.count('\n') + 1  # Simple line count
            result_queue.put((file_path, line_count))  # Put result in the queue

    except Exception as e:
        result_queue.put((file_path, f"Error: {str(e)}"))


# Worker function that will be run by each process
def file_processing_worker(file_path: str, result_queue: multiprocessing.Queue):
    process_file(file_path, result_queue)


# File Processing Manager class
class FileProcessor:
    def __init__(self, file_paths: List[str]):
        self.file_paths = file_paths
        self.result_queue = multiprocessing.Queue()
        self.processes = []

    def start_processing(self):
        """Start the file processing tasks using multiple processes."""
        for file_path in self.file_paths:
            process = multiprocessing.Process(target=file_processing_worker, args=(file_path, self.result_queue))
            self.processes.append(process)
            process.start()

    def wait_for_processes(self):
        """Wait for all processes to complete."""
        for process in self.processes:
            process.join()

    def get_results(self):
        """Retrieve results from the queue."""
        results = []
        while not self.result_queue.empty():
            results.append(self.result_queue.get())
        return results

    def process_files(self):
        """Complete the file processing."""
        self.start_processing()
        self.wait_for_processes()
        return self.get_results()
```

---

### 2. **Writing Tests with `pytest`**

The goal here is to write tests that:

- Verify the correctness of the file processing logic.
- Ensure proper error handling for invalid file paths and file types.
- Test the multiprocessing functionality using `pytest`.

#### Test File: `test_file_processor.py`

```python
import pytest
from unittest.mock import patch
import os
import tempfile
from file_processor import FileProcessor, FileProcessorError, InvalidFileType, ProcessingError


# Helper function to create a temporary text file for testing
def create_temp_file(content: str) -> str:
    with tempfile.NamedTemporaryFile(delete=False, mode='w', newline='') as temp_file:
        temp_file.write(content)
        return temp_file.name


# Unit Test: Test if a valid file is processed correctly
def test_process_file_success():
    file_content = "Hello, world!\nThis is a test file.\n"
    file_path = create_temp_file(file_content)

    result_queue = multiprocessing.Queue()
    process_file(file_path, result_queue)
    result = result_queue.get()

    assert result[0] == file_path
    assert result[1] == 2  # Two lines in the content

    os.remove(file_path)


# Unit Test: Test handling of invalid file type (non-txt files)
def test_process_file_invalid_type():
    file_content = "This is not a .txt file."
    file_path = create_temp_file(file_content)

    result_queue = multiprocessing.Queue()
    process_file(file_path, result_queue)
    result = result_queue.get()

    assert result[0] == file_path
    assert "Invalid file type" in result[1]

    os.remove(file_path)


# Unit Test: Test handling of missing file
def test_process_file_missing_file():
    result_queue = multiprocessing.Queue()
    process_file("non_existent_file.txt", result_queue)
    result = result_queue.get()

    assert "Error" in result[1]


# Integration Test: Test full file processing with multiprocessing
def test_multiprocessing_processing():
    # Create a few temp files
    valid_file = create_temp_file("Line 1\nLine 2\n")
    invalid_file = create_temp_file("Invalid file\n")
    non_txt_file = create_temp_file("Some content")

    file_paths = [valid_file, invalid_file, non_txt_file]

    # Create the processor and run the processing
    processor = FileProcessor(file_paths)
    results = processor.process_files()

    # Check results
    assert len(results) == len(file_paths)
    assert any(result[0] == valid_file and result[1] == 2 for result in results)
    assert any(result[0] == invalid_file and "Error" in result[1] for result in results)
    assert any(result[0] == non_txt_file and "Invalid file type" in result[1] for result in results)

    # Clean up
    os.remove(valid_file)
    os.remove(invalid_file)
    os.remove(non_txt_file)


# Unit Test: Test for FileProcessor class' processing functionality
def test_file_processor_class():
    valid_file = create_temp_file("Line 1\nLine 2\n")
    invalid_file = create_temp_file("Invalid file")
    processor = FileProcessor([valid_file, invalid_file])

    results = processor.process_files()

    assert len(results) == 2
    assert results[0][0] == valid_file
    assert results[0][1] == 2
    assert results[1][0] == invalid_file
    assert "Invalid file type" in results[1][1]

    os.remove(valid_file)
    os.remove(invalid_file)
```

---

### 3. **Running Tests with `pytest`**

To run the tests for the **Multiprocessing File Processing System**, use the following command:

```bash
pytest test_file_processor.py
```

### 4. **Explanation of Tests**

- **Unit Tests**:

  - `test_process_file_success`: Ensures that the `process_file` function works correctly when processing a valid `.txt` file.
  - `test_process_file_invalid_type`: Verifies that an error is raised when a non-`.txt` file is encountered.
  - `test_process_file_missing_file`: Tests that an error occurs when a non-existent file is processed.

- **Integration Test**:
  - `test_multiprocessing_processing`: Verifies the entire file processing system, checking that multiple files are processed correctly (valid and invalid files).
- **File Processor Class Test**:
  - `test_file_processor_class`: Tests the `FileProcessor` class, ensuring that it processes multiple files and handles invalid files as expected.

---

### 5. **Conclusion**

In this scenario:

- We've implemented a **multiprocessing file processing system** that utilizes Python's `multiprocessing`, `pathlib`, and `os` libraries to process multiple files concurrently.
- The tests cover **unit testing** for individual functions, including error handling for invalid file types and missing files.
- **Integration tests** ensure that the system works correctly when processing a mix of valid and invalid files using multiple processes.

By practicing **multiprocessing** and writing comprehensive **unit and integration tests**, you can ensure that your system is efficient, robust, and can scale well for handling large datasets or tasks concurrently.

### Real World Scenario: **Asynchronous Web Scraper**

In this scenario, we will build a real-world **asynchronous web scraper** using Python's **`asyncio`** and **`aiohttp`** libraries. We will then write unit and integration tests using **`pytest`** to test the functionality.

The asynchronous approach will allow us to fetch multiple web pages concurrently, improving efficiency when scraping multiple pages or performing I/O-bound tasks.

We'll focus on the following features and Python constructs:

1. **Asynchronous Programming**: Using **`asyncio`** to manage asynchronous tasks and **`aiohttp`** to make asynchronous HTTP requests.
2. **Concurrency**: Concurrent fetching of URLs.
3. **Error Handling**: Handling possible network errors like timeouts or invalid URLs.
4. **Unit and Integration Testing**: Using **`pytest`** to test both individual functions and the complete scraper.

---

### Step-by-Step Implementation

---

### 1. **Asynchronous Web Scraper Code**

```python
import asyncio
import aiohttp
from typing import List
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)

class ScraperError(Exception):
    """Base class for exceptions in the scraper."""
    pass

class InvalidURLException(ScraperError):
    """Raised when a URL is invalid or unreachable."""
    pass

class WebScraper:
    def __init__(self, urls: List[str]):
        self.urls = urls
        self.results = {}

    async def fetch_page(self, session: aiohttp.ClientSession, url: str):
        """Fetch a single page asynchronously."""
        try:
            async with session.get(url) as response:
                response.raise_for_status()  # Will raise an HTTPError for bad responses (4xx or 5xx)
                content = await response.text()
                logging.info(f"Successfully fetched {url}")
                return content
        except aiohttp.ClientError as e:
            logging.error(f"Error fetching {url}: {e}")
            raise InvalidURLException(f"Could not fetch {url}")
        except Exception as e:
            logging.error(f"Unexpected error while fetching {url}: {e}")
            raise ScraperError(f"Unexpected error fetching {url}: {e}")

    async def fetch_all(self):
        """Fetch all pages concurrently using asyncio."""
        async with aiohttp.ClientSession() as session:
            tasks = [self.fetch_page(session, url) for url in self.urls]
            pages = await asyncio.gather(*tasks, return_exceptions=True)

            for url, page in zip(self.urls, pages):
                if isinstance(page, Exception):
                    self.results[url] = f"Failed to fetch: {page}"
                else:
                    self.results[url] = len(page)  # Just storing the length of the content
            return self.results


async def run_scraper(urls: List[str]):
    scraper = WebScraper(urls)
    return await scraper.fetch_all()
```

---

### 2. **Writing Tests with `pytest`**

We will write unit and integration tests to ensure the correctness of the `WebScraper` class and the `run_scraper` function. We will test:

- **Unit tests** to ensure that individual components work as expected (e.g., fetching a page correctly).
- **Integration tests** to verify that the entire scraping process works with multiple URLs.
- **Mocking** network requests to avoid hitting real websites during testing.

#### Test File: `test_web_scraper.py`

```python
import pytest
from unittest.mock import patch, AsyncMock
from aiohttp import ClientError
from web_scraper import WebScraper, InvalidURLException, ScraperError, run_scraper


# Unit Test: Test fetching a page successfully
@pytest.mark.asyncio
async def test_fetch_page_success():
    # Simulate a successful response using mocking
    mock_url = "https://example.com"
    mock_content = "This is the content of the page."

    async with patch('aiohttp.ClientSession.get') as mock_get:
        mock_get.return_value.__aenter__.return_value.text = AsyncMock(return_value=mock_content)
        scraper = WebScraper([mock_url])

        result = await scraper.fetch_page(mock_get, mock_url)
        assert result == mock_content


# Unit Test: Test invalid URL (network error)
@pytest.mark.asyncio
async def test_fetch_page_invalid_url():
    # Simulate an invalid URL using mocking
    mock_url = "https://invalid-url.com"

    async with patch('aiohttp.ClientSession.get') as mock_get:
        mock_get.return_value.__aenter__.side_effect = ClientError("Invalid URL")
        scraper = WebScraper([mock_url])

        with pytest.raises(InvalidURLException):
            await scraper.fetch_page(mock_get, mock_url)


# Unit Test: Test exception handling during page fetch
@pytest.mark.asyncio
async def test_fetch_page_unexpected_error():
    # Simulate an unexpected error
    mock_url = "https://example.com"

    async with patch('aiohttp.ClientSession.get') as mock_get:
        mock_get.return_value.__aenter__.side_effect = Exception("Unexpected error")
        scraper = WebScraper([mock_url])

        with pytest.raises(ScraperError):
            await scraper.fetch_page(mock_get, mock_url)


# Integration Test: Test the WebScraper with multiple URLs
@pytest.mark.asyncio
async def test_fetch_all():
    # Mocking multiple URLs
    valid_url = "https://valid-url.com"
    invalid_url = "https://invalid-url.com"
    urls = [valid_url, invalid_url]

    # Mock the results of fetching each URL
    valid_content = "Valid content."
    invalid_content = ClientError("Invalid URL")

    async with patch('aiohttp.ClientSession.get') as mock_get:
        mock_get.return_value.__aenter__.return_value.text = AsyncMock(side_effect=[valid_content, invalid_content])

        scraper = WebScraper(urls)
        results = await scraper.fetch_all()

        # Check that the scraper handled both valid and invalid URLs correctly
        assert valid_url in results
        assert invalid_url in results
        assert isinstance(results[valid_url], int)  # Should store the length of valid content
        assert isinstance(results[invalid_url], str)  # Should store an error message


# Integration Test: Test the entire scraper function (async run)
@pytest.mark.asyncio
async def test_run_scraper():
    urls = ["https://valid-url1.com", "https://valid-url2.com"]

    valid_content = "Content 1"
    async with patch('aiohttp.ClientSession.get') as mock_get:
        mock_get.return_value.__aenter__.return_value.text = AsyncMock(side_effect=[valid_content, valid_content])

        results = await run_scraper(urls)

        assert len(results) == 2
        assert results["https://valid-url1.com"] == len(valid_content)
        assert results["https://valid-url2.com"] == len(valid_content)
```

---

### 3. **Explanation of Tests**

- **Unit Tests**:

  - `test_fetch_page_success`: Ensures that the `fetch_page` function correctly fetches the content of a page using a mock response.
  - `test_fetch_page_invalid_url`: Verifies that an `InvalidURLException` is raised when a network error occurs (e.g., when the URL is invalid).
  - `test_fetch_page_unexpected_error`: Tests that the `fetch_page` function raises a `ScraperError` for unexpected errors during the fetch process (e.g., unknown exceptions).

- **Integration Tests**:
  - `test_fetch_all`: Tests the entire process of fetching multiple URLs concurrently and ensures that both successful and failed fetches are handled correctly.
  - `test_run_scraper`: Integrates everything by testing the complete asynchronous scraper function (`run_scraper`), which uses multiple URLs.

---

### 4. **Running Tests with `pytest`**

You can run the tests using the following command in the terminal:

```bash
pytest test_web_scraper.py
```

Make sure you have the necessary dependencies installed:

```bash
pip install pytest aiohttp
```

### 5. **Key Points to Note**

- **Asyncio**: We used `asyncio` to manage the asynchronous nature of HTTP requests, ensuring that we don't block while waiting for a response from each URL.
- **`aiohttp`**: The `aiohttp` library is used for making asynchronous HTTP requests. The `ClientSession.get` method is mocked to simulate successful and failed network responses.
- **Error Handling**: The custom exceptions `InvalidURLException` and `ScraperError` were used to catch errors during the scraping process, such as network errors and unexpected exceptions.
- **Testing Asynchronous Code**: `pytest.mark.asyncio` is used to run asynchronous tests. We used `patch` to mock external dependencies like network requests, enabling us to test the logic of the scraper without actually making HTTP requests.

---

### 6. **Conclusion**

This scenario demonstrates how to use Python's **asyncio** for asynchronous programming and **aiohttp** for concurrent HTTP requests. By implementing and testing a web scraper, we utilized **async I/O**, **error handling**, and **concurrency** to efficiently scrape multiple URLs.

The tests cover both unit and integration levels, ensuring that individual functions like `fetch_page` and the entire scraping process (with multiple URLs) behave as expected, and that error scenarios are properly handled.

By practicing asynchronous code and testing asynchronous behavior, you can ensure that your web scraping or other I/O-bound systems are scalable and efficient.

### Real World Scenario: **PostgreSQL Database Interaction using `psycopg2`**

In this scenario, we'll implement a **real-world application** that interacts with a PostgreSQL database using the **`psycopg2`** library. The application will:

1. **Connect to the PostgreSQL database.**
2. **Insert data into a table.**
3. **Retrieve data from the table.**
4. **Close the connection properly.**

We will also write **unit and integration tests** using **`pytest`**. For testing, we'll use **`pytest`**'s fixtures and **mocking** to avoid modifying a real database during testing.

### Requirements:

- **PostgreSQL** database running locally or remotely.
- **`psycopg2`** library installed (`pip install psycopg2`).
- **`pytest`** and **`pytest-mock`** for unit testing (`pip install pytest pytest-mock`).

---

### 1. **PostgreSQL Database Interaction with `psycopg2`**

We will create a simple Python script that does the following:

1. Connects to the database.
2. Inserts a user record.
3. Fetches records.
4. Closes the connection.

#### Code for Database Interaction (`database.py`):

```python
import psycopg2
from psycopg2 import sql
import logging
from typing import List, Dict

# Configure logging
logging.basicConfig(level=logging.INFO)

class DatabaseError(Exception):
    """Custom exception for database-related errors."""
    pass

class PostgresDatabase:
    def __init__(self, dbname: str, user: str, password: str, host: str = 'localhost', port: int = 5432):
        """Initialize the database connection details."""
        self.dbname = dbname
        self.user = user
        self.password = password
        self.host = host
        self.port = port
        self.connection = None
        self.cursor = None

    def connect(self):
        """Establish a connection to the database."""
        try:
            self.connection = psycopg2.connect(
                dbname=self.dbname,
                user=self.user,
                password=self.password,
                host=self.host,
                port=self.port
            )
            self.cursor = self.connection.cursor()
            logging.info("Database connection established.")
        except Exception as e:
            logging.error(f"Error connecting to the database: {e}")
            raise DatabaseError(f"Connection failed: {e}")

    def create_table(self):
        """Create a table for storing user data."""
        create_table_query = """
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100),
            email VARCHAR(100)
        );
        """
        try:
            self.cursor.execute(create_table_query)
            self.connection.commit()
            logging.info("Table created successfully.")
        except Exception as e:
            logging.error(f"Error creating table: {e}")
            raise DatabaseError(f"Table creation failed: {e}")

    def insert_user(self, name: str, email: str):
        """Insert a user into the users table."""
        insert_query = """
        INSERT INTO users (name, email)
        VALUES (%s, %s)
        RETURNING id;
        """
        try:
            self.cursor.execute(insert_query, (name, email))
            self.connection.commit()
            user_id = self.cursor.fetchone()[0]
            logging.info(f"Inserted user with ID {user_id}")
            return user_id
        except Exception as e:
            logging.error(f"Error inserting user: {e}")
            raise DatabaseError(f"User insertion failed: {e}")

    def fetch_users(self) -> List[Dict[str, str]]:
        """Fetch all users from the users table."""
        select_query = "SELECT id, name, email FROM users;"
        try:
            self.cursor.execute(select_query)
            rows = self.cursor.fetchall()
            users = [{"id": row[0], "name": row[1], "email": row[2]} for row in rows]
            logging.info(f"Fetched {len(users)} users.")
            return users
        except Exception as e:
            logging.error(f"Error fetching users: {e}")
            raise DatabaseError(f"User fetch failed: {e}")

    def close(self):
        """Close the database connection."""
        if self.cursor:
            self.cursor.close()
        if self.connection:
            self.connection.close()
        logging.info("Database connection closed.")
```

---

### 2. **Writing Unit and Integration Tests with `pytest`**

We'll now write tests for the following:

- **Unit Tests**:
  - Test individual methods like `insert_user` and `fetch_users`.
  - Use mocks to simulate database operations without interacting with the real database.
- **Integration Test**:
  - Test the complete interaction flow (connecting, inserting, and fetching).

#### Test File: `test_database.py`

```python
import pytest
from unittest.mock import patch, MagicMock
from database import PostgresDatabase, DatabaseError

# Unit Test: Test the connection method (mocking psycopg2.connect)
@patch('psycopg2.connect')
def test_connect_success(mock_connect):
    # Simulate successful connection
    mock_connection = MagicMock()
    mock_cursor = MagicMock()
    mock_connection.cursor.return_value = mock_cursor
    mock_connect.return_value = mock_connection

    db = PostgresDatabase(dbname="test_db", user="test_user", password="test_password")
    db.connect()

    mock_connect.assert_called_with(dbname="test_db", user="test_user", password="test_password", host='localhost', port=5432)
    assert db.connection == mock_connection
    assert db.cursor == mock_cursor


# Unit Test: Test insert_user method (mocking database insert)
@patch.object(PostgresDatabase, 'connect')  # Mock the connect method to avoid actual DB connection
@patch('psycopg2.cursor')  # Mock the psycopg2 cursor
def test_insert_user(mock_cursor, mock_connect):
    # Simulate cursor behavior
    mock_cursor.return_value.fetchone.return_value = [1]  # Simulate returning user ID 1

    db = PostgresDatabase(dbname="test_db", user="test_user", password="test_password")
    db.connect = MagicMock()  # Mock the connection method to skip actual DB connection

    user_id = db.insert_user("John Doe", "john.doe@example.com")

    assert user_id == 1  # The returned user ID
    mock_cursor.return_value.execute.assert_called_with("""
        INSERT INTO users (name, email)
        VALUES (%s, %s)
        RETURNING id;
        """, ("John Doe", "john.doe@example.com"))


# Unit Test: Test fetch_users method (mocking database fetch)
@patch.object(PostgresDatabase, 'connect')  # Mock the connect method to avoid actual DB connection
@patch('psycopg2.cursor')  # Mock the psycopg2 cursor
def test_fetch_users(mock_cursor, mock_connect):
    # Simulate cursor behavior
    mock_cursor.return_value.fetchall.return_value = [
        (1, 'John Doe', 'john.doe@example.com'),
        (2, 'Jane Doe', 'jane.doe@example.com')
    ]

    db = PostgresDatabase(dbname="test_db", user="test_user", password="test_password")
    db.connect = MagicMock()  # Mock the connection method to skip actual DB connection

    users = db.fetch_users()

    assert len(users) == 2
    assert users == [
        {"id": 1, "name": 'John Doe', "email": 'john.doe@example.com'},
        {"id": 2, "name": 'Jane Doe', "email": 'jane.doe@example.com'}
    ]


# Integration Test: Test the full flow (connecting, inserting, and fetching)
@pytest.fixture
def db_connection():
    db = PostgresDatabase(dbname="test_db", user="test_user", password="test_password")
    db.connect()
    yield db
    db.close()


def test_full_flow(db_connection):
    db = db_connection

    # Test inserting a user
    user_id = db.insert_user("Alice Smith", "alice.smith@example.com")
    assert user_id is not None

    # Test fetching users
    users = db.fetch_users()
    assert any(user["name"] == "Alice Smith" for user in users)
```

---

### 3. **Explanation of Tests**

- **Unit Tests**:

  - `test_connect_success`: Tests that the `connect` method correctly establishes a database connection. The `psycopg2.connect` call is mocked to simulate a successful connection.
  - `test_insert_user`: Tests the `insert_user` method. We mock the `cursor.execute` call and simulate the insertion of a user. The method should return the ID of the inserted user.
  - `test_fetch_users`: Tests the `fetch_users` method. We mock the `cursor.fetchall()` method to simulate fetching user data from the database.

- **Integration Test**:
  - `test_full_flow`: This is an integration test that uses a `pytest` fixture to set up the database connection, insert a user, and fetch all users to verify that the entire flow works correctly.

---

### 4. **Running Tests with `pytest`**

To run the tests, use the following command:

```bash
pytest test_database.py
```

Ensure that you have the necessary dependencies installed:

```bash
pip install pytest psycopg2 pytest-mock
```

---

### 5. **Conclusion**

This real-world scenario demonstrates how to use the **`psycopg2`** library to interact with a PostgreSQL database

, including creating tables, inserting records, and fetching records. We also wrote **unit tests** to mock the database operations and **integration tests** to ensure the complete flow works as expected.

By using **mocking** in the unit tests, we can test individual methods without affecting the actual database, making our tests fast and isolated. The **integration test** ensures that the complete interaction flow works correctly from connecting to the database to inserting and fetching data.

### Real-World Scenario: **MSSQL Database Interaction Using `pyodbc`**

In this scenario, we will implement a real-world example where we interact with a **Microsoft SQL Server (MSSQL)** database using the **`pyodbc`** library. The application will:

1. **Connect to the MSSQL database.**
2. **Create a table if it does not exist.**
3. **Insert records into the table.**
4. **Fetch records from the table.**
5. **Close the connection properly.**

Additionally, we will write **unit and integration tests** using **`pytest`** to test the behavior of our application and ensure it works as expected. The goal is to demonstrate how to perform basic database operations while also writing automated tests for each part.

---

### 1. **Install Dependencies**

Before we begin, make sure that the following dependencies are installed:

```bash
pip install pyodbc pytest pytest-mock
```

You will also need an MSSQL Server running locally or remotely. Adjust the connection parameters accordingly (hostname, database name, user, and password).

---

### 2. **MSSQL Database Interaction with `pyodbc`**

We will create a Python script that interacts with a Microsoft SQL Server database using the **`pyodbc`** library.

#### Code for Database Interaction (`database.py`):

```python
import pyodbc
import logging
from typing import List, Dict

# Configure logging
logging.basicConfig(level=logging.INFO)

class DatabaseError(Exception):
    """Custom exception for database-related errors."""
    pass

class MSSQLDatabase:
    def __init__(self, server: str, database: str, username: str, password: str):
        """Initialize the database connection details."""
        self.server = server
        self.database = database
        self.username = username
        self.password = password
        self.connection = None
        self.cursor = None

    def connect(self):
        """Establish a connection to the database."""
        try:
            conn_str = f'DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={self.server};DATABASE={self.database};UID={self.username};PWD={self.password}'
            self.connection = pyodbc.connect(conn_str)
            self.cursor = self.connection.cursor()
            logging.info("Database connection established.")
        except Exception as e:
            logging.error(f"Error connecting to the database: {e}")
            raise DatabaseError(f"Connection failed: {e}")

    def create_table(self):
        """Create a table for storing user data."""
        create_table_query = """
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
        CREATE TABLE Users (
            id INT PRIMARY KEY IDENTITY,
            name NVARCHAR(100),
            email NVARCHAR(100)
        );
        """
        try:
            self.cursor.execute(create_table_query)
            self.connection.commit()
            logging.info("Table created successfully.")
        except Exception as e:
            logging.error(f"Error creating table: {e}")
            raise DatabaseError(f"Table creation failed: {e}")

    def insert_user(self, name: str, email: str):
        """Insert a user into the Users table."""
        insert_query = "INSERT INTO Users (name, email) OUTPUT INSERTED.id VALUES (?, ?)"
        try:
            self.cursor.execute(insert_query, (name, email))
            user_id = self.cursor.fetchone()[0]
            self.connection.commit()
            logging.info(f"Inserted user with ID {user_id}")
            return user_id
        except Exception as e:
            logging.error(f"Error inserting user: {e}")
            raise DatabaseError(f"User insertion failed: {e}")

    def fetch_users(self) -> List[Dict[str, str]]:
        """Fetch all users from the Users table."""
        select_query = "SELECT id, name, email FROM Users;"
        try:
            self.cursor.execute(select_query)
            rows = self.cursor.fetchall()
            users = [{"id": row[0], "name": row[1], "email": row[2]} for row in rows]
            logging.info(f"Fetched {len(users)} users.")
            return users
        except Exception as e:
            logging.error(f"Error fetching users: {e}")
            raise DatabaseError(f"User fetch failed: {e}")

    def close(self):
        """Close the database connection."""
        if self.cursor:
            self.cursor.close()
        if self.connection:
            self.connection.close()
        logging.info("Database connection closed.")
```

---

### 3. **Writing Unit and Integration Tests with `pytest`**

We will write tests for the following parts:

1. **Unit Tests**:
   - Test individual methods like `insert_user` and `fetch_users`.
   - Mock the database operations to avoid interacting with the actual database during tests.
2. **Integration Test**:
   - Test the complete interaction flow (connect, insert, fetch).

#### Test File: `test_database.py`

```python
import pytest
from unittest.mock import patch, MagicMock
from database import MSSQLDatabase, DatabaseError

# Unit Test: Test the connection method (mocking pyodbc.connect)
@patch('pyodbc.connect')
def test_connect_success(mock_connect):
    # Simulate successful connection
    mock_connection = MagicMock()
    mock_cursor = MagicMock()
    mock_connection.cursor.return_value = mock_cursor
    mock_connect.return_value = mock_connection

    db = MSSQLDatabase(server="localhost", database="test_db", username="test_user", password="test_password")
    db.connect()

    mock_connect.assert_called_with('DRIVER={ODBC Driver 17 for SQL Server};SERVER=localhost;DATABASE=test_db;UID=test_user;PWD=test_password')
    assert db.connection == mock_connection
    assert db.cursor == mock_cursor


# Unit Test: Test insert_user method (mocking database insert)
@patch.object(MSSQLDatabase, 'connect')  # Mock the connect method to avoid actual DB connection
@patch('pyodbc.Cursor')  # Mock the pyodbc cursor
def test_insert_user(mock_cursor, mock_connect):
    # Simulate cursor behavior
    mock_cursor.return_value.fetchone.return_value = [1]  # Simulate returning user ID 1

    db = MSSQLDatabase(server="localhost", database="test_db", username="test_user", password="test_password")
    db.connect = MagicMock()  # Mock the connection method to skip actual DB connection

    user_id = db.insert_user("John Doe", "john.doe@example.com")

    assert user_id == 1  # The returned user ID
    mock_cursor.return_value.execute.assert_called_with("INSERT INTO Users (name, email) OUTPUT INSERTED.id VALUES (?, ?)", ("John Doe", "john.doe@example.com"))


# Unit Test: Test fetch_users method (mocking database fetch)
@patch.object(MSSQLDatabase, 'connect')  # Mock the connect method to avoid actual DB connection
@patch('pyodbc.Cursor')  # Mock the pyodbc cursor
def test_fetch_users(mock_cursor, mock_connect):
    # Simulate cursor behavior
    mock_cursor.return_value.fetchall.return_value = [
        (1, 'John Doe', 'john.doe@example.com'),
        (2, 'Jane Doe', 'jane.doe@example.com')
    ]

    db = MSSQLDatabase(server="localhost", database="test_db", username="test_user", password="test_password")
    db.connect = MagicMock()  # Mock the connection method to skip actual DB connection

    users = db.fetch_users()

    assert len(users) == 2
    assert users == [
        {"id": 1, "name": 'John Doe', "email": 'john.doe@example.com'},
        {"id": 2, "name": 'Jane Doe', "email": 'jane.doe@example.com'}
    ]


# Integration Test: Test the full flow (connecting, inserting, and fetching)
@pytest.fixture
def db_connection():
    db = MSSQLDatabase(server="localhost", database="test_db", username="test_user", password="test_password")
    db.connect()
    yield db
    db.close()


def test_full_flow(db_connection):
    db = db_connection

    # Test inserting a user
    user_id = db.insert_user("Alice Smith", "alice.smith@example.com")
    assert user_id is not None

    # Test fetching users
    users = db.fetch_users()
    assert any(user["name"] == "Alice Smith" for user in users)
```

---

### 4. **Explanation of Tests**

- **Unit Tests**:

  - **`test_connect_success`**: This tests the `connect` method by mocking the `pyodbc.connect` function. It checks that the correct connection string is passed and that the connection is properly established.
  - **`test_insert_user`**: This tests the `insert_user` method by mocking the database interaction. It simulates the insertion of a user and returns a user ID of 1.
  - **`test_fetch_users`**: This tests the `fetch_users` method by mocking the `fetchall` method to simulate fetching user data.

- **Integration Test**:
  - **`test_full_flow`**: This is an integration test that uses a `pytest` fixture to set up the database connection, insert a user, and fetch all users. It verifies that the full flow works correctly from connecting to the database to inserting and fetching data.

---

### 5. **Running Tests with `pytest`**

To run the tests, use the following command:

```bash
pytest test_database.py
```

Ensure that you have the necessary dependencies installed:

```bash
pip install pytest pyodbc pytest-mock
```

---

### 6. \*\*

Conclusion\*\*

In this example, we implemented a real-world use case of interacting with a **Microsoft SQL Server database** using **`pyodbc`**. We also wrote **unit tests** to mock database interactions and **integration tests** to verify the entire process, ensuring that the database operations work correctly.

By using **`pytest`** and **mocking** with **`pytest-mock`**, we can easily test each method in isolation while also ensuring that the complete flow works as expected.

### Real-World Example with `pyodbc` - A Database Interaction Use Case

In this scenario, we'll implement a real-world example of using **`pyodbc`**, a Python library for interacting with databases such as **Microsoft SQL Server (MSSQL)**. The objective will be to demonstrate basic database operations (such as connecting, querying, inserting, and updating data) and show how to write unit and integration tests using **`pytest`**.

---

### Scenario: **User Management System**

We are building a simple **User Management System** that will interact with a Microsoft SQL Server database to:

1. **Create a table** for storing user information (e.g., name, email, etc.).
2. **Insert user data** into the table.
3. **Fetch user data** from the table.
4. **Update user data** in the table.

We'll use **`pyodbc`** to interact with the database, and the goal is to provide a real-world use case of interacting with a database and writing tests for each operation.

### 1. **Install Dependencies**

Make sure the required libraries are installed using the following:

```bash
pip install pyodbc pytest pytest-mock
```

You'll also need an MSSQL Server instance running. Adjust the connection details accordingly (server, database name, username, password).

### 2. **Database Interaction with `pyodbc`**

Let's start by creating a Python script that will define the necessary operations like connecting, creating a table, inserting, fetching, and updating user data.

#### Code for Database Interaction (`database.py`):

```python
import pyodbc
import logging
from typing import List, Dict

# Configure logging
logging.basicConfig(level=logging.INFO)

class DatabaseError(Exception):
    """Custom exception for database-related errors."""
    pass

class MSSQLDatabase:
    def __init__(self, server: str, database: str, username: str, password: str):
        """Initialize the database connection details."""
        self.server = server
        self.database = database
        self.username = username
        self.password = password
        self.connection = None
        self.cursor = None

    def connect(self):
        """Establish a connection to the database."""
        try:
            conn_str = f'DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={self.server};DATABASE={self.database};UID={self.username};PWD={self.password}'
            self.connection = pyodbc.connect(conn_str)
            self.cursor = self.connection.cursor()
            logging.info("Database connection established.")
        except Exception as e:
            logging.error(f"Error connecting to the database: {e}")
            raise DatabaseError(f"Connection failed: {e}")

    def create_table(self):
        """Create a table for storing user data."""
        create_table_query = """
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
        CREATE TABLE Users (
            id INT PRIMARY KEY IDENTITY,
            name NVARCHAR(100),
            email NVARCHAR(100)
        );
        """
        try:
            self.cursor.execute(create_table_query)
            self.connection.commit()
            logging.info("Table created successfully.")
        except Exception as e:
            logging.error(f"Error creating table: {e}")
            raise DatabaseError(f"Table creation failed: {e}")

    def insert_user(self, name: str, email: str):
        """Insert a user into the Users table."""
        insert_query = "INSERT INTO Users (name, email) OUTPUT INSERTED.id VALUES (?, ?)"
        try:
            self.cursor.execute(insert_query, (name, email))
            user_id = self.cursor.fetchone()[0]
            self.connection.commit()
            logging.info(f"Inserted user with ID {user_id}")
            return user_id
        except Exception as e:
            logging.error(f"Error inserting user: {e}")
            raise DatabaseError(f"User insertion failed: {e}")

    def fetch_users(self) -> List[Dict[str, str]]:
        """Fetch all users from the Users table."""
        select_query = "SELECT id, name, email FROM Users;"
        try:
            self.cursor.execute(select_query)
            rows = self.cursor.fetchall()
            users = [{"id": row[0], "name": row[1], "email": row[2]} for row in rows]
            logging.info(f"Fetched {len(users)} users.")
            return users
        except Exception as e:
            logging.error(f"Error fetching users: {e}")
            raise DatabaseError(f"User fetch failed: {e}")

    def update_user_email(self, user_id: int, new_email: str):
        """Update the email of a user."""
        update_query = "UPDATE Users SET email = ? WHERE id = ?"
        try:
            self.cursor.execute(update_query, (new_email, user_id))
            self.connection.commit()
            logging.info(f"Updated user with ID {user_id}")
        except Exception as e:
            logging.error(f"Error updating user: {e}")
            raise DatabaseError(f"User update failed: {e}")

    def close(self):
        """Close the database connection."""
        if self.cursor:
            self.cursor.close()
        if self.connection:
            self.connection.close()
        logging.info("Database connection closed.")
```

### 3. **Writing Unit and Integration Tests with `pytest`**

We'll write tests for the following functionalities:

1. **Unit Tests**: Mocking database interactions to test each method (insert, fetch, update).
2. **Integration Test**: Verifying the full workflow including creating the table, inserting, updating, and fetching data.

#### Test File: `test_database.py`

```python
import pytest
from unittest.mock import patch, MagicMock
from database import MSSQLDatabase, DatabaseError

# Unit Test: Test the connection method (mocking pyodbc.connect)
@patch('pyodbc.connect')
def test_connect_success(mock_connect):
    # Simulate successful connection
    mock_connection = MagicMock()
    mock_cursor = MagicMock()
    mock_connection.cursor.return_value = mock_cursor
    mock_connect.return_value = mock_connection

    db = MSSQLDatabase(server="localhost", database="test_db", username="test_user", password="test_password")
    db.connect()

    mock_connect.assert_called_with('DRIVER={ODBC Driver 17 for SQL Server};SERVER=localhost;DATABASE=test_db;UID=test_user;PWD=test_password')
    assert db.connection == mock_connection
    assert db.cursor == mock_cursor


# Unit Test: Test insert_user method (mocking database insert)
@patch.object(MSSQLDatabase, 'connect')  # Mock the connect method to avoid actual DB connection
@patch('pyodbc.Cursor')  # Mock the pyodbc cursor
def test_insert_user(mock_cursor, mock_connect):
    # Simulate cursor behavior
    mock_cursor.return_value.fetchone.return_value = [1]  # Simulate returning user ID 1

    db = MSSQLDatabase(server="localhost", database="test_db", username="test_user", password="test_password")
    db.connect = MagicMock()  # Mock the connection method to skip actual DB connection

    user_id = db.insert_user("John Doe", "john.doe@example.com")

    assert user_id == 1  # The returned user ID
    mock_cursor.return_value.execute.assert_called_with("INSERT INTO Users (name, email) OUTPUT INSERTED.id VALUES (?, ?)", ("John Doe", "john.doe@example.com"))


# Unit Test: Test fetch_users method (mocking database fetch)
@patch.object(MSSQLDatabase, 'connect')  # Mock the connect method to avoid actual DB connection
@patch('pyodbc.Cursor')  # Mock the pyodbc cursor
def test_fetch_users(mock_cursor, mock_connect):
    # Simulate cursor behavior
    mock_cursor.return_value.fetchall.return_value = [
        (1, 'John Doe', 'john.doe@example.com'),
        (2, 'Jane Doe', 'jane.doe@example.com')
    ]

    db = MSSQLDatabase(server="localhost", database="test_db", username="test_user", password="test_password")
    db.connect = MagicMock()  # Mock the connection method to skip actual DB connection

    users = db.fetch_users()

    assert len(users) == 2
    assert users == [
        {"id": 1, "name": 'John Doe', "email": 'john.doe@example.com'},
        {"id": 2, "name": 'Jane Doe', "email": 'jane.doe@example.com'}
    ]


# Unit Test: Test update_user_email method (mocking database update)
@patch.object(MSSQLDatabase, 'connect')  # Mock the connect method to avoid actual DB connection
@patch('pyodbc.Cursor')  # Mock the pyodbc cursor
def test_update_user_email(mock_cursor, mock_connect):
    db = MSSQLDatabase(server="localhost", database="test_db", username="test_user", password="test_password")
    db.connect = MagicMock()  # Mock the connection method to skip actual DB connection

    # Simulate the update operation
    db.update_user_email(1, "new_email@example.com")
    mock_cursor.return_value.execute.assert_called_with("UPDATE Users SET email = ? WHERE id = ?", ("new_email@example.com", 1))


# Integration Test: Test the full flow (connecting, inserting, updating, and fetching)
@pytest.fixture
def db_connection():
    db = MSSQLDatabase(server="localhost", database="test_db", username="test_user", password="test_password")
    db.connect()
    yield db
    db.close()


def test_full_flow(db_connection):
    db = db_connection

    # Test inserting a user
    user_id = db.insert_user("Alice Smith", "alice.smith@example

.com")
    assert user_id > 0

    # Test fetching users
    users = db.fetch_users()
    assert any(user['name'] == "Alice Smith" for user in users)

    # Test updating a user
    db.update_user_email(user_id, "alice.newemail@example.com")

    # Fetch again to ensure update worked
    updated_users = db.fetch_users()
    assert any(user['email'] == "alice.newemail@example.com" for user in updated_users)
```

### 4. **Running the Tests**

Run your tests with `pytest`:

```bash
pytest test_database.py
```

### Conclusion

In this example, we:

- Implemented a **real-world database interaction** scenario using `pyodbc` for interacting with a **Microsoft SQL Server**.
- Demonstrated how to perform basic database operations such as creating a table, inserting, updating, and fetching data.
- Wrote **unit tests** to mock database interactions and **integration tests** to verify the full process, ensuring the database operations work correctly.

By using **`pytest`**, we can test both individual methods and the entire workflow, ensuring that our application behaves as expected.

### Real-World Example with `Pydantic` - Data Validation and Model Handling

In this scenario, we'll use **`Pydantic`**, a Python library used for data validation and settings management, to handle and validate complex data. Pydantic makes it easy to create and validate data models, and it works well with Python’s type hints. We'll implement a real-world use case where we receive data from an API (or other external sources) that needs validation and transformation into Python objects.

We'll focus on:

1. **Creating Pydantic models** to define data structures.
2. **Validating** input data using Pydantic's validation mechanism.
3. **Transforming** the input data and working with it.
4. **Writing tests** to ensure that our validation logic works correctly.

We will also show how to write **unit tests** to validate that the model and its methods work correctly, and **integration tests** for end-to-end scenarios.

---

### Scenario: **User Registration API**

We are building a **User Registration API** that receives data in the form of a dictionary (or JSON), validates the input, and returns a `User` object with the validated data. The validation should ensure that:

- The `username` is a string of a certain length.
- The `email` is a valid email address.
- The `age` is an integer and greater than or equal to 18.

Additionally, the API should handle cases where validation fails, e.g., returning appropriate error messages.

### 1. **Install Dependencies**

First, install the required dependencies:

```bash
pip install pydantic pytest pytest-mock
```

### 2. **User Model with Pydantic**

We will use **Pydantic** to define a model for the `User` object and use Pydantic's built-in validators to perform validation.

#### Code for User Model (`models.py`):

```python
from pydantic import BaseModel, EmailStr, validator
from typing import Optional

class User(BaseModel):
    username: str
    email: EmailStr
    age: int
    address: Optional[str] = None  # Optional field

    # Validator for ensuring the username length is between 3 and 20 characters
    @validator('username')
    def validate_username_length(cls, value):
        if len(value) < 3 or len(value) > 20:
            raise ValueError('Username must be between 3 and 20 characters')
        return value

    # Validator for ensuring age is 18 or above
    @validator('age')
    def validate_age(cls, value):
        if value < 18:
            raise ValueError('Age must be at least 18')
        return value
```

In the above code:

- `username` must be between 3 and 20 characters.
- `email` must be a valid email address (enforced by `EmailStr`).
- `age` must be an integer greater than or equal to 18.
- `address` is an optional field.

### 3. **Writing Unit Tests with `pytest`**

We will write unit tests to validate that the Pydantic model works as expected, both when the data is valid and invalid.

#### Test File: `test_models.py`

```python
import pytest
from pydantic import ValidationError
from models import User

# Unit Test 1: Test valid user creation
def test_valid_user():
    data = {
        "username": "john_doe",
        "email": "john.doe@example.com",
        "age": 25
    }
    user = User(**data)
    assert user.username == "john_doe"
    assert user.email == "john.doe@example.com"
    assert user.age == 25
    assert user.address is None

# Unit Test 2: Test invalid username (too short)
def test_invalid_username_too_short():
    data = {
        "username": "jd",
        "email": "jd@example.com",
        "age": 30
    }
    with pytest.raises(ValidationError):
        User(**data)

# Unit Test 3: Test invalid username (too long)
def test_invalid_username_too_long():
    data = {
        "username": "a" * 21,
        "email": "longusername@example.com",
        "age": 30
    }
    with pytest.raises(ValidationError):
        User(**data)

# Unit Test 4: Test invalid email
def test_invalid_email():
    data = {
        "username": "valid_username",
        "email": "invalid-email",
        "age": 25
    }
    with pytest.raises(ValidationError):
        User(**data)

# Unit Test 5: Test invalid age (under 18)
def test_invalid_age():
    data = {
        "username": "young_user",
        "email": "young@example.com",
        "age": 17
    }
    with pytest.raises(ValidationError):
        User(**data)

# Unit Test 6: Test optional address field
def test_optional_address():
    data = {
        "username": "alice_smith",
        "email": "alice.smith@example.com",
        "age": 30,
        "address": "123 Elm Street"
    }
    user = User(**data)
    assert user.address == "123 Elm Street"

    data_without_address = {
        "username": "bob_jones",
        "email": "bob.jones@example.com",
        "age": 40
    }
    user_without_address = User(**data_without_address)
    assert user_without_address.address is None
```

### 4. **Writing Integration Tests with `pytest`**

Integration tests will validate the overall workflow of the registration system, including input validation, object creation, and error handling. We will simulate what might happen in an API scenario.

#### Integration Test File: `test_integration.py`

```python
import pytest
from models import User
from pydantic import ValidationError

# Integration Test 1: Valid data should create a user
def test_create_user_integration():
    data = {
        "username": "valid_user",
        "email": "valid.user@example.com",
        "age": 25
    }
    user = User(**data)
    assert user.username == "valid_user"
    assert user.email == "valid.user@example.com"
    assert user.age == 25

# Integration Test 2: Invalid email should raise validation error
def test_create_user_with_invalid_email():
    data = {
        "username": "invalid_email_user",
        "email": "invalid_email",
        "age": 30
    }
    with pytest.raises(ValidationError):
        User(**data)

# Integration Test 3: Invalid age should raise validation error
def test_create_user_with_invalid_age():
    data = {
        "username": "young_user",
        "email": "young.user@example.com",
        "age": 17
    }
    with pytest.raises(ValidationError):
        User(**data)

# Integration Test 4: Validating that missing optional field works fine
def test_create_user_without_address():
    data = {
        "username": "no_address_user",
        "email": "no.address@example.com",
        "age": 35
    }
    user = User(**data)
    assert user.address is None
```

### 5. **Running the Tests**

You can run your tests using `pytest`:

```bash
pytest test_models.py
pytest test_integration.py
```

### 6. **Mocking and Custom Validations**

For more advanced scenarios, you could add **mocking** and **custom validators**. For example, if you want to mock a database call inside a validation method, you can use `pytest-mock` to simulate external API calls or database queries.

---

### Conclusion

In this example, we demonstrated the use of **`Pydantic`** to validate and parse data in a **User Registration System**:

- **Unit tests** were written to ensure that individual validation rules (username length, email format, etc.) work as expected.
- **Integration tests** were used to ensure that the entire flow of user creation, validation, and error handling works as expected.

This approach with **Pydantic** provides a simple yet powerful way to manage data validation and transformation while using **`pytest`** to ensure the correctness of your models and their validation logic.

### Key Benefits of Using Pydantic:

- Automatic data validation.
- Support for complex data types and custom validation.
- Type safety, leveraging Python’s typing system.

By combining **Pydantic** with **pytest** testing, you can ensure that your system handles user data correctly, minimizing bugs and improving the reliability of your data handling logic.

### Real-World Example with `Pandas` - Data Analysis and Testing

In this scenario, we will use **`Pandas`** to handle and analyze data in a real-world use case: performing basic data cleaning and analysis on a dataset. Pandas is an extremely popular library in Python for working with structured data, such as CSVs, Excel spreadsheets, and databases.

We'll focus on:

- **Loading and cleaning data** using Pandas.
- **Performing basic analysis** like filtering, aggregating, and transforming data.
- **Writing tests** to ensure that the data transformations and analysis logic are correct.

We will also show how to write **unit tests** to validate that each data operation works correctly, and **integration tests** for scenarios that involve multiple steps.

### Scenario: **Customer Sales Data Analysis**

You are working with a sales data file (CSV) that contains information about customers, their purchases, and the total amount spent. Your task is to:

1. Clean the data (e.g., remove duplicates, handle missing values).
2. Perform basic analysis (e.g., calculate total spending per customer).
3. Validate the correctness of the transformations and analysis using unit and integration tests.

### 1. **Install Dependencies**

Make sure to install the required dependencies:

```bash
pip install pandas pytest pytest-mock
```

### 2. **The Sales Data**

We’ll work with a simple sales dataset represented as a CSV file (`sales_data.csv`):

#### Sample CSV (`sales_data.csv`):

```csv
customer_id,customer_name,amount_spent,transaction_date
1,John Doe,100.50,2024-01-15
2,Jane Smith,200.75,2024-01-16
3,Bob Johnson,150.00,2024-01-17
1,John Doe,50.00,2024-01-17
2,Jane Smith,75.00,2024-01-18
4,Alice Brown,120.00,2024-01-18
```

### 3. **Data Cleaning and Analysis with Pandas**

#### Code for Data Cleaning and Analysis (`sales_analysis.py`):

```python
import pandas as pd
from typing import List, Optional

# Load data from a CSV file
def load_data(file_path: str) -> pd.DataFrame:
    return pd.read_csv(file_path)

# Clean the data: Remove duplicates, handle missing values
def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    # Remove duplicate entries based on customer_id and transaction_date
    df_cleaned = df.drop_duplicates(subset=['customer_id', 'transaction_date'])

    # Fill missing values in 'amount_spent' with 0 (if any)
    df_cleaned['amount_spent'] = df_cleaned['amount_spent'].fillna(0)

    return df_cleaned

# Analyze the total spending per customer
def total_spending(df: pd.DataFrame) -> pd.DataFrame:
    return df.groupby('customer_id')['amount_spent'].sum().reset_index()

# Analyze the top N customers based on total spending
def top_customers(df: pd.DataFrame, n: int = 5) -> pd.DataFrame:
    spending = total_spending(df)
    return spending.nlargest(n, 'amount_spent')
```

### 4. **Writing Unit Tests with `pytest`**

We’ll write **unit tests** to check that the cleaning and analysis functions work correctly.

#### Test File: `test_sales_analysis.py`

```python
import pytest
import pandas as pd
from pandas.testing import assert_frame_equal
from sales_analysis import load_data, clean_data, total_spending, top_customers

# Sample data to use in the tests
data = {
    'customer_id': [1, 2, 3, 1, 2, 4],
    'customer_name': ['John Doe', 'Jane Smith', 'Bob Johnson', 'John Doe', 'Jane Smith', 'Alice Brown'],
    'amount_spent': [100.50, 200.75, 150.00, 50.00, 75.00, 120.00],
    'transaction_date': ['2024-01-15', '2024-01-16', '2024-01-17', '2024-01-17', '2024-01-18', '2024-01-18']
}

df = pd.DataFrame(data)

# Unit Test 1: Test cleaning data (removing duplicates)
def test_clean_data():
    cleaned_df = clean_data(df)
    # After cleaning, the second John Doe and Jane Smith transactions should be removed
    expected_data = {
        'customer_id': [1, 2, 3, 4],
        'customer_name': ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown'],
        'amount_spent': [100.50, 200.75, 150.00, 120.00],
        'transaction_date': ['2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18']
    }
    expected_df = pd.DataFrame(expected_data)
    assert_frame_equal(cleaned_df, expected_df)

# Unit Test 2: Test total spending calculation
def test_total_spending():
    cleaned_df = clean_data(df)
    spending_df = total_spending(cleaned_df)
    expected_spending = {
        'customer_id': [1, 2, 3, 4],
        'amount_spent': [150.50, 275.75, 150.00, 120.00]
    }
    expected_spending_df = pd.DataFrame(expected_spending)
    assert_frame_equal(spending_df, expected_spending_df)

# Unit Test 3: Test top N customers based on total spending
def test_top_customers():
    cleaned_df = clean_data(df)
    top_2_customers = top_customers(cleaned_df, n=2)
    expected_top_2 = {
        'customer_id': [2, 1],
        'amount_spent': [275.75, 150.50]
    }
    expected_top_2_df = pd.DataFrame(expected_top_2)
    assert_frame_equal(top_2_customers, expected_top_2_df)

# Unit Test 4: Test loading data (mocking the file loading part)
def test_load_data():
    file_path = "sales_data.csv"
    # Let's assume load_data works correctly here
    loaded_df = load_data(file_path)
    assert isinstance(loaded_df, pd.DataFrame)
    assert not loaded_df.empty
```

### 5. **Writing Integration Tests with `pytest`**

Integration tests will validate that the entire data loading, cleaning, and analysis process works correctly from start to finish.

#### Integration Test File: `test_integration_sales_analysis.py`

```python
import pytest
import pandas as pd
from sales_analysis import load_data, clean_data, total_spending, top_customers

# Path to the test CSV file
TEST_FILE_PATH = "sales_data.csv"

# Integration Test 1: Test the full data pipeline
def test_full_data_pipeline():
    # Load the data
    df = load_data(TEST_FILE_PATH)

    # Clean the data
    cleaned_df = clean_data(df)

    # Perform total spending analysis
    spending_df = total_spending(cleaned_df)

    # Get the top 3 customers
    top_3_customers = top_customers(cleaned_df, n=3)

    # Check that the data transformations are correct
    assert not cleaned_df.empty
    assert len(spending_df) > 0
    assert len(top_3_customers) > 0

# Integration Test 2: Test the full flow with a malformed CSV (handling errors)
def test_full_data_pipeline_with_invalid_data():
    # Assume a badly formatted CSV will raise an error (e.g., missing columns)
    with pytest.raises(pd.errors.ParserError):
        load_data("invalid_sales_data.csv")
```

### 6. **Running the Tests**

You can run your tests using `pytest`:

```bash
pytest test_sales_analysis.py
pytest test_integration_sales_analysis.py
```

### 7. **Conclusion**

In this example, we:

1. **Used `Pandas`** to load, clean, and analyze a sales dataset.
2. **Created functions** to handle cleaning (removing duplicates), performing analysis (total spending), and fetching the top customers.
3. Wrote **unit tests** to validate that each function performs as expected:
   - **Cleaning** the data.
   - **Calculating total spending** correctly.
   - **Returning the top customers** based on their spending.
4. Wrote **integration tests** to ensure the full data pipeline (load, clean, and analyze) works end-to-end.

This workflow is typical when working with real-world data analysis and ensures that data transformations and aggregations are correct. By combining **`Pandas`** with **`pytest`**, we can ensure that our data pipeline is robust, performs as expected, and handles edge cases properly.

### Real-World Example with `NumPy` - Data Processing and Testing

In this scenario, we'll focus on **`NumPy`**, a powerful package for numerical computations in Python. We'll use **NumPy** to work with multidimensional arrays, perform mathematical operations, and process some real-world data.

We will:

1. Create and manipulate NumPy arrays.
2. Perform mathematical operations like vectorized operations, aggregation, and reshaping.
3. Write **unit tests** and **integration tests** to validate the functionality.

### Scenario: **Data Processing and Analysis with NumPy**

You are tasked with processing and analyzing a large dataset of numerical values representing sales data. You need to:

1. Create arrays for sales figures.
2. Perform operations like calculating the total sales, average sales, and identifying high-performing products.
3. Write tests to validate that your calculations and transformations are correct.

### 1. **Install Dependencies**

Ensure that you have `NumPy` and `pytest` installed:

```bash
pip install numpy pytest pytest-mock
```

### 2. **Sales Data Example**

We’ll simulate a sales data matrix, where each row represents a product, and the columns represent daily sales figures.

#### Sample Data:

```python
import numpy as np

# Rows are products, and columns represent sales on different days
sales_data = np.array([
    [100, 150, 200],  # Product 1
    [200, 250, 300],  # Product 2
    [50, 75, 100],    # Product 3
    [500, 600, 700]   # Product 4
])
```

### 3. **Data Processing Functions Using NumPy**

We will create functions to perform the following tasks:

1. **Sum the sales** across products and days.
2. **Calculate the average sales** per product.
3. **Identify high-performing products** based on total sales.

#### Code for Data Processing (`sales_processing.py`):

```python
import numpy as np

# Sum the sales for each product (along axis=1)
def total_sales(sales_data: np.ndarray) -> np.ndarray:
    return np.sum(sales_data, axis=1)

# Calculate the average sales for each product (along axis=1)
def average_sales(sales_data: np.ndarray) -> np.ndarray:
    return np.mean(sales_data, axis=1)

# Identify the top N products based on total sales
def top_n_products(sales_data: np.ndarray, n: int = 3) -> np.ndarray:
    total_sales_values = total_sales(sales_data)
    top_indices = np.argsort(total_sales_values)[::-1]  # Sorting in descending order
    return top_indices[:n]

# Normalize sales data (convert sales to a scale of 0-1)
def normalize_sales(sales_data: np.ndarray) -> np.ndarray:
    min_values = np.min(sales_data, axis=1, keepdims=True)
    max_values = np.max(sales_data, axis=1, keepdims=True)
    return (sales_data - min_values) / (max_values - min_values)
```

### 4. **Writing Unit Tests with `pytest`**

We'll write unit tests for each of the functions to verify their correctness.

#### Test File: `test_sales_processing.py`

```python
import pytest
import numpy as np
from numpy.testing import assert_array_equal, assert_almost_equal
from sales_processing import total_sales, average_sales, top_n_products, normalize_sales

# Sample sales data for testing
sales_data = np.array([
    [100, 150, 200],  # Product 1
    [200, 250, 300],  # Product 2
    [50, 75, 100],    # Product 3
    [500, 600, 700]   # Product 4
])

# Unit Test 1: Test total_sales function
def test_total_sales():
    result = total_sales(sales_data)
    expected = np.array([450, 750, 225, 1800])
    assert_array_equal(result, expected)

# Unit Test 2: Test average_sales function
def test_average_sales():
    result = average_sales(sales_data)
    expected = np.array([150.0, 250.0, 75.0, 600.0])
    assert_almost_equal(result, expected)

# Unit Test 3: Test top_n_products function
def test_top_n_products():
    result = top_n_products(sales_data, n=2)
    expected = np.array([3, 1])  # Product 4 and Product 2 have the highest sales
    assert_array_equal(result, expected)

# Unit Test 4: Test normalize_sales function
def test_normalize_sales():
    result = normalize_sales(sales_data)
    expected = np.array([
        [0.0, 0.25, 0.5],  # Product 1
        [0.0, 0.25, 0.5],  # Product 2
        [0.0, 0.25, 0.5],  # Product 3
        [0.0, 0.25, 0.5]   # Product 4
    ])
    assert_almost_equal(result, expected)
```

### 5. **Writing Integration Tests with `pytest`**

Integration tests will check that the entire processing pipeline works correctly when combined. We'll test the entire data flow from **loading**, **processing**, and **normalizing** the sales data.

#### Integration Test File: `test_integration_sales_processing.py`

```python
import pytest
import numpy as np
from sales_processing import total_sales, average_sales, top_n_products, normalize_sales

# Integration Test 1: Test full sales pipeline
def test_full_sales_pipeline():
    # Step 1: Calculate total sales
    total = total_sales(sales_data)
    assert np.array_equal(total, np.array([450, 750, 225, 1800]))

    # Step 2: Calculate average sales
    avg = average_sales(sales_data)
    assert np.array_equal(avg, np.array([150.0, 250.0, 75.0, 600.0]))

    # Step 3: Find top 2 products
    top_2 = top_n_products(sales_data, n=2)
    assert np.array_equal(top_2, np.array([3, 1]))  # Top products based on total sales

    # Step 4: Normalize the sales data
    normalized = normalize_sales(sales_data)
    expected_normalized = np.array([
        [0.0, 0.25, 0.5],
        [0.0, 0.25, 0.5],
        [0.0, 0.25, 0.5],
        [0.0, 0.25, 0.5]
    ])
    assert np.allclose(normalized, expected_normalized)

# Integration Test 2: Test the normalization on a new dataset
def test_normalization_integration():
    new_data = np.array([
        [1, 2, 3],
        [4, 5, 6]
    ])
    normalized_data = normalize_sales(new_data)
    expected_normalized_data = np.array([
        [0.0, 0.5, 1.0],
        [0.0, 0.5, 1.0]
    ])
    assert np.allclose(normalized_data, expected_normalized_data)
```

### 6. **Running the Tests**

You can run your tests using `pytest`:

```bash
pytest test_sales_processing.py
pytest test_integration_sales_processing.py
```

### 7. **Conclusion**

In this example, we:

1. **Used `NumPy`** to process a dataset of sales figures.
2. Created functions to:
   - Calculate **total sales** per product.
   - Calculate the **average sales** per product.
   - Identify the **top N products** based on total sales.
   - **Normalize** the sales data to a 0-1 scale.
3. Wrote **unit tests** to verify the correctness of each function.
4. Wrote **integration tests** to ensure that the entire data pipeline works correctly from start to finish.

By using **`NumPy`** and **`pytest`**, you can handle numerical data efficiently and ensure the correctness of your data processing logic through automated tests. This process is vital for data scientists and engineers who work with large datasets and need to ensure that transformations and analyses are accurate.
