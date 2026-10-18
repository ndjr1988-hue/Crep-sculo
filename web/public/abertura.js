'use strict';
/* abertura.js (Crepúsculo): música de abertura pelo tocador oficial do Deezer.

   Os navegadores só deixam tocar som depois de um gesto da pessoa, então o tocador aparece no
   primeiro clique ou toque da sessão (uma vez por aba aberta), num cartão pequeno no canto. Com o
   Deezer logado e assinatura, toca a faixa inteira; sem login, a prévia de 30 s. A música é do
   catálogo do Deezer, que licencia a execução: nada de arquivo de áudio guardado aqui.
   O "não tocar mais" fica guardado neste navegador. */
(function () {
  const FAIXA = '92720046';   // Back In Black (AC/DC), abertura do Homem de Ferro, escolhida pelo dono
  const CHAVE_SESSAO = 'crepusculo-abertura-tocou';
  const CHAVE_DESLIGADA = 'crepusculo-abertura-desligada';

  const ler = (arm, k) => { try { return arm.getItem(k); } catch (_) { return null; } };
  const gravar = (arm, k, v) => { try { arm.setItem(k, v); } catch (_) { /* sem storage: vale só agora */ } };

  if (ler(localStorage, CHAVE_DESLIGADA) === '1' || ler(sessionStorage, CHAVE_SESSAO) === '1') return;

  function toca() {
    document.removeEventListener('pointerdown', toca, true);
    document.removeEventListener('keydown', toca, true);
    if (ler(sessionStorage, CHAVE_SESSAO) === '1') return;
    gravar(sessionStorage, CHAVE_SESSAO, '1');

    const cartao = document.createElement('div');
    cartao.className = 'abertura';
    cartao.setAttribute('role', 'region');
    cartao.setAttribute('aria-label', 'Música de abertura');
    cartao.innerHTML =
      '<div class="abertura-topo"><span>🌘 abertura</span>' +
      '<button type="button" class="abertura-nunca" title="Não tocar mais neste navegador">não tocar mais</button>' +
      '<button type="button" class="abertura-fecha" aria-label="Fechar e parar a música">✕</button></div>' +
      `<iframe title="Música de abertura (Deezer)" src="https://widget.deezer.com/widget/dark/track/${FAIXA}?autoplay=true&tracklist=false"` +
      ' allow="autoplay; encrypted-media; clipboard-write" loading="eager"></iframe>';
    const fecha = () => cartao.remove();
    cartao.querySelector('.abertura-fecha').onclick = fecha;
    cartao.querySelector('.abertura-nunca').onclick = () => { gravar(localStorage, CHAVE_DESLIGADA, '1'); fecha(); };
    document.body.appendChild(cartao);
  }

  document.addEventListener('pointerdown', toca, true);
  document.addEventListener('keydown', toca, true);
})();
