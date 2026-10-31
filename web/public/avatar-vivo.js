/* Pretor: avatar vivo do Jasper no alto do menu (pedido do Chefe em 31/10/2026).
   A foto ganha profundidade (a cabeça vira um pouco, sozinha ou seguindo o mouse) e sinais de luz
   correm pelos pontos do cérebro. Calmo quando livre, acelerado com html.agente-trabalhando,
   pulsando enquanto o #player toca a voz. No celular fica só com os sinais, a 20 quadros.
   Qualquer falha tira o efeito e deixa a foto normal. Os pontos valem para a imagem jasper.jpg. */
(function () {
  'use strict';
  if (window.PretorAvatarVivo) return;
  window.PretorAvatarVivo = true;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches) return;

  const PONTOS = [[0.5,0.3655],[0.5011,0.2705],[0.6216,0.2838],[0.3409,0.3258],[0.4823,0.2208],[0.5607,0.2495],[0.5199,0.2097],[0.4326,0.1876],[0.6547,0.3268],[0.4801,0.3302],[0.5972,0.328],[0.384,0.2926],[0.3409,0.2783],[0.6304,0.2142],[0.4204,0.3545],[0.363,0.2484],[0.4724,0.3025],[0.4525,0.3666],[0.5342,0.3014],[0.447,0.1987],[0.4448,0.3014],[0.5917,0.1788],[0.5265,0.2429],[0.6282,0.2484],[0.4934,0.181],[0.3873,0.3644],[0.5387,0.223],[0.595,0.2583],[0.3884,0.2384],[0.5652,0.3567],[0.5177,0.328],[0.4724,0.202],[0.6249,0.35],[0.6072,0.3644],[0.4569,0.2749],[0.4238,0.2616],[0.4216,0.2396],[0.4072,0.2296],[0.4061,0.328],[0.3762,0.2639],[0.658,0.3555],[0.342,0.2396],[0.6083,0.2174],[0.5387,0.371],[0.5829,0.3169],[0.5552,0.3423],[0.5431,0.2849],[0.6602,0.2451],[0.5807,0.3655],[0.5685,0.3136],[0.4702,0.3523],[0.3784,0.3467],[0.447,0.2418]];
  const ESTADOS = {livre: {n: 7, v: .012}, pensando: {n: 28, v: .04}, falando: {n: 16, v: .022}};
  const FS = `precision highp float;varying vec2 u;uniform sampler2D t;uniform vec2 m;
float sq(float x){return x*x;}
float prof(vec2 p){
 vec2 c=(p-vec2(.5,.40))/vec2(.215,.31);float r=dot(c,c);float d=r<1.?sqrt(1.-r):0.;
 float nariz=.34*exp(-(sq((p.x-.5)/.035)+sq((p.y-.455)/.075)));
 float testa=.10*exp(-(sq((p.x-.5)/.15)+sq((p.y-.27)/.12)));
 float ombro=.22*smoothstep(.56,.72,p.y)*smoothstep(.40,.0,abs(p.x-.5));
 return max(d*.8+nariz*step(r,1.)+testa*step(r,1.),ombro);}
void main(){vec2 q=u;for(int i=0;i<5;i++)q=u-m*prof(q)*.055;gl_FragColor=texture2D(t,q);}`;
  const VS = 'attribute vec2 a;varying vec2 u;void main(){u=vec2(a.x*.5+.5,.5-a.y*.5);gl_Position=vec4(a,0.,1.);}';

  const vizinhos = PONTOS.map(p => PONTOS.map((q, j) => [(p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2, j])
    .sort((a, b) => a[0] - b[0]).slice(1, 4).map(x => x[1]));
  const brilho = PONTOS.map(() => 0);
  const sinais = Array.from({length: 30}, () => {
    const a = Math.floor(Math.random() * PONTOS.length);
    return {a, b: vizinhos[a][0], t: Math.random()};
  });

  let vivo = null, olhar = null, olharEm = 0, mx = 0, my = 0, voz = false;
  const player = document.getElementById('player');
  if (player) {
    player.addEventListener('playing', () => { voz = player.duration > 1 || !isFinite(player.duration); });
    ['pause', 'ended', 'emptied'].forEach(ev => player.addEventListener(ev, () => { voz = false; }));
  }
  window.addEventListener('pointermove', e => {
    if (!vivo) return;
    const r = vivo.caixa.getBoundingClientRect();
    if (!r.width) return;
    const lim = v => Math.max(-1, Math.min(1, v));
    olhar = [lim((e.clientX - r.left - r.width / 2) / 420), lim((e.clientY - r.top - r.height / 2) / 420)];
    olharEm = performance.now();
  }, {passive: true});

  function montaGL(cv, img) {
    const g = cv.getContext('webgl', {alpha: false, antialias: false});
    if (!g) return null;
    const sh = (tipo, src) => { const s = g.createShader(tipo); g.shaderSource(s, src); g.compileShader(s); return s; };
    const pr = g.createProgram();
    g.attachShader(pr, sh(g.VERTEX_SHADER, VS)); g.attachShader(pr, sh(g.FRAGMENT_SHADER, FS));
    g.linkProgram(pr);
    if (!g.getProgramParameter(pr, g.LINK_STATUS)) return null;
    g.useProgram(pr);
    g.bindBuffer(g.ARRAY_BUFFER, g.createBuffer());
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW);
    const la = g.getAttribLocation(pr, 'a');
    g.enableVertexAttribArray(la); g.vertexAttribPointer(la, 2, g.FLOAT, false, 0, 0);
    g.bindTexture(g.TEXTURE_2D, g.createTexture());
    g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, img);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR);
    const um = g.getUniformLocation(pr, 'm');
    return (x, y) => { g.uniform2f(um, x, y); g.drawArrays(g.TRIANGLES, 0, 3); };
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
    const desenhaFoto = computador ? (() => { try { return montaGL(camada(caixa, W), img); } catch (e) { return null; } })() : null;
    const fx = camada(caixa, W).getContext('2d');
    vivo = {caixa, desenhaFoto, fx, W, computador, ultimo: 0};
  }

  function desliga() {
    if (vivo) vivo.caixa.querySelectorAll('canvas').forEach(c => c.remove());
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
      const seguindo = olhar && t - olharEm < 2500;
      const ax = seguindo ? olhar[0] : Math.sin(t / 2600) * .7, ay = seguindo ? olhar[1] : Math.sin(t / 3700) * .25;
      mx += (ax - mx) * .08; my += (ay - my) * .08;
      if (vivo.desenhaFoto) vivo.desenhaFoto(mx, my);
      const d = vivo.desenhaFoto ? .044 : 0, pos = p => [(p[0] + mx * d) * W, (p[1] + my * d) * W];
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
    const ehJasper = img && /\/agents\/admin\/|\/jasper\.jpg/.test(img.src);
    if (vivo && (vivo.caixa !== caixa || !ehJasper)) desliga();
    if (vivo || !ehJasper) return;
    const pronto = () => { try { if (!vivo && img.isConnected) liga(caixa, img); } catch (e) { desliga(); } };
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
