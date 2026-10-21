/* Crepúsculo: tema claro opcional. O escuro é o padrão; a escolha fica guardada só neste aparelho.
   Carregado no <head>, antes dos estilos aparecerem, para a tela não piscar no tema errado. */
(function () {
  'use strict';
  const CHAVE = 'crep-tema';
  const raiz = document.documentElement;
  const le = () => { try { return localStorage.getItem(CHAVE); } catch (e) { return null; } };
  const grava = v => { try { localStorage.setItem(CHAVE, v); } catch (e) { /* aba privada: vale só nesta visita */ } };
  const aplica = claro => raiz.classList.toggle('tema-claro', claro);
  aplica(le() === 'claro');
  window.CrepTema = {
    claro: () => raiz.classList.contains('tema-claro'),
    alternar() { const claro = !this.claro(); aplica(claro); grava(claro ? 'claro' : 'escuro'); },
  };
})();
