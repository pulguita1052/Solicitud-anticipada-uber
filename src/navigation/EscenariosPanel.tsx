/**
 * Panel lateral (derecho) con los escenarios de verificación del flujo de surtido:
 * Multipedido (propuestas A, B y C) y Un pedido por ronda. Cada tarjeta salta directamente a la pantalla
 * correspondiente con un seed de estado (query `?escenario=<id>`). Se muestra en `/tareas`, `/surtido` y `/ronda`.
 * Fuera del handheld (queda a la derecha del app-frame de 430 px) y oculto bajo 900 px de viewport.
 */
import { useEffect, useRef } from 'react';
import styles from './EscenariosPanel.module.css';

/** Clave en sessionStorage para preservar el scroll del panel a través del reload
    que dispara la navegación con `<a href>` (necesaria para que la semilla se aplique). */
const SCROLL_KEY = 'escenarios-panel-scroll';

type Escenario = {
  id: string;
  titulo: string;
  descripcion: string;
  ruta: '/tareas' | '/surtido' | '/ronda' | '/ronda/detalle' | `/ronda/producto/${string}`;
  /** Reglas o notas clave que aplican a esta pantalla. Se muestran como bullets debajo de la descripción. */
  reglas: string[];
};

/** `oculto`: el grupo se conserva en el código pero no se muestra (propuestas B y C y un pedido por ronda, 2026-10-15). */
type Grupo = { titulo: string; escenarios: Escenario[]; oculto?: boolean };

