const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Pantalon = sequelize.define(
  'Pantalon',
  {
    referencia: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false, 
      unique: {
        name: 'pantalones_nombre_unique',
        msg: 'Ya existe una referencia de pantalón con este nombre.',
      },
    },
    imagen_url: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        esUnaUrlValida(value) {
          if (value && !value.startsWith('http://') && !value.startsWith('https://')) {
            throw new Error('El formato de la URL de la imagen no es válido. Debe comenzar con http:// o https://');
          }
        }
      }
    },
    tallas_disponibles: {
      type: DataTypes.JSONB,
      allowNull: false, 
    },
    precio_individual: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true, 
      validate: {
        isDecimal: {
          msg: 'El precio debe ser un número decimal válido.',
        },
        min: {
          args: [0],
          msg: 'El precio no puede ser negativo.',
        },
      },
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: {
          msg: "La cantidad debe ser un número entero.",
        },
        min: {
          args: [0],
          msg: "La cantidad no puede ser negativa.",
        },
      },
    },
  },
  {
    tableName: 'pantalones',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Pantalon;