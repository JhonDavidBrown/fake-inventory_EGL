const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
 
const Usuario = sequelize.define(
  "usuario",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    correo: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    rol: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password_hash: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "usuario",
    timestamps: false,
  }
);

module.exports = Usuario;
