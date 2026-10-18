'use strict';
/* abertura.js (Crepúsculo): vinheta de abertura.

   Os navegadores só deixam tocar som depois de um gesto da pessoa, então a vinheta toca no
   primeiro clique, toque ou tecla de cada aba aberta, sempre do início. O arquivo fica na pasta
   de dados do servidor (/abertura/vinheta.mp3, só com sessão), fora do repositório: é uma música
   comprada pelo dono, para uso pessoal. Sem arquivo, nada acontece.
   O "não tocar mais" fica guardado neste navegador (localStorage). */
(function () {
  const ARQUIVO = '/abertura/vinheta.mp3';
  const CHAVE_SESSAO = 'crepusculo-abertura-tocou';
  const CHAVE_DESLIGADA = 'crepusculo-abertura-desligada';

  const ler = (arm, k) => { try { return arm.getItem(k); } catch (_) { return null; } };
  const gravar = (arm, k, v) => { try { arm.setItem(k, v); } catch (_) { /* sem storage: vale só agora */ } };

  if (ler(localStorage, CHAVE_DESLIGADA) === '1' || ler(sessionStorage, CHAVE_SESSAO) === '1') return;

  const audio = new Audio();
  audio.preload = 'auto';
  let pronto = false;
  audio.addEventListener('canplaythrough', () => { pronto = true; }, { once: true });
  audio.addEventListener('error', () => { pronto = false; parar(); });
  audio.src = ARQUIVO;

  function parar() {
    document.removeEventListener('pointerdown', toca, true);
    document.removeEventListener('keydown', toca, true);
  }

  function aviso() {
    const el = document.createElement('div');
    el.className = 'abertura';
    el.innerHTML = '<span>🌘 abertura</span>' +
      '<button type="button" class="abertura-nunca" title="Não tocar mais neste navegador">não tocar mais</button>' +
      '<button type="button" class="abertura-fecha" aria-label="Parar a vinheta">✕</button>';
    const some = () => { audio.pause(); el.remove(); };
    el.querySelector('.abertura-fecha').onclick = some;
    el.querySelector('.abertura-nunca').onclick = () => { gravar(localStorage, CHAVE_DESLIGADA, '1'); some(); };
    audio.addEventListener('ended', () => el.remove(), { once: true });
    document.body.appendChild(el);
  }

  function toca() {
    if (!pronto && audio.readyState < 2) return;   // ainda baixando ou sem arquivo: espera o próximo gesto
    parar();
    gravar(sessionStorage, CHAVE_SESSAO, '1');
    audio.currentTime = 0;
    audio.play().then(aviso).catch(() => { /* navegador recusou: fica para a próxima abertura */ });
  }

  document.addEventListener('pointerdown', toca, true);
  document.addEventListener('keydown', toca, true);
})();
