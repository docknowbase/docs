PostgreSQL supports both sharding and partitioning, which are techniques to manage large datasets by splitting data into smaller, more manageable pieces. Here's a detailed look at both approaches, including implementation details:

### 1. Table Sharding in PostgreSQL

Sharding is the process of distributing data across multiple databases or instances to scale horizontally. PostgreSQL doesn’t natively support sharding in the same way as some NoSQL databases, but it can be achieved using external tools like Citus or through logical replication and foreign data wrappers.

#### Implementation Using Citus

Citus is an extension to PostgreSQL that provides sharding and distributed capabilities:

1. **Install Citus Extension**:
   Install the Citus extension on your PostgreSQL instance.
   ```bash
   sudo apt-get install postgresql-14-citus-10.2
   ```

2. **Enable Citus Extension**:
   Enable the extension in your database.
   ```sql
   CREATE EXTENSION citus;
   ```

3. **Create the Distributed Table**:
   - First, create the master table on the coordinator node.
   - Distribute the table by a specific column (e.g., `id`).

   ```sql
   CREATE TABLE users (
       id BIGINT,
       name TEXT,
       email TEXT,
       created_at TIMESTAMP
   );

   -- Distribute the table by the `id` column
   SELECT create_distributed_table('users', 'id');
   ```

4. **Add Worker Nodes**:
   Add worker nodes that will host the shards.
   ```sql
   SELECT * from master_add_node('worker1', 5432);
   SELECT * from master_add_node('worker2', 5432);
   ```

5. **Insert Data**:
   Data is automatically sharded across the workers based on the distribution column.
   ```sql
   INSERT INTO users (id, name, email, created_at) VALUES
   (1, 'John Doe', 'john@example.com', NOW()),
   (2, 'Jane Doe', 'jane@example.com', NOW());
   ```

#### Implementation Using Foreign Data Wrappers

Another approach is using Foreign Data Wrappers (FDW) and partitioning data across multiple servers:

1. **Create Foreign Server and User Mappings**:
   Set up foreign tables pointing to shards on other servers.
   ```sql
   CREATE EXTENSION postgres_fdw;

   CREATE SERVER shard1 FOREIGN DATA WRAPPER postgres_fdw OPTIONS (host 'shard1_host', dbname 'dbname', port '5432');
   CREATE USER MAPPING FOR CURRENT_USER SERVER shard1 OPTIONS (user 'username', password 'password');
   ```

2. **Create Foreign Tables**:
   Define foreign tables pointing to the remote shards.
   ```sql
   CREATE FOREIGN TABLE users_shard1 (
       id BIGINT,
       name TEXT,
       email TEXT,
       created_at TIMESTAMP
   ) SERVER shard1 OPTIONS (table_name 'users');
   ```

3. **Partition and Distribute Data**:
   Manage data placement by routing it to the appropriate shard based on business logic.

### 2. Table Partitioning in PostgreSQL

Partitioning is splitting a table into smaller, more manageable pieces within a single database. PostgreSQL natively supports partitioning using range, list, and hash partitioning methods.

#### Implementation of Range Partitioning

1. **Create the Partitioned Table**:
   Define a partitioned table using the `PARTITION BY` clause.
   ```sql
   CREATE TABLE orders (
       order_id BIGINT,
       customer_id BIGINT,
       order_date DATE,
       amount NUMERIC
   ) PARTITION BY RANGE (order_date);
   ```

2. **Create Partitions**:
   Create child tables (partitions) for specific date ranges.
   ```sql
   CREATE TABLE orders_2023 PARTITION OF orders FOR VALUES FROM ('2023-01-01') TO ('2023-12-31');
   CREATE TABLE orders_2024 PARTITION OF orders FOR VALUES FROM ('2024-01-01') TO ('2024-12-31');
   ```

3. **Insert Data**:
   Insert data, and PostgreSQL automatically routes it to the correct partition.
   ```sql
   INSERT INTO orders (order_id, customer_id, order_date, amount) VALUES
   (1, 101, '2023-06-15', 250.00),
   (2, 102, '2024-07-19', 150.00);
   ```

#### Implementation of List Partitioning

1. **Create the Partitioned Table**:
   ```sql
   CREATE TABLE employees (
       emp_id BIGINT,
       emp_name TEXT,
       emp_department TEXT
   ) PARTITION BY LIST (emp_department);
   ```