const GRUPOS: Grupo[] = [
  {
    titulo: 'Surtido multipedido',
    escenarios: [
      {
        id: 'ronda-a',
        titulo: 'Asignación — Surtir ronda',
        descripcion: 'Tarea "SURTIR RONDA DE PEDIDOS" con 3 pedidos, cada uno con su contenedor A, B y C. Es el flujo de Menú › Tareas. Aceptar abre el Detalle de la ronda.',
        ruta: '/tareas',
        reglas: [
          'Lista consolidada en orden de recorrido: total de piezas por código y desglose por contenedor.',
          'Tocar un contenedor filtra la lista a su pedido; tocarlo otra vez muestra toda la ronda.',
          'Cada escaneo avisa en qué contenedor va la pieza ("Coloca 1394000 · Contenedor A: 4 pz · B: 2 pz").',
          'Las piezas llenan primero el pedido capturado antes; si sobran, aviso "Piezas de más".',
          'Cada contenedor avisa cuando su pedido queda completo.',
        ],
      },
      {
        id: 'ronda-a-detalle',
        titulo: 'Detalle de la ronda',
        descripcion: 'Antes de surtir: qué pedido va en cada contenedor, de qué cliente, piezas y códigos.',
        ruta: '/ronda/detalle',
        reglas: [
          'Los pedidos A y B son del mismo cliente: llevan la etiqueta "Mismo cliente".',
          'Caso que lo motiva: una venta por medida (cable, manguera) dividida en dos pedidos, p. ej. 20 m + 1 m.',
          '"Iniciar surtido" abre la lista de la ronda.',
        ],
      },
      {
        id: 'ronda-a-producto',
        titulo: 'Detalle de producto en la ronda',
        descripcion: '2546000: el pedido A ya tiene sus 2 piezas y el C sigue en 0. Se abre al tocar una card de la lista.',
        ruta: '/ronda/producto/2546000',
        reglas: [
          '"Solicitado ronda" suma lo que piden todos los pedidos (A + C = 3).',
          'En "Surtido por pedido" se edita la cantidad de cada pedido.',
          '"Negar producto" solo ofrece pedidos con el producto en 0 (aquí, C) y pide un solo motivo para todos.',
        ],
      },
      {
        id: 'ronda-a-en-curso',
        titulo: 'Ronda en curso',
        descripcion: 'Pedido A completo, B a la mitad y C sin empezar.',
        ruta: '/ronda',
        reglas: ['Menú ⋮ › Finalizar ronda muestra los faltantes por pedido; es informativo y se puede finalizar.'],
      },
    ],
  },
  {
    titulo: 'Multipedido · B — Batch pick a contenedores',
    oculto: true,
    escenarios: [
      {
        id: 'ronda-b',
        titulo: 'Asignación — Surtir ronda',
        descripcion: 'Mismo inicio que A, pero el surtido va parada por parada (una ubicación a la vez).',
        ruta: '/tareas',
        reglas: [
          'Se escanea en el anaquel y se deposita en el contenedor que indica la parada.',
          'Solo se acepta el código de la parada actual.',
          'Al completar la parada pasa sola a la siguiente incompleta.',
        ],
      },
      {
        id: 'ronda-b-en-curso',
        titulo: 'Ronda en curso',
        descripcion: 'Pedido A completo, B a la mitad: abre en la primera parada incompleta.',
        ruta: '/ronda',
        reglas: [],
      },
    ],
  },
  {
    titulo: 'Multipedido · C — Separación en la revisión',
    oculto: true,
    escenarios: [
      {
        id: 'ronda-c',
        titulo: 'Asignación — Surtir ronda',
        descripcion: 'El surtido solo recolecta las piezas totales; no separa por contenedor.',
        ruta: '/tareas',
        reglas: [
          'Al finalizar, la siguiente tarea es "REVISAR Y SEPARAR RONDA" y sí se puede aceptar.',
          'En la revisión cada escaneo reparte la pieza en su contenedor; no se separa más de lo recolectado.',
        ],
      },
      {
        id: 'ronda-c-revision',
        titulo: 'Asignación — Revisar y separar',
        descripcion: 'Recolección terminada con faltante: 0245134 4 de 6. El faltante cae en el pedido C (el más reciente).',
        ruta: '/tareas',
        reglas: ['Al terminar, la siguiente tarea es "FACTURAR Y EMBARCAR PEDIDO" (bloqueada).'],
      },
    ],
  },
  {
    titulo: 'Un pedido por ronda — Tareas',
    oculto: true,
    escenarios: [
      {
        id: 'tareas-surtido',
        titulo: 'Asignación — Surtir pedido',
        descripcion: 'Empleado con tarea "SURTIR PEDIDO CLIENTE" asignada (86:37). Al aceptar entra a Surtido de órdenes.',
        ruta: '/tareas',
        reglas: ['El "Cancelar" regresa al menú sin cambios.'],
      },
      {
        id: 'tareas-revision',
        titulo: 'Asignación — Siguiente tarea (Revisión)',
        descripcion: 'Al finalizar el surtido aparece la tarea "REVISAR PEDIDO CLIENTE" (197:20499) como siguiente paso.',
        ruta: '/tareas',
        reglas: ['Fuera del alcance de esta rama: "Aceptar" está deshabilitado.'],
      },
    ],
  },
  {
    titulo: 'Un pedido por ronda — Surtido',
    oculto: true,
    escenarios: [
      {
        id: 'inicial',
        titulo: 'Surtido de órdenes — inicio',
        descripcion: 'Pedido sin surtir. Copia una etiqueta del panel izquierdo y pégala en el campo de escaneo.',
        ruta: '/surtido',
        reglas: [
          'Etiqueta de 18 dígitos: surte la cantidad de los dígitos 8 al 13.',
          'Código de 7 dígitos: pide la cantidad en un modal (no permite 0, más de lo solicitado ni más de la existencia).',
          'Con todo surtido o negado, a los 600 ms aparece "Finalizar surtido".',
          'Al finalizar regresa a Asignación de tareas con la tarea de revisión (sin poder aceptarla).',
        ],
      },
      {
        id: 'parcial-2546000',
        titulo: 'Códigos parciales',
        descripcion: '2546000 surtido 3 de 5. Menú ⋮ › Finalizar surtido muestra el modal informativo de parciales (182:9894).',
        ruta: '/surtido',
        reglas: ['El modal es informativo: con ✓ se finaliza aunque haya parciales.'],
      },
      {
        id: 'sin-surtir-2546000',
        titulo: 'Códigos sin surtir',
        descripcion: '2546000 en 0. Menú ⋮ › Finalizar surtido muestra "No es posible finalizar surtido" (190:10418).',
        ruta: '/surtido',
        reglas: [
          'Hay que negarlo desde el Detalle del producto: "Negar producto" › motivo › ✓.',
          'Si la cantidad surtida es mayor a 0, no se puede negar (aviso amarillo).',
          'La cantidad del Detalle solo se edita si el producto ya se escaneó.',
        ],
      },
      {
        id: 'completo-con-negado',
        titulo: 'Finalización automática',
        descripcion: '1394000 completo y 2546000 negado: aparece "Finalizar surtido" sin pasar por el menú (197:22893).',
        ruta: '/surtido',
        reglas: ['Escanear un producto negado muestra el aviso "Producto negado".'],
      },
    ],
  },
];

