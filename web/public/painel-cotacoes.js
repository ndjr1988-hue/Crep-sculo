/* Pretor: quadro de cotações no espaço vazio à esquerda da conversa do Aro (pedido do Chefe em 28/10/2026;
   desde 1/11/2026 só no Aro, com traços finos). Só no computador com tela larga, onde sobra espaço.
   Busca direto do navegador em APIs públicas e gratuitas; nada da conversa sai daqui. */
(function () {
  'use strict';
  if (window.PretorCotacoes || !/^\/a\/jasper\/?$/.test(location.pathname)) return;
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
#pcQuadro{--c:#7fc0ff;--f:#d6ecff;--s:#8fa6c4;--l:rgba(127,192,255,.32);
  position:fixed;top:84px;left:262px;width:236px;z-index:5;display:none;padding:14px 16px 10px;
  font:12.5px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--f);background:transparent;
  border:1px solid var(--l);border-radius:2px}
#pcQuadro::before,#pcQuadro::after{content:"";position:absolute;width:12px;height:12px;border:1.5px solid var(--c)}
#pcQuadro::before{top:-1px;left:-1px;border-right:0;border-bottom:0}
#pcQuadro::after{bottom:-1px;right:-1px;border-left:0;border-top:0}
@media (min-width:1500px){#pcQuadro{display:block}#pcQuadro.oculto{display:none}#pcMostra{display:block}#pcMostra.some{display:none}}
#pcQuadro h4{margin:0 0 6px;font:600 10.5px/1 ui-monospace,monospace;letter-spacing:.32em;color:var(--c);display:flex;justify-content:space-between;align-items:center}
#pcQuadro h4 button{background:none;border:0;color:var(--s);cursor:pointer;font-size:14px;padding:0}
#pcQuadro .pc-hora{font-size:30px;font-weight:300;letter-spacing:.06em;font-variant-numeric:tabular-nums}
#pcQuadro .pc-data{color:var(--s);font-size:11px;margin-bottom:8px}
#pcQuadro .pc-sec{border-top:1px solid var(--l);padding-top:7px;margin-top:7px}
#pcQuadro .pc-lin{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin:3px 0}
#pcQuadro .pc-lin span:first-child{color:var(--s);font-size:11px;letter-spacing:.04em}
#pcQuadro .pc-val{font-weight:400;font-variant-numeric:tabular-nums;text-align:right}
#pcQuadro .pc-var{font-size:10.5px;margin-left:4px}
#pcQuadro .sobe{color:#4ade80}#pcQuadro .desce{color:#ff5a5a}
#pcQuadro .pc-pe{color:var(--s);font-size:10px;margin-top:8px;letter-spacing:.04em}
#pcMostra{display:none;position:fixed;top:84px;left:262px;z-index:5;background:transparent;color:#7fc0ff;border:1px solid rgba(127,192,255,.4);
  border-radius:2px;padding:6px 10px;cursor:pointer;font:12px ui-monospace,monospace}
html.tema-claro #pcQuadro{--c:#1262d6;--f:#16233a;--s:#46566e;--l:rgba(18,98,214,.34)}
html.tema-claro #pcMostra{color:#1262d6;border-color:rgba(18,98,214,.4)}
html.tema-claro #pcQuadro .sobe{color:#1f7a3a}html.tema-claro #pcQuadro .desce{color:#c00000}`;

  const quadro = document.createElement('aside');
  quadro.id = 'pcQuadro';
  quadro.setAttribute('aria-label', 'Cotações e tempo');
  quadro.innerHTML = `
<h4>MERCADO <button type="button" title="Esconder o quadro" aria-label="Esconder o quadro">×</button></h4>
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
  mostra.textContent = '+ MERCADO';

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

  const larga = window.matchMedia('(min-width:1500px)');
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
