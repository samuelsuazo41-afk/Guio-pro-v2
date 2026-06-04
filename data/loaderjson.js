// /data/loaderjson.js
export async function loadAllBancs() {
  const bancsFiles = [
    'banco_estructura.json',
    'banco_generes.json',
    'banco_personatges.json',
    'banco_escenaris.json',
    'banco_emocions.json',
    'banco_ecenes.json',
    'banco_lectura.json',
    'determinants.json',
    'banco_vocabulari.json',
    'banco_preguntes.json',
    'banco_ubicacions.json',
    'banco_temes.json'
  ];

  const bancs = {};
  const promises = bancsFiles.map(async (file) => {
    const res = await fetch(`./data/${file}`);
    if (!res.ok) throw new Error(`No s'ha pogut carregar ${file}`);
    const key = file.replace('.json', '');
    bancs[key] = await res.json();
  });

  await Promise.all(promises);
  return bancs;
}
