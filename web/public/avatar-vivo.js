/* Pretor: avatar vivo dos agentes no alto do menu (pedido do Chefe em 31/10/2026).
   A foto fica parada e sinais de luz correm pelos pontos do cérebro. Calmo quando livre, acelerado
   com html.agente-trabalhando, pulsando enquanto o #player toca a voz. No celular, a 20 quadros.
   Qualquer falha tira o efeito e deixa a foto normal. Cada lista de pontos vale para uma imagem: trocou a foto, refaça os pontos. */
(function () {
  'use strict';
  if (window.PretorAvatarVivo) return;
  window.PretorAvatarVivo = true;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches) return;

  const PONTOS_DE = {
    admin: [[0.5,0.3655],[0.5011,0.2705],[0.6216,0.2838],[0.3409,0.3258],[0.4823,0.2208],[0.5607,0.2495],[0.5199,0.2097],[0.4326,0.1876],[0.6547,0.3268],[0.4801,0.3302],[0.5972,0.328],[0.384,0.2926],[0.3409,0.2783],[0.6304,0.2142],[0.4204,0.3545],[0.363,0.2484],[0.4724,0.3025],[0.4525,0.3666],[0.5342,0.3014],[0.447,0.1987],[0.4448,0.3014],[0.5917,0.1788],[0.5265,0.2429],[0.6282,0.2484],[0.4934,0.181],[0.3873,0.3644],[0.5387,0.223],[0.595,0.2583],[0.3884,0.2384],[0.5652,0.3567],[0.5177,0.328],[0.4724,0.202],[0.6249,0.35],[0.6072,0.3644],[0.4569,0.2749],[0.4238,0.2616],[0.4216,0.2396],[0.4072,0.2296],[0.4061,0.328],[0.3762,0.2639],[0.658,0.3555],[0.342,0.2396],[0.6083,0.2174],[0.5387,0.371],[0.5829,0.3169],[0.5552,0.3423],[0.5431,0.2849],[0.6602,0.2451],[0.5807,0.3655],[0.5685,0.3136],[0.4702,0.3523],[0.3784,0.3467],[0.447,0.2418]],
    marcus: [[0.3281,0.2125],[0.3516,0.1469],[0.6578,0.1594],[0.6609,0.1875],[0.3187,0.1906],[0.6562,0.3156],[0.3328,0.1688],[0.4344,0.1562],[0.5594,0.2891],[0.2984,0.2344],[0.3094,0.2125],[0.4859,0.2703],[0.4766,0.2453],[0.5047,0.2297],[0.6281,0.2156],[0.4969,0.2453],[0.4734,0.2984],[0.6781,0.1891],[0.4953,0.2016],[0.4938,0.1375],[0.5453,0.1578],[0.5172,0.2],[0.45,0.2797],[0.5281,0.1781],[0.55,0.2578],[0.3281,0.25],[0.3688,0.15],[0.4297,0.2781],[0.5328,0.2109],[0.4078,0.2359],[0.5547,0.1734],[0.5828,0.2828],[0.5,0.1062],[0.4906,0.1656],[0.6031,0.2203],[0.4375,0.2203],[0.4422,0.2453],[0.6062,0.2609],[0.5766,0.2641],[0.3828,0.2531],[0.4781,0.1906],[0.6,0.2406],[0.5375,0.2938],[0.4656,0.1437],[0.5312,0.3109],[0.5875,0.2],[0.5625,0.225],[0.5281,0.2781],[0.5906,0.1609],[0.3891,0.275],[0.5453,0.1172],[0.5734,0.1781],[0.5047,0.3078],[0.4437,0.1844],[0.4344,0.2031],[0.3828,0.2313],[0.5172,0.1406],[0.3578,0.3234],[0.5219,0.1094],[0.5328,0.2391],[0.6141,0.1187],[0.4766,0.2219],[0.3547,0.2203],[0.6156,0.3125],[0.4016,0.2141],[0.5078,0.1578],[0.6062,0.1938],[0.4047,0.1688],[0.4969,0.2891],[0.4484,0.0969]],
  };
  const ESTADOS = {livre: {n: 7, v: .012}, pensando: {n: 28, v: .04}, falando: {n: 16, v: .022}};
  let PONTOS = [], vizinhos = [], brilho = [], sinais = [];
  function prepara(lista) {
    PONTOS = lista;
    vizinhos = PONTOS.map(p => PONTOS.map((q, j) => [(p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2, j])
      .sort((a, b) => a[0] - b[0]).slice(1, 4).map(x => x[1]));
    brilho = PONTOS.map(() => 0);
    sinais = Array.from({length: 30}, () => {
      const a = Math.floor(Math.random() * PONTOS.length);
      return {a, b: vizinhos[a][0], t: Math.random()};
    });
  }

  let vivo = null, voz = false;
  const player = document.getElementById('player');
  if (player) {
    player.addEventListener('playing', () => { voz = player.duration > 1 || !isFinite(player.duration); });
    ['pause', 'ended', 'emptied'].forEach(ev => player.addEventListener(ev, () => { voz = false; }));
  }
  function camada(caixa, W) {
    const c = document.createElement('canvas');
    c.width = c.height = W;
    c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;border-radius:50%;pointer-events:none';
    caixa.appendChild(c);
    return c;
  }

  function liga(caixa, img) {
    const W = 240, computador = matchMedia('(min-width:1100px)').matches;
    if (getComputedStyle(caixa).position === 'static') caixa.style.position = 'relative';
    const fx = camada(caixa, W).getContext('2d');
    vivo = {caixa, fx, W, computador, ultimo: 0};
  }

  function desliga() {
    if (vivo) { vivo.caixa.querySelectorAll('canvas').forEach(c => c.remove()); }
    vivo = null;
  }

  function quadro(t) {
    requestAnimationFrame(quadro);
    if (!vivo || document.hidden) return;
    if (t - vivo.ultimo < (vivo.computador ? 30 : 50)) return;
    vivo.ultimo = t;
    try {
      const est = voz ? 'falando' : document.documentElement.classList.contains('agente-trabalhando') ? 'pensando' : 'livre';
      const e = ESTADOS[est], {W, fx} = vivo;
      const pos = p => [p[0] * W, p[1] * W];
      for (let i = 0; i < brilho.length; i++) brilho[i] *= .92;
      for (let i = 0; i < e.n; i++) {
        const s = sinais[i];
        s.t += e.v;
        if (s.t >= 1) {
          brilho[s.b] = 1;
          const o = vizinhos[s.b];
          s.a = s.b; s.b = o[Math.floor(Math.random() * o.length)]; s.t = 0;
        }
      }
      const f = voz ? Math.abs(Math.sin(t / 120) * Math.sin(t / 47 + 1)) : 0;
      fx.clearRect(0, 0, W, W);
      fx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < PONTOS.length; i++) {
        const b = Math.min(1, brilho[i] + f * .45);
        if (b < .03) continue;
        const q = pos(PONTOS[i]), r = W * .024 * (1 + b), h = fx.createRadialGradient(q[0], q[1], 0, q[0], q[1], r);
        h.addColorStop(0, `rgba(255,255,255,${b.toFixed(3)})`);
        h.addColorStop(.35, `rgba(90,167,255,${(b * .7).toFixed(3)})`);
        h.addColorStop(1, 'rgba(47,139,255,0)');
        fx.fillStyle = h; fx.beginPath(); fx.arc(q[0], q[1], r, 0, 6.283); fx.fill();
      }
      fx.lineWidth = W * .004; fx.lineCap = 'round'; fx.strokeStyle = 'rgba(150,205,255,.9)';
      for (let i = 0; i < e.n; i++) {
        const s = sinais[i], A = pos(PONTOS[s.a]), C = pos(PONTOS[s.b]), t0 = Math.max(0, s.t - .35);
        fx.beginPath();
        fx.moveTo(A[0] + (C[0] - A[0]) * t0, A[1] + (C[1] - A[1]) * t0);
        fx.lineTo(A[0] + (C[0] - A[0]) * s.t, A[1] + (C[1] - A[1]) * s.t);
        fx.stroke();
      }
      fx.globalCompositeOperation = 'source-over';
    } catch (e) { desliga(); }
  }

  function confere() {
    const mold = document.getElementById('mlMoldura');
    const caixa = mold && mold.querySelector('.ml-foto');
    const img = caixa && caixa.querySelector('img');
    const achado = img && (/\/agents\/([^/]+)\//.exec(img.src) || /\/(jasper|marcus)\.jpg/.exec(img.src));
    const slug = achado ? (achado[1] === 'jasper' && /\.jpg/.test(achado[0]) ? 'admin' : achado[1]) : null;
    const lista = slug && PONTOS_DE[slug];
    if (vivo && (vivo.caixa !== caixa || !lista)) desliga();
    if (vivo || !lista) return;
    const pronto = () => { try { if (!vivo && img.isConnected) { prepara(lista); liga(caixa, img); } } catch (e) { desliga(); } };
    if (img.complete && img.naturalWidth) pronto(); else img.addEventListener('load', pronto, {once: true});
  }

  const inicio = () => {
    const mold = document.getElementById('mlMoldura');
    if (!mold) return setTimeout(inicio, 500);
    new MutationObserver(confere).observe(mold, {childList: true, subtree: true});
    confere();
    requestAnimationFrame(quadro);
  };
  inicio();
})();
