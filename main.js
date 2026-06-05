// main.js - Guio-Pro v4.1 FIX DEFINITIVO DESPLEGABLES + GENEROS
import { loadAllBancs } from './data/loaderjson.js';
import { generarLlibre } from './core/generadorlilibre.js';

let bancs = {};
let llibreActual = null;
let configActual = {
  genere: null,
  nCapitols: 4,
  mon: null,
  personatge: null,
  estil: 'Directe'
};

console.log('main.js cargado v4.1');

document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM ready');
  try {
    bancs = await loadAllBancs();
    console.log('Bancs carregats:', Object.keys(bancs));

    renderAllSubtabs();
    enganxarEventListeners();
    console.log('App lista ✅');
  } catch (err) {
    console.error('Error iniciant app:', err);
    document.getElementById('resultat').innerHTML = '<p style="color:var(--danger)">Error carregant bancs. Revisa F12</p>';
  }
});

function enganxarEventListeners() {
  const headers = document.querySelectorAll('.tab-header');
  console.log('Headers encontrados:', headers.length);

  headers.forEach(header => {
    header.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Click en tab header');
      const tab = header.closest('.tab');
      const estabaAbierto = tab.classList.contains('open');
      console.log('Estaba abierto:', estabaAbierto);

      document.querySelectorAll('.tab').forEach(t => t.classList.remove('open'));

      if (!estabaAbierto) {
        tab.classList.add('open');
        console.log('Tab abierto:', tab.dataset.tab);
      }
    });
  });

  document.getElementById('btn-preview').addEventListener('click', mostrarOutline);
  document.getElementById('btn-generar').addEventListener('click', generarGuio);
  document.getElementById('btn-exportar').addEventListener('click', exportarTxt);
}

// FUNCIÓN NUEVA: acepta array directo o objeto con clave
function getArray(data,...keys) {
  if (Array.isArray(data)) return data; // si es array directo
  if (!data) return [];
  for (let key of keys) {
    if (Array.isArray(data[key])) return data[key]; // busca la clave
  }
  return [];
}

function renderAllSubtabs() {
  // Generos: mapea valores técnicos a nombres bonitos
  const generos = getArray(bancs.banco_generes, 'generos', 'llista', 'items');
  const nombresBonitos = {
    policiac: 'Policiac',
    romance: 'Romàntica',
    terror: 'Terror',
    thriller: 'Thriller',
    fantasia: 'Fantasia',
    comedia: 'Comèdia'
  };
  const generosFallback = ['policiac','romance','terror','thriller','fantasia','comedia'];
  renderSubtabs('genere-content', generos.length? generos : generosFallback, 'genere', v => nombresBonitos[v] || v);

  renderSubtabs('estructura-content', [3,4,6,8,12], 'nCapitols', v => `${v} cap`);

  const escenaris = getArray(bancs.banco_escenarios, 'tipos', 'escenaris', 'llista');
  renderSubtabs('mon-content', escenaris.length? escenaris : ['Aleatori','Ciutat','Rural','Històric','Futurista','Mar'], 'mon');

  const arquetips = getArray(bancs.banco_personatges, 'arquetipos', 'arquetips', 'llista');
  renderSubtabs('personatges-content', arquetips.length? arquetips : ['Aleatori','Heroïna','Antiheroi','Mentor','Vilà','Grup'], 'personatge');

  renderSubtabs('estil-content', ['Directe','Poètic','Juvenil','Adult'], 'estil');
}

function renderSubtabs(containerId, items, configKey, labelFn = v => v) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn('Container no encontrado:', containerId);
    return;
  }

  container.innerHTML = '';
  console.log(`Pintando ${containerId} con ${items.length} items:`, items);

  if (configActual[configKey] === null && items.length > 0) {
    configActual[configKey] = items[0];
  }

  if (items.length === 0) {
    container.innerHTML = '<p style="color:var(--danger);font-size:0.8rem">Sense dades</p>';
    return;
  }

  items.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'subtab-btn';
    btn.textContent = labelFn(item);
    if (configActual[configKey] === item) btn.classList.add('active');

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      container.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      configActual[configKey] = item;
      console.log('Config actualitzada:', configActual);
    });

    container.appendChild(btn);
  });
}

function mostrarOutline() {
  const resultat = document.getElementById('resultat');
  const beats = getArray(bancs.banco_estructura, 'beats');
  if (!beats.length) {
    resultat.innerHTML = '<p style="color:var(--danger)">Error: no se encontró banco_estructura.json o no té beats</p>';
    return;
  }

  let html = `<h2>Outline - ${configActual.genere || 'Aleatori'}</h2>`;
  beats.forEach(beat => {
    html += `<p><b>Beat ${beat.id}: ${beat.nom}</b> - ${beat.objectiu || ''}</p><hr>`;
  });
  resultat.innerHTML = html;
  llibreActual = null;
}

async function generarGuio() {
  const resultat = document.getElementById('resultat');
  resultat.innerHTML = 'Generant guió...';
  try {
    llibreActual = await generarLlibre(configActual);
    let html = `<h2>Guió generat</h2>`;
    llibreActual.capitols.forEach(cap => {
      html += `<h3>Capítol ${cap.num}</h3>`;
      cap.escenes.forEach(esc => {
        html += `<p><b>${esc.titol}</b><br>${esc.text}</p>`;
      });
    });
    resultat.innerHTML = html;
  } catch (err) {
    console.error('Error generant:', err);
    resultat.innerHTML = `<p style="color:var(--danger)">Error generant: ${err.message}</p>`;
  }
}

function exportarTxt() {
  if (!llibreActual) {
    alert('Primer genera el guió');
    return;
  }
  let text = `Guió Guio-Pro\n`;
  llibreActual.capitols.forEach(cap => {
    text += `CAPÍTOL ${cap.num}\n\n`;
    cap.escenes.forEach(esc => text += `${esc.titol}\n${esc.text}\n\n`);
  });
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `guio-pro.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}