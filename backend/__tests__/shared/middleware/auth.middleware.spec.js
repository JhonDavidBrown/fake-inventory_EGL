const request = require('supertest');
const app = require('../../../app');
const clerkService = require('../../../shared/services/clerk.service'); 

jest.mock('../../../shared/services/clerk.service');

describe('Auth Middleware', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería devolver 401 si no se proporciona la cabecera Authorization', async () => {
    const response = await request(app)
      .get('/api/usuarios'); 

    expect(response.statusCode).toBe(401);
    expect(response.body.error).toContain('Token no proporcionado');
  });

  it('debería devolver 401 si el token no tiene el formato "Bearer"', async () => {
    const response = await request(app)
      .get('/api/usuarios')
      .set('Authorization', 'InvalidFormat token123'); 

    expect(response.statusCode).toBe(401);
  });

  it('debería devolver 401 si clerkService.verifyToken lanza un error (token inválido)', async () => {
    const errorMessage = 'Token inválido';
    clerkService.verifyToken.mockRejectedValue(new Error(errorMessage));

    const response = await request(app)
      .get('/api/usuarios')
      .set('Authorization', 'Bearer token-invalido');

    expect(response.statusCode).toBe(401);
    expect(response.body.error).toContain('Token inválido');
  });

  it('debería llamar a next() y añadir req.auth si el token es válido', async () => {
    const mockUserPayload = { sub: 'user_12345_test' };
    clerkService.verifyToken.mockResolvedValue(mockUserPayload);

    const response = await request(app)
      .get('/api/usuarios')
      .set('Authorization', 'Bearer token-valido-mockeado');

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toContain('Ruta de usuarios protegida funcionando');
    expect(response.body.authenticatedUserId).toBe(mockUserPayload.sub);
  });

}); 