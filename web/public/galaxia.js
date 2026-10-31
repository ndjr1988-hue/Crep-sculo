/* Pretor: núcleo holográfico no espaço vazio da conversa do Jasper (pedido do Chefe em 31/10/2026).
   Um núcleo de luz com anéis finos girando em sentidos opostos. Devagar quando livre, acelera com
   html.agente-trabalhando e mostra ondas enquanto o #player toca a voz. Só no computador e só em /a/admin. */
(function () {
  'use strict';

  const TAU = Math.PI * 2;
  /* desenha(canvas, leEstado): leEstado() devolve {est:'livre'|'pensando'|'falando', claro, cx, cy, raio} */
  window.PretorGalaxia = function (cv, leEstado) {
    const c = cv.getContext('2d');
    const ANEIS = [
      {r: .985, tipo: 'marcas', n: 180, cada: 15, t: .012, l: .018, v: .05, alfa: .55},
      {r: .925, tipo: 'arcos', arcos: [[0, 1.5], [2.1, .9], [3.6, 1.7]], lg: .007, v: -.14, alfa: .9},
      {r: .875, tipo: 'linha', lg: .0022, alfa: .4},
      {r: .83, tipo: 'blocos', n: 36, cheio: .62, lg: .026, v: .09, alfa: .75},
      {r: .755, tipo: 'linha', lg: .0022, alfa: .35},
      {r: .72, tipo: 'marcas', n: 72, cada: 6, t: .03, l: .014, v: -.11, alfa: .7},
      {r: .625, tipo: 'arcos', arcos: [[.4, 2.3], [3.5, 1.2], [5.1, .55]], lg: .016, v: .24, alfa: .95},
      {r: .545, tipo: 'tracejado', n: 48, lg: .004, v: -.2, alfa: .6},
      {r: .475, tipo: 'arcos', arcos: [[0, .9], [TAU / 3, .9], [2 * TAU / 3, .9]], lg: .009, v: -.42, alfa: .9},
    ];
    /* cérebro em rede, de perfil, dentro do globo */
    const PF = [[0, 1.22], [25, 1.27], [50, 1.2], [75, 1.13], [100, 1.12], [125, 1.2], [150, 1.34], [172, 1.42], [195, 1.3], [215, 1.02],
      [238, .74], [262, .6], [285, .72], [305, .92], [325, .98], [345, .98], [360, 1.22]];
    const perfil = g => {
      for (let i = 1; i < PF.length; i++) if (g <= PF[i][0]) {
        const a = PF[i - 1], b = PF[i]; let k = (g - a[0]) / (b[0] - a[0]); k = k * k * (3 - 2 * k);
        return a[1] + (b[1] - a[1]) * k;
      }
      return 1.2;
    };
    const sobre = (g, w) => {
      const R0 = perfil(g), m = Math.pow(Math.sqrt(Math.max(0, 1 - w * w)), .55), ra = g * Math.PI / 180;
      const dobra = 1 + .055 * Math.sin(g * .19 + w * 3.1) + .035 * Math.sin(g * .41 - w * 5);
      return {x: Math.cos(ra) * R0 * m * dobra, y: Math.sin(ra) * R0 * m * dobra * .86, z: w * .92 + (w > 0 ? .045 : -.045)};
    };
    let semente = 4242;
    const acaso = () => { semente = semente * 16807 % 2147483647; return (semente - 1) / 2147483646; };
    const NOS = [];
    for (let i = 0; i < 18; i++) {
      const w0 = -.95 + 1.9 * (i + .5) / 18, fase = acaso() * 360;
      for (let j = 0; j < 22; j++) {
        const g = (fase + j * 16.4 + acaso() * 9) % 360;
        if (g > 235 && g < 295 && Math.abs(w0) < .45) continue;
        NOS.push(sobre(g, w0 + (acaso() - .5) * .06));
      }
    }
    for (let i = 0; i < 90; i++) { const e = sobre(acaso() * 360, (acaso() * 2 - 1) * .9), k = .25 + acaso() * .6; NOS.push({x: e.x * k, y: e.y * k, z: e.z * k}); }
    const LIG = [], VIZ = NOS.map(() => []);
    NOS.forEach((p, a) => {
      NOS.map((o, b) => [(p.x - o.x) ** 2 + (p.y - o.y) ** 2 + (p.z - o.z) ** 2, b]).sort((m, n) => m[0] - n[0]).slice(1, 4).forEach(d => {
        if (VIZ[a].indexOf(d[1]) < 0) { VIZ[a].push(d[1]); VIZ[d[1]].push(a); LIG.push([a, d[1]]); }
      });
    });
    const LUZ = NOS.map(() => 0);
    const SINAIS = Array.from({length: 30}, () => { const a = Math.floor(acaso() * NOS.length); return {a, b: VIZ[a][0] ?? a, t: acaso()}; });
    const barras = Array.from({length: 96}, (_, i) => ({f: 1 + (i % 7) * .6, p: i * 1.7}));
    let rot = 0, vel = 1, brilho = .35, ult = 0, voz = 0;

    function linha(raio, ini, fim, lg, cor, alfa, sombra) {
      c.beginPath(); c.arc(0, 0, raio, ini, fim);
      c.strokeStyle = cor; c.lineWidth = lg; c.globalAlpha = alfa; c.stroke();
      if (sombra) { c.lineWidth = lg * 3.4; c.globalAlpha = alfa * sombra; c.stroke(); }
    }

    function quadro(t) {
      const s = leEstado();
      if (!s) return;
      const W = cv.width, H = cv.height, R = s.raio || Math.min(W, H) * .46;
      c.clearRect(0, 0, W, H);
      if (R < 60) return;
      const dt = Math.min(3, (t - ult) / 33 || 1); ult = t;
      const pensa = s.est === 'pensando', fala = s.est === 'falando';
      vel += ((pensa ? 5 : fala ? 2 : 1) - vel) * .05;
      rot += .0032 * vel * dt;
      const aVoz = fala ? .35 + .65 * Math.abs(Math.sin(t / 120) * Math.sin(t / 47 + 1)) : 0;
      voz += (aVoz - voz) * .22;
      brilho += ((pensa ? .75 + .2 * Math.sin(t / 190) : fala ? .55 + voz * .45 : .36 + .08 * Math.sin(t / 1500)) - brilho) * .08;
      const cor = '#7fc0ff', forte = '#d6ecff', sombra = .18;
      const cx = s.cx * W, cy = s.cy * H;
      c.save(); c.translate(cx, cy);
      const disco = c.createRadialGradient(0, 0, R * .8, 0, 0, R * 1.06);
      disco.addColorStop(0, 'rgba(5,10,24,.97)'); disco.addColorStop(.72, 'rgba(5,10,24,.94)'); disco.addColorStop(1, 'rgba(5,10,24,0)');
      c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.fillStyle = disco;
      c.beginPath(); c.arc(0, 0, R * 1.06, 0, TAU); c.fill();
      c.globalCompositeOperation = 'lighter';
      c.lineCap = 'butt';

      const halo = c.createRadialGradient(0, 0, 0, 0, 0, R * .98);
      const a0 = .17 + brilho * .15;
      halo.addColorStop(0, `rgba(47,139,255,${a0.toFixed(3)})`);
      halo.addColorStop(.55, `rgba(47,139,255,${(a0 * .35).toFixed(3)})`);
      halo.addColorStop(1, 'rgba(47,139,255,0)');
      c.globalAlpha = 1; c.fillStyle = halo; c.beginPath(); c.arc(0, 0, R * .98, 0, TAU); c.fill();

      ANEIS.forEach(a => {
        const r = a.r * R, g = rot * (a.v || 0) * 8, al = a.alfa * (.68 + brilho * .42);
        if (a.tipo === 'linha') return linha(r, 0, TAU, Math.max(1, a.lg * R), cor, al);
        if (a.tipo === 'arcos') return a.arcos.forEach(q => linha(r, q[0] + g, q[0] + q[1] + g, Math.max(1.4, a.lg * R), cor, al, sombra));
        if (a.tipo === 'blocos' || a.tipo === 'tracejado') {
          const passo = TAU / a.n, ch = a.tipo === 'blocos' ? a.cheio : .5;
          for (let i = 0; i < a.n; i++) {
            const ac = a.tipo === 'blocos' && Math.sin(i * 1.3 + t / 900) > .55 ? 1.25 : 1;
            linha(r, i * passo + g, i * passo + passo * ch + g, Math.max(1, a.lg * R), cor, Math.min(1, al * ac * (i % 3 ? .75 : 1)));
          }
          return;
        }
        c.save(); c.rotate(g); c.strokeStyle = cor; c.globalAlpha = al; c.lineWidth = Math.max(1, .0028 * R);
        c.beginPath();
        for (let i = 0; i < a.n; i++) {
          const an = i * TAU / a.n, l = (i % a.cada ? a.l : a.t) * R, co = Math.cos(an), se = Math.sin(an);
          c.moveTo(co * r, se * r); c.lineTo(co * (r - l), se * (r - l));
        }
        c.stroke(); c.restore();
      });

      if (voz > .02) {
        c.strokeStyle = forte; c.lineWidth = Math.max(1.4, .008 * R); c.globalAlpha = .85; c.beginPath();
        barras.forEach((b, i) => {
          const an = i * TAU / barras.length, l = R * .085 * voz * (.25 + .75 * Math.abs(Math.sin(t / (90 * b.f) + b.p)));
          const co = Math.cos(an), se = Math.sin(an), r0 = R * .485;
          c.moveTo(co * r0, se * r0); c.lineTo(co * (r0 + l), se * (r0 + l));
        });
        c.stroke();
      }

      /* globo de linhas */
      const rg = R * .455, giro = rot * 1.5;
      c.lineWidth = Math.max(1, .0026 * R); c.strokeStyle = cor;
      for (let i = 0; i < 6; i++) {
        const an = giro + i * Math.PI / 6, rx = Math.abs(Math.cos(an)) * rg;
        c.globalAlpha = .16 + brilho * .14; c.beginPath(); c.ellipse(0, 0, rx, rg, 0, 0, TAU); c.stroke();
      }
      [-.62, -.31, 0, .31, .62].forEach(q => {
        const y = q * rg, rx = Math.sqrt(1 - q * q) * rg;
        c.globalAlpha = .13 + brilho * .12; c.beginPath(); c.ellipse(0, y, rx, rx * .16, 0, 0, TAU); c.stroke();
      });
      /* cérebro em rede */
      const oscila = Math.sin(rot * 2.2) * .55, co = Math.cos(oscila), se = Math.sin(oscila), kb = R * .262;
      const T = NOS.map(p => {
        const x = p.x * co + p.z * se, z = -p.x * se + p.z * co, e = 4.2 / (4.2 + z);
        return {x: (x + .12) * kb * e, y: -p.y * kb * e + R * .01, z};
      });
      c.lineWidth = Math.max(.8, .0024 * R);
      LIG.forEach(l => {
        const a = T[l[0]], b = T[l[1]], g = Math.max(LUZ[l[0]], LUZ[l[1]]);
        c.globalAlpha = Math.min(1, .2 + brilho * .22 + g * .6); c.strokeStyle = g > .3 ? forte : cor;
        c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
      });
      for (let i = 0; i < LUZ.length; i++) LUZ[i] *= .93;
      const nSin = pensa ? 30 : fala ? 16 : 8, vSin = pensa ? .05 : fala ? .028 : .015;
      for (let i = 0; i < nSin; i++) {
        const q = SINAIS[i]; q.t += vSin * dt;
        if (q.t >= 1) { LUZ[q.b] = 1; const o = VIZ[q.b]; q.a = q.b; q.b = o[Math.floor(Math.random() * o.length)]; q.t = 0; }
        const A = T[q.a], B = T[q.b];
        c.globalAlpha = 1; c.fillStyle = '#ffffff'; c.beginPath();
        c.arc(A.x + (B.x - A.x) * q.t, A.y + (B.y - A.y) * q.t, Math.max(1.2, R * .007), 0, TAU); c.fill();
      }
      c.fillStyle = forte;
      T.forEach((p, i) => {
        c.globalAlpha = Math.min(1, .45 + brilho * .3 + LUZ[i]);
        const r = Math.max(.9, R * (.0042 + LUZ[i] * .007));
        c.beginPath(); c.arc(p.x, p.y, r, 0, TAU); c.fill();
      });
      /* núcleo de luz no meio do cérebro */
      const rc = R * (.13 + brilho * .05 + voz * .05);
      const nuc = c.createRadialGradient(0, 0, 0, 0, 0, rc);
      nuc.addColorStop(0, 'rgba(255,255,255,1)'); nuc.addColorStop(.3, 'rgba(190,226,255,.9)');
      nuc.addColorStop(.6, 'rgba(47,139,255,.5)'); nuc.addColorStop(1, 'rgba(47,139,255,0)');
      c.globalAlpha = 1; c.fillStyle = nuc; c.beginPath(); c.arc(0, 0, rc, 0, TAU); c.fill();
      c.globalCompositeOperation = 'source-over';

      if (R > 130) {
        c.globalAlpha = .9; c.fillStyle = forte; c.textAlign = 'center'; c.textBaseline = 'middle';
        const rotulo = pensa ? 'PROCESSANDO' : fala ? 'FALANDO' : 'EM ESPERA';
        c.font = `600 ${Math.round(R * .05)}px ui-monospace,SFMono-Regular,Menlo,monospace`;
        c.fillText('P R E T O R', 0, -R * .685);
        c.font = `${Math.round(R * .034)}px ui-monospace,SFMono-Regular,Menlo,monospace`;
        c.globalAlpha = .72; c.fillText(rotulo, 0, R * .685);
      }
      c.restore();
      c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
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
    /* Mede o espaço vazio entre o quadro de cotações e as mensagens que estão na tela. */
    const MARGEM = 28, INCL = 1;
    let alvo = {x: 0, y: 0, r: 0}, pos = null, medidoEm = -1e9;
    function mede() {
      const W = cv.width, H = cv.height, sobe = 58, esq = 240;
      let limite = W - MARGEM;
      document.querySelectorAll('#chat .bub, #chat .row, #chat .lc, #chat .pc').forEach(el => {
        const alvoEl = el.classList.contains('row') ? (el.querySelector('.bub') || null) : el;
        if (!alvoEl) return;
        const r = alvoEl.getBoundingClientRect();
        if (r.width && r.bottom > sobe && r.top < sobe + H) limite = Math.min(limite, r.left - esq - MARGEM);
      });
      const q = document.getElementById('pcQuadro');
      const box = q && getComputedStyle(q).display !== 'none' ? q.getBoundingClientRect() : null;
      const op = [];
      const cabe = (x0, y0, x1, y1) => {
        const w = x1 - x0, h = y1 - y0;
        if (w > 0 && h > 0) op.push({x: (x0 + x1) / 2, y: (y0 + y1) / 2, r: Math.min(w / 2, h / 2 / INCL)});
      };
      if (box) {
        cabe(box.right - esq + MARGEM, MARGEM, limite, H - 112);
        cabe(MARGEM, box.bottom - sobe + MARGEM, limite, H - 112);
      } else cabe(MARGEM, MARGEM, limite, H - 112);
      op.sort((a, b) => b.r - a.r);
      alvo = op[0] ? {x: op[0].x, y: op[0].y, r: Math.min(op[0].r, 330) / 1.08} : {x: 0, y: 0, r: 0};
      if (!pos) pos = {...alvo};
    }
    const quadro = window.PretorGalaxia(cv, () => {
      const agora = performance.now();
      if (agora - medidoEm > 700) { medidoEm = agora; mede(); }
      pos.x += (alvo.x - pos.x) * .06; pos.y += (alvo.y - pos.y) * .06; pos.r += (alvo.r - pos.r) * .06;
      return {
        est: voz ? 'falando' : raiz.classList.contains('agente-trabalhando') ? 'pensando' : 'livre',
        claro: raiz.classList.contains('tema-claro'),
        cx: pos.x / cv.width, cy: pos.y / cv.height, raio: pos.r,
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