2. **Create Partitions**:
   ```sql
   CREATE TABLE employees_sales PARTITION OF employees FOR VALUES IN ('Sales');
   CREATE TABLE employees_hr PARTITION OF employees FOR VALUES IN ('HR');
   ```

3. **Insert Data**:
   Data is routed to the appropriate partition based on the department.
   ```sql
   INSERT INTO employees (emp_id, emp_name, emp_department) VALUES
   (1, 'Alice', 'Sales'),
   (2, 'Bob', 'HR');
   ```

#### Implementation of Hash Partitioning

1. **Create the Partitioned Table**:
   ```sql
   CREATE TABLE accounts (
       account_id BIGINT,
       account_name TEXT,
       balance NUMERIC
   ) PARTITION BY HASH (account_id);
   ```

2. **Create Partitions**:
   ```sql
   CREATE TABLE accounts_p0 PARTITION OF accounts FOR VALUES WITH (MODULUS 4, REMAINDER 0);
   CREATE TABLE accounts_p1 PARTITION OF accounts FOR VALUES WITH (MODULUS 4, REMAINDER 1);
   ```

3. **Insert Data**:
   PostgreSQL will hash the `account_id` to determine the partition.
   ```sql
   INSERT INTO accounts (account_id, account_name, balance) VALUES
   (100, 'Savings', 5000),
   (101, 'Checking', 1500);
   ```

Both sharding and partitioning help manage large datasets, but they serve different purposes. Sharding scales out by distributing across multiple instances, while partitioning organizes data within a single instance for performance and manageability.

---

### PostgreSQL Table Partitioning: In-Depth Guide

PostgreSQL’s built-in table partitioning is a powerful feature for managing large tables by dividing them into smaller, more manageable pieces, which are called partitions. The partitioning can be based on ranges, lists, or hash values of one or more columns. This can improve performance by allowing the database engine to perform operations on only the relevant partitions.

### 1. Partitioning Types in PostgreSQL

- **Range Partitioning**: Partitions are created based on ranges of values, typically used for date or numeric columns.
- **List Partitioning**: Partitions are created based on a list of discrete values, useful for categorical data.
- **Hash Partitioning**: Partitions are created based on the hash value of a column, providing an even distribution across partitions.

### 2. Creating and Managing Partitioned Tables

#### 2.1. Creating a Partitioned Table

To create a partitioned table, you use the `PARTITION BY` clause. Here’s a step-by-step implementation for each type:

##### **Range Partitioning**

Example: Partition a table `sales` by date:

1. **Create the Partitioned Table**:
   ```sql
   CREATE TABLE sales (
       sale_id SERIAL PRIMARY KEY,
       sale_date DATE NOT NULL,
       amount NUMERIC
   ) PARTITION BY RANGE (sale_date);
   ```

2. **Create Partitions**:
   Create partitions for different date ranges.
   ```sql
   CREATE TABLE sales_2023 PARTITION OF sales FOR VALUES FROM ('2023-01-01') TO ('2023-12-31');
   CREATE TABLE sales_2024 PARTITION OF sales FOR VALUES FROM ('2024-01-01') TO ('2024-12-31');
   ```

##### **List Partitioning**

Example: Partition an `employees` table by department:

1. **Create the Partitioned Table**:
   ```sql
   CREATE TABLE employees (
       emp_id SERIAL PRIMARY KEY,
       emp_name TEXT,
       emp_department TEXT
   ) PARTITION BY LIST (emp_department);
   ```

2. **Create Partitions**:
   Create partitions for specific departments.
   ```sql
   CREATE TABLE employees_sales PARTITION OF employees FOR VALUES IN ('Sales');
   CREATE TABLE employees_hr PARTITION OF employees FOR VALUES IN ('HR');
   CREATE TABLE employees_engineering PARTITION OF employees FOR VALUES IN ('Engineering');
   ```

##### **Hash Partitioning**

Example: Partition a table `accounts` by account ID using hash partitioning:

1. **Create the Partitioned Table**:
   ```sql
   CREATE TABLE accounts (
       account_id SERIAL PRIMARY KEY,
       account_name TEXT,
       balance NUMERIC
   ) PARTITION BY HASH (account_id);
   ```

