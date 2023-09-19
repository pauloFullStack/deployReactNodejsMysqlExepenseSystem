const Sequelize = require('sequelize');

const connectDB = new Sequelize('expense_system', 'user_paulo', 'Davi91445129!', {
  host: 'localhost',
  dialect: 'mysql',
});

module.exports = connectDB;
