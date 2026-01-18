const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Insumo = sequelize.define(
  "Insumo",
  {
    referencia: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    tipo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cantidad: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    proveedor: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    unidad: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    preciounidad: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "insumos",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Insumo;
