/**
 * Panel lateral (derecho) con los escenarios de las dos propuestas para rechazar un traspaso:
 * Tareas → Surtido → Rechazo. Cada tarjeta salta directamente a la pantalla correspondiente con un seed de estado
 * (query `?escenario=<id>`), que también fija la propuesta. Se muestra en `/menu`, `/tareas` y `/surtido`.
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
    titulo: 'Propuesta #1 — Rechazar solo sin piezas surtidas',
    escenarios: [
      {
        id: 'p1-tareas',
        titulo: 'Asignación — Surtir traspaso',
        descripcion: 'Tarea "SURTIR TRASPASO" del pedido 123456 (7020:21323). Al aceptar entra a Surtido de órdenes.',
        ruta: '/tareas',
        reglas: ['El "Cancelar" regresa al menú sin cambios.'],
      },
      {
        id: 'p1-inicio',
        titulo: 'Surtido de órdenes — todo en 0',
        descripcion: 'Traspaso de 4 productos sin surtir (7020:22451). Menú ⋮ ofrece "Rechazar traspaso" (7020:25441).',
        ruta: '/surtido',
        reglas: [
          'Con todos los productos en 0, "Rechazar traspaso" (azul) y "Finalizar surtido" (rojo) están activos.',
          'Rechazar traspaso › ✓ › motivo › ✓ regresa a Asignación de tareas con el toast "Traspaso rechazado".',
          'El ✓ del motivo se habilita al elegir una opción. Cualquier ✕ regresa al surtido.',
        ],
      },
      {
        id: 'p1-con-surtido',
        titulo: 'Surtido de órdenes — con piezas surtidas',
        descripcion: '0486600 surtido 4 de 11. En el menú ⋮ "Rechazar traspaso" está deshabilitado y "Finalizar surtido" activo.',
        ruta: '/surtido',
        reglas: ['Si en el Detalle se regresa la cantidad a 0, se vuelve a habilitar "Rechazar traspaso".'],
      },
      {
        id: 'p1-rechazado',
        titulo: 'Asignación — Traspaso rechazado',
        descripcion: 'Después de rechazar (7114:10987 + toast 7114:11110) se muestra otra tarea de demo.',
        ruta: '/tareas',
        reglas: ['La nueva tarea no se puede tomar: "Aceptar" está deshabilitado.'],
      },
    ],
  },
  {
    titulo: 'Propuesta #2 — Rechazar siempre',
    escenarios: [
      {
        id: 'p2-tareas',
        titulo: 'Asignación — Surtir traspaso',
        descripcion: 'Tarea "SURTIR TRASPASO" del pedido 123456 (7053:26774). Al aceptar entra a Surtido de órdenes.',
        ruta: '/tareas',
        reglas: ['El "Cancelar" regresa al menú sin cambios.'],
      },
      {
        id: 'p2-inicio',
        titulo: 'Surtido de órdenes — todo en 0',
        descripcion: 'Traspaso de 2 productos sin surtir (7053:26345). Menú ⋮ con "Rechazar traspaso" y "Finalizar surtido" activos.',
        ruta: '/surtido',
        reglas: ['La confirmación siempre avisa: "Las piezas surtidas se marcarán como rechazadas."'],
      },
      {
        id: 'p2-parcial',
        titulo: 'Surtido de órdenes — surtido parcial',
        descripcion: '0486600 surtido 1 de 2 (7053:27466). Se puede rechazar o finalizar sin importar lo surtido o negado.',
        ruta: '/surtido',
        reglas: ['Rechazar traspaso › ✓ › motivo › ✓ regresa a Asignación de tareas con el toast "Traspaso rechazado".'],
      },
      {
        id: 'p2-rechazado',
        titulo: 'Asignación — Traspaso rechazado',
        descripcion: 'Después de rechazar se muestra otra tarea de demo con el toast "Traspaso rechazado".',
        ruta: '/tareas',
        reglas: ['La nueva tarea no se puede tomar: "Aceptar" está deshabilitado.'],
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
          Rechazar traspaso: dos propuestas. Selecciona un escenario para saltar a esa pantalla con el estado y la
          propuesta ya sembrados.
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
