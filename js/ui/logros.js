/**
 * ============================================================
 *  logros.js — OBSERVADOR: sistema de logros (achievements)
 * ============================================================
 * Ejemplo de por qué Observer es útil: los logros se agregaron
 * SIN cambiar ni una línea del Juego. Solo escuchan eventos.
 * Además, cuando se desbloquea uno, emite su propio evento
 * 'logro' (que la consola también escucha).
 */
const LISTA_DE_LOGROS = [
  { id: 'primer-bug', titulo: 'Primer bug aplastado', descripcion: 'Elimina un virus' },
  { id: 'combo', titulo: 'Limpieza total', descripcion: 'Elimina 4 virus con un solo antivirus' },
  { id: 'mutaciones', titulo: 'Evolución', descripcion: 'Provoca 3 mutaciones' },
  { id: 'overclock', titulo: 'Overclockeado', descripcion: 'Usa un Overclock' },
  { id: 'breakpoint', titulo: 'Depurador', descripcion: 'Congela a los virus con un Breakpoint' },
  { id: 'codigo-limpio', titulo: 'Código limpio', descripcion: 'Pasa un nivel sin perder vidas' },
];

class Logros {
  constructor(eventos, elementoNotificacion, elementoLista) {
    this.eventos = eventos;
    this.notificacion = elementoNotificacion;
    this.lista = elementoLista;
    this.desbloqueados = []; // ids de los logros ya conseguidos
    this.mutaciones = 0;
    this.perdioVidaEnEsteNivel = false;

    this.dibujarLista();

    eventos.suscribir('virusEliminado', (datos) => {
      this.desbloquear('primer-bug');
      if (datos.combo >= 4) this.desbloquear('combo');
    });
    eventos.suscribir('mutacion', () => {
      this.mutaciones = this.mutaciones + 1;
      if (this.mutaciones >= 3) this.desbloquear('mutaciones');
    });
    eventos.suscribir('powerUp', (datos) => {
      if (datos.nombre === 'Overclock') this.desbloquear('overclock');
      if (datos.nombre === 'Breakpoint') this.desbloquear('breakpoint');
    });
    eventos.suscribir('nivel', () => {
      this.perdioVidaEnEsteNivel = false; // empieza un nivel nuevo
    });
    eventos.suscribir('jugadorAtrapado', () => {
      this.perdioVidaEnEsteNivel = true;
    });
    eventos.suscribir('nivelCompletado', () => {
      if (!this.perdioVidaEnEsteNivel) this.desbloquear('codigo-limpio');
    });
  }

  /** Crea en el HTML un cuadrito (bloqueado) por cada logro. */
  dibujarLista() {
    for (const logro of LISTA_DE_LOGROS) {
      const item = document.createElement('li');
      item.id = 'logro-' + logro.id;
      item.className = 'bloqueado';
      item.innerHTML = '<strong>' + logro.titulo + '</strong><br><small>' + logro.descripcion + '</small>';
      this.lista.appendChild(item);
    }
  }

  desbloquear(id) {
    if (this.desbloqueados.includes(id)) return; // cada logro se gana una sola vez
    this.desbloqueados.push(id);

    const logro = LISTA_DE_LOGROS.find((l) => l.id === id); // buscamos el logro por su id
    document.getElementById('logro-' + id).className = 'desbloqueado';
    this.mostrarNotificacion(logro.titulo);
    this.eventos.emitir('logro', { titulo: logro.titulo });
  }

  /** Muestra el aviso amarillo arriba del juego por 2.5 segundos. */
  mostrarNotificacion(titulo) {
    this.notificacion.textContent = '★ Logro: ' + titulo;
    this.notificacion.classList.add('visible');

    clearTimeout(this.temporizador); // si había otro aviso, cancelamos su cierre
    this.temporizador = setTimeout(() => {
      this.notificacion.classList.remove('visible');
    }, 2500);
  }
}
