const request = require('supertest');
const app = require('../../../app');
const sequelize = require('../../../config/db');

const Insumo = require('../../../modules/insumos/insumo.model');
const Pantalon = require('../../../modules/pantalones/pantalones.model');
const PantalonInsumo = require('../../../modules/pantalones/pantalonInsumo.model');
const clerkService = require('../../../shared/services/clerk.service');

jest.mock('../../../shared/services/clerk.service');

describe('API de Insumos - /api/insumos', () => {

  beforeAll(async () => {
    clerkService.verifyToken.mockResolvedValue({ sub: 'user_test_id_123' });
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    // Limpiar tablas en el orden correcto para evitar errores de FK
    await PantalonInsumo.destroy({ where: {} });
    await Pantalon.destroy({ where: {} });
    await Insumo.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /', () => {
    it('debería crear un nuevo insumo y devolver 201 cuando los datos son válidos', async () => {
      const nuevoInsumo = {
        nombre: 'Tela de Algodón',
        tipo: 'Tela', 
        cantidad: 100.50,
        unidad: 'metros',
        preciounidad: 15.75
      };

      const response = await request(app)
        .post('/api/insumos')
        .set('Authorization', 'Bearer fake-token')
        .send(nuevoInsumo);

      expect(response.statusCode).toBe(201);
      expect(response.body.nombre).toBe('Tela de Algodón');
      expect(response.body.tipo).toBe('Tela'); 
    });

    // --- NUEVA PRUEBA DE VALIDACIÓN ---
    it('debería devolver 400 si faltan campos obligatorios', async () => {
      const insumoInvalido = {
        nombre: 'Insumo incompleto',
        cantidad: 50
        // Faltan tipo, unidad y preciounidad
      };

      const response = await request(app)
        .post('/api/insumos')
        .set('Authorization', 'Bearer fake-token')
        .send(insumoInvalido);

      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toBeInstanceOf(Array);
      
      const errorMessages = response.body.errors.map(e => e.msg);
      expect(errorMessages).toContain('El tipo es obligatorio.');
      expect(errorMessages).toContain('La unidad es obligatoria.');
      expect(errorMessages).toContain('El precio por unidad debe ser un número igual o mayor a 0.');
    });

    // --- NUEVA PRUEBA DE VALIDACIÓN ---
    it('debería devolver 400 si los tipos de datos son incorrectos', async () => {
      const insumoInvalido = {
        nombre: 'Tela',
        tipo: 'Tela',
        cantidad: 'mucha', // No es un número
        unidad: 'metros',
        preciounidad: -10 // Es negativo
      };

      const response = await request(app)
        .post('/api/insumos')
        .set('Authorization', 'Bearer fake-token')
        .send(insumoInvalido);
      
      expect(response.statusCode).toBe(400);
      
      const errors = response.body.errors;
      expect(errors).toBeInstanceOf(Array);
      expect(errors.some(e => e.path === 'cantidad' && e.msg.includes('debe ser un número'))).toBe(true);
      expect(errors.some(e => e.path === 'preciounidad' && e.msg.includes('debe ser un número igual o mayor a 0'))).toBe(true);
    });
  });

  describe('GET /', () => {
    beforeEach(async () => {
      await Insumo.bulkCreate([
        { nombre: 'Tela de Lino', tipo: 'Tela', unidad: 'metros', cantidad: 50, preciounidad: 20 },
        { nombre: 'Botón de Nácar', tipo: 'Botón', unidad: 'unidades', cantidad: 1000, preciounidad: 0.5 },
      ]);
    }); 

    it('debería devolver todos los insumos', async () => {
      const response = await request(app)
        .get('/api/insumos')
        .set('Authorization', 'Bearer fake-token');

      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBe(2);
    });
  });

  describe('GET /:referencia', () => {
    it('debería devolver un solo insumo si la referencia existe', async () => {
      const insumoCreado = await Insumo.create({ nombre: 'Lino Fino', tipo: 'Tela', unidad: 'm', cantidad: 10, preciounidad: 5 });

      const response = await request(app)
        .get(`/api/insumos/${insumoCreado.referencia}`)
        .set('Authorization', 'Bearer fake-token');

      expect(response.statusCode).toBe(200);
      expect(response.body.nombre).toBe('Lino Fino');
    });

    // --- NUEVA PRUEBA DE VALIDACIÓN DE PARÁMETRO ---
    it('debería devolver 400 si la referencia en la URL no es un número', async () => {
      const response = await request(app)
          .get('/api/insumos/texto-invalido')
          .set('Authorization', 'Bearer fake-token');
      
      expect(response.statusCode).toBe(400);
      expect(response.body.errors[0].msg).toBe('La referencia debe ser un número entero.');
    });
  });
  
  describe('PUT /:referencia', () => {
    it('debería actualizar un insumo existente y devolver 200', async () => {
      const insumo = await Insumo.create({ nombre: 'Cierre de Metal', tipo: 'Cierre', unidad: 'unidades', cantidad: 200, preciounidad: 1.00 });
      const datosActualizados = { preciounidad: 1.25, tipo: 'Cierre Reforzado' };

      const response = await request(app)
        .put(`/api/insumos/${insumo.referencia}`)
        .set('Authorization', 'Bearer fake-token')
        .send(datosActualizados);

      expect(response.statusCode).toBe(200);
      expect(parseFloat(response.body.preciounidad)).toBe(1.25);
      expect(response.body.tipo).toBe('Cierre Reforzado');
    });
  });

  describe('DELETE /:referencia', () => {
    it('debería devolver 409 si el insumo está en uso', async () => {
      const insumoEnUso = await Insumo.create({ nombre: 'Tela Cruda', tipo: 'Tela', unidad: 'metros', cantidad: 10, preciounidad: 30 });
      // Corregido: se añade el campo obligatorio 'tallas_disponibles'
      const pantalon = await Pantalon.create({ nombre: 'Jean de Prueba', tallas_disponibles: { "32": 10 } });
      
      await PantalonInsumo.create({ referencia_pantalon: pantalon.referencia, referencia_insumo: insumoEnUso.referencia, cantidad_usada: 2.5 });

      const response = await request(app)
        .delete(`/api/insumos/${insumoEnUso.referencia}`)
        .set('Authorization', 'Bearer fake-token');
      
      expect(response.statusCode).toBe(409);
    });
  });
});