2. **Create Partitions**:
   Create partitions that distribute rows evenly.
   ```sql
   CREATE TABLE accounts_p0 PARTITION OF accounts FOR VALUES WITH (MODULUS 4, REMAINDER 0);
   CREATE TABLE accounts_p1 PARTITION OF accounts FOR VALUES WITH (MODULUS 4, REMAINDER 1);
   CREATE TABLE accounts_p2 PARTITION OF accounts FOR VALUES WITH (MODULUS 4, REMAINDER 2);
   CREATE TABLE accounts_p3 PARTITION OF accounts FOR VALUES WITH (MODULUS 4, REMAINDER 3);
   ```

### 3. Inserting Data into Partitioned Tables

Inserting data into a partitioned table is similar to inserting into a regular table. PostgreSQL automatically routes the data to the correct partition based on the partition key.

```sql
-- For range partitioning
INSERT INTO sales (sale_date, amount) VALUES
('2023-06-15', 100.00), -- goes into sales_2023
('2024-01-20', 150.00); -- goes into sales_2024

-- For list partitioning
INSERT INTO employees (emp_name, emp_department) VALUES
('Alice', 'Sales'),        -- goes into employees_sales
('Bob', 'HR'),             -- goes into employees_hr
('Charlie', 'Engineering');-- goes into employees_engineering

-- For hash partitioning
INSERT INTO accounts (account_name, balance) VALUES
('Savings', 5000),  -- hash(account_id) % 4 determines the partition
('Checking', 1500);
```

### 4. Querying Partitioned Tables

PostgreSQL automatically optimizes queries on partitioned tables by scanning only the relevant partitions, a process known as "partition pruning."

#### Example Queries

1. **Range Partitioning**:
   ```sql
   -- This query scans only sales_2023
   SELECT * FROM sales WHERE sale_date BETWEEN '2023-01-01' AND '2023-12-31';
   ```

2. **List Partitioning**:
   ```sql
   -- This query scans only employees_sales
   SELECT * FROM employees WHERE emp_department = 'Sales';
   ```

3. **Hash Partitioning**:
   ```sql
   -- This query scans the appropriate partition based on account_id hash
   SELECT * FROM accounts WHERE account_id = 5;
   ```

### 5. Maintenance and Management of Partitions

Managing partitions involves adding, dropping, and altering partitions as data changes over time.

#### 5.1. Adding Partitions

Adding new partitions as data grows is straightforward:

```sql
-- Add a new partition for sales in 2025
CREATE TABLE sales_2025 PARTITION OF sales FOR VALUES FROM ('2025-01-01') TO ('2025-12-31');
```

#### 5.2. Dropping Partitions

Dropping a partition when it’s no longer needed:

```sql
-- Drop a partition
DROP TABLE sales_2023;
```

#### 5.3. Detaching Partitions

Detaching a partition to manage it independently or for archiving purposes:

```sql
-- Detach partition from main table
ALTER TABLE sales DETACH PARTITION sales_2024;
```

### 6. Best Practices

- **Choose Appropriate Partition Key**: The partition key should be chosen based on query patterns to maximize performance gains.
- **Avoid Too Many Partitions**: Having too many partitions can degrade performance. Keep the number of partitions manageable.
- **Monitor Partition Size**: Ensure partitions remain balanced and avoid hot partitions (i.e., partitions that receive disproportionate access).
- **Use Indexing**: Indexes on partitions can improve query performance but should be used judiciously, considering the maintenance cost.

### 7. Key Features

- **Automatic Partition Pruning**: PostgreSQL automatically prunes partitions during query execution, scanning only relevant partitions based on the partition key.
- **Partitioned Indexes**: Indexes can be defined on partitions individually or globally on the partitioned table.
- **Inheritance-Based Implementation**: Each partition is an actual table that inherits from the parent partitioned table, allowing for flexible configurations and unique constraints on partitions.

### Conclusion

PostgreSQL's built-in partitioning provides a robust and flexible way to manage large datasets, making queries more efficient and easier to maintain. By using range, list, or hash partitioning, you can optimize storage and performance to suit your application's needs. Regular maintenance, such as adding and removing partitions, is straightforward and helps keep the database performant as data grows over time.