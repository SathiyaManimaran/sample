# Task Manager - MySQL Setup Guide

## Prerequisites

1. **MySQL Server** - Download and install from https://dev.mysql.com/downloads/mysql/
2. **Node.js** - Already installed
3. **MySQL Workbench** (optional) - For visual database management

## Installation Steps

### Step 1: Install MySQL Server

**Windows:**
1. Download MySQL installer from https://dev.mysql.com/downloads/mysql/
2. Run the installer
3. Choose "Developer Default" setup
4. Complete the installation
5. During setup, note your password for `root` user

**macOS (using Homebrew):**
```bash
brew install mysql
brew services start mysql
```

**Linux (Ubuntu):**
```bash
sudo apt-get install mysql-server
sudo mysql_secure_installation
```

### Step 2: Create Database

Open MySQL Command Line Client or MySQL Workbench:

```sql
CREATE DATABASE task_manager_db;
```

### Step 3: Update Backend Configuration

Create a `.env` file in `d:\Sathiya\backend\`:

```env
# MySQL Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=task_manager_db
DB_USER=root
DB_PASSWORD=your_mysql_password

# Server
PORT=3000
NODE_ENV=development
```

Replace `your_mysql_password` with the password you set during MySQL installation.

### Step 4: Install New Dependencies

```bash
cd d:\Sathiya\backend
npm install
```

This will install:
- `mysql2` - MySQL driver
- `sequelize` - ORM for database operations
- `dotenv` - Environment variables

### Step 5: Sync Database Schema

Create the `tasks` table:

```bash
npm run sync-db
```

You should see:
```
✅ Database synced successfully!
```

### Step 6: Start the Server

```bash
npm start
```

You should see:
```
✅ MySQL connection established successfully!
Task Manager API running on http://localhost:3000
```

## Verify MySQL Connection

### Using MySQL Command Line:

```bash
mysql -u root -p
```

Enter your password, then:

```sql
USE task_manager_db;
SHOW TABLES;
DESCRIBE tasks;
SELECT * FROM tasks;
```

### Using MySQL Workbench:

1. Open MySQL Workbench
2. Create connection to localhost
3. Navigate to `task_manager_db` database
4. View `tasks` table

### Using Browser:

1. Open `http://localhost:3000/api/tasks`
2. All tasks from MySQL will be returned as JSON

## Database Schema

The `tasks` table has these columns:

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Unique task identifier (Primary Key) |
| text | VARCHAR(500) | Task description |
| priority | ENUM | 'low', 'medium', or 'high' |
| category | VARCHAR(50) | Task category |
| dueDate | DATE | Due date |
| completed | BOOLEAN | Completion status |
| createdAt | DATETIME | Creation timestamp |
| updatedAt | DATETIME | Last update timestamp |

## Using the Application

1. **Open Frontend:** `d:\Sathiya\JS\TaskManager.html`
2. **Add tasks** in the UI
3. **Click "☁️ Sync to DB"** to save to MySQL
4. **Refresh browser** - Tasks persist from MySQL
5. **Check database** - All data in `task_manager_db.tasks` table

## API Endpoints

All endpoints now use MySQL database:

```
GET    /api/tasks              - Get all tasks
GET    /api/tasks/:id          - Get single task
POST   /api/tasks              - Create task
PUT    /api/tasks/:id          - Update task
DELETE /api/tasks/:id          - Delete task
GET    /api/stats              - Get statistics
GET    /api/tasks/filter/:type - Filter tasks
```

## Troubleshooting

### Error: "Access denied for user 'root'@'localhost'"
- Wrong password in `.env` file
- Check MySQL password
- Update `DB_PASSWORD` in `.env`

### Error: "Unknown database 'task_manager_db'"
- Database not created
- Run: `mysql -u root -p < setup.sql`
- Or create manually in MySQL Workbench

### Error: "connect ECONNREFUSED 127.0.0.1:3306"
- MySQL server not running
- Start MySQL:
  - **Windows:** Services > Start "MySQL80" (or your version)
  - **macOS:** `brew services start mysql`
  - **Linux:** `sudo systemctl start mysql`

### Error: "PROTOCOL_CONNECTION_LOST"
- MySQL connection timeout
- Increase connection pool timeout in `database.js`

## Next Steps

### Upgrade to Production

1. Use strong passwords
2. Enable SSL/TLS encryption
3. Use environment variables for secrets
4. Add database backups
5. Use connection pooling

### Add User Authentication

```javascript
// Add users table
const User = sequelize.define('User', {
  username: DataTypes.STRING,
  email: DataTypes.STRING,
  password: DataTypes.STRING,
});
```

### Add Task Sharing

```javascript
// Tasks belong to users
Task.belongsTo(User);
User.hasMany(Task);
```

## Useful MySQL Commands

```sql
-- View all databases
SHOW DATABASES;

-- Switch to task database
USE task_manager_db;

-- View all tables
SHOW TABLES;

-- View table structure
DESCRIBE tasks;

-- View all tasks
SELECT * FROM tasks;

-- View high priority tasks
SELECT * FROM tasks WHERE priority = 'high';

-- View pending tasks
SELECT * FROM tasks WHERE completed = false;

-- Count completed tasks
SELECT COUNT(*) FROM tasks WHERE completed = true;

-- Delete all tasks
DELETE FROM tasks;

-- Drop database
DROP DATABASE task_manager_db;
```

## File Structure

```
d:\Sathiya\backend\
├── server.js              (Updated for MySQL)
├── package.json           (With mysql2, sequelize)
├── .env                   (Database credentials)
├── config/
│   ├── database.js        (MySQL connection)
│   └── sync-db.js         (Create tables)
├── models/
│   └── Task.js            (Task model)
└── tasks.json             (Old - no longer used)
```

---

**Your application is now connected to MySQL! 🎉**
