// Archivo: __tests__/config/setup-env.js
const path = require('path');
const dotenv = require('dotenv');

// Carga las variables de entorno desde .env.test
// Esto asegura que se carguen antes que cualquier otro código de la aplicación.
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

/*
console.log('--- JEST SETUP: DATABASE_URL loaded ---');
console.log(process.env.DATABASE_URL);
console.log('---------------------------------------');
*/