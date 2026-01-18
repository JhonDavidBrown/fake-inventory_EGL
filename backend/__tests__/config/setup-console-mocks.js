// Silencia los logs de la consola durante las pruebas para mantener la salida limpia
// Las implementaciones originales se restauran automáticamente con mockRestore()

// Antes de cada prueba, reemplaza las funciones de la consola
// por una función de Jest vacía, efectivamente silenciándolas.
beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

// Después de cada prueba, restaura las funciones originales.
// Esto es importante para no afectar logs de Jest u otros procesos.
afterEach(() => {
  console.log.mockRestore();
  console.warn.mockRestore();
  console.error.mockRestore();
});