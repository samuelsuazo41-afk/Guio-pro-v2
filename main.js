// main.js - Guio-Pro v6.0 FLUX 3 NIVELLS + 9 BANCS
import { loadAllBancs } from './data/loaderjson.js';
import { generarLlibre } from './core/generadorlilibre.js';

let bancs = {};
let llibreActual = null;
let configActual = {
  genere: null,
  personatgeId: null,
  personatgeNom: null,
  nCapitols: 4,
  mon: null,
  escenari: null,
  escenariNom: null,
  estil: 'Directe',
  intensitat: 'mitjana'
};

console.log('main.js carregat v6.0');

document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM ready');
  try {
    bancs = await loadAllBancs();
    console.log('Bancs carregats:', Object.keys(bancs));

    renderGeneres();
    renderEstructura();
    renderEstil();
    enganxarEventListeners();
    console.log('App lista ✅');
  } catch (err) {
    console.error('Error iniciant app:', err);
    document.getElementById('resultat').innerHTML = '<p style="color:var(--danger)">Error carregant bancs. Revisa F12</p>';
  }
});

function enganxarEventListeners() {
  const headers = document.querySelectorAll('.tab-header');
  headers.forEach(header => {
    header.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = header.closest('.tab');
      const estabaAbierto = tab.classList.contains('open');
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('open'));
      if (!estabaAbierto) tab.classList.add('open');
    });
  });

  document.getElementById('btn-preview').addEventListener('click', mostrarOutline);
  document.getElementById('btn-generar').addEventListener('click', generarGuio);
  document.getElementById('btn-exportar').addEventListener('click', exportarTxt);
}

function getArray(data,...keys) {
  if (Array.isArray(data)) return data;
  if (!data) return [];
  for (let key of keys) {
    if (Array.isArray(data[key])) return data[key];
  }
  return [];
}

// NIVELL 1: GÈNERE - dispara render Personatge + Escenari
function renderGeneres() {
  const generos = getArray(bancs.banco_generes, 'generos', 'llista', 'items');
  const nombresBonitos = {
    policiac: 'Policiac',
    romance: 'Romàntica',
    terror: 'Terror',
    thriller: 'Thriller',
    fantasia: 'Fantasia',
    comedia: 'Comèdia'
  };
  const fallback = ['policiac','romance','terror','thriller','fantasia','comedia'];
  renderSubtabs('genere-content', generos.length? generos : fallback, 'genere', v => nombresBonitos[v] || v, (v) => {
    configActual.genere = v;
    renderPersonatges(v);
    renderMon();
  });
}

// NIVELL 2: PERSONATGE - filtra per genere
function renderPersonatges(genere) {
  const personatges = bancs.banco_personatge || [];
  const filtrats = personatges.filter(p => p.genero === genere);
  const items = filtrats.map(p => ({
    id: p.id,
    nom: p.banco_variables?.nom?.[0] || p.nom || p.id
  }));
  renderSubtabs('personatge-content', items, 'personatgeId', v => v.nom, (v) => {
    configActual.personatgeId = v.id;
    configActual.personatgeNom = v.nom;
  });
}

// NIVELL 2: ESTRUCTURA - fix
function renderEstructura() {
  renderSubtabs('estructura-content', [3,4,6,8,12], 'nCapitols', v => `${v} cap`);
}

// NIVELL 2: MÓN - ciutats úniques de banco_escenarios.json
function renderMon() {
  const escenaris = bancs.banco_escenarios || [];
  const ciutats = [...new Set(escenaris.map(e => e.ciutat).filter(Boolean))];
  const fallback = ['Girona','Barcelona','Aleatori'];
  renderSubtabs('mon-content', ciutats.length? ciutats : fallback, 'mon', v => v, (v) => {
    configActual.mon = v;
    renderEscenaris(v);
  });
}

// NIVELL 3: ESCENARI - filtra per ciutat + genere
function renderEscenaris(ciutat) {
  const escenaris = bancs.banco_escenarios || [];
  const filtrats = escenaris.filter(e =>
    e.ciutat === ciutat && (!configActual.genere || e.genero?.includes(configActual.genere))
  );
  const items = filtrats.map(e => ({
    id: e.id,
    nom: e.nom
  }));
  renderSubtabs('escenari-content', items, 'escenari', v => v.nom, (v) => {
    configActual.escenari = v.id;
    configActual.escenariNom = v.nom;
  });
}

// NIVELL 2: ESTIL
function renderEstil() {
  renderSubtabs('estil-content', ['Directe','Poètic','Juvenil','Adult'], 'estil');
}

function renderSubtabs(containerId, items, configKey, labelFn = v => v, onClick = null) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn('Container no trobat:', containerId);
    return;
  }

  container.innerHTML = '';
  console.log(`Pintant ${containerId} amb ${items.length} items`);

  if (configActual[configKey] === null && items.length > 0) {
    configActual[configKey] = items[0].id || items[0];
  }

  if (items.length === 0) {
    container.innerHTML = '<p style="color:var(--danger);font-size:0.8rem">Sense dades</p>';
    return;
  }

  items.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'subtab-btn';
    const value = item.id || item;
    btn.textContent = labelFn(item);
    if (configActual[configKey] === value) btn.classList.add('active');

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      container.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      configActual[configKey] = value;
      if (onClick) onClick(item);
      console.log('Config actualitzada:', configActual);
    });

    container.appendChild(btn);
  });
}

function mostrarOutline() {
  const resultat = document.getElementById('resultat');
  const beats = getArray(bancs.banco_estructura, 'beats');
  if (!beats.length) {
    resultat.innerHTML = '<p style="color:var(--danger)">Error: no es troba banco_estructura.json o no té beats</p>';
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