const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const ManoDeObra = require('../manoDeObra/mano_de_obra.model');
const Pantalon = require('./pantalones.model');

const PantalonManoDeObra = sequelize.define('PantalonManoDeObra', {
  referencia_pantalon: {
    type: DataTypes.INTEGER,
    references: {
      model: Pantalon,
      key: 'referencia',
    },
    primaryKey: true,
    onDelete: 'CASCADE',
  },
  referencia_mano_de_obra: {
    type: DataTypes.INTEGER,
    references: {
      model: ManoDeObra,
      key: 'referencia',
    },
    primaryKey: true,
    onDelete: 'CASCADE',
  },
}, {
  tableName: 'pantalon_mano_obra',
  timestamps: false,
});

module.exports = PantalonManoDeObra;