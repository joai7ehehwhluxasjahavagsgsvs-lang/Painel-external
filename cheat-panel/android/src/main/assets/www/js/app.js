console.log('Cheat Panel frontend loaded');

async function api(path, opts = {}) {
  const res = await fetch(path, opts);
  return res.json();
}

// exemplo: buscar status do backend
api('/cheat/status').then(console.log).catch(() => {});
