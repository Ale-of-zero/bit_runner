# Bit Runner: Modo Debug

Proyecto final de **Programación Orientada a Objetos**: un juego de laberinto inspirado en el
género de los clásicos arcade, con temática de ingeniería de software y **4 patrones de diseño**.

## Cómo ejecutarlo

1. Descomprimir la carpeta.
2. Abrir `index.html` con doble clic (Chrome, Edge o Firefox). No necesita instalar nada.

**Controles:** Flechas o WASD para moverse · Espacio para iniciar o pausar · M para el sonido.
En celular aparecen botones en pantalla.

## La idea

Eres **Bit**, un robot que recorre la memoria de un programa recolectando bits (0 y 1).
Los **virus** te persiguen, cada uno con una forma distinta de pensar. Si recoges un
**Antivirus**, los virus se vuelven vulnerables y te los puedes comer... pero regresan a su
casa y **MUTAN**: vuelven con un comportamiento diferente.

Elementos innovadores:

| Novedad | Qué hace | Patrón que lo permite |
|---|---|---|
| Mutación de virus | Al ser eliminado, el virus vuelve con otra estrategia y color | Strategy |
| Power-ups aleatorios | Overclock (velocidad) y Breakpoint (congela virus) aparecen y desaparecen | Factory |
| Consola de depuración | Narra lo que pasa como una terminal | Observer |
| Logros | 6 logros desbloqueables | Observer |
| Sonido 8 bits | Generado con código, sin archivos de audio | Observer |

## Patrones de diseño

| Patrón | Archivo | Clases |
|---|---|---|
| **Strategy** | `js/patrones/estrategias.js` | `EstrategiaMovimiento` → `Rastreador`, `Emboscador`, `Errática`, `Tímida` |
| **State** | `js/patrones/estados.js` | `EstadoVirus` → `Cazando`, `Asustado`, `Eliminado`, `Congelado` |
| **Observer** | `js/patrones/observador.js` | `EmisorEventos` + suscriptores en `js/ui/` |
| **Factory** | `js/patrones/fabrica.js` | `FabricaEntidades` |

Además se aplican los pilares de POO: **herencia** (`Personaje` → `Jugador`/`Virus`,
`Coleccionable` → `Dato`/`Antivirus`/`PowerUpTemporal`), **polimorfismo**
(`alSerRecogido()`, `dibujar()`), **encapsulamiento** y **abstracción** (clases base con
métodos que los hijos deben implementar).

## Estructura

```
bit-runner/
├── index.html
├── css/estilos.css
└── js/
    ├── config.js              constantes y mapa
    ├── patrones/
    │   ├── observador.js      OBSERVER
    │   ├── estrategias.js     STRATEGY
    │   ├── estados.js         STATE
    │   └── fabrica.js         FACTORY
    ├── entidades/
    │   ├── laberinto.js
    │   ├── coleccionables.js
    │   ├── personaje.js       clase base
    │   ├── jugador.js
    │   └── virus.js
    ├── ui/                    observadores
    │   ├── marcador.js
    │   ├── consola.js
    │   ├── logros.js
    │   └── sonido.js
    ├── juego.js               clase principal (game loop)
    └── main.js                arranque
```

## Cambiar la dificultad

Todo está en `js/config.js` (velocidades, duraciones y puntos). El laberinto también está ahí
como texto: se puede redibujar cambiando los caracteres.
