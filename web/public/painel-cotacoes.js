/* Pretor: quadro de cotações no espaço vazio à esquerda da conversa (pedido do Chefe em 28/10/2026).
   Só aparece no computador com tela larga, onde sobra espaço entre o menu e a conversa.
   Busca direto do navegador em APIs públicas e gratuitas; nada da conversa sai daqui. */
(function () {
  'use strict';
  if (window.PretorCotacoes) return;
  window.PretorCotacoes = true;

  const CHAVE = 'pretor-cotacoes-oculto';
  const FONTES = {
    cambio: 'https://api.coinbase.com/v2/exchange-rates?currency=USD',
    cripto: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=brl,usd&include_24hr_change=true',
    tempo: 'https://api.open-meteo.com/v1/forecast?latitude=-23.62&longitude=-46.79&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=America%2FSao_Paulo&forecast_days=1',
    selic: 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json',
    ipca: 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.13522/dados/ultimos/1?formato=json',
  };
  const TEMPO = {0: ['☀️', 'céu limpo'], 1: ['🌤️', 'poucas nuvens'], 2: ['⛅', 'parcialmente nublado'], 3: ['☁️', 'nublado'],
    45: ['🌫️', 'neblina'], 48: ['🌫️', 'neblina'], 51: ['🌦️', 'garoa'], 53: ['🌦️', 'garoa'], 55: ['🌦️', 'garoa forte'],
    61: ['🌧️', 'chuva fraca'], 63: ['🌧️', 'chuva'], 65: ['🌧️', 'chuva forte'], 80: ['🌦️', 'pancadas'], 81: ['🌧️', 'pancadas'],
    82: ['⛈️', 'pancadas fortes'], 95: ['⛈️', 'trovoadas'], 96: ['⛈️', 'trovoadas'], 99: ['⛈️', 'trovoadas']};

  const css = `
#pcQuadro{position:fixed;top:84px;left:262px;width:250px;z-index:5;display:none;font:13px/1.35 system-ui,sans-serif;
  color:#f0e3e4;background:rgba(10,6,7,.82);border:1px solid rgba(212,0,0,.35);border-radius:16px;padding:14px 14px 10px;
  box-shadow:0 8px 28px rgba(0,0,0,.25);backdrop-filter:blur(8px)}
@media (min-width:1700px){#pcQuadro{display:block}#pcQuadro.oculto{display:none}#pcMostra{display:block}#pcMostra.some{display:none}}
#pcQuadro h4{margin:0 0 8px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#ff4d4d;display:flex;justify-content:space-between;align-items:center}
#pcQuadro h4 button{background:none;border:0;color:inherit;cursor:pointer;font-size:15px;padding:0 2px;opacity:.7}
#pcQuadro .pc-hora{font-size:30px;font-weight:700;letter-spacing:.02em;font-variant-numeric:tabular-nums}
#pcQuadro .pc-data{color:#a8959a;margin-bottom:10px}
#pcQuadro .pc-sec{border-top:1px solid rgba(255,255,255,.08);padding-top:8px;margin-top:8px}
#pcQuadro .pc-lin{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin:3px 0}
#pcQuadro .pc-lin span:first-child{color:#c8b6ba}
#pcQuadro .pc-val{font-weight:700;font-variant-numeric:tabular-nums;text-align:right}
#pcQuadro .pc-var{font-size:11px;font-weight:600;margin-left:4px}
#pcQuadro .sobe{color:#4ade80}#pcQuadro .desce{color:#ff5a5a}
#pcQuadro .pc-pe{color:#8a777b;font-size:11px;margin-top:8px}
#pcMostra{display:none;position:fixed;top:84px;left:262px;z-index:5;background:rgba(10,6,7,.8);color:#f0e3e4;border:1px solid rgba(212,0,0,.35);
  border-radius:12px;padding:6px 10px;cursor:pointer;font:13px system-ui}
html.tema-claro #pcQuadro,html.tema-claro #pcMostra{color:#1c1c1c;background:rgba(255,255,255,.85);border-color:rgba(192,0,0,.25)}
html.tema-claro #pcQuadro h4{color:#c00000}
html.tema-claro #pcQuadro .pc-data,html.tema-claro #pcQuadro .pc-lin span:first-child{color:#5f5f68}
html.tema-claro #pcQuadro .pc-sec{border-top-color:rgba(0,0,0,.08)}
html.tema-claro #pcQuadro .sobe{color:#1f7a3a}html.tema-claro #pcQuadro .desce{color:#c00000}`;

  const quadro = document.createElement('aside');
  quadro.id = 'pcQuadro';
  quadro.setAttribute('aria-label', 'Cotações e tempo');
  quadro.innerHTML = `
<h4>Hoje <button type="button" title="Esconder o quadro" aria-label="Esconder o quadro">×</button></h4>
<div class="pc-hora" data-k="hora">--:--</div><div class="pc-data" data-k="data"></div>
<div class="pc-lin"><span data-k="tempoTxt">Taboão da Serra</span><span class="pc-val" data-k="tempo">…</span></div>
<div class="pc-lin"><span>máx / mín</span><span class="pc-val" data-k="maxmin">…</span></div>
<div class="pc-sec">
<div class="pc-lin"><span>Dólar</span><span class="pc-val" data-k="usd">…</span></div>
<div class="pc-lin"><span>Euro</span><span class="pc-val" data-k="eur">…</span></div>
</div>
<div class="pc-sec">
<div class="pc-lin"><span>Bitcoin</span><span class="pc-val" data-k="btc">…</span></div>
<div class="pc-lin"><span></span><span class="pc-val" data-k="btcusd" style="font-weight:400">…</span></div>
<div class="pc-lin"><span>Ethereum</span><span class="pc-val" data-k="eth">…</span></div>
</div>
<div class="pc-sec">
<div class="pc-lin"><span>Selic</span><span class="pc-val" data-k="selic">…</span></div>
<div class="pc-lin"><span>IPCA 12 meses</span><span class="pc-val" data-k="ipca">…</span></div>
</div>
<div class="pc-pe" data-k="pe">atualizando…</div>`;
  const mostra = document.createElement('button');
  mostra.id = 'pcMostra';
  mostra.type = 'button';
  mostra.textContent = '💲 Cotações';

  const campo = k => quadro.querySelector(`[data-k="${k}"]`);
  const poe = (k, v) => { const e = campo(k); if (e) e.innerHTML = v; };
  const brl = (n, casas = 2) => 'R$ ' + Number(n).toLocaleString('pt-BR', {minimumFractionDigits: casas, maximumFractionDigits: casas});
  const variacao = p => {
    if (typeof p !== 'number' || !isFinite(p)) return '';
    const s = p >= 0 ? 'sobe' : 'desce';
    return `<span class="pc-var ${s}">${p >= 0 ? '▲' : '▼'} ${Math.abs(p).toLocaleString('pt-BR', {maximumFractionDigits: 1})}%</span>`;
  };
  const busca = url => fetch(url, {cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer'})
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); });

  function relogio() {
    const agora = new Date();
    poe('hora', agora.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo'}));
    const d = agora.toLocaleDateString('pt-BR', {weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Sao_Paulo'});
    poe('data', d.charAt(0).toUpperCase() + d.slice(1));
  }

  function cotacoes() {
    busca(FONTES.cambio).then(j => {
      const r = j.data.rates;
      poe('usd', brl(+r.BRL, 3));
      poe('eur', brl(+r.BRL / +r.EUR, 3));
    }).catch(() => {});
    busca(FONTES.cripto).then(j => {
      poe('btc', brl(j.bitcoin.brl, 0) + variacao(j.bitcoin.brl_24h_change));
      poe('btcusd', 'US$ ' + Number(j.bitcoin.usd).toLocaleString('en-US', {maximumFractionDigits: 0}));
      poe('eth', brl(j.ethereum.brl, 0) + variacao(j.ethereum.brl_24h_change));
    }).catch(() => {});
    poe('pe', 'atualizado às ' + new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo'}));
  }

  function tempo() {
    busca(FONTES.tempo).then(j => {
      const [ic, txt] = TEMPO[j.current.weather_code] || ['🌡️', ''];
      poe('tempoTxt', 'Taboão: ' + txt);
      poe('tempo', ic + ' ' + Math.round(j.current.temperature_2m) + '°C');
      const chuva = j.daily.precipitation_probability_max ? j.daily.precipitation_probability_max[0] : null;
      poe('maxmin', Math.round(j.daily.temperature_2m_max[0]) + '° / ' + Math.round(j.daily.temperature_2m_min[0]) + '°' +
        (chuva != null ? ` <span class="pc-var" style="color:inherit;opacity:.7">💧${chuva}%</span>` : ''));
    }).catch(() => {});
  }

  function indicadores() {
    busca(FONTES.selic).then(j => poe('selic', Number(j[0].valor).toLocaleString('pt-BR') + '% a.a.')).catch(() => {});
    busca(FONTES.ipca).then(j => poe('ipca', Number(j[0].valor).toLocaleString('pt-BR') + '%')).catch(() => {});
  }

  let ligado = false;
  function liga() {
    if (ligado) return;
    ligado = true;
    relogio(); cotacoes(); tempo(); indicadores();
    setInterval(relogio, 15000);
    setInterval(() => { if (!document.hidden) cotacoes(); }, 2 * 60000);
    setInterval(() => { if (!document.hidden) tempo(); }, 30 * 60000);
    setInterval(indicadores, 6 * 3600000);
  }

  const larga = window.matchMedia('(min-width:1700px)');
  const oculto = () => { try { return localStorage.getItem(CHAVE) === '1'; } catch (e) { return false; } };
  function aplica() {
    const esc = oculto();
    quadro.classList.toggle('oculto', esc);
    mostra.classList.toggle('some', !esc);
    if (larga.matches && !esc) liga();
  }
  quadro.querySelector('h4 button').addEventListener('click', () => {
    try { localStorage.setItem(CHAVE, '1'); } catch (e) { /* aba privada */ }
    aplica();
  });
  mostra.addEventListener('click', () => {
    try { localStorage.removeItem(CHAVE); } catch (e) { /* aba privada */ }
    aplica();
  });

  function monta() {
    const estilo = document.createElement('style');
    estilo.textContent = css;
    document.head.appendChild(estilo);
    document.body.appendChild(quadro);
    document.body.appendChild(mostra);
    aplica();
    if (larga.addEventListener) larga.addEventListener('change', aplica);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', monta); else monta();
})();
