/**
 * ============================================================
 *  PATRÓN STRATEGY (Estrategia) — estrategias.js
 * ============================================================
 * PROBLEMA:
 *   Cada virus "piensa" distinto para perseguir al jugador.
 *   La forma fácil sería un if gigante dentro de Virus:
 *     if (tipo === 'rojo') {...} else if (tipo === 'rosado') {...}
 *   Eso crece sin control y no permite cambiar el
 *   comportamiento mientras el juego corre.
 *
 * SOLUCIÓN:
 *   Cada forma de pensar es una CLASE separada que tiene el
 *   mismo método: calcularObjetivo(virus, juego).
 *   El virus solo hace:  this.estrategia.calcularObjetivo(...)
 *   y no le importa cuál estrategia tiene.
 *
 * INNOVACIÓN DEL JUEGO — "MUTACIÓN":
 *   Cuando te comes un virus, regresa a su casa y MUTA: recibe
 *   una estrategia diferente (y cambia de color). Esto solo es
 *   posible porque la estrategia es un objeto intercambiable.
 */

/** Clase base: todas las estrategias deben tener calcularObjetivo(). */
class EstrategiaMovimiento {
  constructor(nombre, color, descripcion) {
    this.nombre = nombre;
    this.color = color;
    this.descripcion = descripcion;
  }

  /** Devuelve la casilla {fila, col} hacia donde el virus quiere ir. */
  calcularObjetivo(virus, juego) {
    throw new Error('Cada estrategia debe implementar calcularObjetivo()');
  }
}

/** Va directo a la casilla donde está el jugador. */
class EstrategiaRastreador extends EstrategiaMovimiento {
  constructor() {
    super('Rastreador', '#ff4d6d', 'Te persigue directamente');
  }

  calcularObjetivo(virus, juego) {
    return { fila: juego.jugador.fila, col: juego.jugador.col };
  }
}

/** Apunta 4 casillas DELANTE del jugador para cerrarle el paso. */
class EstrategiaEmboscador extends EstrategiaMovimiento {
  constructor() {
    super('Emboscador', '#ff8cf0', 'Se adelanta para cortarte el camino');
  }

  calcularObjetivo(virus, juego) {
    const jugador = juego.jugador;
    // Ejemplo: si el jugador va a la DERECHA (col +1), apuntamos 4 columnas más allá
    return {
      fila: jugador.fila + jugador.direccion.fila * 4,
      col: jugador.col + jugador.direccion.col * 4,
    };
  }
}

/** Elige destinos al azar: es impredecible. */
class EstrategiaErratica extends EstrategiaMovimiento {
  constructor() {
    super('Errático', '#ffb347', 'Se mueve sin un patrón fijo');
    this.objetivo = null; // cada virus errático recuerda su propio destino
  }

  calcularObjetivo(virus, juego) {
    let necesitaNuevoDestino = false;

    if (this.objetivo === null) {
      necesitaNuevoDestino = true; // todavía no tiene destino
    } else if (virus.fila === this.objetivo.fila && virus.col === this.objetivo.col) {
      necesitaNuevoDestino = true; // ya llegó
    } else if (Math.random() < 0.05) {
      necesitaNuevoDestino = true; // 5% de probabilidad de "cambiar de idea"
    }

    if (necesitaNuevoDestino) {
      this.objetivo = juego.laberinto.celdaLibreAleatoria();
    }
    return this.objetivo;
  }
}

/** Te persigue de lejos, pero si se acerca mucho huye a su esquina. */
class EstrategiaTimida extends EstrategiaMovimiento {
  constructor() {
    super('Tímido', '#5ce1e6', 'Persigue de lejos y huye si te acercas');
  }

  calcularObjetivo(virus, juego) {
    const jugador = juego.jugador;
    if (distancia(virus, jugador) > 7) {
      return { fila: jugador.fila, col: jugador.col }; // lejos: persigue
    }
    return { fila: juego.laberinto.filas - 2, col: 1 }; // cerca: huye a la esquina inferior izquierda
  }
}

/** Lista de todas las estrategias (la usan la fábrica y la mutación). */
const TODAS_LAS_ESTRATEGIAS = [
  EstrategiaRastreador,
  EstrategiaEmboscador,
  EstrategiaErratica,
  EstrategiaTimida,
];

/** Crea una estrategia cualquiera, elegida al azar. */
function crearEstrategiaAlAzar() {
  const ClaseElegida = elegirAlAzar(TODAS_LAS_ESTRATEGIAS);
  return new ClaseElegida();
}

/** Crea una estrategia al azar que sea DIFERENTE a la actual (para la mutación). */
function crearEstrategiaDiferente(estrategiaActual) {
  let nueva = crearEstrategiaAlAzar();
  while (nueva.nombre === estrategiaActual.nombre) {
    nueva = crearEstrategiaAlAzar(); // salió la misma: probamos otra vez
  }
  return nueva;
}
