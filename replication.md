PostgreSQL offers two main types of replication: physical (streaming) replication and logical replication. Each type serves different purposes and has its own set of use cases.

### Physical Replication
Physical replication involves copying the entire database cluster, including all data and configuration, from a primary server to one or more standby servers. This method ensures that the standby servers are identical to the primary server and can be used for high availability and disaster recovery.

**Key Points:**
- **Use Cases:** High availability, disaster recovery, and read-only operations on replicas.
- **Pros:** Easy to implement, ensures data consistency, and ideal for large volumes of data.
- **Cons:** Bandwidth-intensive, does not offer multi-master database replication.

**Example Setup:**
1. **Primary Server Configuration:**
   - Edit `postgresql.conf` to set `wal_level = hot_standby`, `archive_mode = on`, and `archive_command = 'test ! -f /var/lib/postgresql/12/main/archive/%f && cp %p /var/lib/postgresql/12/main/archive/%f'`.
   - Restart PostgreSQL service.

2. **Standby Server Configuration:**
   - Stop PostgreSQL service.
   - Remove existing PostgreSQL data directory.
   - Use `pg_basebackup` to create a base backup from the primary server.
   - Create a `recovery.conf` file with `standby_mode = 'on'`, `primary_conninfo = 'host=primary_server_ip port=5432 user=replication_user password=replication_password'`, and `trigger_file = '/tmp/postgresql.trigger'`.
   - Start PostgreSQL service.

3. **Verification:**
   - On the primary server, run `SELECT client_addr, state FROM pg_stat_replication;` to verify the replication status.

### Logical Replication
Logical replication allows for fine-grained control over data replication, enabling the replication of specific tables or databases. This method is useful for scenarios where not all data needs to be replicated.

**Key Points:**
- **Use Cases:** Selective data replication, cross-version replication, and multi-master replication.
- **Pros:** Flexible, allows for selective replication, and supports cross-version and cross-platform replication.
- **Cons:** More complex to set up compared to physical replication.

**Example Setup:**
1. **Publisher Configuration:**
   - Create a publication on the primary server:
     ```sql
     CREATE PUBLICATION my_pub FOR TABLE my_table;
     ```
   - Ensure `wal_level = logical` in `postgresql.conf`.

2. **Subscriber Configuration:**
   - Create a subscription on the standby server:
     ```sql
     CREATE SUBSCRIPTION my_sub CONNECTION 'host=primary_server_ip port=5432 dbname=my_database user=replication_user password=replication_password' PUBLICATION my_pub;
     ```
   - Ensure the table exists on the standby server with the same schema as on the primary server.

3. **Verification:**
   - On the standby server, query the replicated table to verify the data:
     ```sql
     SELECT * FROM my_table;
     ```

### Code Examples
#### Physical Replication Example
**Primary Server:**
```sql
-- Edit postgresql.conf
wal_level = hot_standby
archive_mode = on
archive_command = 'test ! -f /var/lib/postgresql/12/main/archive/%f && cp %p /var/lib/postgresql/12/main/archive/%f'

-- Restart PostgreSQL service
sudo service postgresql restart
```

**Standby Server:**
```bash
-- Stop PostgreSQL service
sudo service postgresql stop

-- Remove existing PostgreSQL data directory
sudo rm -rf /var/lib/postgresql/12/main

-- Create base backup
pg_basebackup -h primary_server_ip -U replication_user -D /var/lib/postgresql/12/main

-- Create recovery.conf
echo "standby_mode = 'on'" >> /var/lib/postgresql/12/main/recovery.conf
echo "primary_conninfo = 'host=primary_server_ip port=5432 user=replication_user password=replication_password'" >> /var/lib/postgresql/12/main/recovery.conf
echo "trigger_file = '/tmp/postgresql.trigger'" >> /var/lib/postgresql/12/main/recovery.conf

-- Start PostgreSQL service
sudo service postgresql start
```

#### Logical Replication Example
**Primary Server:**
```sql
-- Create publication
CREATE PUBLICATION my_pub FOR TABLE my_table;

-- Ensure wal_level = logical in postgresql.conf
wal_level = logical
```

**Standby Server:**
```sql
-- Create subscription
CREATE SUBSCRIPTION my_sub CONNECTION 'host=primary_server_ip port=5432 dbname=my_database user=replication_user password=replication_password' PUBLICATION my_pub;

-- Create table with the same schema
CREATE TABLE my_table (id INTEGER NOT NULL PRIMARY KEY, data TEXT);
```

