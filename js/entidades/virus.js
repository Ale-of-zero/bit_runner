/**
 * ============================================================
 *  virus.js — Los enemigos
 * ============================================================
 * Aquí se juntan DOS patrones:
 *   - this.estrategia -> STRATEGY: CÓMO persigue (a dónde quiere ir).
 *   - this.estado     -> STATE:    QUÉ le pasa ahora (cazando,
 *                                  asustado, eliminado, congelado).
 * La clase Virus casi no tiene "if": delega en esos dos objetos.
 */
class Virus extends Personaje {
  constructor(fila, col, estrategia, retrasoSalida) {
    super(fila, col);
    this.estrategia = estrategia;
    this.retrasoSalida = retrasoSalida;
    this.msBase = CONFIG.VELOCIDAD.VIRUS; // el Juego lo ajusta según el nivel
    this.reiniciar();
  }

  reiniciar() {
    super.reiniciar();
    this.estado = new EstadoCazando();
    this.tiempoEspera = this.retrasoSalida; // tiempo que espera dentro de la casa
  }

  // ---------- STATE: delegamos en el estado actual ----------
  cambiarEstado(nuevoEstado) {
    this.estado = nuevoEstado;
    nuevoEstado.alEntrar(this);
  }

  msPorCelda() {
    return this.estado.msPorCelda(this);
  }

  // ---------- STRATEGY: cambiar la forma de pensar ----------
  /** INNOVACIÓN: el virus vuelve con una estrategia diferente. */
  mutar(juego) {
    this.estrategia = crearEstrategiaDiferente(this.estrategia);
    juego.eventos.emitir('mutacion', { virus: this });
  }

  // ---------- Movimiento ----------
  actualizar(dt, juego) {
    this.estado.actualizar(this, dt, juego);

    if (this.tiempoEspera > 0) {
      this.tiempoEspera = this.tiempoEspera - dt; // todavía no le toca salir
      return;
    }
    super.actualizar(dt, juego); // el movimiento lo hace Personaje
  }

  estaDentroDeCasa(juego) {
    return juego.laberinto.esCasa(this.fila, this.col) || juego.laberinto.esPuerta(this.fila, this.col);
  }

  /** Puede cruzar la puerta si está saliendo de la casa o si su estado lo permite. */
  puedeCruzarPuerta(juego) {
    return this.estaDentroDeCasa(juego) || this.estado.puedeCruzarPuerta();
  }

  decidirDireccion(juego) {
    const opciones = this.opcionesDeMovimiento(juego);
    if (opciones.length === 0) {
      this.direccion = DIRECCION.NINGUNA;
      return;
    }

    if (this.estaDentroDeCasa(juego) && this.estado.quiereSalirDeCasa()) {
      // Primero tiene que salir de la casa
      this.direccion = this.direccionMasCercanaA(juego.laberinto.salidaCasa, opciones);
    } else {
      // Fuera de la casa, el ESTADO decide
      this.direccion = this.estado.elegirDireccion(this, opciones, juego);
    }
  }

  /**
   * Direcciones a las que puede ir. Regla: no da media vuelta,
   * salvo que sea un callejón sin salida.
   */
  opcionesDeMovimiento(juego) {
    const puedeCruzar = this.puedeCruzarPuerta(juego);
    const reversa = direccionOpuesta(this.direccion);

    const libres = []; // todas las direcciones sin pared
    for (const direccion of DIRECCIONES_DE_MOVIMIENTO) {
      const filaSiguiente = this.fila + direccion.fila;
      const colSiguiente = this.col + direccion.col;
      if (juego.laberinto.esTransitable(filaSiguiente, colSiguiente, puedeCruzar)) {
        libres.push(direccion);
      }
    }

    const sinReversa = []; // las mismas, pero sin la media vuelta
    for (const direccion of libres) {
      if (direccion !== reversa) {
        sinReversa.push(direccion);
      }
    }

    if (sinReversa.length > 0) return sinReversa;
    return libres; // callejón sin salida: solo le queda volver
  }

  /** De las opciones, elige la que deja al virus más cerca del objetivo. */
  direccionMasCercanaA(objetivo, opciones) {
    let mejorDireccion = opciones[0];
    let menorDistancia = Infinity; // empezamos con "infinito" para que cualquiera sea menor

    for (const direccion of opciones) {
      const siguienteCasilla = { fila: this.fila + direccion.fila, col: this.col + direccion.col };
      const d = distancia(siguienteCasilla, objetivo);
      if (d < menorDistancia) {
        menorDistancia = d;
        mejorDireccion = direccion;
      }
    }
    return mejorDireccion;
  }

  // ---------- Dibujo ----------
  dibujar(ctx, tiempo) {
    const posicion = this.posicionEnPantalla();
    const x = posicion.x;
    const y = posicion.y;
    const color = this.estado.colorPara(this, tiempo); // el ESTADO decide el color

    if (color !== null) {
      this.dibujarCuerpo(ctx, x, y, color, tiempo);
    }
    this.dibujarOjos(ctx, x, y);
    this.estado.dibujarExtra(ctx, x, y, tiempo);
  }

  /** Un "bicho": 6 patitas que se mueven, 2 antenas y un cuerpo ovalado. */
  dibujarCuerpo(ctx, x, y, color, tiempo) {
    const r = CONFIG.TAMANO_CELDA * 0.34; // "radio" del bicho
    const meneo = Math.sin(tiempo / 90 + this.col + this.fila) * 2; // de -2 a 2 píxeles

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    // 3 pares de patas: arriba (-1), al medio (0) y abajo (1)
    for (const nivel of [-1, 0, 1]) {
      const alturaPata = y + nivel * r * 0.6;
      let movimiento = meneo;
      if (nivel === 0) movimiento = -meneo; // la pata del medio se mueve al revés

      ctx.moveTo(x - r * 0.6, alturaPata); // pata izquierda
      ctx.lineTo(x - r * 1.25, alturaPata + nivel * 3 + movimiento);
      ctx.moveTo(x + r * 0.6, alturaPata); // pata derecha
      ctx.lineTo(x + r * 1.25, alturaPata + nivel * 3 - movimiento);
    }

    // Antenas
    ctx.moveTo(x - 3, y - r * 0.8);
    ctx.lineTo(x - 7, y - r * 1.4);
    ctx.moveTo(x + 3, y - r * 0.8);
    ctx.lineTo(x + 7, y - r * 1.4);
    ctx.stroke();

    // Cuerpo
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, r * 0.85, r, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  /** Dos ojos blancos; las pupilas se corren hacia donde se mueve. */
  dibujarOjos(ctx, x, y) {
    const corrimientoX = this.direccion.col * 1.5;
    const corrimientoY = this.direccion.fila * 1.5;

    for (const separacion of [-4, 4]) { // ojo izquierdo (-4) y derecho (+4)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x + separacion, y - 3, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0b0f14';
      ctx.beginPath();
      ctx.arc(x + separacion + corrimientoX, y - 3 + corrimientoY, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
