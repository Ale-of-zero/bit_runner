/**
 * ============================================================
 *  PATRÓN OBSERVER (Observador) — observador.js
 * ============================================================
 * PROBLEMA:
 *   Cuando pasa algo en el juego (sube el puntaje, te comes un
 *   virus, pierdes una vida...) varias partes necesitan
 *   enterarse: el marcador, la consola, los logros y el sonido.
 *   Si el Juego llamara a cada una directamente, quedaría
 *   "amarrado" a todas ellas.
 *
 * SOLUCIÓN:
 *   El Juego solo EMITE eventos ("¡pasó esto!").
 *   Las demás clases se SUSCRIBEN a los eventos que les
 *   interesan. El Juego no sabe quién está escuchando.
 *
 *   Juego ──emitir('virusEliminado')──► EmisorEventos
 *                                          ├──► Marcador
 *                                          ├──► ConsolaDebug
 *                                          ├──► Logros
 *                                          └──► Sonido
 */
class EmisorEventos {
  constructor() {
    // Por cada nombre de evento, una lista de funciones a llamar.
    // Ejemplo: { puntos: [funcion1, funcion2], vidas: [funcion3] }
    this.suscriptores = {};
  }

  /** Guarda una función para que se ejecute cada vez que ocurra el evento. */
  suscribir(nombreEvento, funcion) {
    if (this.suscriptores[nombreEvento] === undefined) {
      this.suscriptores[nombreEvento] = []; // primera vez: creamos la lista vacía
    }
    this.suscriptores[nombreEvento].push(funcion);
  }

  /** Avisa a todos los suscritos a ese evento y les pasa los datos. */
  emitir(nombreEvento, datos) {
    const lista = this.suscriptores[nombreEvento];
    if (lista === undefined) return; // nadie está escuchando este evento

    for (const funcion of lista) {
      funcion(datos);
    }
  }
}
