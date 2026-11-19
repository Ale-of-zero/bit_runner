/**
 * ============================================================
 *  coleccionables.js — Todo lo que el jugador puede recoger
 * ============================================================
 * Aquí se ve HERENCIA y POLIMORFISMO (pilares de POO):
 * todas las clases tienen alSerRecogido() y dibujar(), pero
 * cada una hace algo distinto. El Juego no pregunta "¿qué eres?",
 * simplemente llama coleccionable.alSerRecogido(juego).
 *
 *   Coleccionable
 *     ├── Dato            (bit 0/1, hay que recogerlos todos)
 *     ├── Antivirus       (asusta a los virus)
 *     └── PowerUpTemporal (aparece un rato y desaparece)
 *           ├── Overclock  (te hace más rápido)
 *           └── Breakpoint (congela a los virus)
 */

class Coleccionable {
  constructor(fila, col, puntos) {
    this.fila = fila;
    this.col = col;
    this.puntos = puntos;
    this.activo = true; // false = ya fue recogido o desapareció
  }

  alSerRecogido(juego) {
    this.activo = false;
    juego.sumarPuntos(this.puntos);
  }

  /** ¿Hay que recogerlo para pasar de nivel? */
  esObligatorio() {
    return false;
  }

  actualizar(dt) {}
  dibujar(ctx, tiempo) {}

  /** Centro de la casilla en píxeles. */
  centro() {
    const t = CONFIG.TAMANO_CELDA;
    return { x: this.col * t + t / 2, y: this.fila * t + t / 2 };
  }
}

// ------------------------------------------------------------
class Dato extends Coleccionable {
  constructor(fila, col) {
    super(fila, col, CONFIG.PUNTOS.DATO);
    // Alterna "0" y "1" como un tablero de ajedrez
    if ((fila + col) % 2 === 0) {
      this.texto = '0';
    } else {
      this.texto = '1';
    }
  }

  alSerRecogido(juego) {
    super.alSerRecogido(juego);
    juego.eventos.emitir('datoRecogido');
  }

  esObligatorio() {
    return true;
  }

  dibujar(ctx) {
    const centro = this.centro();
    ctx.fillStyle = 'rgba(57, 255, 136, 0.6)';
    ctx.font = 'bold 11px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.texto, centro.x, centro.y);
  }
}

// ------------------------------------------------------------
class Antivirus extends Coleccionable {
  constructor(fila, col) {
    super(fila, col, CONFIG.PUNTOS.ANTIVIRUS);
  }

  alSerRecogido(juego) {
    super.alSerRecogido(juego);
    juego.activarAntivirus();
  }

  esObligatorio() {
    return true;
  }

  /** Dibuja un escudo con una cruz que "late" (crece y se achica). */
  dibujar(ctx, tiempo) {
    const centro = this.centro();
    const x = centro.x;
    const y = centro.y;
    const latido = 1 + 0.15 * Math.sin(tiempo / 150); // va de 0.85 a 1.15
    const r = CONFIG.TAMANO_CELDA * 0.32 * latido;

    // Escudo (un polígono de 6 puntas)
    ctx.fillStyle = '#5ce1e6';
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.lineTo(x + r * 0.85, y - r * 0.55);
    ctx.lineTo(x + r * 0.7, y + r * 0.35);
    ctx.lineTo(x, y + r);
    ctx.lineTo(x - r * 0.7, y + r * 0.35);
    ctx.lineTo(x - r * 0.85, y - r * 0.55);
    ctx.closePath();
    ctx.fill();

    // Cruz oscura en el centro
    ctx.fillStyle = '#0b0f14';
    ctx.fillRect(x - 1.5, y - r * 0.45, 3, r * 0.9);
    ctx.fillRect(x - r * 0.45, y - 1.5, r * 0.9, 3);
  }
}

// ------------------------------------------------------------
/** Power-up que solo está en el mapa por un tiempo limitado. */
class PowerUpTemporal extends Coleccionable {
  constructor(fila, col, nombre) {
    super(fila, col, CONFIG.PUNTOS.POWERUP);
    this.nombre = nombre;
    this.tiempoRestante = CONFIG.DURACION.POWERUP_EN_MAPA;
  }

  actualizar(dt) {
    this.tiempoRestante = this.tiempoRestante - dt;
    if (this.tiempoRestante <= 0) {
      this.activo = false; // se acabó el tiempo: desaparece
    }
  }

  /** Cuando le quedan menos de 2 segundos, parpadea (se ve un rato sí y un rato no). */
  estaVisible(tiempo) {
    if (this.tiempoRestante >= 2000) return true;
    return Math.floor(tiempo / 150) % 2 === 0;
  }
}

class Overclock extends PowerUpTemporal {
  constructor(fila, col) {
    super(fila, col, 'Overclock');
  }

  alSerRecogido(juego) {
    super.alSerRecogido(juego);
    juego.activarOverclock();
  }

  /** Dibuja un rayo amarillo. */
  dibujar(ctx, tiempo) {
    if (!this.estaVisible(tiempo)) return;
    const centro = this.centro();
    const x = centro.x;
    const y = centro.y;

    ctx.fillStyle = '#ffe14d';
    ctx.beginPath();
    ctx.moveTo(x + 2, y - 10);
    ctx.lineTo(x - 6, y + 2);
    ctx.lineTo(x - 1, y + 2);
    ctx.lineTo(x - 3, y + 10);
    ctx.lineTo(x + 6, y - 2);
    ctx.lineTo(x + 1, y - 2);
    ctx.closePath();
    ctx.fill();
  }
}

class Breakpoint extends PowerUpTemporal {
  constructor(fila, col) {
    super(fila, col, 'Breakpoint');
  }

  alSerRecogido(juego) {
    super.alSerRecogido(juego);
    juego.activarBreakpoint();
  }

  /** Dibuja un punto rojo, como los breakpoints de un editor de código. */
  dibujar(ctx, tiempo) {
    if (!this.estaVisible(tiempo)) return;
    const centro = this.centro();

    ctx.fillStyle = '#ff3b3b';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centro.x, centro.y, 8, 0, Math.PI * 2); // círculo de radio 8
    ctx.fill();
    ctx.stroke();
  }
}
