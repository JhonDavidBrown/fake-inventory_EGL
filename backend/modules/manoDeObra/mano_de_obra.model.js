const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const ManoDeObra = sequelize.define(
  "ManoDeObra",
  {
    referencia: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: false, 
      validate: {
        notEmpty: {
          msg: "El nombre del proceso no puede estar vacío.",
        },
      },
    },
    precio: {
      type: DataTypes.FLOAT, 
      allowNull: false,
      validate: {
        isFloat: {
          msg: "El precio debe ser un número válido.",
        },
        min: {
          args: [0],
          msg: "El precio no puede ser negativo.",
        },
      },
    },
    proveedor: {
      type: DataTypes.STRING(150),
      allowNull: true, 
    },


  },
  {
    tableName: "manos_de_obra",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at", 
  }
);

module.exports = ManoDeObra;