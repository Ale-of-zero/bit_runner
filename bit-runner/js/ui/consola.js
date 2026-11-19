/**
 * ============================================================
 *  consola.js — OBSERVADOR: registro estilo terminal
 * ============================================================
 * Escucha casi todos los eventos y escribe un mensaje por cada
 * uno, como si fuera la consola de un programa en depuración.
 */
class ConsolaDebug {
  constructor(eventos, elementoLista) {
    this.lista = elementoLista;
    this.maximoDeLineas = 8;

    // Un suscribir por cada evento que queremos mostrar
    eventos.suscribir('nivel', (nivel) => {
      this.escribir('cargando nivel ' + nivel + '...');
    });
    eventos.suscribir('antivirus', () => {
      this.escribir('antivirus activo: ¡los virus son vulnerables!');
    });
    eventos.suscribir('virusEliminado', (datos) => {
      this.escribir('virus ' + datos.virus.estrategia.nombre + ' eliminado (+' + datos.puntos + ')');
    });
    eventos.suscribir('mutacion', (datos) => {
      this.escribir('ALERTA: un virus mutó a ' + datos.virus.estrategia.nombre.toUpperCase(), 'alerta');
    });
    eventos.suscribir('jugadorAtrapado', () => {
      this.escribir('error fatal: un virus te atrapó', 'alerta');
    });
    eventos.suscribir('powerUpAparecio', (datos) => {
      this.escribir('apareció ' + datos.nombre + ' en el mapa');
    });
    eventos.suscribir('powerUp', (datos) => {
      this.escribir('power-up activado: ' + datos.nombre);
    });
    eventos.suscribir('nivelCompletado', (nivel) => {
      this.escribir('nivel ' + nivel + ' depurado ✔');
    });
    eventos.suscribir('finDelJuego', (puntos) => {
      this.escribir('proceso terminado. puntaje final: ' + puntos);
    });
    eventos.suscribir('logro', (datos) => {
      this.escribir('★ logro desbloqueado: ' + datos.titulo, 'logro');
    });
    eventos.suscribir('sonido', (activo) => {
      this.escribir(activo ? 'sonido activado' : 'sonido silenciado');
    });
  }

  /** Agrega una línea arriba de todo. tipo = 'alerta' (rojo), 'logro' (amarillo) o nada. */
  escribir(texto, tipo) {
    const linea = document.createElement('li');
    linea.textContent = '> ' + texto;
    if (tipo) linea.className = 'linea-' + tipo;
    this.lista.prepend(linea); // prepend = poner al inicio

    // Si hay demasiadas líneas, borramos las más viejas (las de abajo)
    while (this.lista.children.length > this.maximoDeLineas) {
      this.lista.lastElementChild.remove();
    }
  }
}
