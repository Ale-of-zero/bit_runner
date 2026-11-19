/**
 * ============================================================
 *  main.js — Punto de entrada: arma todo y arranca el juego
 * ============================================================
 */

// 1. Creamos el juego sobre el <canvas id="pantalla"> del HTML
const juego = new Juego(document.getElementById('pantalla'));

// 2. OBSERVER: cada observador se suscribe a los eventos del juego.
//    Para quitar el sonido del proyecto bastaría con borrar esa línea.
new Marcador(juego.eventos);
new ConsolaDebug(juego.eventos, document.getElementById('consola'));
new Logros(juego.eventos, document.getElementById('notificacion'), document.getElementById('logros'));
new Sonido(juego.eventos);

// 3. Teclado: cada tecla presionada se la pasamos al juego
document.addEventListener('keydown', (evento) => {
  const seUso = juego.manejarTecla(evento.key);
  if (seUso) {
    evento.preventDefault(); // evita que las flechas o el espacio muevan la página
  }
});

// 4. Botones táctiles (para celular). Cada botón tiene data-tecla="..." en el HTML.
const botones = document.querySelectorAll('[data-tecla]');
for (const boton of botones) {
  boton.addEventListener('pointerdown', (evento) => {
    evento.preventDefault();
    juego.manejarTecla(boton.dataset.tecla);
  });
}

// Para depurar: escriban "juego" en la consola del navegador (F12)
window.juego = juego;

// 5. ¡Arranca!
juego.arrancar();
