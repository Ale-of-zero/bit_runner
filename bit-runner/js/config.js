/**
 * ============================================================
 *  config.js — Configuración general del juego
 * ============================================================
 * Aquí están TODAS las constantes. Para cambiar la dificultad
 * (velocidades, tiempos, puntos) solo se toca este archivo.
 */

const CONFIG = {
  TAMANO_CELDA: 28, // píxeles que mide cada casilla del laberinto
  VIDAS_INICIALES: 3,

  // VELOCIDAD = milisegundos que tarda un personaje en avanzar UNA casilla.
  // OJO: número MÁS GRANDE = personaje MÁS LENTO.
  VELOCIDAD: {
    JUGADOR: 190, // velocidad normal de Bit
    JUGADOR_OVERCLOCK: 130, // Bit con el power-up Overclock
    VIRUS: 230, // virus en el nivel 1
    VIRUS_MINIMA: 150, // límite: los virus nunca serán más rápidos que esto
    VIRUS_ASUSTADO: 340, // virus huyendo (más lentos)
    VIRUS_ELIMINADO: 100, // ojos volviendo a casa (rápidos)
  },

  // En cada nivel, la velocidad de los virus se multiplica por este número.
  // 0.95 = cada nivel tardan 5% menos en avanzar (o sea, son 5% más rápidos).
  AUMENTO_POR_NIVEL: 0.95,

  // Duraciones en milisegundos (1000 ms = 1 segundo)
  DURACION: {
    ANTIVIRUS: 7000,
    OVERCLOCK: 5000,
    BREAKPOINT: 3500,
    POWERUP_EN_MAPA: 8000, // cuánto dura un power-up antes de desaparecer
    ENTRE_POWERUPS: 12000, // cada cuánto aparece un power-up nuevo
    PAUSA_AL_MORIR: 1500,
    PAUSA_ENTRE_NIVELES: 1800,
  },

  PUNTOS: {
    DATO: 10,
    ANTIVIRUS: 50,
    VIRUS: 200, // se duplica con cada virus seguido (combo)
    POWERUP: 100,
  },

  // Milisegundos que espera cada virus dentro de la casa antes de salir
  RETRASO_SALIDA_VIRUS: [0, 2500, 5000, 7500],
};

/**
 * Mapa del laberinto. Cada letra es una casilla:
 *   #  pared                 .  dato (bit)
 *   A  antivirus             J  jugador (posición inicial)
 *   V  virus (inicio)        C  casa de los virus (vacía)
 *   -  puerta de la casa     (espacio) camino sin dato
 * La fila 9 no tiene paredes en los bordes: es un túnel que
 * conecta el lado izquierdo con el derecho.
 */
const MAPA = [
  '###################',
  '#........#........#',
  '#A##.###.#.###.##A#',
  '#.................#',
  '#.##.#.#####.#.##.#',
  '#....#...#...#....#',
  '####.### # ###.####',
  '####.#       #.####',
  '####.# ##-## #.####',
  '    .  #VCV#  .    ',
  '####.# #VCV# #.####',
  '####.# ##### #.####',
  '####.#       #.####',
  '#........#........#',
  '#.##.###.#.###.##.#',
  '#A.#.....J.....#.A#',
  '##.#.#.#####.#.#.##',
  '#....#...#...#....#',
  '#.######.#.######.#',
  '#.................#',
  '###################',
];

/**
 * Las direcciones dicen cuánto cambia la fila y la columna en un paso.
 * Ejemplo: ARRIBA = la fila baja en 1 (fila -1) y la columna no cambia.
 * Siempre usamos ESTOS mismos objetos, así se pueden comparar con ===.
 */
const DIRECCION = {
  ARRIBA: { fila: -1, col: 0 },
  ABAJO: { fila: 1, col: 0 },
  IZQUIERDA: { fila: 0, col: -1 },
  DERECHA: { fila: 0, col: 1 },
  NINGUNA: { fila: 0, col: 0 },
};

// Las 4 direcciones en las que uno se puede mover (en este orden)
const DIRECCIONES_DE_MOVIMIENTO = [
  DIRECCION.ARRIBA,
  DIRECCION.IZQUIERDA,
  DIRECCION.ABAJO,
  DIRECCION.DERECHA,
];

// ---------- Funciones de ayuda pequeñas ----------

/** Devuelve la dirección contraria (ARRIBA -> ABAJO, etc.). */
function direccionOpuesta(direccion) {
  if (direccion === DIRECCION.ARRIBA) return DIRECCION.ABAJO;
  if (direccion === DIRECCION.ABAJO) return DIRECCION.ARRIBA;
  if (direccion === DIRECCION.IZQUIERDA) return DIRECCION.DERECHA;
  if (direccion === DIRECCION.DERECHA) return DIRECCION.IZQUIERDA;
  return DIRECCION.NINGUNA;
}

/** Distancia en línea recta entre dos casillas (teorema de Pitágoras). */
function distancia(a, b) {
  const diferenciaFilas = a.fila - b.fila;
  const diferenciaColumnas = a.col - b.col;
  return Math.sqrt(diferenciaFilas * diferenciaFilas + diferenciaColumnas * diferenciaColumnas);
}

/** Elige un elemento al azar de una lista. */
function elegirAlAzar(lista) {
  const posicion = Math.floor(Math.random() * lista.length);
  return lista[posicion];
}
