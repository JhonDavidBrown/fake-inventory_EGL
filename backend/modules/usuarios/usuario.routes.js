
const express = require('express');
const router = express.Router();

const { authenticateRequest } = require('../../shared/middleware/auth.middleware');

const usuarioController = require('./usuario.controller');

router.use(authenticateRequest);

router.get('/', usuarioController.getAllUsers);

module.exports = router;