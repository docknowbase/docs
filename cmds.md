Here are some essential PostgreSQL commands for listing databases, tables, dumping data, and performing backups:

### 1. **Listing Databases and Tables**

- **List Databases:**
  Use the `\l` command in `psql` to list all databases.

  ```sql
  \l
  ```

  Alternatively, you can use a SQL query to list databases:

  ```sql
  SELECT * FROM pg_catalog.pg_database;
  ```

- **List Tables:**
  Use the `\dt` command in `psql` to list all tables in the current database.

  ```sql
  \dt
  ```

  Alternatively, you can use a SQL query to list tables:

  ```sql
  SELECT * FROM information_schema.tables WHERE table_schema = 'public';
  ```

### 2. **Dumping Data**

- **Dump Database:**
  Use `pg_dump` to dump a database into a SQL file.

  ```bash
  pg_dump -U username -d database_name > dump_file.sql
  ```

- **Dump All Databases:**
  Use `pg_dumpall` to dump all databases in a PostgreSQL cluster.

  ```bash
  pg_dumpall -U username > all_databases.sql
  ```

### 3. **Backup and Restore**

- **Backup Database:**
  Use `pg_dump` to create a backup of a database.

  ```bash
  pg_dump -U username -d database_name > backup_file.sql
  ```

- **Restore Database:**
  Use `psql` to restore a database from a backup file.

  ```bash
  psql -U username -d database_name < backup_file.sql
  ```

- **Backup All Databases:**
  Use `pg_dumpall` to create a backup of all databases in a PostgreSQL cluster.

  ```bash
  pg_dumpall -U username > all_databases_backup.sql
  ```

- **Restore All Databases:**
  Use `psql` to restore all databases from a backup file.

  ```bash
  psql -U username -f all_databases_backup.sql postgres
  ```

### 4. **Additional Commands**

- **Connect to Database:**
  Use `\c` to connect to a specific database in `psql`.

  ```sql
  \c database_name
  ```

- **Show Database Schema:**
  Use `\d` to show the schema of a database in `psql`.

  ```sql
  \d
  ```

- **Show Table Schema:**
  Use `\d table_name` to show the schema of a specific table in `psql`.

  ```sql
  \d table_name
  ```

### 5. **Scripting Backups**

- **Automated Backup Script:**
  Create a script to automate backups using `pg_dump` and `pg_dumpall`.

  ```bash
  #!/bin/bash
  datestamp=$(date +'%Y-%m-%d')
  timestamp=$(date +'%H%M')
  pg_dump -U "$PGUSER" -d "$PGDATABASE" > "$BACKUP_DIR/$PGDATABASE"_"$datestamp"_"$timestamp".sql
  ```

  Replace `$PGUSER`, `$PGDATABASE`, and `$BACKUP_DIR` with your actual values.

  Make the script executable and run it to automate backups.

  ```bash
  chmod +x backup_script.sh
  ./backup_script.sh
  ```

These commands and scripts help manage and maintain PostgreSQL databases by listing databases and tables, dumping data, performing backups, and restoring databases.

---

