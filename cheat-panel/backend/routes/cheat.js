const express = require('express');
const router = express.Router();

// GET /cheat/status
router.get('/status', (req, res) => {
  res.json({ ok: true, status: 'cheat endpoint placeholder' });
});

module.exports = router;