### References
- **PostgreSQL Documentation:** [Logical Replication][1]
- **Kinsta:** [PostgreSQL Replication: A Comprehensive Guide][2]
- **Microsoft Learn:** [Logical replication - Azure Database for PostgreSQL][3]
- **EnterpriseDB:** [Logical Replication in PostgreSQL Explained][6], [PostgreSQL Replication and Automatic Failover Tutorial][8]

### Note
The examples provided are simplified and intended for educational purposes. In a production environment, additional considerations such as security, performance, and monitoring should be taken into account.

---

### Logical Replication vs. Physical Replication in PostgreSQL

**Logical Replication:**
- **Definition:** Logical replication operates at a logical level, replicating specific tables, databases, or even individual rows based on defined replication rules[3][4].
- **Key Features:**
  - **Selective Replication:** Allows for granular control over the replicated data, enabling the selection of specific tables, databases, or even filtering rows[3][4].
  - **Cross-Version Compatibility:** Supports replication between different PostgreSQL major versions, facilitating easier version upgrades and migrations[1][3].
  - **Multi-Master Replication:** Enables multiple primary servers, allowing write operations on any of the replica servers[3][4].
- **Use Cases:**
  - **Data Migration:** Ideal for zero-downtime data migrations, especially when upgrading or migrating databases[2][6].
  - **Data Sharing:** Useful for sharing specific datasets among multiple databases or for aggregating multiple databases into a centralized one[6][7].
  - **Cross-Platform Replication:** Enables replication between PostgreSQL instances on diverse platforms, such as Linux to Windows[1][6].

**Physical Replication:**
- **Definition:** Physical replication involves copying the entire database cluster, including all data and configuration, from a primary server to one or more standby servers[3][4].
- **Key Features:**
  - **High Data Consistency:** Ensures that the standby servers are identical to the primary server, ideal for high availability and disaster recovery[3][4].
  - **Byte-for-Byte Copy:** Sends changes at nearly disk block level, including all database contents, index entries, and vacuum data[3][4].
- **Use Cases:**
  - **High Availability:** Suitable for maintaining high-availability replicas for fault-tolerance and read scalability[3][4].
  - **Disaster Recovery:** Ideal for creating a complete copy of the database cluster for disaster recovery purposes[3][4].

### Setting Up Logical Replication in PostgreSQL

1. **Create Publication:**
   - On the primary server, create a publication for the tables you want to replicate:
     ```sql
     CREATE PUBLICATION my_pub FOR TABLE my_table;
     ```
2. **Create Subscription:**
   - On the standby server, create a subscription to the publication:
     ```sql
     CREATE SUBSCRIPTION my_sub CONNECTION 'host=primary_server_ip port=5432 dbname=my_database user=replication_user password=replication_password' PUBLICATION my_pub;
     ```
3. **Verify Replication:**
   - On the standby server, query the replicated table to verify the data:
     ```sql
     SELECT * FROM my_table;
     ```

### Handling Conflicts in Logical Replication

- **Conflict Detection and Resolution:** PostgreSQL logs conflict events in the `pg_stat_replication` view. Regular monitoring of this view can help identify conflicts early. Resolving conflicts usually requires manual intervention, such as deciding which version of the conflicting row should prevail[5].
- **Row-Level Conflict Avoidance:** Design application logic to minimize conflict chances, such as using UUIDs instead of sequential IDs to reduce key conflicts[5].
- **Use Extensions for Conflict Handling:** Extensions like BDR (Bi-Directional Replication) provide mechanisms to automatically resolve certain types of conflicts[5].

### Benefits of Logical Replication for Data Migration

- **Zero Downtime:** Logical replication enables zero-downtime migrations by replicating data incrementally and selectively[2][6].
- **Flexibility:** Allows for granular control over the replicated data, making it easier to manage complex data migrations[2][6].
- **Cross-Version Compatibility:** Facilitates replication between different PostgreSQL major versions, reducing downtime for migrations and upgrades[1][6].

---

### Limitations of Logical Replication in PostgreSQL

1. **Data Types and Objects:**
   - Logical replication is restricted to table data and does not replicate other database objects like roles, sequences, or schema changes[6][7].
   - It cannot replicate data definition language (DDL) operations, such as index creation, tablespace alterations, vacuum, or altering the data type of a column[6][7].

