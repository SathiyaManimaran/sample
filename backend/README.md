# Task Manager API - Backend

Complete REST API for the Advanced Task Manager application.

## Features

- ✅ Create, Read, Update, Delete (CRUD) tasks
- ✅ Bulk sync operations
- ✅ Task filtering (completed, pending, high priority, overdue)
- ✅ Statistics endpoint
- ✅ CORS enabled for frontend integration
- ✅ JSON file-based storage (easily upgradeable to MongoDB/MySQL)

## Installation

1. **Install Node.js** (if not already installed)
   - Download from https://nodejs.org/

2. **Navigate to backend folder**
   ```bash
   cd d:\Sathiya\backend
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start the server**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

   Server will run on: `http://localhost:3000`

## API Endpoints

### Get All Tasks
```
GET /api/tasks
```
Returns all tasks stored in the database.

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1702473600000,
      "text": "Buy groceries",
      "priority": "high",
      "category": "Shopping",
      "dueDate": "2025-12-15",
      "completed": false,
      "createdAt": "2025-12-13T10:00:00.000Z",
      "updatedAt": "2025-12-13T10:00:00.000Z"
    }
  ]
}
```

### Get Single Task
```
GET /api/tasks/:id
```
Get a specific task by ID.

### Create New Task
```
POST /api/tasks
Content-Type: application/json

{
  "text": "Complete project report",
  "priority": "high",
  "category": "Work",
  "dueDate": "2025-12-20"
}
```

### Sync Multiple Tasks (Bulk Update)
```
POST /api/tasks/sync
Content-Type: application/json

{
  "tasks": [
    {
      "id": 1702473600000,
      "text": "Task 1",
      "priority": "high",
      "category": "Work",
      "dueDate": "2025-12-15",
      "completed": false
    }
  ]
}
```

### Update Task
```
PUT /api/tasks/:id
Content-Type: application/json

{
  "text": "Updated task",
  "priority": "medium",
  "category": "Personal",
  "dueDate": "2025-12-25",
  "completed": true
}
```

### Delete Task
```
DELETE /api/tasks/:id
```

### Clear All Completed Tasks
```
DELETE /api/tasks/completed/all
```

### Filter Tasks
```
GET /api/tasks/filter/pending
GET /api/tasks/filter/completed
GET /api/tasks/filter/high-priority
GET /api/tasks/filter/overdue
```

### Get Statistics
```
GET /api/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTasks": 10,
    "completedTasks": 3,
    "pendingTasks": 7,
    "highPriorityTasks": 2,
    "tasksByCategory": {
      "Work": 5,
      "Personal": 3,
      "Shopping": 2
    },
    "tasksByPriority": {
      "high": 2,
      "medium": 5,
      "low": 3
    }
  }
}
```

### Health Check
```
GET /api/health
```

## Using with Frontend

Update the frontend's `TaskManager.html` to use the API:

1. **Uncomment the fetch code** in the `syncToDB()` function
2. **Make sure the server is running** on `http://localhost:3000`
3. **Update the API_URL** if using a different port

## Upgrading to a Real Database

To use a real database instead of JSON file storage:

### With MongoDB:
```bash
npm install mongoose
```

Then replace the file operations with Mongoose models.

### With MySQL:
```bash
npm install mysql2 sequelize
```

### With SQLite:
```bash
npm install sqlite3
```

## Example cURL Commands

### Create a task
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"Learn Node.js\",\"priority\":\"high\",\"category\":\"Work\"}"
```

### Get all tasks
```bash
curl http://localhost:3000/api/tasks
```

### Update a task
```bash
curl -X PUT http://localhost:3000/api/tasks/1702473600000 \
  -H "Content-Type: application/json" \
  -d "{\"completed\":true}"
```

### Delete a task
```bash
curl -X DELETE http://localhost:3000/api/tasks/1702473600000
```

## Troubleshooting

**Port 3000 already in use:**
- Edit `server.js` and change `const PORT = 3000;` to a different port
- Update the frontend's `API_URL` variable accordingly

**CORS errors:**
- Make sure the frontend is running on a different origin
- CORS is already enabled in the server

**File not found errors:**
- Create the `tasks.json` file manually or the server will create it on first save

## License

MIT
