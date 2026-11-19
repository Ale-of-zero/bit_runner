/**
 * ============================================================
 *  PATRÓN FACTORY (Fábrica) — fabrica.js
 * ============================================================
 * PROBLEMA:
 *   El mapa es solo texto ('.', 'A', 'J', 'V'...). Alguien tiene
 *   que convertir cada letra en un objeto real (Dato, Antivirus,
 *   Jugador, Virus). Si ese código estuviera regado por el Juego,
 *   cada objeto nuevo obligaría a modificar el Juego.
 *
 * SOLUCIÓN:
 *   La FÁBRICA es la única clase que sabe CÓMO se crea cada
 *   objeto. El Juego solo le pide: "créame lo que corresponde a
 *   esta letra" y recibe el objeto listo.
 *
 *   Para agregar un objeto nuevo (ej. 'L' = llave) solo se
 *   cambia la fábrica y el mapa. El Juego no se toca.
 */
class FabricaEntidades {
  constructor() {
    this.virusCreados = 0; // cuenta los virus para darle a cada uno una estrategia distinta
  }

  /** Convierte un símbolo del mapa en el objeto correspondiente (o null). */
  crearDesdeSimbolo(simbolo, fila, col) {
    if (simbolo === '.') return new Dato(fila, col);
    if (simbolo === 'A') return new Antivirus(fila, col);
    if (simbolo === 'J') return new Jugador(fila, col);
    if (simbolo === 'V') return this.crearVirus(fila, col);
    return null; // paredes, caminos vacíos, casa y puerta no son objetos
  }

  /** El virus 1 es Rastreador, el 2 Emboscador, el 3 Errático y el 4 Tímido. */
  crearVirus(fila, col) {
    const numero = this.virusCreados; // 0, 1, 2, 3
    this.virusCreados = this.virusCreados + 1;

    const ClaseEstrategia = TODAS_LAS_ESTRATEGIAS[numero];
    const retraso = CONFIG.RETRASO_SALIDA_VIRUS[numero];

    return new Virus(fila, col, new ClaseEstrategia(), retraso);
  }

  /** Crea al azar uno de los power-ups temporales. */
  crearPowerUpAleatorio(fila, col) {
    if (Math.random() < 0.5) {
      return new Overclock(fila, col);
    }
    return new Breakpoint(fila, col);
  }
}
