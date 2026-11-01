/* Pretor: quadro de cotações no espaço vazio à esquerda da conversa do Aro (pedido do Chefe em 28/10/2026;
   desde 1/11/2026 só no Aro, como painel de indicadores). Só no computador com tela larga, onde sobra espaço.
   Busca direto do navegador em APIs públicas e gratuitas; nada da conversa sai daqui. */
(function () {
  'use strict';
  if (window.PretorCotacoes || !/^\/a\/jasper\/?$/.test(location.pathname)) return;
  window.PretorCotacoes = true;

  const CHAVE = 'pretor-cotacoes-oculto';
  const FONTES = {
    cambio: 'https://api.coinbase.com/v2/exchange-rates?currency=USD',
    cripto: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=brl,usd&include_24hr_change=true',
    tempo: 'https://api.open-meteo.com/v1/forecast?latitude=-23.62&longitude=-46.79&current=temperature_2m&timezone=America%2FSao_Paulo',
    selic: 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json',
    ipca: 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.13522/dados/ultimos/1?formato=json',
  };
  const L = 272, ESQ = 262, TOPO = 84;

  const css = `
#pcQuadro{--a:#7fc0ff;--f:#e4f1ff;--s:#9db3cf;--l:rgba(127,192,255,.2);--bg:rgba(13,26,52,.6);--bo:rgba(127,192,255,.28);--so:0 10px 28px rgba(0,0,0,.35);--t:rgba(255,255,255,.06);
  position:fixed;top:${TOPO}px;left:${ESQ}px;width:${L}px;box-sizing:border-box;z-index:5;display:none;padding:15px;
  font:12.5px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:var(--f);background:var(--bg);
  backdrop-filter:blur(16px) saturate(1.3);-webkit-backdrop-filter:blur(16px) saturate(1.3);border:1px solid var(--bo);border-radius:16px;box-shadow:var(--so)}
@media (min-width:1100px){#pcQuadro{display:block}#pcQuadro.oculto,#pcQuadro.cobre{display:none}#pcMostra{display:block}#pcMostra.some,#pcMostra.cobre{display:none}}
#pcQuadro .pc-sup{display:flex;align-items:baseline;gap:8px;font-size:10.5px;font-weight:600;letter-spacing:.1em;color:var(--a)}
#pcQuadro .pc-sup span{margin-left:auto;font-weight:400;letter-spacing:0;color:var(--s);font-variant-numeric:tabular-nums}
#pcQuadro .pc-sup button{background:none;border:0;color:var(--s);cursor:pointer;font-size:14px;line-height:1;padding:0}
#pcQuadro .pc-dia{font-size:20px;font-weight:600;line-height:1.15;margin:3px 0 10px}
#pcQuadro .pc-blocos{display:grid;grid-template-columns:1fr 1fr;gap:7px}
#pcQuadro .pc-bloco{min-width:0;background:var(--t);border:1px solid var(--l);border-radius:10px;padding:8px 9px}
#pcQuadro .pc-bloco small{display:block;color:var(--s);font-size:10.5px}
#pcQuadro .pc-bloco b{display:block;font-size:15px;font-weight:650;font-variant-numeric:tabular-nums;white-space:nowrap}
#pcQuadro .pc-var{display:block;font-size:10px}
#pcQuadro .sobe{color:#4ade80}#pcQuadro .desce{color:#ff7a7a}
#pcMostra{display:none;position:fixed;top:${TOPO}px;left:${ESQ}px;z-index:5;background:transparent;color:#7fc0ff;border:1px solid rgba(127,192,255,.4);
  border-radius:10px;padding:6px 10px;cursor:pointer;font:600 11px system-ui,sans-serif}
html.tema-claro #pcQuadro{--a:#1262d6;--f:#16233a;--s:#4d5c73;--l:rgba(22,35,58,.12);--bg:rgba(255,255,255,.66);--bo:rgba(255,255,255,.8);--so:0 10px 26px rgba(30,50,90,.16);--t:rgba(255,255,255,.72)}
html.tema-claro #pcMostra{color:#1262d6;border-color:rgba(18,98,214,.4)}
html.tema-claro #pcQuadro .sobe{color:#1f7a3a}html.tema-claro #pcQuadro .desce{color:#c00000}`;

  const quadro = document.createElement('aside');
  quadro.id = 'pcQuadro';
  quadro.setAttribute('aria-label', 'Cotações e tempo');
  quadro.innerHTML = `
<div class="pc-sup">MERCADO <span data-k="agora">--:--</span><button type="button" title="Esconder o quadro" aria-label="Esconder o quadro">×</button></div>
<div class="pc-dia" data-k="data"></div>
<div class="pc-blocos">
<div class="pc-bloco"><small>Dólar</small><b data-k="usd">…</b></div>
<div class="pc-bloco"><small>Euro</small><b data-k="eur">…</b></div>
<div class="pc-bloco"><small>Bitcoin</small><b data-k="btc">…</b><span data-k="btcv"></span></div>
<div class="pc-bloco"><small>Ethereum</small><b data-k="eth">…</b><span data-k="ethv"></span></div>
<div class="pc-bloco"><small>Selic</small><b data-k="selic">…</b></div>
<div class="pc-bloco"><small>IPCA 12 meses</small><b data-k="ipca">…</b></div>
</div>`;
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

  let temperatura = '';
  function relogio() {
    const agora = new Date(), z = {timeZone: 'America/Sao_Paulo'};
    poe('agora', agora.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit', ...z}) + temperatura);
    const dia = agora.toLocaleDateString('pt-BR', {weekday: 'long', ...z}).split('-')[0];
    poe('data', dia.charAt(0).toUpperCase() + dia.slice(1) + ', ' + agora.toLocaleDateString('pt-BR', {day: 'numeric', month: 'numeric', ...z}));
  }

  function cotacoes() {
    busca(FONTES.cambio).then(j => {
      const r = j.data.rates;
      poe('usd', brl(+r.BRL, 3));
      poe('eur', brl(+r.BRL / +r.EUR, 3));
    }).catch(() => {});
    busca(FONTES.cripto).then(j => {
      poe('btc', brl(j.bitcoin.brl, 0));
      poe('btcv', variacao(j.bitcoin.brl_24h_change));
      poe('eth', brl(j.ethereum.brl, 0));
      poe('ethv', variacao(j.ethereum.brl_24h_change));
    }).catch(() => {});
  }

  function tempo() {
    busca(FONTES.tempo).then(j => {
      temperatura = ' · ' + Math.round(j.current.temperature_2m) + '°C';
      relogio();
    }).catch(() => {});
  }

  function indicadores() {
    busca(FONTES.selic).then(j => poe('selic', Number(j[0].valor).toLocaleString('pt-BR') + '%')).catch(() => {});
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

  const larga = window.matchMedia('(min-width:1100px)');
  const oculto = () => { try { return localStorage.getItem(CHAVE) === '1'; } catch (e) { return false; } };
  function aplica() {
    const esc = oculto();
    quadro.classList.toggle('oculto', esc);
    mostra.classList.toggle('some', !esc);
    if (larga.matches && !esc) liga();
  }
  quadro.querySelector('.pc-sup button').addEventListener('click', () => {
    try { localStorage.setItem(CHAVE, '1'); } catch (e) { /* aba privada */ }
    aplica();
  });
  mostra.addEventListener('click', () => {
    try { localStorage.removeItem(CHAVE); } catch (e) { /* aba privada */ }
    aplica();
  });

  /* Some só se alguma mensagem na tela chegar até o quadro; volta quando ela sair. */
  function desvia() {
    let bate = false;
    const fim = ESQ + L + 16, H = window.innerHeight, alt = quadro.offsetHeight || 340;
    document.querySelectorAll('#chat .bub').forEach(b => {
      const r = b.getBoundingClientRect();
      if (r.width && r.left < fim && r.top < TOPO + alt && r.bottom > TOPO && r.top < H) bate = true;
    });
    quadro.classList.toggle('cobre', bate);
    mostra.classList.toggle('cobre', bate);
  }

  function monta() {
    const estilo = document.createElement('style');
    estilo.textContent = css;
    document.head.appendChild(estilo);
    document.body.appendChild(quadro);
    document.body.appendChild(mostra);
    aplica();
    if (larga.addEventListener) larga.addEventListener('change', aplica);
    setInterval(desvia, 1000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', monta); else monta();
})();
