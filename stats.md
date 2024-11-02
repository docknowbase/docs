To get statistics for all tables in a PostgreSQL database, including memory usage, rows, and size in GB or MB, you can use the following SQL queries:

### 1. **Get Statistics for All Tables**

```sql
SELECT 
    table_schema,
    table_name,
    pg_size_pretty(pg_total_relation_size(c.oid)) AS total_size,
    pg_size_pretty(pg_relation_size(c.oid)) AS table_size,
    pg_size_pretty(pg_indexes_size(c.oid)) AS index_size,
    c.reltuples AS row_estimate
FROM 
    pg_class c
LEFT JOIN 
    pg_namespace n ON n.oid = c.relnamespace
WHERE 
    c.relkind = 'r'
ORDER BY 
    total_size DESC;
```

This query retrieves the schema name, table name, total size (including indexes), table size (excluding indexes), index size, and estimated row count for all tables in the database[3][4].

### 2. **Get Statistics for a Single Table**

To get statistics for a single table, you can modify the previous query to filter by the table name:

```sql
SELECT 
    table_schema,
    table_name,
    pg_size_pretty(pg_total_relation_size(c.oid)) AS total_size,
    pg_size_pretty(pg_relation_size(c.oid)) AS table_size,
    pg_size_pretty(pg_indexes_size(c.oid)) AS index_size,
    c.reltuples AS row_estimate
FROM 
    pg_class c
LEFT JOIN 
    pg_namespace n ON n.oid = c.relnamespace
WHERE 
    c.relkind = 'r' AND table_name = 'your_table_name';
```

Replace `'your_table_name'` with the name of the table you want to query.

### 3. **Alternative Method Using `information_schema`**

You can also use `information_schema` to get table statistics, although it may be slower than using `pg_class` and `pg_namespace`:

```sql
SELECT 
    table_schema,
    table_name,
    pg_size_pretty(pg_total_relation_size(c.oid)) AS total_size,
    pg_size_pretty(pg_relation_size(c.oid)) AS table_size,
    pg_size_pretty(pg_indexes_size(c.oid)) AS index_size,
    c.reltuples AS row_estimate
FROM 
    information_schema.tables t
JOIN 
    pg_class c ON t.table_name = c.relname
JOIN 
    pg_namespace n ON n.oid = c.relnamespace
WHERE 
    t.table_type = 'BASE TABLE'
ORDER BY 
    total_size DESC;
```

### 4. **Using `pg_size_pretty` for Human-Readable Sizes**

The `pg_size_pretty` function is used to convert byte sizes to human-readable formats (e.g., MB, GB). This makes it easier to understand the size of each table[4].

### 5. **Running `ANALYZE` for Accurate Statistics**

To ensure accurate statistics, run the `ANALYZE` command periodically or after making significant changes to your tables. This updates the statistics stored in `pg_statistic`, which are used by the query planner to determine efficient execution plans[5].

By using these queries and maintaining up-to-date statistics with `ANALYZE`, you can effectively monitor and manage table sizes and performance in your PostgreSQL database.

