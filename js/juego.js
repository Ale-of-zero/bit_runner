/**
 * ============================================================
 *  juego.js — Clase principal que coordina todo
 * ============================================================
 * El Juego:
 *   - usa la FÁBRICA para crear los objetos del nivel,
 *   - actualiza y dibuja todo en cada cuadro (game loop),
 *   - revisa choques,
 *   - y EMITE eventos (OBSERVER) para que la interfaz reaccione.
 *
 * this.estado guarda en qué momento está la partida:
 *   'inicio'          pantalla de inicio
 *   'jugando'         partida en curso
 *   'pausa'           pausado con Espacio
 *   'atrapado'        un virus te atrapó (pausa corta)
 *   'nivelCompletado' recogiste todo (pausa corta)
 *   'fin'             game over
 */
class Juego {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d'); // ctx = el "pincel" para dibujar en el canvas
    this.eventos = new EmisorEventos(); // canal de noticias (Observer)

    this.estado = 'inicio';
    this.tiempoDeEspera = 0; // para las pausas cortas
    this.puntos = 0;
    this.vidas = CONFIG.VIDAS_INICIALES;
    this.nivel = 1;
    this.combo = 0; // cuántos virus seguidos te comiste con el mismo antivirus

    this.cargarNivel();
    canvas.width = this.laberinto.columnas * CONFIG.TAMANO_CELDA;
    canvas.height = this.laberinto.filas * CONFIG.TAMANO_CELDA;
  }

  // ============ Preparación ============

  iniciarPartida() {
    this.puntos = 0;
    this.vidas = CONFIG.VIDAS_INICIALES;
    this.nivel = 1;
    this.cargarNivel();
    this.estado = 'jugando';

    this.eventos.emitir('puntos', this.puntos);
    this.eventos.emitir('vidas', this.vidas);
    this.eventos.emitir('nivel', this.nivel);
  }

  /** Crea el laberinto y, con la FÁBRICA, todos los objetos del mapa. */
  cargarNivel() {
    this.laberinto = new Laberinto(MAPA);
    this.fabrica = new FabricaEntidades();
    this.jugador = null;
    this.virus = [];
    this.coleccionables = [];
    this.relojPowerUp = 0;

    // Recorremos el mapa letra por letra y le pedimos a la fábrica cada objeto
    for (let fila = 0; fila < MAPA.length; fila++) {
      for (let col = 0; col < MAPA[fila].length; col++) {
        const objeto = this.fabrica.crearDesdeSimbolo(MAPA[fila][col], fila, col);
        this.guardarObjeto(objeto);
      }
    }

    // Velocidad de los virus en este nivel (cada nivel un poco más rápidos)
    let velocidadVirus = CONFIG.VELOCIDAD.VIRUS * Math.pow(CONFIG.AUMENTO_POR_NIVEL, this.nivel - 1);
    if (velocidadVirus < CONFIG.VELOCIDAD.VIRUS_MINIMA) {
      velocidadVirus = CONFIG.VELOCIDAD.VIRUS_MINIMA;
    }
    for (const virus of this.virus) {
      virus.msBase = velocidadVirus;
    }
  }

  /** Pone cada objeto creado por la fábrica en su lista correspondiente. */
  guardarObjeto(objeto) {
    if (objeto === null) return; // pared o camino vacío: no hay objeto
    if (objeto instanceof Jugador) this.jugador = objeto;
    else if (objeto instanceof Virus) this.virus.push(objeto);
    else if (objeto instanceof Coleccionable) this.coleccionables.push(objeto);
  }

  reiniciarPosiciones() {
    this.jugador.reiniciar();
    for (const virus of this.virus) {
      virus.reiniciar();
    }
  }

  // ============ Bucle principal (game loop) ============
  // El navegador llama a bucle() unas 60 veces por segundo.
  // En cada vuelta: 1) actualizamos todo  2) dibujamos todo.

  arrancar() {
    this.ultimoTiempo = performance.now();
    requestAnimationFrame((tiempo) => this.bucle(tiempo));
  }

  bucle(tiempoActual) {
    // dt = milisegundos desde el cuadro anterior (máximo 50, por si la pestaña se durmió)
    let dt = tiempoActual - this.ultimoTiempo;
    if (dt > 50) dt = 50;
    this.ultimoTiempo = tiempoActual;

    this.actualizar(dt);
    this.dibujar(tiempoActual);

    requestAnimationFrame((tiempo) => this.bucle(tiempo)); // pedimos el siguiente cuadro
  }

  actualizar(dt) {
    if (this.estado === 'jugando') {
      this.actualizarPartida(dt);
    }

    if (this.estado === 'atrapado' || this.estado === 'nivelCompletado') {
      this.tiempoDeEspera = this.tiempoDeEspera - dt;
      if (this.tiempoDeEspera <= 0) {
        this.continuarDespuesDeLaEspera();
      }
    }
    // En 'inicio', 'pausa' y 'fin' no se mueve nada.
  }

  actualizarPartida(dt) {
    this.jugador.actualizar(dt, this);
    for (const virus of this.virus) {
      virus.actualizar(dt, this);
    }
    for (const coleccionable of this.coleccionables) {
      coleccionable.actualizar(dt);
    }

    // Nos quedamos solo con los objetos que siguen activos (borramos los recogidos)
    this.coleccionables = this.coleccionables.filter((c) => c.activo);

    this.generarPowerUpAleatorio(dt);
    this.revisarColisiones();
    this.revisarNivelCompletado();
  }

  continuarDespuesDeLaEspera() {
    if (this.estado === 'atrapado') {
      if (this.vidas <= 0) {
        this.estado = 'fin';
        this.eventos.emitir('finDelJuego', this.puntos);
      } else {
        this.reiniciarPosiciones();
        this.estado = 'jugando';
      }
    } else if (this.estado === 'nivelCompletado') {
      this.nivel = this.nivel + 1;
      this.cargarNivel();
      this.estado = 'jugando';
      this.eventos.emitir('nivel', this.nivel);
    }
  }

  // ============ Choques ============

  revisarColisiones() {
    // 1. ¿El jugador está sobre algo que se puede recoger?
    for (const coleccionable of this.coleccionables) {
      const mismaCasilla = coleccionable.fila === this.jugador.fila && coleccionable.col === this.jugador.col;
      if (coleccionable.activo && mismaCasilla) {
        coleccionable.alSerRecogido(this); // POLIMORFISMO: cada objeto hace lo suyo
      }
    }

    // 2. ¿Algún virus toca al jugador? El ESTADO del virus decide qué pasa.
    for (const virus of this.virus) {
      if (this.estado !== 'jugando') break; // si ya te atraparon, no seguimos revisando
      if (this.seTocan(this.jugador, virus)) {
        virus.estado.alTocarJugador(virus, this);
      }
    }
  }

  /** Se tocan si están en la misma casilla o si se cruzaron de frente (intercambiaron casillas). */
  seTocan(a, b) {
    const mismaCasilla = a.fila === b.fila && a.col === b.col;

    const aFueAdondeEstabaB = a.fila === b.filaAnterior && a.col === b.colAnterior;
    const bFueAdondeEstabaA = b.fila === a.filaAnterior && b.col === a.colAnterior;
    const seCruzaron = aFueAdondeEstabaB && bFueAdondeEstabaA;

    return mismaCasilla || seCruzaron;
  }

  revisarNivelCompletado() {
    if (this.estado !== 'jugando') return;

    // Contamos cuántos bits y antivirus faltan por recoger
    let pendientes = 0;
    for (const coleccionable of this.coleccionables) {
      if (coleccionable.esObligatorio()) pendientes++;
    }

    if (pendientes === 0) {
      this.estado = 'nivelCompletado';
      this.tiempoDeEspera = CONFIG.DURACION.PAUSA_ENTRE_NIVELES;
      this.eventos.emitir('nivelCompletado', this.nivel);
    }
  }

  // ============ Acciones que llaman los objetos ============

  sumarPuntos(cantidad) {
    this.puntos = this.puntos + cantidad;
    this.eventos.emitir('puntos', this.puntos);
  }

  jugadorAtrapado() {
    if (this.estado !== 'jugando') return;
    this.vidas = this.vidas - 1;
    this.estado = 'atrapado';
    this.tiempoDeEspera = CONFIG.DURACION.PAUSA_AL_MORIR;
    this.eventos.emitir('vidas', this.vidas);
    this.eventos.emitir('jugadorAtrapado');
  }

  virusEliminado(virus) {
    this.combo = this.combo + 1;
    // Combo: 1er virus 200, 2do 400, 3ro 800, 4to 1600 (se duplica)
    const puntosGanados = CONFIG.PUNTOS.VIRUS * Math.pow(2, this.combo - 1);
    this.sumarPuntos(puntosGanados);
    virus.cambiarEstado(new EstadoEliminado());
    this.eventos.emitir('virusEliminado', { virus: virus, combo: this.combo, puntos: puntosGanados });
  }

  activarAntivirus() {
    this.combo = 0;

    // Cada nivel el antivirus dura 0.7 segundos menos (mínimo 3 segundos)
    let duracion = CONFIG.DURACION.ANTIVIRUS - (this.nivel - 1) * 700;
    if (duracion < 3000) duracion = 3000;

    for (const virus of this.virus) {
      if (virus.estado.puedeAsustarse()) {
        virus.cambiarEstado(new EstadoAsustado(duracion));
      }
    }
    this.eventos.emitir('antivirus');
  }

  activarOverclock() {
    this.jugador.tiempoOverclock = CONFIG.DURACION.OVERCLOCK;
    this.eventos.emitir('powerUp', { nombre: 'Overclock' });
  }

  activarBreakpoint() {
    for (const virus of this.virus) {
      if (virus.estado.puedeCongelarse()) {
        virus.cambiarEstado(new EstadoCongelado(CONFIG.DURACION.BREAKPOINT));
      }
    }
    this.eventos.emitir('powerUp', { nombre: 'Breakpoint' });
  }

  // ============ Power-ups aleatorios (usa la FÁBRICA) ============

  generarPowerUpAleatorio(dt) {
    this.relojPowerUp = this.relojPowerUp + dt;
    if (this.relojPowerUp < CONFIG.DURACION.ENTRE_POWERUPS) return; // todavía no toca
    this.relojPowerUp = 0;

    const casilla = this.buscarCasillaVacia();
    if (casilla === null) return;

    const powerUp = this.fabrica.crearPowerUpAleatorio(casilla.fila, casilla.col);
    this.coleccionables.push(powerUp);
    this.eventos.emitir('powerUpAparecio', { nombre: powerUp.nombre });
  }

  /** Busca al azar una casilla sin objetos y no muy cerca del jugador (hasta 40 intentos). */
  buscarCasillaVacia() {
    for (let intento = 0; intento < 40; intento++) {
      const casilla = this.laberinto.celdaLibreAleatoria();
      const lejosDelJugador = distancia(casilla, this.jugador) > 4;
      if (!this.hayObjetoEn(casilla.fila, casilla.col) && lejosDelJugador) {
        return casilla;
      }
    }
    return null; // no encontró ninguna
  }

  hayObjetoEn(fila, col) {
    for (const coleccionable of this.coleccionables) {
      if (coleccionable.fila === fila && coleccionable.col === col) return true;
    }
    return false;
  }

  // ============ Teclado ============

  /** Devuelve true si la tecla se usó (para evitar que la página haga scroll). */
  manejarTecla(tecla) {
    tecla = tecla.toLowerCase(); // 'W' y 'w' cuentan igual

    let direccion = null;
    if (tecla === 'arrowup' || tecla === 'w') direccion = DIRECCION.ARRIBA;
    if (tecla === 'arrowdown' || tecla === 's') direccion = DIRECCION.ABAJO;
    if (tecla === 'arrowleft' || tecla === 'a') direccion = DIRECCION.IZQUIERDA;
    if (tecla === 'arrowright' || tecla === 'd') direccion = DIRECCION.DERECHA;

    if (direccion !== null) {
      this.jugador.direccionDeseada = direccion;
      if (this.estado === 'inicio') this.iniciarPartida(); // en el celular basta con tocar una flecha
      return true;
    }
    if (tecla === ' ') {
      this.alPresionarEspacio();
      return true;
    }
    if (tecla === 'm') {
      this.eventos.emitir('alternarSonido');
      return true;
    }
    return false;
  }

  alPresionarEspacio() {
    if (this.estado === 'inicio' || this.estado === 'fin') this.iniciarPartida();
    else if (this.estado === 'jugando') this.estado = 'pausa';
    else if (this.estado === 'pausa') this.estado = 'jugando';
  }

  // ============ Dibujo ============
  // Se dibuja en capas: lo último que se dibuja queda encima.

  dibujar(tiempo) {
    // 1. Fondo negro
    this.ctx.fillStyle = '#0b0f14';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 2. Paredes, objetos, virus y jugador
    this.laberinto.dibujar(this.ctx);
    for (const coleccionable of this.coleccionables) {
      coleccionable.dibujar(this.ctx, tiempo);
    }
    for (const virus of this.virus) {
      virus.dibujar(this.ctx, tiempo);
    }
    this.jugador.dibujar(this.ctx, tiempo);

    // 3. Mensaje encima de todo (si corresponde)
    this.dibujarMensaje();
  }

  /** Devuelve [título, subtítulo] según el estado, o null si no hay mensaje. */
  mensajeSegunEstado() {
    if (this.estado === 'inicio') return ['BIT RUNNER', 'Presiona ESPACIO para iniciar'];
    if (this.estado === 'pausa') return ['PAUSA', 'ESPACIO para continuar'];
    if (this.estado === 'atrapado') return ['¡UN VIRUS TE ATRAPÓ!', 'Vidas restantes: ' + this.vidas];
    if (this.estado === 'nivelCompletado') return ['NIVEL ' + this.nivel + ' DEPURADO', 'Compilando siguiente nivel...'];
    if (this.estado === 'fin') return ['GAME OVER', 'Puntaje: ' + this.puntos + ' · ESPACIO para reintentar'];
    return null; // jugando: no hay mensaje
  }

  dibujarMensaje() {
    const mensaje = this.mensajeSegunEstado();
    if (mensaje === null) return;

    const ctx = this.ctx;
    const centroX = this.canvas.width / 2;
    const centroY = this.canvas.height / 2;

    // Franja oscura semitransparente
    ctx.fillStyle = 'rgba(11, 15, 20, 0.82)';
    ctx.fillRect(0, centroY - 50, this.canvas.width, 100);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Título
    ctx.fillStyle = '#39ff88';
    ctx.font = 'bold 26px "Courier New", monospace';
    ctx.fillText(mensaje[0], centroX, centroY - 14);

    // Subtítulo
    ctx.fillStyle = '#d7ffe8';
    ctx.font = '15px "Courier New", monospace';
    ctx.fillText(mensaje[1], centroX, centroY + 20);
  }
}
