// core/generadorLlibre.js

// Funció per triar un item segons el seu pes en %
function triarPerPes(objPercentatges) {
  const entries = Object.entries(objPercentatges).filter(([k, v]) => v > 0);
  if (entries.length === 0) return null;

  const total = entries.reduce((sum, [, v]) => sum + v, 0);
  const random = Math.random() * total;
  let acumulat = 0;

  for (const [item, pes] of entries) {
    acumulat += pes;
    if (random <= acumulat) return item;
  }
  return entries[0][0]; // fallback
}

// Funció per triar frase segons % de personalitat
function triarFrasePersonalitat(bancoEmocions, pesosPersonalitat) {
  const categoria = triarPerPes(pesosPersonalitat);
  if (!categoria ||!bancoEmocions[categoria]) return "Pensament intern...";

  const frases = bancoEmocions[categoria];
  return frases[Math.floor(Math.random() * frases.length)];
}

export async function generarLlibre(config) {
  const bancs = window.bancs;
  if (!bancs) throw new Error("Bancs no carregats");

  // 1. Tria elements segons %
  const genereTriat = triarPerPes(config.genero);
  const escenariTriat = triarPerPes(config.escenari);
  const arquetipTriat = triarPerPes(config.arquetip);
  const llenguatgeTriat = triarPerPes(config.llenguatge);

  // 2. Agafa beats segons nº de capítols
  const beats = bancs.banco_estructura?.beats || [];
  const beatsPerCapitol = Math.ceil(beats.length / config.nCapitols);

  const capitols = [];

  for (let i = 0; i < config.nCapitols; i++) {
    const beatsDelCapitol = beats.slice(i * beatsPerCapitol, (i + 1) * beatsPerCapitol);
    const escenes = [];

    beatsDelCapitol.forEach(beat => {
      // 3. Tria escenari per escena respectant %
      const escenariEscena = triarPerPes(config.escenari);

      // 4. Genera text amb personalitat del prota
      const pensament = triarFrasePersonalitat(bancs.banco_emocions, config.personalitat.prota);

      escenes.push({
        titol: `Escena: ${beat.nom} - ${escenariEscena}`,
        text: `${beat.descripcio || ''}\n\nPensament del protagonista: ${pensament}`
      });
    });

    capitols.push({
      num: i + 1,
      escenes
    });
  }

  return {
    metadata: {
      genere: genereTriat,
      escenari: escenariTriat,
      arquetip: arquetipTriat,
      llenguatge: llenguatgeTriat,
      nCapitols: config.nCapitols
    },
    capitols
  };
      }