2. **Replication Identity:**
   - Tables being replicated logically must have a primary key or a replica identity set[6].
   - Replica identity can be set to `full`, but this is inefficient and should be used as a last resort[7].

3. **Conflict Management:**
   - Logical replication does not resolve conflicts that may arise due to concurrent writes on the primary and the replica. Conflict management has to be handled externally[6].

4. **Performance:**
   - Logical replication can introduce additional load on the primary database because it needs to transform WAL records into logical change records, which can be resource-intensive[6].
   - In cases of subscriber downtime, this can lead to increased disk space usage on the primary server due to the accumulation of WAL logs[6].

### Handling Data Consistency in Logical Replication

- **Transactional Consistency:** Logical replication ensures transactional consistency by applying changes in the same order as they occur on the publisher, guaranteeing that the subscriber remains in sync with the publisher[2][7].
- **Real-Time Synchronization:** Logical replication supports real-time data synchronization by continuously sending changes from the publisher to the subscriber as they occur[2][7].

### Real-Time Data Synchronization with Logical Replication

- **Real-Time Updates:** Logical replication can be used for real-time data synchronization by continuously sending changes from the publisher to the subscriber as they occur[2][7].
- **Use Cases:** It is particularly useful for scenarios requiring real-time data updates, such as consolidating multiple databases into a single one for analytical purposes or replicating between PostgreSQL instances on different platforms[2][4].

### Performance Implications of Logical Replication

- **Resource Intensity:** Logical replication can introduce additional load on the primary database because it needs to transform WAL records into logical change records, which can be resource-intensive[6].
- **Bandwidth Efficiency:** However, logical replication optimizes data transfer by filtering and transmitting only the required data, reducing bandwidth and storage needs compared to physical replication[6][7].

### Managing Data Security and Privacy in Logical Replication

- **Fine-Grained Control:** Logical replication provides fine-grained control over both data replication and security, allowing for selective replication of specific tables or rows[2][7].
- **Security Considerations:** It is essential to ensure that the replication process complies with data privacy regulations, such as replicating non-sensitive data to subscribers outside specific regions while keeping sensitive data within[6].

---

### Common Pitfalls in Implementing Logical Replication in PostgreSQL

1. **Schema Changes:**
   - Logical replication does not replicate schema changes. Manual intervention is required to apply schema changes on both the publisher and subscriber databases[5][8].
   - **Solution:** Use tools or scripts to automate schema synchronization between the publisher and subscriber.

2. **LSNs Overlap:**
   - Logical Sequence Numbers (LSNs) can overlap between transactions, causing issues in replication[5].
   - **Solution:** Use `recovery_target_lsn` to ensure that the physical replica catches up to the specific LSN of the logical slot[1].

3. **TOASTed Values:**
   - Accessing TOASTed values can be problematic in logical replication[5].
   - **Solution:** Ensure that the subscriber database is configured to handle TOASTed values correctly.

4. **Row Identifier Permutations:**
   - Different row identifier permutations can cause issues in logical replication[5].
   - **Solution:** Use consistent row identifiers across the publisher and subscriber databases.

### Handling Data Conflicts in Logical Replication

1. **Conflict Detection and Resolution:**
   - PostgreSQL logs conflict events in the `pg_stat_replication` view. Regular monitoring can help identify conflicts early. Resolving conflicts usually requires manual intervention[3].
   - **Example:**
     ```sql
     SELECT * FROM pg_stat_replication;
     ```

2. **Row-Level Conflict Avoidance:**
   - Design application logic to minimize conflict chances, such as using UUIDs instead of sequential IDs[3].
   - **Example:**
     ```sql
     CREATE TABLE my_table (
       id UUID PRIMARY KEY,
       data TEXT
     );
     ```

3. **Use Extensions for Conflict Handling:**
   - Extensions like BDR (Bi-Directional Replication) provide mechanisms to automatically resolve certain types of conflicts[3].
   - **Example:**
     ```sql
     CREATE EXTENSION bdr;
     ```

### Improvements in PostgreSQL 16

1. **Binary Format Initial Table Synchronization:**
   - PostgreSQL 16 allows initial table synchronization in binary format, providing a quicker and more effective method to copy rows during the initial synchronization[4].
   - **Example:**
     ```sql
     CREATE PUBLICATION my_pub WITH (format = 'binary');
     ```

### Major Version Replication Support

