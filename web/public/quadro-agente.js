/* Pretor: quadro de informações na conversa do Marcus (pedido do Chefe em 1/11/2026), como painel de indicadores, igual ao MERCADO.
   Os dados vêm de /quadros/marcus.json, que nasce do que o agente coletou em sites públicos: é tudo texto
   de fora, então entra só por textContent e o link só vale se for https. */
(function () {
  'use strict';
  const m = /^\/a\/([a-z0-9-]+)\/?$/.exec(location.pathname);
  const NOMES = {marcus: 'SERVENTIAS'};
  const TITULOS = {marcus: 'Serventias'};
  const TIPOS = [['dec', 'decisões'], ['com', 'comunicados'], ['pro', 'provimentos']], RECENTES = 6;
  if (window.PretorQuadro || !m || !NOMES[m[1]]) return;
  window.PretorQuadro = true;
  const slug = m[1], CHAVE = 'pretor-quadro-oculto', L = 300, ESQ = 262, TOPO = 84;

  const css = `
#qaQuadro{--a:#7fc0ff;--f:#e4f1ff;--s:#9db3cf;--l:rgba(127,192,255,.2);--bg:rgba(13,26,52,.6);--bo:rgba(127,192,255,.28);--so:0 10px 28px rgba(0,0,0,.35);--t:rgba(255,255,255,.06);position:fixed;top:${TOPO}px;left:${ESQ}px;width:${L}px;
  max-height:calc(100vh - 210px);overflow-y:auto;z-index:5;display:none;padding:15px;box-sizing:border-box;
  font:12.5px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:var(--f);background:var(--bg);
  backdrop-filter:blur(16px) saturate(1.3);-webkit-backdrop-filter:blur(16px) saturate(1.3);border:1px solid var(--bo);border-radius:16px;box-shadow:var(--so)}
@media (min-width:1100px){#qaQuadro{display:block}#qaQuadro.oculto,#qaQuadro.cobre{display:none}#qaMostra{display:block}#qaMostra.some,#qaMostra.cobre{display:none}}
#qaQuadro .qa-sup{display:flex;align-items:baseline;gap:8px;font-size:10.5px;font-weight:600;letter-spacing:.1em;color:var(--a)}
#qaQuadro .qa-sup span{margin-left:auto;font-weight:400;letter-spacing:0;color:var(--s)}
#qaQuadro .qa-sup button{background:none;border:0;color:var(--s);cursor:pointer;font-size:14px;line-height:1;padding:0}
#qaQuadro .qa-nome{font-size:20px;font-weight:600;line-height:1.15;margin:3px 0 10px}
#qaQuadro .qa-blocos{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}
#qaQuadro .qa-bloco{min-width:0;background:var(--t);border:1px solid var(--l);border-radius:10px;padding:8px 6px 8px 9px;text-align:left;color:var(--f);font:inherit;cursor:pointer}
#qaQuadro .qa-bloco:hover{border-color:var(--a)}
#qaQuadro .qa-bloco[aria-pressed="true"]{border-color:var(--a);box-shadow:inset 0 0 0 1px var(--a)}
#qaQuadro .qa-bloco b{display:block;font-size:24px;line-height:1.1;font-weight:650;color:var(--a)}
#qaQuadro .qa-bloco small{display:block;color:var(--s);font-size:10.5px}
#qaQuadro h5{margin:12px 0 2px;font-size:10.5px;line-height:1.2;font-weight:650;letter-spacing:.06em;color:var(--a);text-transform:uppercase}
#qaQuadro .qa-lin{display:flex;gap:8px;justify-content:space-between;align-items:baseline;padding:6px 0;border-top:1px solid var(--l)}
#qaQuadro .qa-lin:first-of-type{border-top:0}
#qaQuadro .qa-org{color:var(--a);font-size:10px;font-weight:650;margin-right:5px}
#qaQuadro .qa-lin a{color:var(--f);text-decoration:none}
#qaQuadro .qa-lin a:hover{color:var(--a);text-decoration:underline}
#qaQuadro .qa-lin em{font-style:normal;color:var(--s);font-size:10.5px;white-space:nowrap}
#qaQuadro .qa-res{margin:3px 0 0;color:var(--s);font-size:11.5px;line-height:1.35}
#qaQuadro .qa-aviso{margin:6px 0 0;color:var(--s);font-size:11.5px}
#qaMostra{display:none;position:fixed;top:${TOPO}px;left:${ESQ}px;z-index:5;background:transparent;color:#7fc0ff;border:1px solid rgba(127,192,255,.4);
  border-radius:10px;padding:6px 10px;cursor:pointer;font:600 11px system-ui,sans-serif}
html.tema-claro #qaQuadro{--a:#1262d6;--f:#16233a;--s:#4d5c73;--l:rgba(22,35,58,.12);--bg:rgba(255,255,255,.66);--bo:rgba(255,255,255,.8);--so:0 10px 26px rgba(30,50,90,.16);--t:rgba(255,255,255,.72)}
html.tema-claro #qaMostra{color:#1262d6;border-color:rgba(18,98,214,.4)}`;

  const q = document.createElement('aside');
  q.id = 'qaQuadro';
  q.setAttribute('aria-label', 'Quadro de informações');
  const cab = document.createElement('div');
  cab.className = 'qa-sup';
  cab.textContent = 'BOLETIM';
  const coleta = document.createElement('span');
  const fecha = document.createElement('button');
  fecha.type = 'button'; fecha.textContent = '×'; fecha.title = 'Esconder o quadro';
  cab.append(coleta, fecha);
  const nome = document.createElement('div');
  nome.className = 'qa-nome';
  nome.textContent = TITULOS[slug];
  const corpo = document.createElement('div');
  corpo.textContent = 'aguardando a primeira coleta';
  q.append(cab, nome, corpo);
  const mostra = document.createElement('button');
  mostra.id = 'qaMostra'; mostra.type = 'button'; mostra.textContent = '+ ' + NOMES[slug];

  const oculto = () => { try { return localStorage.getItem(CHAVE) === '1'; } catch (e) { return false; } };
  function aplica() {
    const o = oculto();
    q.classList.toggle('oculto', o);
    mostra.classList.toggle('some', !o);
  }
  fecha.addEventListener('click', () => { try { localStorage.setItem(CHAVE, '1'); } catch (e) { /* aba privada */ } aplica(); });
  mostra.addEventListener('click', () => { try { localStorage.removeItem(CHAVE); } catch (e) { /* aba privada */ } aplica(); });

  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; return e; };
  /* Decisão é o que vem na primeira seção; nas outras, o título diz se é comunicado ou outro ato. */
  const tipoDe = (i, n) => n === 0 ? 'dec' : /comunicado/i.test(i.titulo || '') ? 'com' : 'pro';
  let dados = null, filtro = null;
  function linha(i, comResumo) {
    const lin = el('div', 'qa-lin'), txt = el('span');
    if (i.etiqueta) txt.appendChild(el('span', 'qa-org', i.etiqueta));
    const tit = i.titulo || '';
    if (/^https:\/\//.test(i.link || '')) {
      const a = el('a', '', tit);
      a.href = i.link; a.target = '_blank'; a.rel = 'noopener noreferrer';
      if (i.texto) a.title = i.texto;
      txt.appendChild(a);
    } else txt.appendChild(document.createTextNode(tit));
    if (comResumo && i.texto) txt.appendChild(el('p', 'qa-res', i.texto));
    lin.append(txt, el('em', '', (i.data || '').replace(/\/\d{4}$/, '')));
    return lin;
  }
  function pinta() {
    const d = dados, itens = [], avisos = [];
    (d.secoes || []).forEach((s, n) => (s.itens || []).forEach(i => {
      if (i.titulo) itens.push({i, tipo: tipoDe(i, n)}); else if (i.texto) avisos.push(i.texto);
    }));
    const c = /^\d{4}-(\d{2})-(\d{2})/.exec(d.atualizado || '');
    coleta.textContent = c ? 'coleta de ' + c[2] + '/' + c[1] : '';
    corpo.textContent = '';
    const blocos = el('div', 'qa-blocos');
    TIPOS.forEach(([id, rot]) => {
      const b = el('button', 'qa-bloco');
      b.type = 'button'; b.title = 'Ver só ' + rot; b.setAttribute('aria-pressed', String(filtro === id));
      b.append(el('b', '', String(itens.filter(x => x.tipo === id).length)), el('small', '', rot));
      b.addEventListener('click', () => { filtro = filtro === id ? null : id; pinta(); });
      blocos.appendChild(b);
    });
    corpo.appendChild(blocos);
    const rot = filtro ? TIPOS.find(t => t[0] === filtro)[1] : 'mais recentes';
    corpo.appendChild(el('h5', '', rot));
    const lista = filtro ? itens.filter(x => x.tipo === filtro) : itens.slice(0, RECENTES);
    lista.forEach(x => corpo.appendChild(linha(x.i, !!filtro)));
    avisos.forEach(t => corpo.appendChild(el('p', 'qa-aviso', t)));
  }
  function busca() {
    fetch('/quadros/' + slug + '.json', {cache: 'no-store', credentials: 'same-origin'})
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(d => { dados = d; pinta(); }).catch(() => {});
  }
  function desvia() {
    const fim = ESQ + L + 16, alt = q.offsetHeight || 420;
    let bate = false;
    document.querySelectorAll('#chat .bub').forEach(b => {
      const r = b.getBoundingClientRect();
      if (r.width && r.left < fim && r.top < TOPO + alt && r.bottom > TOPO && r.top < window.innerHeight) bate = true;
    });
    q.classList.toggle('cobre', bate);
    mostra.classList.toggle('cobre', bate);
  }
  function monta() {
    const e = document.createElement('style');
    e.textContent = css;
    document.head.appendChild(e);
    document.body.append(q, mostra);
    aplica(); busca();
    setInterval(busca, 10 * 60000);
    setInterval(desvia, 1000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', monta); else monta();
})();
