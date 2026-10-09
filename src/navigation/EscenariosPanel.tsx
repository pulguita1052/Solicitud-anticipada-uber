/**
 * Panel lateral (derecho) con los escenarios de verificación del flujo de surtido:
 * Tareas → Surtido. Cada tarjeta salta directamente a la pantalla
 * correspondiente con un seed de estado (query `?escenario=<id>`). Se muestra en `/tareas` y `/surtido`.
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
  ruta: '/tareas' | '/surtido';
  /** Reglas o notas clave que aplican a esta pantalla. Se muestran como bullets debajo de la descripción. */
  reglas: string[];
};

type Grupo = { titulo: string; escenarios: Escenario[] };

const GRUPOS: Grupo[] = [
  {
    titulo: 'Tareas',
    escenarios: [
      {
        id: 'tareas-surtido',
        titulo: 'Asignación — Surtido',
        descripcion: 'Empleado con tarea "SURTIDO Y REVISIÓN PEDIDO CLIENTE" asignada. Al aceptar entra al surtido pieza por pieza.',
        ruta: '/tareas',
        reglas: [
          'Solo el operador asignado puede aceptar la tarea.',
          'Al aceptar, se registra la hora de inicio.',
          'El "Cancelar" regresa al menú sin cambios.',
        ],
      },
      {
        id: 'tareas-facturacion',
        titulo: 'Asignación — Siguiente tarea (Facturación)',
        descripcion: 'Al finalizar el surtido aparece la tarea "FACTURAR Y EMBARCAR PEDIDO" (6004:1813) como siguiente paso.',
        ruta: '/tareas',
        reglas: [
          'Requiere que el pedido esté totalmente surtido y revisado.',
          'Fuera del alcance de esta rama: "Aceptar" está deshabilitado.',
        ],
      },
    ],
  },
  {
    titulo: 'Surtido',
    escenarios: [
      {
        id: 'inicial',
        titulo: 'Surtido de órdenes — inicio',
        descripcion: 'Pedido sin surtir. Escanea la etiqueta de 18 dígitos (panel izquierdo) para surtir cada partida.',
        ruta: '/surtido',
        reglas: [
          'Al completar una partida se abre la revisión.',
          'Con todo surtido y revisado, a los 3 s aparece "Finalizar surtido y revisión".',
          'Al finalizar regresa a Asignación de tareas con la tarea de facturación (sin poder aceptarla).',
        ],
      },
      {
        id: 'parcial-2546000',
        titulo: 'Partida parcial',
        descripcion: 'Producto 2546000 surtido 3 de 5 (Figma 3089:13509).',
        ruta: '/surtido',
        reglas: ['Al finalizar con parciales aparece el modal de partidas parciales.'],
      },
      {
        id: 'surtido-1394000',
        titulo: 'Partida completa y revisada',
        descripcion: 'Producto 1394000 (misceláneo) surtido y revisado 10/10.',
        ruta: '/surtido',
        reglas: [],
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
          Tareas → Surtido. Selecciona un escenario para saltar a esa pantalla con el estado ya sembrado.
        </p>
      </header>
      <div className={styles.grupos}>
        {GRUPOS.map((g) => (
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