1. **Cross-Version Replication:**
   - Logical replication supports replicating between different major versions of PostgreSQL[2].
   - **Example:**
     ```sql
     CREATE PUBLICATION my_pub FOR TABLE my_table;
     CREATE SUBSCRIPTION my_sub CONNECTION 'host=primary_server_ip port=5432 dbname=my_database user=replication_user password=replication_password' PUBLICATION my_pub;
     ```

### Best Practices for Configuring Logical Replication

1. **Publisher Settings:**
   - Set `wal_level` to `logical`, `max_replication_slots` to accommodate at least the number of subscriptions, and `max_wal_senders` to accommodate `max_replication_slots` and physical replicas[7].
   - **Example:**
     ```sql
     ALTER SYSTEM SET wal_level = 'logical';
     ALTER SYSTEM SET max_replication_slots = 10;
     ALTER SYSTEM SET max_wal_senders = 10;
     ```

2. **Subscriber Settings:**
   - Set `max_replication_slots` to accommodate the least number of subscriptions, `max_logical_replication_workers` to accommodate at least the number of subscriptions, and `max_worker_processes` to at least `max_logical_replication_workers + 1`[7].
   - **Example:**
     ```sql
     ALTER SYSTEM SET max_replication_slots = 10;
     ALTER SYSTEM SET max_logical_replication_workers = 10;
     ALTER SYSTEM SET max_worker_processes = 11;
     ```

3. **Monitoring Replication Slots:**
   - Regularly monitor and clean up inactive replication slots to prevent accumulation of WAL files[9].
   - **Example:**
     ```sql
     SELECT slot_name FROM pg_replication_slots WHERE active = 'f';
     SELECT pg_drop_replication_slot('slot_name');
     ```

---

### Minimizing Data Conflicts in Logical Replication Setups

1. **Conflict Detection and Resolution:**
   - Regularly monitor the `pg_stat_replication` view to identify conflicts early. Resolving conflicts usually requires manual intervention, such as deciding which version of the conflicting row should prevail[2][5].
   - **Example:**
     ```sql
     SELECT * FROM pg_stat_replication;
     ```

2. **Row-Level Conflict Avoidance:**
   - Design application logic to minimize conflict chances, such as using UUIDs instead of sequential IDs to reduce key conflicts, or partitioning data to isolate writes[2][5].
   - **Example:**
     ```sql
     CREATE TABLE my_table (
       id UUID PRIMARY KEY,
       data TEXT
     );
     ```

3. **Use Extensions for Conflict Handling:**
   - Extensions like BDR (Bi-Directional Replication) provide mechanisms to automatically resolve certain types of conflicts, though they may require careful configuration and understanding of the trade-offs involved[2].

### Best Strategies for Handling Conflicts in Logical Replication

1. **Preventive Measures:**
   - Ensure synchronous commit by setting `synchronous_commit` to `on` or `remote_apply` to minimize potential conflicts[2].
   - **Example:**
     ```sql
     ALTER SYSTEM SET synchronous_commit = 'on';
     ```

2. **Promotion and Timeline Switching:**
   - Use tools like PgBouncer for connection pooling and redirection to prevent split-brain scenarios when promoting a standby to a primary[2].

3. **Conflict Resolution:**
   - Regularly monitor and manually resolve conflicts by examining the `pg_stat_replication` view and deciding which version of the conflicting row should prevail[2][5].

### PostgreSQL 16 Improvements in Conflict Resolution

1. **Logical Decoding on Standbys:**
   - PostgreSQL 16 introduces the ability to create logical replication slots on standby nodes, reducing the workload on the primary server and improving conflict resolution[3].
   - **Example:**
     ```sql
     SELECT * FROM pg_create_logical_replication_slot('slot1', 'pgoutput');
     ```

2. **Parallel Apply Workers:**
   - PostgreSQL 16 supports parallel apply workers, enhancing the efficiency of logical replication and reducing the likelihood of conflicts[3].

### Key Differences Between Logical and Physical Replication

1. **Replication Level:**
   - **Logical Replication:** Operates at a logical level, replicating specific tables, databases, or even individual rows based on defined replication rules[1][4].
   - **Physical Replication:** Provides a byte-for-byte copy of the entire database, ensuring high data consistency but not supporting replication at the row level or between different PostgreSQL versions[1][4].

2. **Flexibility and Control:**
   - **Logical Replication:** Offers more flexibility and control over the replicated data, allowing for selective replication and cross-version compatibility[1][4].
   - **Physical Replication:** Provides a simpler and more efficient method for high availability and disaster recovery, but lacks the granularity of logical replication[1][4].

