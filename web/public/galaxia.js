/* Pretor: galáxia viva no fundo da conversa do Jasper (pedido do Chefe em 31/10/2026).
   Um núcleo de luz com braços em espiral, atrás das mensagens. Gira devagar quando livre, acelera com
   html.agente-trabalhando e pulsa enquanto o #player toca a voz. Só no computador e só em /a/admin. */
(function () {
  'use strict';

  function sprite(tam, stops) {
    const c = document.createElement('canvas');
    c.width = c.height = tam;
    const x = c.getContext('2d'), g = x.createRadialGradient(tam / 2, tam / 2, 0, tam / 2, tam / 2, tam / 2);
    stops.forEach(s => g.addColorStop(s[0], s[1]));
    x.fillStyle = g;
    x.fillRect(0, 0, tam, tam);
    return c;
  }

  const ARTE = {
    escuro: {
      modo: 'lighter',
      ponto: sprite(32, [[0, 'rgba(255,255,255,1)'], [.25, 'rgba(150,205,255,.9)'], [1, 'rgba(47,139,255,0)']]),
      halo: sprite(512, [[0, 'rgba(255,255,255,1)'], [.08, 'rgba(205,232,255,.95)'], [.22, 'rgba(47,139,255,.55)'],
        [.5, 'rgba(50,50,210,.16)'], [1, 'rgba(47,139,255,0)']]),
    },
    claro: {
      modo: 'source-over',
      ponto: sprite(32, [[0, 'rgba(10,60,190,1)'], [.3, 'rgba(31,111,224,.8)'], [1, 'rgba(47,139,255,0)']]),
      halo: sprite(512, [[0, 'rgba(255,255,255,1)'], [.08, 'rgba(120,190,255,1)'], [.22, 'rgba(47,139,255,.7)'],
        [.5, 'rgba(47,100,230,.2)'], [1, 'rgba(47,139,255,0)']]),
    },
  };

  /* desenha(canvas, leEstado): leEstado() devolve {est:'livre'|'pensando'|'falando', claro:boolean, cx, cy} */
  window.PretorGalaxia = function (cv, leEstado) {
    const c = cv.getContext('2d');
    const BRACOS = 3, N = 1500, E = [];
    for (let i = 0; i < N; i++) {
      const fora = Math.pow(Math.random(), .62), braco = i % BRACOS;
      const disperso = Math.random() < .14;
      const giro = fora * 3.6 + braco * (6.283 / BRACOS) + (Math.random() - .5) * (disperso ? 6.283 : .55 * (1.15 - fora));
      E.push({r: .07 + fora * .93, a: giro, h: (Math.random() - .5) * .10 * (1.2 - fora), t: Math.random() * .75 + .25,
        fase: Math.random() * 6.283, v: .55 + Math.random() * .45});
    }
    let rot = 0, vel = .0012, pulso = 0, ult = 0;
    function quadro(t) {
      const s = leEstado();
      if (!s) return;
      const W = cv.width, H = cv.height;
      const alvo = s.est === 'pensando' ? .0075 : s.est === 'falando' ? .0028 : .0012;
      vel += (alvo - vel) * .04;
      rot += vel * Math.min(3, (t - ult) / 33 || 1);
      ult = t;
      const fala = s.est === 'falando' ? Math.abs(Math.sin(t / 120) * Math.sin(t / 47 + 1)) : 0;
      pulso += ((s.est === 'pensando' ? .35 + .25 * Math.sin(t / 240) : fala) - pulso) * .18;
      const A = s.claro ? ARTE.claro : ARTE.escuro;
      const R = Math.min(W, H) * .46, cx = s.cx * W, cy = s.cy * H, incl = .46;
      c.clearRect(0, 0, W, H);
      c.globalCompositeOperation = A.modo;
      const respira = 1 + .05 * Math.sin(t / 1400) + pulso * .35;
      for (let i = 0; i < N; i++) {
        const e = E[i], an = e.a + rot * (1.6 - e.r * .9) * e.v * 1.6;
        const x = Math.cos(an) * e.r * R, y = Math.sin(an) * e.r * R;
        const px = cx + x, py = cy + y * incl + e.h * R;
        const tw = .55 + .45 * Math.sin(t / 700 + e.fase);
        const tam = (1.2 + e.t * 3.2) * (W > 1400 ? 1.5 : 1.15) * (1 + pulso * .3);
        c.globalAlpha = Math.min(1, e.t * tw * (s.claro ? .7 : .85) + pulso * .2);
        c.drawImage(A.ponto, px - tam, py - tam, tam * 2, tam * 2);
      }
      c.globalAlpha = s.claro ? .9 : 1;
      const h = R * .62 * respira;
      c.drawImage(A.halo, cx - h, cy - h, h * 2, h * 2);
      c.globalAlpha = 1;
      c.globalCompositeOperation = 'source-over';
    }
    return quadro;
  };

  /* Na página: só na conversa do Jasper, no computador. */
  if (!document.documentElement || !/^\/a\/admin\/?$/.test(location.pathname)) return;
  if (!(window.matchMedia && matchMedia('(min-width:1100px)').matches)) return;
  const parado = matchMedia('(prefers-reduced-motion:reduce)').matches;

  function monta() {
    const cv = document.createElement('canvas');
    cv.id = 'pretorGalaxia';
    cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:fixed;left:240px;top:58px;right:0;bottom:0;z-index:0;pointer-events:none;display:block';
    document.body.appendChild(cv);
    const est = document.createElement('style');
    est.textContent = '#chat{position:relative;z-index:1}';
    document.head.appendChild(est);
    const ajusta = () => {
      const w = window.innerWidth - 240, h = window.innerHeight - 58;
      cv.style.width = w + 'px'; cv.style.height = h + 'px';
      cv.width = w; cv.height = h;
    };
    ajusta();
    window.addEventListener('resize', ajusta);
    const player = document.getElementById('player');
    let voz = false;
    if (player) {
      player.addEventListener('playing', () => { voz = player.duration > 1 || !isFinite(player.duration); });
      ['pause', 'ended', 'emptied'].forEach(ev => player.addEventListener(ev, () => { voz = false; }));
    }
    const raiz = document.documentElement;
    const quadro = window.PretorGalaxia(cv, () => {
      return {
        est: voz ? 'falando' : raiz.classList.contains('agente-trabalhando') ? 'pensando' : 'livre',
        claro: raiz.classList.contains('tema-claro'),
        cx: cv.width > 1300 ? .34 : .5,
        cy: .56,
      };
    });
    if (parado) { quadro(0); return; }
    let ultimo = 0;
    const laco = t => {
      requestAnimationFrame(laco);
      if (document.hidden || t - ultimo < 33) return;
      ultimo = t;
      try { quadro(t); } catch (e) { cv.remove(); }
    };
    requestAnimationFrame(laco);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', monta); else monta();
})();
