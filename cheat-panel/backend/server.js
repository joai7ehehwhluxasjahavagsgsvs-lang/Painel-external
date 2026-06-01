const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Optional existing routes
app.use('/auth', require('./routes/auth'));
app.use('/cheat', require('./routes/cheat'));

// Configurações específicas para cada versão
const GAME_VERSIONS = {
  normal: {
    package: 'com.dts.freefireth',
    version: '2.100.1',
    offsets: {
      entity_list: '0x1A2B3C4D',
      local_player: '0x0F0E0D0C',
      camera_rotation: '0x2A0B0C0D',
      position: '0x80',
      health: '0x1A0',
      team: '0x1C0',
      name: '0x200',
      weapon: '0x240',
      vehicle: '0x280'
    },
    bypass_methods: ['memory_mapping', 'api_hook', 'proxy']
  },
  max: {
    package: 'com.dts.freefiremax',
    version: '2.100.1',
    offsets: {
      entity_list: '0x2B3C4D5E',
      local_player: '0x1E0F0D0C',
      camera_rotation: '0x3B0C0D0E',
      position: '0x90',
      health: '0x1B0',
      team: '0x1D0',
      name: '0x210',
      weapon: '0x250',
      vehicle: '0x290'
    },
    bypass_methods: ['memory_mapping', 'api_hook', 'proxy', 'kernel']
  }
};

// Middleware de autenticação simples
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  if (authHeader === 'Bearer secrettoken') {
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized' });
}

// Endpoint para escanear jogos instalados
app.get('/api/scan', authMiddleware, (req, res) => {
  const games = [
    { package: 'com.dts.freefireth', name: 'Free Fire', version: '2.100.1' },
    { package: 'com.dts.freefiremax', name: 'Free Fire MAX', version: '2.100.1' }
  ];

  res.json({
    success: true,
    games
  });
});

// Endpoint para detectar versão e obter configurações
app.get('/api/detect/:package', authMiddleware, (req, res) => {
  const packageName = req.params.package;
  let detectedVersion = null;

  if (packageName.includes('freefireth')) {
    detectedVersion = GAME_VERSIONS.normal;
  } else if (packageName.includes('freefiremax')) {
    detectedVersion = GAME_VERSIONS.max;
  }

  if (detectedVersion) {
    res.json({
      success: true,
      game: detectedVersion,
      injection_ready: true,
      anti_ban: generateAntiBanConfig(detectedVersion)
    });
  } else {
    res.json({
      success: false,
      error: 'Versão não suportada'
    });
  }
});

// Endpoint para injeção específica por versão
app.post('/api/inject/:version', authMiddleware, (req, res) => {
  const version = req.params.version;
  const gameConfig = GAME_VERSIONS[version];

  if (!gameConfig) {
    return res.status(400).json({ error: 'Versão inválida' });
  }

  const payload = generatePayload(gameConfig, req.body || {});

  // Return encrypted payload but also expose the target library name
  // in plain text so the frontend can perform the injection into the
  // correct .lib even if the full payload is encrypted.
  res.json({
    success: true,
    payload: encryptPayload(payload),
    target_library: payload.target_library,
    method: 'dynamic_injection',
    obfuscation_level: 4
  });
});

app.post('/api/clean', authMiddleware, (req, res) => {
  // Placeholder cleanup route for the frontend.
  const { package: packageName, full_clean } = req.body || {};

  res.json({
    success: true,
    cleaned: true,
    package: packageName || null,
    full_clean: Boolean(full_clean)
  });
});

function generateAntiBanConfig(gameConfig) {
  return {
    level: 'high',
    methods: gameConfig.bypass_methods,
    randomization: true,
    memory_cleanup: true,
    process_hiding: true,
    signature_spoofing: true
  };
}

function generatePayload(gameConfig, userConfig) {
  const features = userConfig.features || {};
  const aimbotSource = typeof features.aimbot !== 'undefined' ? features.aimbot : userConfig.aimbot || {};
  const espSource = typeof features.esp !== 'undefined' ? features.esp : userConfig.esp || {};
  const wallhackSource = typeof features.wallhack !== 'undefined' ? features.wallhack : userConfig.wallhack || {};

  const normalizeBool = (value, fallback) => {
    if (typeof value === 'boolean') return value;
    return typeof fallback === 'boolean' ? fallback : true;
  };

  const targetLibrarySource = typeof userConfig.targetLibrary !== 'undefined'
    ? userConfig.targetLibrary
    : (userConfig.features && userConfig.features.targetLibrary) || 'a.lib';

  return {
    package: gameConfig.package,
    offsets: gameConfig.offsets,
    target_library: targetLibrarySource,
    features: {
      aimbot: {
        enabled: normalizeBool(aimbotSource.enabled, true),
        mode: aimbotSource.mode || userConfig.aimMode || 'neck',
        fov: Number(aimbotSource.fov ?? userConfig.fov ?? 15),
        smoothness: Number(aimbotSource.smoothness ?? userConfig.smoothness ?? 50),
        max_distance: Number(aimbotSource.maxDistance ?? userConfig.maxDistance ?? 300),
        prediction: normalizeBool(aimbotSource.prediction, true),
        recoil_control: normalizeBool(aimbotSource.recoilControl, true)
      },
      esp: {
        enabled: normalizeBool(espSource.enabled, true),
        type: espSource.type || userConfig.espType || 'box',
        show_distance: normalizeBool(espSource.showDistance, true),
        show_health: normalizeBool(espSource.showHealth, true),
        show_name: normalizeBool(espSource.showName, true),
        show_weapon: normalizeBool(espSource.showWeapon, false),
        show_vehicle: normalizeBool(espSource.showVehicle, false),
        color: espSource.color || userConfig.espColor || '#ff0000',
        transparency: Number(espSource.transparency ?? userConfig.espTransparency ?? 50),
        max_distance: Number(espSource.maxDistance ?? userConfig.espMaxDistance ?? 300)
      },
      wallhack: {
        enabled: normalizeBool(wallhackSource.enabled, true),
        mode: wallhackSource.mode || userConfig.wallhackMode || 'full',
        transparency: Number(wallhackSource.transparency ?? userConfig.wallhackTransparency ?? 0.5)
      },
      antiban: {
        enabled: true,
        level: userConfig.antibanLevel || 'high',
        injection_delay: userConfig.injectionDelay || 1000,
        bypass_method: userConfig.bypassMethod || 'auto'
      }
    }
  };
}

function encryptPayload(payload) {
  const secret = crypto.createHash('sha256').update('painel-dual-ff-secret').digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', secret, iv);
  let encrypted = cipher.update(JSON.stringify(payload), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

app.listen(port, () => {
  console.log(`Painel Dual FF rodando na porta ${port}`);
});
