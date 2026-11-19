/**
 * ============================================================
 *  sonido.js — OBSERVADOR: efectos de sonido
 * ============================================================
 * Genera sonidos tipo "8 bits" con la Web Audio API (no usa
 * archivos de audio). También es solo un suscriptor: si se
 * borra esta clase, el juego sigue funcionando igual.
 *
 * Las frecuencias están en Hz: número más alto = sonido más agudo.
 */
class Sonido {
  constructor(eventos) {
    this.eventos = eventos;
    this.activo = true;
    this.contexto = null; // se crea con la primera tecla (lo exigen los navegadores)
    this.notaAlterna = false;

    eventos.suscribir('datoRecogido', () => {
      // Alterna entre dos notas para que no suene siempre igual
      this.notaAlterna = !this.notaAlterna;
      if (this.notaAlterna) {
        this.tocarNota(660, 0.04, 0.03);
      } else {
        this.tocarNota(520, 0.04, 0.03);
      }
    });
    eventos.suscribir('antivirus', () => this.tocarMelodia([220, 330, 440], 0.09));
    eventos.suscribir('virusEliminado', () => this.tocarMelodia([400, 600, 900], 0.07));
    eventos.suscribir('mutacion', () => this.tocarMelodia([300, 250, 300], 0.06));
    eventos.suscribir('jugadorAtrapado', () => this.tocarMelodia([500, 350, 200, 120], 0.12));
    eventos.suscribir('powerUp', () => this.tocarMelodia([800, 1000, 1200], 0.06));
    eventos.suscribir('nivelCompletado', () => this.tocarMelodia([523, 659, 784, 1046], 0.12));
    eventos.suscribir('alternarSonido', () => this.alternar());
  }

  alternar() {
    this.activo = !this.activo;
    this.eventos.emitir('sonido', this.activo);
  }

  /** Toca una nota. duracion y retraso en segundos. */
  tocarNota(frecuencia, duracion, volumen = 0.06, retraso = 0) {
    if (!this.activo) return;
    try {
      if (this.contexto === null) {
        this.contexto = new AudioContext();
      }

      const inicio = this.contexto.currentTime + retraso;
      const oscilador = this.contexto.createOscillator(); // genera el tono
      const volumenNodo = this.contexto.createGain(); // controla el volumen

      oscilador.type = 'square'; // onda cuadrada = sonido "8 bits"
      oscilador.frequency.value = frecuencia;
      volumenNodo.gain.setValueAtTime(volumen, inicio);
      volumenNodo.gain.exponentialRampToValueAtTime(0.0001, inicio + duracion); // se apaga suave

      oscilador.connect(volumenNodo);
      volumenNodo.connect(this.contexto.destination); // destination = parlantes
      oscilador.start(inicio);
      oscilador.stop(inicio + duracion);
    } catch (error) {
      this.activo = false; // si el navegador no soporta audio, seguimos sin sonido
    }
  }

  /** Toca varias notas seguidas, una después de otra. */
  tocarMelodia(frecuencias, duracionNota) {
    for (let i = 0; i < frecuencias.length; i++) {
      this.tocarNota(frecuencias[i], duracionNota, 0.06, i * duracionNota);
    }
  }
}
