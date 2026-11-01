/* Pretor: quadro de informações na conversa do Marcus (pedido do Chefe em 1/11/2026), no mesmo traço do MERCADO.
   Os dados vêm de /quadros/marcus.json, que nasce do que o agente coletou em sites públicos: é tudo texto
   de fora, então entra só por textContent e o link só vale se for https. */
(function () {
  'use strict';
  const m = /^\/a\/([a-z0-9-]+)\/?$/.exec(location.pathname);
  const NOMES = {marcus: 'SERVENTIAS'};
  if (window.PretorQuadro || !m || !NOMES[m[1]]) return;
  window.PretorQuadro = true;
  const slug = m[1], CHAVE = 'pretor-quadro-oculto', L = 300, ESQ = 262, TOPO = 84;

  const css = `
#qaQuadro{--c:#7fc0ff;--f:#d6ecff;--s:#8fa6c4;--l:rgba(127,192,255,.32);position:fixed;top:${TOPO}px;left:${ESQ}px;width:${L}px;
  max-height:calc(100vh - 210px);overflow-y:auto;z-index:5;display:none;padding:14px 16px 10px;box-sizing:border-box;
  font:12px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--f);background:transparent;border:1px solid var(--l);border-radius:2px}
@media (min-width:1100px){#qaQuadro{display:block}#qaQuadro.oculto,#qaQuadro.cobre{display:none}#qaMostra{display:block}#qaMostra.some,#qaMostra.cobre{display:none}}
#qaQuadro h4{margin:0 0 8px;font:600 10.5px/1 ui-monospace,monospace;letter-spacing:.32em;color:var(--c);display:flex;justify-content:space-between}
#qaQuadro h4 button{background:none;border:0;color:var(--s);cursor:pointer;font-size:14px;padding:0}
#qaQuadro h5{margin:10px 0 4px;padding-top:7px;border-top:1px solid var(--l);font:600 10px/1.2 ui-monospace,monospace;letter-spacing:.14em;color:var(--c);text-transform:uppercase}
#qaQuadro ul{margin:0;padding:0;list-style:none}
#qaQuadro li{margin:4px 0}
#qaQuadro a{color:var(--f);text-decoration:none;border-bottom:1px solid var(--l)}
#qaQuadro a:hover{color:var(--c)}
#qaQuadro .qa-pe{color:var(--s);font-size:10px;margin-top:10px}
#qaMostra{display:none;position:fixed;top:${TOPO}px;left:${ESQ}px;z-index:5;background:transparent;color:#7fc0ff;border:1px solid rgba(127,192,255,.4);
  border-radius:2px;padding:6px 10px;cursor:pointer;font:12px ui-monospace,monospace}
html.tema-claro #qaQuadro{--c:#1262d6;--f:#16233a;--s:#46566e;--l:rgba(18,98,214,.34)}
html.tema-claro #qaMostra{color:#1262d6;border-color:rgba(18,98,214,.4)}`;

  const q = document.createElement('aside');
  q.id = 'qaQuadro';
  q.setAttribute('aria-label', 'Quadro de informações');
  const cab = document.createElement('h4');
  cab.textContent = NOMES[slug];
  const fecha = document.createElement('button');
  fecha.type = 'button'; fecha.textContent = '×'; fecha.title = 'Esconder o quadro';
  cab.appendChild(fecha);
  const corpo = document.createElement('div');
  corpo.textContent = 'aguardando a primeira coleta';
  q.append(cab, corpo);
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

  function pinta(d) {
    corpo.textContent = '';
    (d.secoes || []).forEach(s => {
      const h = document.createElement('h5');
      h.textContent = s.titulo;
      const ul = document.createElement('ul');
      (s.itens || []).forEach(i => {
        const li = document.createElement('li');
        if (/^https:\/\//.test(i.link || '')) {
          const a = document.createElement('a');
          a.href = i.link; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = i.texto;
          li.appendChild(a);
        } else li.textContent = i.texto;
        ul.appendChild(li);
      });
      corpo.append(h, ul);
    });
    const pe = document.createElement('div');
    pe.className = 'qa-pe';
    pe.textContent = 'coleta de ' + (d.atualizado || '?');
    corpo.appendChild(pe);
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
