/**
 * ============================================================
 *  marcador.js — OBSERVADOR: puntos, vidas, nivel y leyenda
 * ============================================================
 * Solo se suscribe a eventos. El Juego nunca llama al Marcador
 * directamente: ni siquiera sabe que existe.
 */
class Marcador {
  constructor(eventos) {
    this.elementoPuntos = document.getElementById('puntos');
    this.elementoVidas = document.getElementById('vidas');
    this.elementoNivel = document.getElementById('nivel');

    // Cuando el Juego emita 'puntos', se ejecuta mostrarPuntos, y así con los demás
    eventos.suscribir('puntos', (puntos) => this.mostrarPuntos(puntos));
    eventos.suscribir('vidas', (vidas) => this.mostrarVidas(vidas));
    eventos.suscribir('nivel', (nivel) => this.mostrarNivel(nivel));

    this.dibujarLeyendaDeVirus();
  }

  mostrarPuntos(puntos) {
    this.elementoPuntos.textContent = puntos;
  }

  mostrarVidas(vidas) {
    if (vidas > 0) {
      this.elementoVidas.textContent = '♥'.repeat(vidas); // un corazón por vida
    } else {
      this.elementoVidas.textContent = '—';
    }
  }

  mostrarNivel(nivel) {
    this.elementoNivel.textContent = nivel;
  }

  /** Arma la lista de tipos de virus a partir de las estrategias que existen. */
  dibujarLeyendaDeVirus() {
    const lista = document.getElementById('leyenda-virus');

    for (const ClaseEstrategia of TODAS_LAS_ESTRATEGIAS) {
      const estrategia = new ClaseEstrategia();
      const item = document.createElement('li');
      item.innerHTML =
        '<span class="icono" style="background:' + estrategia.color + '"></span> ' +
        '<strong>' + estrategia.nombre + '</strong> — ' + estrategia.descripcion;
      lista.appendChild(item);
    }
  }
}