function currentQuery() {
  if (typeof window === 'undefined') return { escenario: '' };
  return { escenario: new URLSearchParams(window.location.search).get('escenario') ?? '' };
}

function urlFor(e: Escenario) {
  const q = new URLSearchParams({ escenario: e.id });
  // Reload total: la semilla del store se lee en main.tsx; sin reload no se aplica el nuevo escenario.
  // BASE_URL es "/" en dev y "/Solicitud-anticipada-uber/" en GitHub Pages (vite base).
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${e.ruta}?${q.toString()}`;
}

export function EscenariosPanel() {
  const q = currentQuery();
  const panelRef = useRef<HTMLElement>(null);

  // Restaurar scroll al montar (después del reload).
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    try {
      const saved = sessionStorage.getItem(SCROLL_KEY);
      if (saved) el.scrollTop = parseInt(saved, 10);
    } catch {
      /* sessionStorage no disponible */
    }
  }, []);

  // Guardar posición del scroll cada vez que el usuario hace click en un escenario, justo antes del reload.
  const guardarScroll = () => {
    const el = panelRef.current;
    if (!el) return;
    try {
      sessionStorage.setItem(SCROLL_KEY, String(el.scrollTop));
    } catch {
      /* sessionStorage no disponible */
    }
  };

  return (
    <aside ref={panelRef} className={styles.panel} aria-label="Escenarios del flujo">
      <header className={styles.header}>
        <span className={styles.badge}>Flujo</span>
        <h2 className={styles.title}>Escenarios</h2>
        <p className={styles.subtitle}>
          Surtido multipedido. Selecciona un escenario para saltar a esa pantalla con el estado ya sembrado.
        </p>
      </header>
      <div className={styles.grupos}>
        {GRUPOS.filter((g) => !g.oculto).map((g) => (
          <section key={g.titulo} className={styles.grupo}>
            <h3 className={styles.grupoTitulo}>{g.titulo}</h3>
            <ol className={styles.list}>
              {g.escenarios.map((e, i) => {
                const activo = q.escenario === e.id;
                return (
                  <li key={e.id}>
                    <a href={urlFor(e)} onClick={guardarScroll} className={`${styles.item} ${activo ? styles.itemActivo : ''}`}>
                      <span className={styles.itemStep}>{i + 1}</span>
                      <span className={styles.itemBody}>
                        <span className={styles.itemTitulo}>{e.titulo}</span>
                        <span className={styles.itemDescripcion}>{e.descripcion}</span>
                        {e.reglas.length > 0 && (
                          <ul className={styles.reglas}>
                            {e.reglas.map((r) => (
                              <li key={r}>{r}</li>
                            ))}
                          </ul>
                        )}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </aside>
  );
}
