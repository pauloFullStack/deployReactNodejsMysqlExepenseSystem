const crypto = require('crypto');
const Sequelize = require('sequelize');
const connectDB = require('../config/db');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const Users = connectDB.define(
  'users',
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
    },
    lestName: {
      type: Sequelize.STRING,
    },
    email: {
      type: Sequelize.STRING,
    },
    password: {
      type: Sequelize.STRING,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal('NOW()'),
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal('NOW()'),
    },
    deletedAt: { // Campo para rastrear a data e hora de exclusão
      type: Sequelize.DATE,
      allowNull: true,
    },
    // resetPasswordToken: Sequelize.STRING,
    // resetPasswordExpire: Sequelize.DATE,
  });

// Função para criptografar a senha antes de salvar
Users.beforeCreate(async (user) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(user.password, saltRounds);
  user.password = hashedPassword;
});

// Função para criar token JWT
Users.prototype.getSignedJwtToken = function () {
  return jwt.sign({
    id: this.id,
    uuid1: uuidv4(),
    uuid2: uuidv4()
  }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Função para comparar senhas
Users.prototype.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Função para gerar e hash de token de senha
// Users.prototype.getResetPasswordToken = function () {
//   const resetToken = crypto.randomBytes(20).toString('hex');
//   const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
//   this.resetPasswordToken = resetTokenHash;
//   this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos
//   return resetToken;
// };

module.exports = Users;
