require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const Task = require('./models/Task');
const { Op } = require('sequelize');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Sync database on startup
(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Database schema synced');
  } catch (error) {
    console.error('❌ Error syncing database:', error);
  }
})();

// GET all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message
    });
  }
});

// GET single task by ID
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching task',
      error: error.message
    });
  }
});

// POST - Create new task
app.post('/api/tasks', async (req, res) => {
  try {
    const { text, priority, category, dueDate } = req.body;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Task text is required'
      });
    }
    
    const newTask = await Task.create({
      text: text.trim(),
      priority: priority || 'medium',
      category: category || null,
      dueDate: dueDate || null,
      completed: false
    });
    
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: newTask
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating task',
      error: error.message
    });
  }
});

// POST - Sync multiple tasks (bulk update)
app.post('/api/tasks/sync', async (req, res) => {
  try {
    const { tasks } = req.body;
    
    if (!Array.isArray(tasks)) {
      return res.status(400).json({
        success: false,
        message: 'Tasks must be an array'
      });
    }
    
    // Delete all existing tasks and insert new ones
    await Task.truncate();
    
    const syncedTasks = await Task.bulkCreate(tasks);
    
    res.json({
      success: true,
      message: 'Tasks synced successfully',
      count: syncedTasks.length,
      data: syncedTasks
    });
  } catch (error) {
    console.error('Error syncing tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error syncing tasks',
      error: error.message
    });
  }
});

// PUT - Update task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { text, priority, category, dueDate, completed } = req.body;
    
    const task = await Task.findByPk(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    // Update fields
    if (text !== undefined) task.text = text;
    if (priority !== undefined) task.priority = priority;
    if (category !== undefined) task.category = category;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (completed !== undefined) task.completed = completed;
    
    await task.save();
    
    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task',
      error: error.message
    });
  }
});

// DELETE - Delete task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    await task.destroy();
    
    res.json({
      success: true,
      message: 'Task deleted successfully',
      data: task
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: error.message
    });
  }
});

// DELETE - Clear all completed tasks
app.delete('/api/tasks/completed/all', async (req, res) => {
  try {
    const deletedCount = await Task.destroy({
      where: { completed: true }
    });
    
    const remainingCount = await Task.count();
    
    res.json({
      success: true,
      message: 'Completed tasks cleared',
      deletedCount: deletedCount,
      remainingCount: remainingCount
    });
  } catch (error) {
    console.error('Error clearing completed tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing completed tasks',
      error: error.message
    });
  }
});

// GET - Tasks by filter
app.get('/api/tasks/filter/:type', async (req, res) => {
  try {
    const type = req.params.type;
    let whereClause = {};
    
    switch(type) {
      case 'completed':
        whereClause = { completed: true };
        break;
      case 'pending':
        whereClause = { completed: false };
        break;
      case 'high-priority':
        whereClause = { priority: 'high' };
        break;
      case 'overdue':
        const today = new Date().toISOString().split('T')[0];
        whereClause = {
          dueDate: { [Op.lt]: today },
          completed: false
        };
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid filter type'
        });
    }
    
    const filtered = await Task.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      filter: type,
      count: filtered.length,
      data: filtered
    });
  } catch (error) {
    console.error('Error filtering tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error filtering tasks',
      error: error.message
    });
  }
});

// GET - Statistics
app.get('/api/stats', async (req, res) => {
  try {
    const totalTasks = await Task.count();
    const completedTasks = await Task.count({ where: { completed: true } });
    const pendingTasks = await Task.count({ where: { completed: false } });
    const highPriorityTasks = await Task.count({ where: { priority: 'high' } });
    
    // Get tasks by category
    const tasksByCategory = {};
    const tasks = await Task.findAll();
    tasks.forEach(task => {
      if (task.category) {
        tasksByCategory[task.category] = (tasksByCategory[task.category] || 0) + 1;
      }
    });
    
    // Get tasks by priority
    const tasksByPriority = {
      high: await Task.count({ where: { priority: 'high' } }),
      medium: await Task.count({ where: { priority: 'medium' } }),
      low: await Task.count({ where: { priority: 'low' } })
    };
    
    const stats = {
      totalTasks,
      completedTasks,
      pendingTasks,
      highPriorityTasks,
      tasksByCategory,
      tasksByPriority
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Task Manager API is running with MySQL',
        timestamp: new Date().toISOString(),
        database: 'MySQL',
        port: PORT
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Task Manager API running on http://localhost:${PORT}`);
    console.log(`API Documentation:`);
    console.log(`  GET    /api/tasks              - Get all tasks`);
    console.log(`  GET    /api/tasks/:id          - Get single task`);
    console.log(`  POST   /api/tasks              - Create new task`);
    console.log(`  POST   /api/tasks/sync         - Sync multiple tasks`);
    console.log(`  PUT    /api/tasks/:id          - Update task`);
    console.log(`  DELETE /api/tasks/:id          - Delete task`);
    console.log(`  DELETE /api/tasks/completed/all - Clear completed tasks`);
    console.log(`  GET    /api/tasks/filter/:type - Filter tasks`);
    console.log(`  GET    /api/stats              - Get statistics`);
    console.log(`  GET    /api/health             - Health check`);
});
