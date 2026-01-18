const { DataTypes } = require('sequelize');

/**
 * Inicializa todos los modelos para una conexión Sequelize específica
 * Esto permite tener modelos separados para cada empresa/compañía
 * @param {Sequelize} sequelize - Instancia de Sequelize para una empresa específica
 * @returns {Object} Objeto con todos los modelos inicializados
 */
function initializeModels(sequelize) {
  // ==================== INSUMO ====================
  const Insumo = sequelize.define(
    'Insumo',
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
      tableName: 'insumos',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  // ==================== MANO DE OBRA ====================
  const ManoDeObra = sequelize.define(
    'ManoDeObra',
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
            msg: 'El nombre del proceso no puede estar vacío.',
          },
        },
      },
      precio: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          isFloat: {
            msg: 'El precio debe ser un número válido.',
          },
          min: {
            args: [0],
            msg: 'El precio no puede ser negativo.',
          },
        },
      },
      proveedor: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
    },
    {
      tableName: 'manos_de_obra',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  // ==================== PANTALON ====================
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
          },
        },
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
            msg: 'La cantidad debe ser un número entero.',
          },
          min: {
            args: [0],
            msg: 'La cantidad no puede ser negativa.',
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

  // ==================== PANTALON_INSUMO (Junction) ====================
  const PantalonInsumo = sequelize.define(
    'PantalonInsumo',
    {
      referencia_pantalon: {
        type: DataTypes.INTEGER,
        references: { model: 'pantalones', key: 'referencia' },
        primaryKey: true,
        onDelete: 'CASCADE',
      },
      referencia_insumo: {
        type: DataTypes.INTEGER,
        references: { model: 'insumos', key: 'referencia' },
        primaryKey: true,
        onDelete: 'CASCADE',
      },
      cantidad_usada: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    },
    {
      tableName: 'pantalon_insumo',
      timestamps: false,
    }
  );

  // ==================== PANTALON_MANO_DE_OBRA (Junction) ====================
  const PantalonManoDeObra = sequelize.define(
    'PantalonManoDeObra',
    {
      referencia_pantalon: {
        type: DataTypes.INTEGER,
        references: { model: 'pantalones', key: 'referencia' },
        primaryKey: true,
        onDelete: 'CASCADE',
      },
      referencia_mano_de_obra: {
        type: DataTypes.INTEGER,
        references: { model: 'manos_de_obra', key: 'referencia' },
        primaryKey: true,
        onDelete: 'CASCADE',
      },
    },
    {
      tableName: 'pantalon_mano_obra',
      timestamps: false,
    }
  );

  // ==================== USUARIO ====================
  const Usuario = sequelize.define(
    'usuario',
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
      tableName: 'usuario',
      timestamps: false,
    }
  );

  // ==================== CONFIGURAR RELACIONES ====================
  // Pantalon ↔ Insumo (Many-to-Many)
  Pantalon.belongsToMany(Insumo, {
    through: PantalonInsumo,
    foreignKey: 'referencia_pantalon',
    otherKey: 'referencia_insumo',
    as: 'insumos',
  });
  Insumo.belongsToMany(Pantalon, {
    through: PantalonInsumo,
    foreignKey: 'referencia_insumo',
    otherKey: 'referencia_pantalon',
  });

  // Asociaciones directas para PantalonInsumo (necesarias para includes)
  PantalonInsumo.belongsTo(Pantalon, {
    foreignKey: 'referencia_pantalon',
    targetKey: 'referencia',
  });
  PantalonInsumo.belongsTo(Insumo, {
    foreignKey: 'referencia_insumo',
    targetKey: 'referencia',
  });

  // Pantalon ↔ ManoDeObra (Many-to-Many)
  Pantalon.belongsToMany(ManoDeObra, {
    through: PantalonManoDeObra,
    foreignKey: 'referencia_pantalon',
    otherKey: 'referencia_mano_de_obra',
    as: 'procesos',
  });
  ManoDeObra.belongsToMany(Pantalon, {
    through: PantalonManoDeObra,
    foreignKey: 'referencia_mano_de_obra',
    otherKey: 'referencia_pantalon',
  });

  // Asociaciones directas para PantalonManoDeObra (necesarias para includes)
  PantalonManoDeObra.belongsTo(Pantalon, {
    foreignKey: 'referencia_pantalon',
    targetKey: 'referencia',
  });
  PantalonManoDeObra.belongsTo(ManoDeObra, {
    foreignKey: 'referencia_mano_de_obra',
    targetKey: 'referencia',
  });

  // ==================== RETORNAR MODELOS ====================
  return {
    Insumo,
    ManoDeObra,
    Pantalon,
    PantalonInsumo,
    PantalonManoDeObra,
    Usuario,
    sequelize,
  };
}

module.exports = initializeModels;