### Monitoring Logical Replication Conflicts

1. **Regular Monitoring:**
   - Regularly monitor the `pg_stat_replication` view to identify conflicts early and take appropriate action[2][5].
   - **Example:**
     ```sql
     SELECT * FROM pg_stat_replication;
     ```

2. **Alert Systems:**
   - Implement alert systems to notify administrators of potential conflicts, ensuring prompt resolution and minimizing data inconsistencies[2][5].

By following these strategies and understanding the improvements in PostgreSQL 16, you can effectively minimize and manage data conflicts in logical replication setups.

---

### Preventive Measures for Minimizing Conflicts in Logical Replication

1. **Row-Level Conflict Avoidance:**
   - Design application logic to minimize conflict chances by using UUIDs instead of sequential IDs to reduce key conflicts, or partition data to isolate writes.
   - **Example:**
     ```sql
     CREATE TABLE my_table (
       id UUID PRIMARY KEY,
       data TEXT
     );
     ```
   - This approach helps in reducing conflicts by ensuring that each row has a unique identifier that is less likely to be duplicated across different locations[1][3].

2. **Use Extensions for Conflict Handling:**
   - Extensions like BDR (Bi-Directional Replication) provide mechanisms to automatically resolve certain types of conflicts, though they may require careful configuration and understanding of the trade-offs involved.
   - **Example:**
     ```sql
     CREATE EXTENSION bdr;
     ```
   - BDR offers advanced conflict resolution techniques, including column-level conflict resolution and conflict-free replicated data types (CRDTs)[2][4].

3. **Regular Monitoring:**
   - Regularly monitor the `pg_stat_replication` view to identify conflicts early. Resolving conflicts usually requires manual intervention.
   - **Example:**
     ```sql
     SELECT * FROM pg_stat_replication;
     ```
   - This helps in detecting conflicts promptly and taking appropriate action to resolve them[1][3].

### Automating Conflict Detection and Resolution

1. **Custom Conflict Resolution Techniques:**
   - Use triggers activated when a conflict is detected to implement custom conflict resolution techniques.
   - **Example:**
     ```sql
     CREATE TRIGGER conflict_resolution_trigger
     AFTER INSERT OR UPDATE ON my_table
     FOR EACH ROW
     EXECUTE FUNCTION resolve_conflict();
     ```
   - This approach allows for automated conflict resolution tailored to specific application needs[2].

2. **BDR Conflict Resolution:**
   - BDR provides automatic conflict resolution mechanisms, including last-update-wins and CRDTs.
   - **Example:**
     ```sql
     CREATE TABLE my_table (
       id UUID PRIMARY KEY,
       data TEXT,
       CONSTRAINT my_table_crdt CHECK (data IS NOT NULL)
     );
     ```
   - BDR’s conflict resolution mechanisms help in ensuring data consistency across the cluster[2][4].

### Logical Replication Slots in Conflict Management

1. **Logical Replication Slots:**
   - Logical replication slots are crucial for managing conflicts by allowing for selective data replication and providing a mechanism to track and resolve conflicts.
   - **Example:**
     ```sql
     SELECT * FROM pg_create_logical_replication_slot('slot1', 'pgoutput');
     ```
   - This helps in managing conflicts by providing a clear view of the replication process and allowing for targeted intervention[3].

### Use of UUIDs in Reducing Key Conflicts

1. **UUIDs for Conflict Reduction:**
   - Using UUIDs instead of sequential IDs helps in reducing key conflicts by ensuring that each row has a unique identifier that is less likely to be duplicated across different locations.
   - **Example:**
     ```sql
     CREATE TABLE my_table (
       id UUID PRIMARY KEY,
       data TEXT
     );
     ```
   - This approach is effective in minimizing conflicts by reducing the likelihood of key collisions[1][3].

### Advantages of Using BDR for Conflict Handling

1. **Advanced Conflict Resolution:**
   - BDR provides advanced conflict resolution mechanisms, including column-level conflict resolution and CRDTs, which help in ensuring data consistency across the cluster.
   - **Example:**
     ```sql
     CREATE EXTENSION bdr;
     ```
   - BDR’s conflict resolution mechanisms are particularly useful in complex replication scenarios where traditional conflict resolution methods may not suffice[2][4].

By implementing these strategies, you can effectively minimize and manage conflicts in logical replication setups.

---

