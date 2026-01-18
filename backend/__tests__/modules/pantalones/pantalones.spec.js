const request = require('supertest');
const fs = require('fs');
const app = require('../../../app');
const sequelize = require('../../../config/db');
const path = require('path');

// Importar Modelos
const Pantalon = require('../../../modules/pantalones/pantalones.model');
const Insumo = require('../../../modules/insumos/insumo.model');
const ManoDeObra = require('../../../modules/manoDeObra/mano_de_obra.model');
const PantalonInsumo = require('../../../modules/pantalones/pantalonInsumo.model');
const PantalonManoDeObra = require('../../../modules/pantalones/pantalonManoDeObra.model');

// Mockear módulos externos
jest.mock('../../../modules/uploads/uploads.controller.js', () => ({
  uploadImage: jest.fn(),
  deleteImage: jest.fn(),
}));
const clerkService = require('../../../shared/services/clerk.service');
jest.mock('../../../shared/services/clerk.service');
jest.mock('fs');


describe('API de Pantalones - /api/pantalones', () => {

  beforeAll(async () => {
    clerkService.verifyToken.mockResolvedValue({ sub: 'user_test_pantalones_123' });
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await PantalonInsumo.destroy({ where: {} });
    await PantalonManoDeObra.destroy({ where: {} });
    await Pantalon.destroy({ where: {} });
    await Insumo.destroy({ where: {} });
    await ManoDeObra.destroy({ where: {} });
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/pantalones', () => {
    
    it('debería crear un pantalón, calcular su precio, deducir el stock de insumos y devolver 201 (Camino Feliz)', async () => {
      const tela = await Insumo.create({ nombre: 'Tela Denim', tipo: 'Tela', unidad: 'metros', cantidad: 100, preciounidad: 10 });
      const botones = await Insumo.create({ nombre: 'Botón Metálico', tipo: 'Botón', unidad: 'unidades', cantidad: 500, preciounidad: 0.5 });
      const confeccion = await ManoDeObra.create({ nombre: 'Confección', precio: 15 });
      const lavanderia = await ManoDeObra.create({ nombre: 'Lavandería', precio: 5 });

      const stockInicialTela = parseFloat(tela.cantidad);
      const stockInicialBotones = parseFloat(botones.cantidad);

      const nuevoPantalonData = {
        nombre: 'Jean Clásico 101',
        tallas_disponibles: { "30": 10, "32": 10 },
        cantidad: 10, 
        insumos: [
          { insumo_referencia: tela.referencia, cantidad_requerida: 1.5 },
          { insumo_referencia: botones.referencia, cantidad_requerida: 5 }  
        ],
        manos_de_obra: [
          { mano_de_obra_referencia: confeccion.referencia },
          { mano_de_obra_referencia: lavanderia.referencia }
        ]
      };

      const response = await request(app)
        .post('/api/pantalones')
        .set('Authorization', 'Bearer fake-token')
        .send(nuevoPantalonData);

      expect(response.statusCode).toBe(201);
      expect(response.body.nombre).toBe('Jean Clásico 101');
      expect(parseFloat(response.body.precio_individual)).toBe(37.50);

      const telaActualizada = await Insumo.findByPk(tela.referencia);
      const botonesActualizados = await Insumo.findByPk(botones.referencia);
      
      const telaRequeridaTotal = 10 * 1.5; 
      const botonesRequeridosTotal = 10 * 5; 

      expect(parseFloat(telaActualizada.cantidad)).toBe(stockInicialTela - telaRequeridaTotal);
      expect(parseFloat(botonesActualizados.cantidad)).toBe(stockInicialBotones - botonesRequeridosTotal);
    });

    it('debería devolver 409 Conflict si no hay stock suficiente de un insumo y no modificar la BD', async () => {
      const tela = await Insumo.create({ nombre: 'Tela Lino', tipo: 'Tela', unidad: 'metros', cantidad: 10, preciounidad: 20 });
      const confeccion = await ManoDeObra.create({ nombre: 'Confección Lino', precio: 30 });
      const stockInicialTela = parseFloat(tela.cantidad);

      const pantalonSinStock = {
        nombre: 'Pantalón de Lino Verano',
        tallas_disponibles: { "M": 20 },
        cantidad: 20, 
        insumos: [{ insumo_referencia: tela.referencia, cantidad_requerida: 2 }],
        manos_de_obra: [{ mano_de_obra_referencia: confeccion.referencia }]
      };

      const response = await request(app)
        .post('/api/pantalones')
        .set('Authorization', 'Bearer fake-token')
        .send(pantalonSinStock);

      expect(response.statusCode).toBe(409);
      expect(response.body.details).toContain('Stock insuficiente para \'Tela Lino\'');

      const totalPantalones = await Pantalon.count();
      expect(totalPantalones).toBe(0);

      const telaSinCambios = await Insumo.findByPk(tela.referencia);
      expect(parseFloat(telaSinCambios.cantidad)).toBe(stockInicialTela); 
    });

    // --- ¡NUEVAS PRUEBAS DE VALIDACIÓN AÑADIDAS! ---
    it('debería devolver 400 si los datos básicos son inválidos', async () => {
      const bodyInvalido = {
          nombre: '', // Vacío
          tallas_disponibles: "no es un objeto", // Tipo incorrecto
          cantidad: -1 // Negativo
      };

      const response = await request(app)
          .post('/api/pantalones')
          .set('Authorization', 'Bearer fake-token')
          .send(bodyInvalido);

      expect(response.statusCode).toBe(400);
      const errorPaths = response.body.errors.map(e => e.path);
      expect(errorPaths).toContain('nombre');
      expect(errorPaths).toContain('tallas_disponibles');
      expect(errorPaths).toContain('cantidad');
    });

    it('debería devolver 400 si la estructura del array de insumos es incorrecta', async () => {
      const bodyInvalido = {
          nombre: 'Jean Válido',
          tallas_disponibles: { "32": 5 },
          cantidad: 5,
          insumos: [
              { insumo_referencia: 'abc', cantidad_requerida: 1.5 }, // ref no es número
              { cantidad_requerida: -2.0 } // falta ref, cantidad es negativa
          ]
      };

      const response = await request(app)
          .post('/api/pantalones')
          .set('Authorization', 'Bearer fake-token')
          .send(bodyInvalido);

      expect(response.statusCode).toBe(400);
      const errors = response.body.errors;
      expect(errors.some(e => e.path === 'insumos[0].insumo_referencia')).toBe(true);
      expect(errors.some(e => e.path === 'insumos[1].insumo_referencia')).toBe(true);
      expect(errors.some(e => e.path === 'insumos[1].cantidad_requerida')).toBe(true);
    });

  });

  describe('GET /api/pantalones', () => {
    it('debería tener sus insumos y procesos correctamente asociados en la base de datos', async () => {
      const tela = await Insumo.create({ nombre: 'Gabardina', tipo: 'Tela', unidad: 'metros', cantidad: 50, preciounidad: 12 });
      const corte = await ManoDeObra.create({ nombre: 'Corte', precio: 8 });
      const pantalon = await Pantalon.create({
          nombre: 'Chino Casual',
          cantidad: 50,
          tallas_disponibles: { "L": 50 },
          precio_individual: 20
      });

      await pantalon.addInsumo(tela.referencia, { through: { cantidad_usada: 1 } });
      await pantalon.addProceso(corte.referencia);

      const pantalonConAsociaciones = await Pantalon.findByPk(pantalon.referencia, {
          include: [
            { model: Insumo, as: 'insumos' },
            { model: ManoDeObra, as: 'procesos' }
          ]
      });

      expect(pantalonConAsociaciones).toBeDefined();
      expect(pantalonConAsociaciones.insumos).toHaveLength(1);
      expect(pantalonConAsociaciones.insumos[0].nombre).toBe('Gabardina');
      expect(pantalonConAsociaciones.procesos).toHaveLength(1);
      expect(pantalonConAsociaciones.procesos[0].nombre).toBe('Corte');
    }); 
  });

  describe('PUT /api/pantalones/:referencia', () => {
    it('debería actualizar un pantalón, retornando el stock antiguo y deduciendo el nuevo', async () => {
      const telaAntigua = await Insumo.create({ nombre: 'Tela Algodón', tipo: 'Tela', cantidad: 100, unidad: 'm', preciounidad: 8 });
      const telaNueva = await Insumo.create({ nombre: 'Tela Poliéster', tipo: 'Tela', cantidad: 100, unidad: 'm', preciounidad: 6 });
      const confeccion = await ManoDeObra.create({ nombre: 'Confección Universal', precio: 10 });

      const resCreacion = await request(app)
        .post('/api/pantalones')
        .set('Authorization', 'Bearer fake-token')
        .send({
          nombre: 'Pantalón Básico',
          cantidad: 10, 
          tallas_disponibles: { "S": 10 },
          insumos: [{ insumo_referencia: telaAntigua.referencia, cantidad_requerida: 2 }],
          manos_de_obra: [{ mano_de_obra_referencia: confeccion.referencia }]
        });
      
      const pantalonCreado = resCreacion.body;
      let telaAntiguaDB = await Insumo.findByPk(telaAntigua.referencia);
      expect(parseFloat(telaAntiguaDB.cantidad)).toBe(80); 

      const datosActualizados = {
        nombre: 'Pantalón Básico V2',
        cantidad: 5, 
        tallas_disponibles: { "S": 5 },
        insumos: [{ insumo_referencia: telaNueva.referencia, cantidad_requerida: 3 }],
        manos_de_obra: [{ mano_de_obra_referencia: confeccion.referencia }]
      };

      const response = await request(app)
        .put(`/api/pantalones/${pantalonCreado.referencia}`)
        .set('Authorization', 'Bearer fake-token')
        .send(datosActualizados);

      expect(response.statusCode).toBe(200);
      expect(response.body.cantidad).toBe(5);
      
      telaAntiguaDB = await Insumo.findByPk(telaAntigua.referencia);
      expect(parseFloat(telaAntiguaDB.cantidad)).toBe(100);

      const telaNuevaDB = await Insumo.findByPk(telaNueva.referencia);
      const telaNuevaRequerida = 5 * 3;
      expect(parseFloat(telaNuevaDB.cantidad)).toBe(100 - telaNuevaRequerida);
    });
  });

  describe('DELETE /api/pantalones/:referencia', () => {
    it('debería eliminar un pantalón y su imagen local asociada', async () => {
      const imagenUrl = 'http://localhost:3001/uploads/test-image-to-delete.jpg';
      const pantalonParaBorrar = await Pantalon.create({
        nombre: 'Pantalón a Eliminar',
        cantidad: 1,
        tallas_disponibles: {"XS": 1},
        precio_individual: 10,
        imagen_url: imagenUrl
      });
      
      fs.existsSync.mockReturnValue(true);

      const response = await request(app)
        .delete(`/api/pantalones/${pantalonParaBorrar.referencia}`)
        .set('Authorization', 'Bearer fake-token');
      
      expect(response.statusCode).toBe(204);

      const pantalonBorrado = await Pantalon.findByPk(pantalonParaBorrar.referencia);
      expect(pantalonBorrado).toBeNull();
      
      const expectedPath = path.join('public', 'uploads', 'test-image-to-delete.jpg');
      expect(fs.existsSync).toHaveBeenCalledWith(expect.stringContaining(expectedPath));
      expect(fs.unlinkSync).toHaveBeenCalledWith(expect.stringContaining(expectedPath));
    });
  });
});