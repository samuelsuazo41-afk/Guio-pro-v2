// main.js - Guio-Pro v3.5 FIX FINAL SUBMENÚS
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

document.addEventListener('DOMContentLoaded', async () => {
  try {
    bancs = await loadAllBancs();
    console.log('Bancs carregats:', Object.keys(bancs));

    // Pinta subtabs immediatament amb fallback si bancs ve buit
    renderAllSubtabs();
    enganxarEventListeners();
    console.log('App lista ✅');
  } catch (err) {
    console.error('Error iniciant app:', err);
    const resultat = document.getElementById('resultat');
    if (resultat) {
      resultat.innerHTML = '<p style="color:var(--danger)">Error carregant bancs</p>';
    }
  }
});

function enganxarEventListeners() {
  document.querySelectorAll('.tab-header').forEach(header => {
    header.addEventListener('click', (e) => {
      e.preventDefault();
      vibrar();
      const tab = header.closest('.tab');
      const estabaAbierto = tab.classList.contains('open');
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('open'));
      if (!estabaAbierto) {
        tab.classList.add('open');
      }
    });
  });

  document.getElementById('btn-preview').addEventListener('click', mostrarOutline);
  document.getElementById('btn-generar').addEventListener('click', generarGuio);
  document.getElementById('btn-exportar').addEventListener('click', exportarTxt);
}

function renderAllSubtabs() {
  // Fallback dur com al TEST TABS v22 si el JSON no carrega
  const generos = bancs.banco_generes?.generos || bancs.generes || ['Drama','Romàntica','Thriller','Fantasia','Sci-Fi','Històrica'];
  renderSubtabs('genere-content', generos, 'genere');

  renderSubtabs('estructura-content', [3,4,6,8,12], 'nCapitols', v => `${v} cap`);

  const escenaris = bancs.banco_escenaris?.tipos || bancs.escenaris || ['Aleatori','Ciutat','Rural','Històric','Futurista','Mar'];
  renderSubtabs('mon-content', escenaris, 'mon');

  const arquetips = bancs.banco_personatges?.arquetipos || bancs.arquetips || ['Aleatori','Heroïna','Antiheroi','Mentor','Vilà','Grup'];
  renderSubtabs('personatges-content', arquetips, 'personatge');

  renderSubtabs('estil-content', ['Directe','Poètic','Juvenil','Adult'], 'estil');
}

function renderSubtabs(containerId, items, configKey, labelFn = v => v) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  // Si per algun motiu items ve buit, posa el primer per defecte
  if (configActual[configKey] === null && items.length > 0) {
    configActual[configKey] = items[0];
  }

  items.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'subtab-btn';
    btn.textContent = labelFn(item);
    if (configActual[configKey] === item) btn.classList.add('active');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      vibrar();
      container.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      configActual[configKey] = item;
    });
    container.appendChild(btn);
  });
}

function mostrarOutline() {
  const resultat = document.getElementById('resultat');
  if (!bancs.banco_estructura?.beats) {
    resultat.innerHTML = '<p style="color:var(--danger)">Error: no se encontró banco_estructura.json</p>';
    return;
  }
  let html = `<h2>Outline - ${configActual.genere || 'Aleatori'}</h2>`;
  bancs.banco_estructura.beats.forEach(beat => {
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

function vibrar() {
  if (navigator.vibrate) navigator.vibrate(50);
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(console.error);
  });
}
