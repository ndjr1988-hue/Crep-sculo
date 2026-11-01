/* Pretor: quadro de informações na conversa do Marcus (pedido do Chefe em 1/11/2026), no mesmo traço do MERCADO.
   Os dados vêm de /quadros/marcus.json, que nasce do que o agente coletou em sites públicos: é tudo texto
   de fora, então entra só por textContent e o link só vale se for https. */
(function () {
  'use strict';
  const m = /^\/a\/([a-z0-9-]+)\/?$/.exec(location.pathname);
  const NOMES = {marcus: 'SERVENTIAS'};
  const TITULOS = {marcus: 'Serventias'};
  if (window.PretorQuadro || !m || !NOMES[m[1]]) return;
  window.PretorQuadro = true;
  const slug = m[1], CHAVE = 'pretor-quadro-oculto', L = 300, ESQ = 262, TOPO = 84;

  const css = `
#qaQuadro{--c:#7fc0ff;--f:#e4f1ff;--s:#8fa6c4;--l:rgba(127,192,255,.3);position:fixed;top:${TOPO}px;left:${ESQ}px;width:${L}px;
  max-height:calc(100vh - 210px);overflow-y:auto;z-index:5;display:none;padding:15px 16px 12px;box-sizing:border-box;
  font:12.5px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:var(--f);background:transparent;border:1px solid var(--l);border-radius:2px}
@media (min-width:1100px){#qaQuadro{display:block}#qaQuadro.oculto,#qaQuadro.cobre{display:none}#qaMostra{display:block}#qaMostra.some,#qaMostra.cobre{display:none}}
#qaQuadro .qa-sup{display:flex;justify-content:space-between;align-items:center;font:600 9.5px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.3em;color:var(--c)}
#qaQuadro .qa-sup button{background:none;border:0;color:var(--s);cursor:pointer;font-size:14px;line-height:1;padding:0}
#qaQuadro .qa-nome{font-size:25px;line-height:1.15;font-weight:300;letter-spacing:.015em;margin:7px 0 7px}
#qaQuadro .qa-data{display:flex;justify-content:space-between;gap:8px;padding:5px 0;border-top:2px solid var(--c);border-bottom:1px solid var(--l);
  font:10.5px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--s)}
#qaQuadro h5{margin:15px 0 3px;font:600 10px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.16em;color:var(--c);text-transform:uppercase}
#qaQuadro article{padding:8px 0;border-bottom:1px solid var(--l)}
#qaQuadro article:last-child{border-bottom:0}
#qaQuadro .qa-et{display:flex;justify-content:space-between;gap:8px;margin-bottom:3px;font:10px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--s)}
#qaQuadro .qa-et b{font-weight:600;color:var(--c);letter-spacing:.05em}
#qaQuadro .qa-tit{display:block;margin:0;font-size:13px;line-height:1.3;font-weight:600;color:var(--f);text-decoration:none}
#qaQuadro a.qa-tit:hover{color:var(--c);text-decoration:underline}
#qaQuadro .qa-res{margin:3px 0 0;color:var(--s);font-size:12px;line-height:1.4}
#qaQuadro article.qa-manchete .qa-tit{font-size:15.5px;line-height:1.28;font-weight:600}
#qaQuadro article.qa-manchete .qa-res{color:var(--f);opacity:.85;font-size:12.5px}
#qaQuadro .qa-pe{margin-top:9px;padding-top:7px;border-top:1px solid var(--l);color:var(--s);font-size:10px}
#qaMostra{display:none;position:fixed;top:${TOPO}px;left:${ESQ}px;z-index:5;background:transparent;color:#7fc0ff;border:1px solid rgba(127,192,255,.4);
  border-radius:2px;padding:6px 10px;cursor:pointer;font:12px ui-monospace,monospace}
html.tema-claro #qaQuadro{--c:#1262d6;--f:#16233a;--s:#46566e;--l:rgba(18,98,214,.3)}
html.tema-claro #qaMostra{color:#1262d6;border-color:rgba(18,98,214,.4)}`;

  const q = document.createElement('aside');
  q.id = 'qaQuadro';
  q.setAttribute('aria-label', 'Quadro de informações');
  const cab = document.createElement('div');
  cab.className = 'qa-sup';
  cab.textContent = 'BOLETIM';
  const fecha = document.createElement('button');
  fecha.type = 'button'; fecha.textContent = '×'; fecha.title = 'Esconder o quadro';
  cab.appendChild(fecha);
  const nome = document.createElement('div');
  nome.className = 'qa-nome';
  nome.textContent = TITULOS[slug];
  const faixa = document.createElement('div');
  faixa.className = 'qa-data';
  const corpo = document.createElement('div');
  corpo.textContent = 'aguardando a primeira coleta';
  q.append(cab, nome, faixa, corpo);
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

  /* 'AAAA-MM-DD HH:MM' vira a data por extenso do cabeçalho; sem esse formato, mostra o texto como veio. */
  function dataDe(t) {
    const r = /^(\d{4})-(\d{2})-(\d{2})(?: (\d{2}:\d{2}))?/.exec(t || '');
    if (!r) return [t || '', ''];
    const d = new Date(+r[1], +r[2] - 1, +r[3]).toLocaleDateString('pt-BR', {weekday: 'long', day: 'numeric', month: 'long'});
    return [d.charAt(0).toUpperCase() + d.slice(1), r[4] || ''];
  }
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; return e; };
  function noticia(i, manchete) {
    const art = el('article', manchete ? 'qa-manchete' : '');
    if (i.etiqueta || i.data) {
      const et = el('div', 'qa-et');
      et.append(el('b', '', i.etiqueta || ''), el('span', '', i.data || ''));
      art.appendChild(et);
    }
    const tit = i.titulo || i.texto || '';
    const link = /^https:\/\//.test(i.link || '');
    const t = el(link ? 'a' : 'div', 'qa-tit', tit);
    if (link) { t.href = i.link; t.target = '_blank'; t.rel = 'noopener noreferrer'; }
    art.appendChild(t);
    if (i.titulo && i.texto) art.appendChild(el('p', 'qa-res', i.texto));
    return art;
  }
  function pinta(d) {
    const [dia, hora] = dataDe(d.atualizado);
    faixa.textContent = '';
    faixa.append(el('span', '', dia), el('span', '', hora));
    corpo.textContent = '';
    (d.secoes || []).forEach((s, n) => {
      corpo.appendChild(el('h5', '', s.titulo));
      (s.itens || []).forEach((i, k) => corpo.appendChild(noticia(i, n === 0 && k === 0 && !!i.titulo)));
    });
    if (d.fontes) corpo.appendChild(el('div', 'qa-pe', 'Fontes: ' + d.fontes));
  }
  function busca() {
    fetch('/quadros/' + slug + '.json', {cache: 'no-store', credentials: 'same-origin'})
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(pinta).catch(() => {});
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
