/**
 * ============================================================
 *  personaje.js — Clase base para todo lo que se mueve
 * ============================================================
 * Jugador y Virus HEREDAN de Personaje. Aquí está lo que
 * tienen en común: posición, dirección y avanzar casilla por
 * casilla. Cada hijo decide su propia dirección
 * (decidirDireccion) y su velocidad (msPorCelda).
 *
 * ¿Cómo funciona el movimiento?
 *   1. La posición "real" es una casilla: (fila, col).
 *   2. Un reloj suma el tiempo que pasa. Cuando llega a
 *      msPorCelda(), el personaje salta a la casilla siguiente.
 *   3. Para que no se vea a saltos, al DIBUJAR lo ponemos en un
 *      punto intermedio entre la casilla anterior y la actual.
 */
class Personaje {
  constructor(fila, col) {
    this.filaInicial = fila;
    this.colInicial = col;
    this.volverAlInicio();
  }

  volverAlInicio() {
    this.fila = this.filaInicial;
    this.col = this.colInicial;
    this.filaAnterior = this.fila;
    this.colAnterior = this.col;
    this.direccion = DIRECCION.NINGUNA;
    this.reloj = 0; // milisegundos desde el último paso
  }

  /** Los hijos amplían este método (y llaman a super.reiniciar()). */
  reiniciar() {
    this.volverAlInicio();
  }

  // ----- Métodos que cada hijo DEBE implementar -----
  msPorCelda() {
    throw new Error('Implementar msPorCelda()');
  }

  decidirDireccion(juego) {
    throw new Error('Implementar decidirDireccion()');
  }

  dibujar(ctx, tiempo) {}

  // ----- Lógica común -----

  /** Se llama en cada cuadro. dt = milisegundos desde el cuadro anterior. */
  actualizar(dt, juego) {
    this.reloj = this.reloj + dt;

    const duracionDelPaso = this.msPorCelda();
    if (this.reloj < duracionDelPaso) {
      return; // todavía no toca avanzar
    }

    // Toca avanzar. Guardamos el tiempo que "sobró" para el siguiente paso.
    this.reloj = this.reloj - duracionDelPaso;
    if (this.reloj > duracionDelPaso) {
      this.reloj = 0; // sobró demasiado (por ej. el juego se trabó): empezamos de cero
    }
    this.darUnPaso(juego);
  }

  darUnPaso(juego) {
    // Recordamos dónde estábamos (sirve para dibujar suave y para los choques)
    this.filaAnterior = this.fila;
    this.colAnterior = this.col;

    this.decidirDireccion(juego);
    if (this.direccion === DIRECCION.NINGUNA) {
      return; // se queda quieto
    }

    this.fila = this.fila + this.direccion.fila;
    this.col = juego.laberinto.ajustarColumna(this.col + this.direccion.col);
  }

  /** Posición en píxeles para dibujar, entre la casilla anterior y la actual. */
  posicionEnPantalla() {
    const t = CONFIG.TAMANO_CELDA;

    // progreso: 0 = recién sale de la casilla anterior, 1 = ya llegó a la nueva
    let progreso = this.reloj / this.msPorCelda();
    if (progreso > 1) progreso = 1;

    // Punto intermedio: anterior + (actual - anterior) * progreso
    const filaVisual = this.filaAnterior + (this.fila - this.filaAnterior) * progreso;
    let colVisual = this.colAnterior + (this.col - this.colAnterior) * progreso;

    // Si cruzó el túnel (saltó de un borde al otro), no lo deslizamos por toda la pantalla
    if (Math.abs(this.col - this.colAnterior) > 1) {
      colVisual = this.col;
    }

    // Pasamos de casillas a píxeles (al centro de la casilla)
    return {
      x: colVisual * t + t / 2,
      y: filaVisual * t + t / 2,
    };
  }
}
