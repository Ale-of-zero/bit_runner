/**
 * ============================================================
 *  jugador.js — "Bit", el robot que controla el usuario
 * ============================================================
 */
class Jugador extends Personaje {
  constructor(fila, col) {
    super(fila, col);
    this.reiniciar();
  }

  reiniciar() {
    super.reiniciar();
    this.direccionDeseada = DIRECCION.NINGUNA; // la última flecha que presionó el usuario
    this.mirando = DIRECCION.DERECHA; // hacia dónde miran los ojos
    this.tiempoOverclock = 0; // milisegundos que le quedan de Overclock
  }

  msPorCelda() {
    if (this.tiempoOverclock > 0) {
      return CONFIG.VELOCIDAD.JUGADOR_OVERCLOCK;
    }
    return CONFIG.VELOCIDAD.JUGADOR;
  }

  actualizar(dt, juego) {
    if (this.tiempoOverclock > 0) {
      this.tiempoOverclock = this.tiempoOverclock - dt;
    }
    super.actualizar(dt, juego); // el movimiento lo hace Personaje
  }

  /** ¿La casilla siguiente en esa dirección está libre? (nunca puede cruzar la puerta) */
  puedeIrHacia(direccion, juego) {
    const filaSiguiente = this.fila + direccion.fila;
    const colSiguiente = this.col + direccion.col;
    return juego.laberinto.esTransitable(filaSiguiente, colSiguiente, false);
  }

  decidirDireccion(juego) {
    // 1. Si se puede ir hacia donde pidió el usuario, giramos.
    if (this.direccionDeseada !== DIRECCION.NINGUNA && this.puedeIrHacia(this.direccionDeseada, juego)) {
      this.direccion = this.direccionDeseada;
    }

    // 2. Si hay pared adelante, nos detenemos.
    if (!this.puedeIrHacia(this.direccion, juego)) {
      this.direccion = DIRECCION.NINGUNA;
    }

    // 3. Los ojos miran hacia donde vamos (si estamos quietos, siguen mirando igual).
    if (this.direccion !== DIRECCION.NINGUNA) {
      this.mirando = this.direccion;
    }
  }

  /** Dibuja a Bit: un robot cuadrado con antena y ojos en una pantalla. */
  dibujar(ctx, tiempo) {
    const posicion = this.posicionEnPantalla();
    const x = posicion.x;
    const y = posicion.y;
    const lado = CONFIG.TAMANO_CELDA * 0.72;
    const izquierda = x - lado / 2;
    const arriba = y - lado / 2;
    const colorCuerpo = '#b8ff3d';

    // Brillo amarillo mientras dura el Overclock
    if (this.tiempoOverclock > 0) {
      ctx.shadowColor = '#ffe14d';
      ctx.shadowBlur = 16;
    }

    // Antena
    ctx.strokeStyle = colorCuerpo;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, arriba);
    ctx.lineTo(x, arriba - 5);
    ctx.stroke();

    // Lucecita de la antena: cambia de color cada 400 ms
    if (Math.floor(tiempo / 400) % 2 === 0) {
      ctx.fillStyle = '#ff4d6d';
    } else {
      ctx.fillStyle = colorCuerpo;
    }
    ctx.beginPath();
    ctx.arc(x, arriba - 6, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Cuerpo (cuadrado con esquinas redondeadas)
    ctx.fillStyle = colorCuerpo;
    ctx.beginPath();
    ctx.roundRect(izquierda, arriba, lado, lado, 6);
    ctx.fill();
    ctx.shadowBlur = 0; // apagamos el brillo para lo demás

    // Pantalla (cara)
    ctx.fillStyle = '#0b0f14';
    ctx.beginPath();
    ctx.roundRect(izquierda + 3, arriba + 4, lado - 6, lado * 0.5, 3);
    ctx.fill();

    // Ojos: se corren 2 píxeles hacia donde mira
    const caraY = arriba + 4 + lado * 0.25;
    const corrimientoX = this.mirando.col * 2;
    const corrimientoY = this.mirando.fila * 2;
    ctx.fillStyle = colorCuerpo;
    ctx.fillRect(x - 6 + corrimientoX, caraY - 3 + corrimientoY, 3, 5); // ojo izquierdo
    ctx.fillRect(x + 3 + corrimientoX, caraY - 3 + corrimientoY, 3, 5); // ojo derecho
  }
}
