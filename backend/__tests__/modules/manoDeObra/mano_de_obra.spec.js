const request = require('supertest');
const app = require('../../../app');
const sequelize = require('../../../config/db');
const ManoDeObra = require('../../../modules/manoDeObra/mano_de_obra.model');
const clerkService = require('../../../shared/services/clerk.service');

jest.mock('../../../shared/services/clerk.service');

describe('API de Mano de Obra - /api/manos-de-obra', () => {

  beforeAll(async () => {
    clerkService.verifyToken.mockResolvedValue({ sub: 'user_test_id_mano_de_obra' });
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await ManoDeObra.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /', () => {
    it('debería crear un nuevo registro de mano de obra y devolver 201', async () => {
      const nuevaManoDeObra = {
        nombre: 'Confección',
        precio: 25.50,
      };

      const response = await request(app)
        .post('/api/manos-de-obra')
        .set('Authorization', 'Bearer fake-token')
        .send(nuevaManoDeObra);

      expect(response.statusCode).toBe(201);
      expect(response.body.nombre).toBe('Confección');
    });

    // --- PRUEBA ACTUALIZADA PARA VALIDACIÓN ---
    it('debería devolver 400 si los datos enviados son inválidos', async () => {
      const datosInvalidos = { nombre: '', precio: -10.00 };
      
      const response = await request(app)
        .post('/api/manos-de-obra')
        .set('Authorization', 'Bearer fake-token')
        .send(datosInvalidos);
      
      expect(response.statusCode).toBe(400);
      const errorMessages = response.body.errors.map(e => e.msg);
      // Verifica los mensajes de error específicos de las nuevas reglas
      expect(errorMessages).toContain('El nombre es obligatorio.');
      expect(errorMessages).toContain('El precio debe ser un número igual o mayor a 0.');
    });

    it('debería devolver 400 si el nombre ya existe (restricción unique)', async () => {
      await ManoDeObra.create({ nombre: 'Empaque', precio: 5.00 });
      
      const datosDuplicados = { nombre: 'Empaque', precio: 6.00 };
      const response = await request(app)
        .post('/api/manos-de-obra')
        .set('Authorization', 'Bearer fake-token')
        .send(datosDuplicados);
        
      // Sequelize UniqueConstraintError ahora es manejado por el controlador
      // y devuelve un 400 con un mensaje específico.
      expect(response.statusCode).toBe(400);
      expect(response.body.error).toContain('Datos inválidos o duplicados.');
    });
  });

  describe('GET /', () => {
    it('debería devolver una lista de manos de obra ordenada por nombre', async () => {
      await ManoDeObra.bulkCreate([
        { nombre: 'Lavandería', precio: 15.00 },
        { nombre: 'Empaque', precio: 5.00 },
        { nombre: 'Confección', precio: 25.50 },
      ]);
      
      const response = await request(app)
        .get('/api/manos-de-obra')
        .set('Authorization', 'Bearer fake-token');
      
      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBe(3);
      expect(response.body[0].nombre).toBe('Confección');
    });
  });
  
  describe('Rutas con /:referencia', () => {
    // --- NUEVA PRUEBA DE VALIDACIÓN DE PARÁMETRO ---
    it('debería devolver 400 si la referencia en la URL no es un número entero', async () => {
      const response = await request(app)
        .get('/api/manos-de-obra/texto-invalido')
        .set('Authorization', 'Bearer fake-token');
      
      expect(response.statusCode).toBe(400);
      expect(response.body.errors[0].msg).toBe('La referencia debe ser un número entero.');
    });

    it('GET /:referencia - debería devolver un solo registro si la referencia existe', async () => {
      const registro = await ManoDeObra.create({ nombre: 'Corte de Tela', precio: 12.00 });
      
      const response = await request(app)
        .get(`/api/manos-de-obra/${registro.referencia}`)
        .set('Authorization', 'Bearer fake-token');

      expect(response.statusCode).toBe(200);
      expect(response.body.nombre).toBe('Corte de Tela');
    });

    it('GET /:referencia - debería devolver 404 si la referencia no existe', async () => {
        const response = await request(app)
          .get('/api/manos-de-obra/9999')
          .set('Authorization', 'Bearer fake-token');
          
        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe('Mano de obra no encontrada');
      });

    it('PUT /:referencia - debería actualizar un registro existente y devolver 200', async () => {
      const registro = await ManoDeObra.create({ nombre: 'Planchado', precio: 8.00 });
      const datosActualizados = { precio: 9.50 };

      const response = await request(app)
        .put(`/api/manos-de-obra/${registro.referencia}`)
        .set('Authorization', 'Bearer fake-token')
        .send(datosActualizados);

      expect(response.statusCode).toBe(200);
      expect(response.body.precio).toBe(9.50);
    });

    it('DELETE /:referencia - debería eliminar un registro y devolver 204', async () => {
      const registro = await ManoDeObra.create({ nombre: 'Botones', precio: 1.00 });

      const deleteResponse = await request(app)
        .delete(`/api/manos-de-obra/${registro.referencia}`)
        .set('Authorization', 'Bearer fake-token');
      
      expect(deleteResponse.statusCode).toBe(204);

      const getResponse = await request(app)
        .get(`/api/manos-de-obra/${registro.referencia}`)
        .set('Authorization', 'Bearer fake-token');
      
      expect(getResponse.statusCode).toBe(404);
    });
  });
});