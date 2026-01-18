const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
// Insumo and Pantalon models are referenced but associations are defined elsewhere
// const Insumo = require('../insumos/insumo.model');
// const Pantalon = require('./pantalones.model'); 

const PantalonInsumo = sequelize.define('PantalonInsumo', {
  referencia_pantalon: {
    type: DataTypes.INTEGER,
    references: { model: 'Pantalones', key: 'referencia' },
    primaryKey: true,
    onDelete: 'CASCADE',
  },
  referencia_insumo: {
    type: DataTypes.INTEGER,
    references: { model: 'Insumos', key: 'referencia' },
    primaryKey: true,
    onDelete: 'CASCADE',
  },
  cantidad_usada: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
}, {
  tableName: 'pantalon_insumo',
  timestamps: false,
});

module.exports = PantalonInsumo;