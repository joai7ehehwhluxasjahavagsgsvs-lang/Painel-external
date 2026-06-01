const express = require('express');
const router = express.Router();

// POST /auth/login
router.post('/login', (req, res) => {
  // placeholder: autenticar usuário
  res.json({ ok: true, message: 'login placeholder' });
});

module.exports = router;
