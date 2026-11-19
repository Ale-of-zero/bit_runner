/**
 * ============================================================
 *  laberinto.js — El mapa por donde se mueven todos
 * ============================================================
 * Responsabilidades:
 *   - Saber qué hay en cada casilla (pared, puerta, casa, libre).
 *   - Responder "¿se puede pasar por aquí?".
 *   - Dibujar las paredes.
 */

const TIPO_CELDA = {
  PARED: 'pared',
  PUERTA: 'puerta',
  CASA: 'casa',
  LIBRE: 'libre',
};

class Laberinto {
  constructor(mapaTexto) {
    this.filas = mapaTexto.length; // cantidad de filas (21)
    this.columnas = mapaTexto[0].length; // cantidad de columnas (19)

    this.celdas = []; // celdas[fila][col] = 'pared', 'puerta', 'casa' o 'libre'
    this.celdasLibres = []; // lista de casillas por donde se puede caminar
    let puerta = null;

    // Recorremos el mapa letra por letra
    for (let fila = 0; fila < this.filas; fila++) {
      const filaDeCeldas = [];

      for (let col = 0; col < this.columnas; col++) {
        const simbolo = mapaTexto[fila][col];
        const tipo = this.tipoDeSimbolo(simbolo);
        filaDeCeldas.push(tipo);

        if (tipo === TIPO_CELDA.LIBRE) this.celdasLibres.push({ fila: fila, col: col });
        if (tipo === TIPO_CELDA.PUERTA) puerta = { fila: fila, col: col };
      }

      this.celdas.push(filaDeCeldas);
    }

    // La puerta nos dice por dónde salen y entran los virus
    this.salidaCasa = { fila: puerta.fila - 1, col: puerta.col }; // justo afuera (arriba)
    this.centroCasa = { fila: puerta.fila + 1, col: puerta.col }; // justo adentro (abajo)

    this.fondo = this.crearImagenDeParedes();
  }

  tipoDeSimbolo(simbolo) {
    if (simbolo === '#') return TIPO_CELDA.PARED;
    if (simbolo === '-') return TIPO_CELDA.PUERTA;
    if (simbolo === 'C' || simbolo === 'V') return TIPO_CELDA.CASA;
    return TIPO_CELDA.LIBRE;
  }

  /**
   * Túnel: si una columna se sale del mapa, aparece por el otro lado.
   * Ejemplo con 19 columnas: la columna -1 se convierte en 18, y la 19 en 0.
   */
  ajustarColumna(col) {
    if (col < 0) return col + this.columnas;
    if (col >= this.columnas) return col - this.columnas;
    return col;
  }

  tipoEn(fila, col) {
    if (fila < 0 || fila >= this.filas) return TIPO_CELDA.PARED; // fuera del mapa
    return this.celdas[fila][this.ajustarColumna(col)];
  }

  esPared(fila, col) {
    return this.tipoEn(fila, col) === TIPO_CELDA.PARED;
  }

  esCasa(fila, col) {
    return this.tipoEn(fila, col) === TIPO_CELDA.CASA;
  }

  esPuerta(fila, col) {
    return this.tipoEn(fila, col) === TIPO_CELDA.PUERTA;
  }

  /** ¿Se puede entrar a esta casilla? La puerta solo si se tiene permiso. */
  esTransitable(fila, col, puedeCruzarPuerta) {
    const tipo = this.tipoEn(fila, col);
    if (tipo === TIPO_CELDA.PARED) return false;
    if (tipo === TIPO_CELDA.PUERTA) return puedeCruzarPuerta === true;
    return true;
  }

  celdaLibreAleatoria() {
    return elegirAlAzar(this.celdasLibres);
  }

  /**
   * Las paredes nunca cambian, así que las dibujamos UNA sola vez
   * en una imagen aparte (otro canvas) y en cada cuadro solo
   * copiamos esa imagen. Así no redibujamos cientos de paredes.
   */
  crearImagenDeParedes() {
    const t = CONFIG.TAMANO_CELDA;
    const lienzo = document.createElement('canvas');
    lienzo.width = this.columnas * t;
    lienzo.height = this.filas * t;
    const ctx = lienzo.getContext('2d');

    for (let fila = 0; fila < this.filas; fila++) {
      for (let col = 0; col < this.columnas; col++) {
        const x = col * t;
        const y = fila * t;

        if (this.esPuerta(fila, col)) {
          ctx.fillStyle = '#ff4d6d';
          ctx.fillRect(x, y + t / 2 - 2, t, 4); // línea roja horizontal
        }

        if (this.esPared(fila, col)) {
          this.dibujarPared(ctx, fila, col, x, y, t);
        }
      }
    }
    return lienzo;
  }

  /** Cuadro verde oscuro con una línea neón en los lados que dan a un camino. */
  dibujarPared(ctx, fila, col, x, y, t) {
    ctx.fillStyle = '#0d2218';
    ctx.fillRect(x, y, t, t);

    ctx.strokeStyle = '#39ff88';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (!this.esPared(fila - 1, col)) { // arriba hay camino: línea arriba
      ctx.moveTo(x, y + 1);
      ctx.lineTo(x + t, y + 1);
    }
    if (!this.esPared(fila + 1, col)) { // abajo hay camino: línea abajo
      ctx.moveTo(x, y + t - 1);
      ctx.lineTo(x + t, y + t - 1);
    }
    if (!this.esPared(fila, col - 1)) { // a la izquierda hay camino
      ctx.moveTo(x + 1, y);
      ctx.lineTo(x + 1, y + t);
    }
    if (!this.esPared(fila, col + 1)) { // a la derecha hay camino
      ctx.moveTo(x + t - 1, y);
      ctx.lineTo(x + t - 1, y + t);
    }
    ctx.stroke();
  }

  dibujar(ctx) {
    ctx.drawImage(this.fondo, 0, 0);
  }
}
