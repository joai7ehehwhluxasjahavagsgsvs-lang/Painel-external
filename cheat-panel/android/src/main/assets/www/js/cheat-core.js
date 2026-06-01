class DualCheatCore {
  constructor() {
    this.config = {
      version: 'auto',
      game: null,
      targetLibrary: 'a.lib',
      aimbot: {
        enabled: true,
        mode: 'neck',
        fov: 15,
        smoothness: 50,
        maxDistance: 300,
        recoilControl: true,
        movementPrediction: true
      },
      esp: {
        enabled: true,
        type: 'box',
        showDistance: true,
        showHealth: true,
        showName: true,
        showWeapon: false,
        showVehicle: false,
        color: '#ff0000',
        transparency: 50,
        maxDistance: 300
      },
      wallhack: {
        enabled: true,
        transparency: 0.5
      },
      antiban: {
        level: 'high',
        methods: ['memory', 'hook', 'proxy'],
        injectionDelay: 2000,
        randomizeAddresses: true,
        memoryCleanup: true,
        trafficObfuscation: true
      }
    };

    this.sessionId = this.generateSessionId();
    this.detectedGames = [];
  }

  generateSessionId() {
    return Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }

  getAuthToken() {
    return 'Bearer secrettoken';
  }

  async scanForGames() {
    try {
      const response = await fetch('/api/scan', {
        headers: {
          Authorization: this.getAuthToken()
        }
      });

      const data = await response.json();
      this.detectedGames = Array.isArray(data.games) ? data.games : [];

      if (this.detectedGames.length > 0) {
        await this.autoDetectVersion();
      }

      return this.detectedGames;
    } catch (error) {
      console.error('Erro ao escanear:', error);
      this.updateStatus('error');
      return [];
    }
  }

  async autoDetectVersion() {
    const maxDetected = this.detectedGames.find(g => g.package === 'com.dts.freefiremax');
    if (maxDetected) {
      this.config.version = 'max';
      this.config.game = 'Free Fire MAX';
      this.updateVersionDisplay('MAX', 'com.dts.freefiremax');
      return;
    }

    const normalDetected = this.detectedGames.find(g => g.package === 'com.dts.freefireth');
    if (normalDetected) {
      this.config.version = 'normal';
      this.config.game = 'Free Fire Normal';
      this.updateVersionDisplay('Normal', 'com.dts.freefireth');
      return;
    }

    this.updateVersionDisplay('Não detectado', '-');
  }

  async getOffsets(version) {
    const offsets = {
      normal: {
        entity_list: 0x1A2B3C4D,
        local_player: 0x0F0E0D0C,
        camera_rotation: 0x2A0B0C0D,
        position: 0x80,
        health: 0x1A0,
        team: 0x1C0,
        name: 0x200,
        weapon: 0x240,
        vehicle: 0x280
      },
      max: {
        entity_list: 0x2B3C4D5E,
        local_player: 0x1E0F0D0C,
        camera_rotation: 0x3B0C0D0E,
        position: 0x90,
        health: 0x1B0,
        team: 0x1D0,
        name: 0x210,
        weapon: 0x250,
        vehicle: 0x290
      }
    };

    return offsets[version] || offsets.normal;
  }

  getDefaultLibrary(version) {
    const defaultLibs = {
      normal: 'a.lib',
      max: 'a.lib'
    };
    return this.config.targetLibrary || defaultLibs[version] || 'a.lib';
  }

  async injectCheat() {
    if (!this.config.version || this.config.version === 'auto') {
      await this.scanForGames();
      if (this.config.version === 'auto') {
        this.updateStatus('error');
        return false;
      }
    }

    const version = this.config.version;
    const offsets = await this.getOffsets(version);

    try {
      const payload = {
        version,
        offsets,
        targetLibrary: this.getDefaultLibrary(version),
        features: {
          aimbot: this.config.aimbot,
          esp: this.config.esp,
          wallhack: this.config.wallhack,
          antiban: this.config.antiban
        }
      };

      const response = await fetch(`/api/inject/${version}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.getAuthToken()
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.success) {
        // Prefer server-provided target library if present (plain text),
        // otherwise fallback to local config. Pass both encrypted payload
        // and targetLibrary so injectWithBypass can use the correct .lib.
        const serverTarget = result.target_library || result.targetLibrary || this.config.targetLibrary;
        await this.sleep(this.config.antiban.injectionDelay);
        await this.injectWithBypass({ encrypted: result.payload, targetLibrary: serverTarget });
        this.updateStatus('injected');
        return true;
      }

      this.updateStatus('error');
      return false;
    } catch (error) {
      console.error('Erro na injeção:', error);
      this.updateStatus('error');
      return false;
    }
  }

  async injectWithBypass(payload) {
    // payload: { encrypted: '<hex...>', targetLibrary: 'a.lib' }
    const platform = this.detectPlatform();
    const version = this.config.version;

    if (version === 'max') {
      await this.kernelBypass();
      await this.memoryMappingBypass();
      await this.apiHookBypass();
    } else {
      await this.memoryMappingBypass();
      await this.proxyInjectionBypass();
    }

    if (platform === 'android') {
      await this.injectAndroid(payload);
    } else if (platform === 'ios') {
      await this.injectIOS(payload);
    } else {
      console.warn('Plataforma não suportada para injeção:', platform);
    }
  }

  async kernelBypass() {
    const kernelModule = {
      name: 'ff_bypass_ko',
      entry: '0x12345678',
      method: 'syscall_hook'
    };
    await this.loadKernelModule(kernelModule);
  }

  async loadKernelModule(module) {
    console.log('Carregando módulo kernel:', module);
    await this.sleep(200);
  }

  async memoryMappingBypass() {
    console.log('Aplicando bypass de memory mapping');
    await this.sleep(100);
  }

  async apiHookBypass() {
    console.log('Aplicando bypass de API hook');
    await this.sleep(100);
  }

  async proxyInjectionBypass() {
    console.log('Aplicando bypass de proxy injection');
    await this.sleep(100);
  }

  async injectAndroid(payload) {
    const lib = payload && payload.targetLibrary ? payload.targetLibrary : this.config.targetLibrary;
    console.log('Injetando Android na biblioteca:', lib, payload);
    await this.injectIntoLibrary(lib, payload.encrypted);
  }

  async injectIOS(payload) {
    const lib = payload && payload.targetLibrary ? payload.targetLibrary : this.config.targetLibrary;
    console.log('Injetando iOS na biblioteca:', lib, payload);
    await this.injectIntoLibrary(lib, payload.encrypted);
  }

  async injectIntoLibrary(lib, encryptedPayload) {
    console.log(`Injetando somente na biblioteca: ${lib}`);
    // Substitua este trecho pelo fluxo nativo que aplica o payload diretamente na .lib.
    await this.sleep(200);
  }

  updateVersionDisplay(version, packageName) {
    const versionElement = document.getElementById('detected-version');
    const packageElement = document.getElementById('detected-package');
    const gameVersionDisplay = document.getElementById('game-version-display');
    const gamePackageDisplay = document.getElementById('game-package-display');

    if (versionElement) versionElement.textContent = version;
    if (packageElement) packageElement.textContent = packageName;
    if (gameVersionDisplay) gameVersionDisplay.textContent = version;
    if (gamePackageDisplay) gamePackageDisplay.textContent = packageName;
  }

  updateStatus(status) {
    const statusElement = document.getElementById('status');
    const connectionStatus = document.getElementById('connection-status');

    if (statusElement) {
      if (status === 'injected') {
        statusElement.textContent = 'Cheat injetado';
        statusElement.className = 'status-indicator success';
      } else if (status === 'cleaned') {
        statusElement.textContent = 'Memória limpa';
        statusElement.className = 'status-indicator success';
      } else if (status === 'error') {
        statusElement.textContent = 'Erro';
        statusElement.className = 'status-indicator error';
      } else {
        statusElement.textContent = 'Aguardando...';
        statusElement.className = 'status-indicator';
      }
    }

    if (connectionStatus) {
      connectionStatus.textContent = status === 'injected' ? 'Online' : status === 'cleaned' ? 'Limpo' : status === 'Offline';
    }
  }

  async cleanMemory() {
    const version = this.config.version;
    const gamePackage = version === 'max' ? 'com.dts.freefiremax' : 'com.dts.freefireth';

    try {
      await fetch('/api/clean', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.getAuthToken()
        },
        body: JSON.stringify({
          package: gamePackage,
          full_clean: true
        })
      });

      this.updateStatus('cleaned');
    } catch (error) {
      console.error('Erro ao limpar:', error);
      this.updateStatus('error');
    }
  }

  async sendConfig() {
    const getInput = id => document.getElementById(id);
    const getChecked = id => {
      const el = getInput(id);
      return el ? el.checked : false;
    };
    const getValue = id => {
      const el = getInput(id);
      return el ? el.value : null;
    };
    const parseNumber = (id, fallback) => {
      const val = getValue(id);
      const num = Number(val);
      return Number.isFinite(num) ? num : fallback;
    };

    this.config.aimbot.enabled = getChecked('aimbot-toggle');
    this.config.aimbot.mode = getValue('aim-mode') || this.config.aimbot.mode;
    this.config.aimbot.fov = parseNumber('fov', this.config.aimbot.fov);
    this.config.aimbot.smoothness = parseNumber('smoothness', this.config.aimbot.smoothness);
    this.config.aimbot.maxDistance = parseNumber('max-distance', this.config.aimbot.maxDistance);
    this.config.aimbot.recoilControl = getChecked('recoil-control');
    this.config.aimbot.movementPrediction = getChecked('movement-prediction');

    this.config.esp.enabled = getChecked('esp-toggle');
    this.config.esp.type = getValue('esp-type') || this.config.esp.type;
    this.config.esp.showDistance = getChecked('show-distance');
    this.config.esp.showHealth = getChecked('show-health');
    this.config.esp.showName = getChecked('show-name');
    this.config.esp.showWeapon = getChecked('show-weapon');
    this.config.esp.showVehicle = getChecked('show-vehicle');
    this.config.esp.color = getValue('esp-color') || this.config.esp.color;
    this.config.esp.transparency = parseNumber('esp-transparency', this.config.esp.transparency);
    this.config.esp.maxDistance = parseNumber('esp-distance', this.config.esp.maxDistance);

    this.config.targetLibrary = getValue('target-library') || this.config.targetLibrary;

    this.config.antiban.level = getValue('antiban-level') || this.config.antiban.level;
    this.config.antiban.injectionDelay = parseNumber('injection-delay', this.config.antiban.injectionDelay);
    this.config.antiban.randomizeAddresses = getChecked('randomize-addresses');
    this.config.antiban.memoryCleanup = getChecked('memory-cleanup');
    this.config.antiban.trafficObfuscation = getChecked('traffic-obfuscation');

    console.log('Config atualizada:', this.config);
  }

  detectPlatform() {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('android')) return 'android';
    if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) return 'ios';
    return 'web';
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

const dualCheat = new DualCheatCore();

async function scanForGame() {
  const btn = document.querySelector('.btn-scan');
  if (btn) {
    btn.textContent = '🔎 Escaneando...';
    btn.disabled = true;
  }

  const games = await dualCheat.scanForGames();

  if (btn) {
    if (games.length > 0) {
      btn.textContent = '✅ Jogos Detectados';
      btn.style.background = '#4CAF50';
    } else {
      btn.textContent = '❌ Nenhum Jogo Encontrado';
      btn.style.background = '#f44336';
    }

    setTimeout(() => {
      btn.textContent = '🔎 Escanear Jogos';
      btn.style.background = '';
      btn.disabled = false;
    }, 3000);
  }
}

async function injectCheat(skipConfigUpdate = false) {
  const btn = document.querySelector('.btn-inject');
  if (btn) {
    btn.textContent = '⏳ Injetando...';
    btn.disabled = true;
  }

  if (!skipConfigUpdate) {
    dualCheat.sendConfig();
  }

  const result = await dualCheat.injectCheat();

  if (btn) {
    if (result) {
      btn.textContent = '✅ Injetado com Sucesso';
      btn.style.background = '#4CAF50';
    } else {
      btn.textContent = '❌ Erro na Injeção';
      btn.style.background = '#f44336';
    }

    setTimeout(() => {
      btn.textContent = '🚀 INJETAR CHEAT';
      btn.style.background = '';
      btn.disabled = false;
    }, 3000);
  }
}

async function injectStealth() {
  dualCheat.sendConfig();
  dualCheat.config.antiban.level = 'extreme';
  dualCheat.config.antiban.injectionDelay = 5000;
  await injectCheat(true);
}

async function cleanMemory() {
  const btn = document.querySelector('.btn-clean');
  if (btn) {
    btn.textContent = '🧹 Limpando...';
    btn.disabled = true;
  }

  await dualCheat.cleanMemory();

  if (btn) {
    btn.textContent = '✅ Memória Limpa';
    btn.style.background = '#4CAF50';
    setTimeout(() => {
      btn.textContent = '🧹 LIMPAR MEMÓRIA';
      btn.style.background = '';
      btn.disabled = false;
    }, 3000);
  }
}

function switchVersion() {
  const selector = document.getElementById('game-version');
  if (!selector) return;

  dualCheat.config.version = selector.value;

  if (selector.value !== 'auto') {
    dualCheat.updateVersionDisplay(
      selector.value === 'max' ? 'MAX' : 'Normal',
      selector.value === 'max' ? 'com.dts.freefiremax' : 'com.dts.freefireth'
    );
  }
}

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => scanForGame(), 2000);

  document.querySelectorAll('select, input').forEach(element => {
    element.addEventListener('change', () => {
      dualCheat.sendConfig();
    });
  });
});
