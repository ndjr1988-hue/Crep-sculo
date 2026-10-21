/* Pretor: ícones de traço fino no lugar dos símbolos do menu e dos botões do cabeçalho (pedido do
   Chefe em 21/10/2026, ideia high-tech 5). Os outros scripts continuam escrevendo o símbolo (◔, ⏰…);
   este troca o conteúdo de cada .ml-ico (e o símbolo no começo dos botões #btnMesa e #btnLembretes)
   pelo desenho, e observa a página para pegar o menu montado depois. Símbolo sem desenho fica como está. */
(function () {
  'use strict';
  const D = {
    conversa: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    mesa: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 7v7M12 7v4M16 7v9"/>',
    lembretes: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M5 3 2 6M22 6l-3-3"/>',
    avisos: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    lua: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    sessoes: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
    baixar: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    girar: '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
    status: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    skills: '<path d="m12 3 1.9 5.8L20 10.7l-6.1 1.9L12 18.5l-1.9-5.9L4 10.7l6.1-1.9z"/>',
    cofre: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
    pasta: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
    memoria: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5M3 12a9 3 0 0 0 18 0"/>',
    operacoes: '<path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4"/>',
    custos: '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    ajuda: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/>',
    identidade: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M15 8h2M15 12h2M7 16h6"/>',
    personalidade: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>',
    apps: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
    socorro: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="m4.93 4.93 4.24 4.24M14.83 9.17l4.24-4.24M14.83 14.83l4.24 4.24M9.17 14.83l-4.24 4.24"/>',
  };
  const SIMBOLO = {
    '◔': 'conversa', '▦': 'mesa', '📋': 'mesa', '⏰': 'lembretes', '🔔': 'avisos', '☀': 'sol', '☾': 'lua',
    '🖥': 'sessoes', '⤓': 'baixar', '↻': 'girar', '◉': 'status', '✦': 'skills', '⚿': 'cofre', '▢': 'pasta',
    '▤': 'memoria', '⚙': 'operacoes', '◇': 'custos', '◎': 'ajuda', '◈': 'identidade', '◐': 'personalidade',
    '▨': 'apps', '✚': 'socorro',
  };
  const svg = nome => '<svg class="ico-traco" viewBox="0 0 24 24" aria-hidden="true">' + D[nome] + '</svg>';
  const chave = t => SIMBOLO[String(t || '').replace(/️/g, '').trim()];

  function troca(raiz) {
    (raiz.querySelectorAll ? raiz : document).querySelectorAll('.ml-ico').forEach(el => {
      if (el.firstElementChild) return;
      const n = chave(el.textContent);
      if (n) el.innerHTML = svg(n);
    });
    ['btnMesa', 'btnLembretes'].forEach(id => {
      const b = document.getElementById(id);
      const t = b && b.firstChild;
      if (!t || t.nodeType !== 3) return;
      const n = chave(t.textContent);
      if (n) { t.textContent = ' '; b.insertAdjacentHTML('afterbegin', svg(n)); }
    });
  }

  function liga() {
    troca(document);
    let pendente = false;
    new MutationObserver(() => {
      if (pendente) return;
      pendente = true;
      requestAnimationFrame(() => { pendente = false; troca(document); });
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', liga);
  else liga();
})();