### Implementing UUIDs to Reduce Key Conflicts

1. **Using UUIDs:**
   - UUIDs (Universally Unique Identifiers) are designed to be unique across different systems and databases, reducing the likelihood of key conflicts.
   - **Example:**
     ```sql
     CREATE TABLE my_table (
       id UUID PRIMARY KEY,
       data TEXT
     );
     ```
   - This approach helps in minimizing conflicts by ensuring that each row has a unique identifier that is less likely to be duplicated across different locations.

2. **Generating UUIDs:**
   - PostgreSQL provides the `gen_random_uuid()` function to generate UUIDs.
   - **Example:**
     ```sql
     SELECT gen_random_uuid();
     ```
   - This function can be used to automatically generate UUIDs for new rows.

3. **Default UUID Generation:**
   - You can set a default value for a UUID column using the `gen_random_uuid()` function.
   - **Example:**
     ```sql
     CREATE TABLE my_table (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       data TEXT
     );
     ```
   - This ensures that every new row inserted into the table will have a unique UUID generated automatically.

### Benefits of Using BDR for Conflict Resolution

1. **Advanced Conflict Resolution:**
   - BDR (Bi-Directional Replication) provides advanced conflict resolution mechanisms, including column-level conflict resolution and conflict-free replicated data types (CRDTs).
   - **Example:**
     ```sql
     CREATE EXTENSION bdr;
     ```
   - BDR’s conflict resolution mechanisms are particularly useful in complex replication scenarios where traditional conflict resolution methods may not suffice.

2. **Multi-Master Replication:**
   - BDR supports multi-master replication, allowing write operations on any of the replica servers.
   - **Example:**
     ```sql
     CREATE TABLE my_table (
       id UUID PRIMARY KEY,
       data TEXT
     );
     ```
   - This capability is essential for scenarios where multiple locations need to perform write operations independently.

### Logical Replication Slots in Conflict Management

1. **Logical Replication Slots:**
   - Logical replication slots are placeholders that retain a copy of replicated data even if the subscriber is not actively consuming it.
   - **Example:**
     ```sql
     SELECT * FROM pg_create_logical_replication_slot('slot1', 'pgoutput');
     ```
   - This helps in managing conflicts by ensuring that the primary server keeps track of the replication progress and avoids overwriting data that has not been consumed by the subscriber yet.

### Common Challenges in Logical Replication Conflict Resolution

1. **Conflict Detection and Resolution:**
   - Regular monitoring of the `pg_stat_replication` view is necessary to identify conflicts early. Resolving conflicts usually requires manual intervention.
   - **Example:**
     ```sql
     SELECT * FROM pg_stat_replication;
     ```
   - This helps in detecting conflicts promptly and taking appropriate action to resolve them.

2. **Row-Level Conflict Avoidance:**
   - Design application logic to minimize conflict chances by using UUIDs instead of sequential IDs to reduce key conflicts, or partition data to isolate writes.
   - **Example:**
     ```sql
     CREATE TABLE my_table (
       id UUID PRIMARY KEY,
       data TEXT
     );
     ```
   - This approach helps in reducing conflicts by ensuring that each row has a unique identifier that is less likely to be duplicated across different locations.

### BDR Conflict Handling

1. **BDR Conflict Resolution:**
   - BDR provides advanced conflict resolution mechanisms, including column-level conflict resolution and CRDTs.
   - **Example:**
     ```sql
     CREATE EXTENSION bdr;
     ```
   - BDR’s conflict resolution mechanisms are particularly useful in complex replication scenarios where traditional conflict resolution methods may not suffice.

2. **Differences from Other Replication Methods:**
   - Unlike other replication methods, BDR supports multi-master replication and provides more granular control over conflict resolution.
   - **Example:**
     ```sql
     CREATE TABLE my_table (
       id UUID PRIMARY KEY,
       data TEXT
     );
     ```
   - This capability is essential for scenarios where multiple locations need to perform write operations independently.

### References
- **PostgreSQL Documentation:** [Logical Replication][1]
- **Heatware:** [PostgreSQL: Physical vs Logical Replication (w/ TL;DR)][2]
- **PostgreSQL Tutorial:** [PostgreSQL UUID Data Type][3]
- **DragonflyDB:** [How do you handle replication conflicts in PostgreSQL?][4]
- **EnterpriseDB:** [PostgreSQL Logical Replication: Advantages, EDB's Contributions and PG 16 Enhancements][5]

