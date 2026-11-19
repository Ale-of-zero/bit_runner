/**
 * ============================================================
 *  PATRÓN STATE (Estado) — estados.js
 * ============================================================
 * PROBLEMA:
 *   Un virus se comporta MUY distinto según su situación:
 *     - Cazando:   te persigue y te quita una vida si te toca.
 *     - Asustado:  huye al azar, es lento y tú te lo comes.
 *     - Eliminado: solo se ven sus ojos, vuelve rápido a casa.
 *     - Congelado: (por el Breakpoint) se queda quieto.
 *   Con if/else tendríamos en CADA método de Virus:
 *     if (estado === 'cazando') ... else if (estado === 'asustado') ...
 *
 * SOLUCIÓN:
 *   Cada estado es una CLASE con los mismos métodos. El virus
 *   guarda su estado actual y le DELEGA el trabajo:
 *     this.estado.alTocarJugador(this, juego)
 *   Cambiar de comportamiento = cambiar de objeto estado.
 *
 *   Transiciones:
 *     Cazando ──(antivirus)──► Asustado ──(te lo comes)──► Eliminado
 *        ▲                        │                           │
 *        └────(se acaba tiempo)───┘     (llega a casa, muta)──┘
 *     Cazando ──(breakpoint)──► Congelado ──(se acaba tiempo)──► Cazando
 */

/** Clase base: el comportamiento "por defecto" que los hijos pueden cambiar. */
class EstadoVirus {
  constructor(nombre) {
    this.nombre = nombre;
  }

  alEntrar(virus) {} // se ejecuta una vez al cambiar a este estado
  actualizar(virus, dt, juego) {} // se ejecuta en cada cuadro del juego

  /** Elige una de las direcciones posibles. */
  elegirDireccion(virus, opciones, juego) {
    return opciones[0];
  }

  /** Velocidad del virus en este estado. */
  msPorCelda(virus) {
    return virus.msBase;
  }

  /** Qué pasa cuando el virus toca al jugador. */
  alTocarJugador(virus, juego) {}

  /** Color del cuerpo. null = no dibujar el cuerpo. */
  colorPara(virus, tiempo) {
    return virus.estrategia.color;
  }

  dibujarExtra(ctx, x, y, tiempo) {} // detalles visuales opcionales

  puedeCruzarPuerta() { return false; }
  quiereSalirDeCasa() { return true; }
  puedeAsustarse() { return true; }
  puedeCongelarse() { return false; }
}

// ------------------------------------------------------------
class EstadoCazando extends EstadoVirus {
  constructor() {
    super('cazando');
  }

  elegirDireccion(virus, opciones, juego) {
    // Aquí se juntan los dos patrones: el ESTADO pregunta a la ESTRATEGIA.
    const objetivo = virus.estrategia.calcularObjetivo(virus, juego);
    return virus.direccionMasCercanaA(objetivo, opciones);
  }

  alTocarJugador(virus, juego) {
    juego.jugadorAtrapado();
  }

  puedeCongelarse() { return true; }
}

// ------------------------------------------------------------
class EstadoAsustado extends EstadoVirus {
  constructor(duracion) {
    super('asustado');
    this.tiempoRestante = duracion;
  }

  alEntrar(virus) {
    virus.direccion = direccionOpuesta(virus.direccion); // da media vuelta
  }

  actualizar(virus, dt) {
    this.tiempoRestante = this.tiempoRestante - dt;
    if (this.tiempoRestante <= 0) {
      virus.cambiarEstado(new EstadoCazando());
    }
  }

  elegirDireccion(virus, opciones) {
    return elegirAlAzar(opciones); // huye sin rumbo
  }

  msPorCelda() {
    return CONFIG.VELOCIDAD.VIRUS_ASUSTADO;
  }

  alTocarJugador(virus, juego) {
    juego.virusEliminado(virus); // ¡ahora el jugador se come al virus!
  }

  colorPara(virus, tiempo) {
    // En los últimos 2 segundos parpadea entre azul y blanco para avisar
    if (this.tiempoRestante < 2000) {
      const toca = Math.floor(tiempo / 180) % 2; // cambia entre 0 y 1 cada 180 ms
      if (toca === 0) return '#ffffff';
    }
    return '#3d5afe';
  }
}

// ------------------------------------------------------------
class EstadoEliminado extends EstadoVirus {
  constructor() {
    super('eliminado');
  }

  actualizar(virus, dt, juego) {
    if (juego.laberinto.esCasa(virus.fila, virus.col)) {
      virus.mutar(juego); // INNOVACIÓN: vuelve con otra estrategia
      virus.cambiarEstado(new EstadoCazando());
    }
  }

  elegirDireccion(virus, opciones, juego) {
    return virus.direccionMasCercanaA(juego.laberinto.centroCasa, opciones);
  }

  msPorCelda() {
    return CONFIG.VELOCIDAD.VIRUS_ELIMINADO;
  }

  colorPara() {
    return null; // solo se dibujan los ojos
  }

  puedeCruzarPuerta() { return true; }
  quiereSalirDeCasa() { return false; }
  puedeAsustarse() { return false; }
}

// ------------------------------------------------------------
class EstadoCongelado extends EstadoVirus {
  constructor(duracion) {
    super('congelado');
    this.tiempoRestante = duracion;
  }

  actualizar(virus, dt) {
    this.tiempoRestante = this.tiempoRestante - dt;
    if (this.tiempoRestante <= 0) {
      virus.cambiarEstado(new EstadoCazando());
    }
  }

  elegirDireccion() {
    return DIRECCION.NINGUNA; // no se mueve
  }

  colorPara() {
    return '#9ecbff';
  }

  /** Dibuja el símbolo de pausa (||) encima del virus. */
  dibujarExtra(ctx, x, y) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 5, y + 2, 3, 7);
    ctx.fillRect(x + 2, y + 2, 3, 7);
  }

  quiereSalirDeCasa() { return false; }
}
