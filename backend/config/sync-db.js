require('dotenv').config();
const sequelize = require('./database');
const Task = require('../models/Task');

async function syncDatabase() {
  try {
    console.log('🔄 Syncing database schema...');
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing database:', error);
    process.exit(1);
  }
}

syncDatabase();
