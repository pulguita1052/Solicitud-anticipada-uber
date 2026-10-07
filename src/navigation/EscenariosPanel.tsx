/**
 * Panel lateral (derecho) con los escenarios de verificación del flujo completo:
 * Tareas → Surtido → Datos del traspaso → Embarque → Uber (flujo de pedido: Facturación). Cada tarjeta salta directamente a la pantalla
 * correspondiente con un seed de estado (query `?escenario=<id>`) y opcionalmente un `?paso=` o
 * `?overlay=` para preabrir un sub-estado. Se muestra en `/tareas`, `/surtido`, `/facturacion` y `/uber`.
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
  ruta: '/tareas' | '/surtido' | '/facturacion' | '/traspaso' | '/uber';
  paso?: string;
  overlay?: string;
  generar?: 'error';
  /** Fuerza el flujo donde el cliente no tiene embarques activos previos (?sinActivos=1). */
  sinActivos?: boolean;
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
        descripcion: 'Empleado con tarea "SURTIDO Y REVISIÓN TRASPASO" asignada. Al aceptar entra al surtido pieza por pieza.',
        ruta: '/tareas',
        reglas: [
          'Solo el operador asignado puede aceptar la tarea.',
          'Al aceptar, se registra la hora de inicio.',
          'El "Cancelar" regresa al menú sin cambios.',
        ],
      },
      {
        id: 'tareas-traspaso',
        titulo: 'Asignación — Embarque de traspaso',
        descripcion: 'Tarea "EMBARCAR TRASPASO" (antes "FACTURAR Y EMBARCAR PEDIDO"). Al aceptar entra a la pantalla de datos del traspaso.',
        ruta: '/tareas',
        reglas: [
          'Requiere que el traspaso esté totalmente surtido y revisado.',
          'Aceptar navega a /traspaso.',
        ],
      },
    ],
  },
  {
    titulo: 'Traspaso (sin factura)',
    escenarios: [
      {
        id: 'traspaso',
        titulo: 'Datos del traspaso',
        descripcion: 'Empleado, traspaso, sucursal destino y dirección de la sucursal destino (solo lectura), más el resumen del contenido. Sin impresión ni factura.',
        ruta: '/traspaso',
        reglas: [
          'Un traspaso es solo un movimiento de inventario entre sucursales: no genera factura.',
          'Botones: "Cancelar" (regresa a tareas) y "Continuar a embarque".',
          'Con embarques activos hacia la misma sucursal aparece "Agregar embarque"; si no, va directo a "Nuevo embarque".',
        ],
      },
      {
        id: 'traspaso-embarcado',
        titulo: 'Traspaso embarcado → Uber',
        descripcion: 'Traspaso ya con embarque. Se valida si es candidato y se ofrece Uber sobre la misma pantalla.',
        ruta: '/traspaso',
        reglas: [
          'Mismas reglas de candidatura de ERB-53024; el monto es el valor de la mercancía del traspaso.',
          '"Ahora no" deja la pantalla con el No. de embarque y "Regresar a tareas".',
        ],
      },
      {
        id: 'traspaso-uber-formulario',
        titulo: 'Formulario Uber (traspaso)',
        descripcion: 'Formulario de solicitud con la dirección de la sucursal destino (solo lectura).',
        ruta: '/uber',
        paso: 'formulario',
        reglas: ['Sin historial de contacto: campos vacíos.'],
      },
      {
        id: 'traspaso-uber-confirmada',
        titulo: 'Solicitud creada (traspaso)',
        descripcion: 'Confirmación con No. de solicitud, No. de traspaso, embarque y vehículo (sin factura).',
        ruta: '/uber',
        paso: 'confirmada',
        reglas: ['Regresar a tareas cierra el flujo.'],
      },
    ],
  },
  {
    titulo: 'Facturación',
    escenarios: [
      {
        id: 'facturacion',
        titulo: 'Datos de la factura',
        descripcion: 'Formulario inicial con datos precargados: empleado, pedido, forma de pago, cliente, direcciones y copias de impresión.',
        ruta: '/facturacion',
        reglas: [
          'Empleado, pedido y cliente vienen de EPICO — solo lectura.',
          'Dirección de entrega es seleccionable de un dropdown.',
          'Copias entre 1 y 9.',
          '"Generar factura" muestra spinner ~2.5 s y crea el folio.',
        ],
      },
      {
        id: 'factura-facturada',
        titulo: 'Factura generada',
        descripcion: 'Factura ya timbrada — aparece el folio y los botones "Reimprimir factura" / "Continuar a embarque".',
        ruta: '/facturacion',
        reglas: [
          'Folio recibido de EPICO (mock 1099204).',
          'Al continuar a embarque, si hay embarques activos aparece "Agregar embarque" (elegir nuevo o existente); si no, va directo a "Nuevo embarque".',
          'Reimprimir muestra toast de "Imprimiendo factura".',
        ],
      },
      {
        id: 'factura-embarcada',
        titulo: 'Factura + embarque final',
        descripcion: 'Pantalla final tras crear el embarque y cerrar (o rechazar) Uber. Muestra folio y No. de embarque; botones "Regresar a tareas" / "Reimprimir factura".',
        ruta: '/facturacion',
        reglas: [
          'Regresar a tareas cambia la etapa a surtido y va a /tareas.',
          'Reimprimir no reabre el flujo — solo dispara el toast.',
          'Este es el punto final normal del flujo de facturación.',
        ],
      },
      {
        id: 'factura-error',
        titulo: 'Error al generar',
        descripcion: 'Fuerza el fallo del timbrado (usa ?generar=error). El toast rojo indica revisar Wi-Fi de la sucursal.',
        ruta: '/facturacion',
        generar: 'error',
        reglas: [
          'La barra de progreso se completa pero termina en estado error.',
          'El formulario queda intacto para reintentar.',
        ],
      },
    ],
  },
  {
    titulo: 'Embarque',
    escenarios: [
      {
        id: 'embarque-sin-activos',
        titulo: 'Sin embarque previo',
        descripcion: 'El cliente no tiene embarques activos. Al dar "Continuar a embarque" se abre directamente el modal "Nuevo embarque" (No existe un embarque activo para este cliente).',
        ruta: '/facturacion',
        overlay: 'nuevoEmbarque',
        sinActivos: true,
        reglas: [
          'Se dispara cuando `EMBARQUES_ACTIVOS` está vacío (o con ?sinActivos=1).',
          'X cierra el modal sin crear nada — regresa a la factura.',
          '✓ crea el embarque (mock 147707) y abre "Embarque creado".',
        ],
      },
      {
        id: 'embarque-con-activos',
        titulo: 'Con embarque activo',
        descripcion: 'El cliente ya tiene N embarques activos. Al dar "Continuar a embarque" aparece el modal "Agregar embarque" para elegir entre sumar la factura a uno existente o crear uno nuevo.',
        ruta: '/facturacion',
        overlay: 'agregarEleccion',
        reglas: [
          'Se dispara cuando `EMBARQUES_ACTIVOS` tiene entradas (por default 2 en el mock).',
          '"Agregar existente" abre un selector con los embarques activos.',
          '"Nuevo embarque" salta directo a "Embarque creado" (ya está informado de los activos).',
        ],
      },
      {
        id: 'embarque-creado',
        titulo: 'Embarque creado',
        descripcion: 'Modal de confirmación con el No. de embarque generado. Al aceptar dispara el ofrecimiento de Uber sobre la misma pantalla.',
        ruta: '/facturacion',
        overlay: 'embarqueCreado',
        reglas: [
          'El No. de embarque queda guardado en el store (factura.embarque).',
          'Al aceptar aparece el modal de Uber si el pedido es candidato.',
          'Si el usuario rechaza Uber, la factura queda visible con folio + embarque.',
        ],
      },
    ],
  },
  {
    titulo: 'Uber (ERB-53024)',
    escenarios: [
      {
        id: 'uber-embarcado',
        titulo: 'Ofrecimiento (modal)',
        descripcion: 'Modal inferior "Este embarque es candidato para envío por Uber" sobre Datos de la factura. Muestra solo total, cantidad de artículos y distancia.',
        ruta: '/facturacion',
        reglas: [
          'Sucursal habilitada + distancia ≤ 24 km.',
          'Monto ≥ $300 y ≤ $15,000 (crédito) o ≤ $1,700 (Uber Cash). Si se niegan productos y el monto cae bajo $300 no se muestra el ofrecimiento.',
          'Embarque en Monitor 1: estado "Creado — sin documentar, sin paquetería asignada". Si el embarque ya se documentó o se le asignó paquetería, deja de ser candidato.',
          '"Ahora no" cierra el modal; el operador ve la factura con folio + embarque y puede reimprimir o regresar a tareas.',
          '"Generar solicitud" navega al formulario.',
        ],
      },
      {
        id: 'uber-formulario-vacio',
        titulo: 'Formulario vacío',
        descripcion: 'Formulario "Solicitud de Uber - Embarque N" para un cliente sin historial: todos los campos vacíos.',
        ruta: '/uber',
        paso: 'formulario',
        reglas: [
          'Dirección de entrega solo lectura.',
          'Nombre, teléfono, referencias, dpto y descripción obligatorios.',
          'Selector de vehículo: Moto (paquetes pequeños) / Coche (paquetes grandes/pesados).',
        ],
      },
      {
        id: 'uber-formulario-lleno',
        titulo: 'Formulario precargado',
        descripcion: 'Formulario con nombre, teléfono, referencias y dpto/oficina precargados desde el historial. La descripción siempre inicia vacía.',
        ruta: '/uber',
        paso: 'formulario',
        reglas: [
          'Precarga: nombre, teléfono, referencias, dpto/oficina, tipo de vehículo.',
          'Descripción del paquete la debe capturar el operador.',
        ],
      },
      {
        id: 'uber-confirmada',
        titulo: 'Solicitud creada',
        descripcion: 'Pantalla final tras enviar la solicitud. Muestra No. de solicitud, No. de pedido, embarque, factura y vehículo.',
        ruta: '/uber',
        paso: 'confirmada',
        reglas: [
          'No. de solicitud generado localmente (mock 5 dígitos).',
          'No. de pedido = PEDIDO_ID (123456).',
          '"Regresar a tareas" cierra el flujo y vuelve a /tareas.',
        ],
      },
    ],
  },
];

function currentQuery() {
  if (typeof window === 'undefined') return { escenario: '', paso: '', overlay: '', generar: '', sinActivos: '' };
  const p = new URLSearchParams(window.location.search);
  return {
    escenario: p.get('escenario') ?? '',
    paso: p.get('paso') ?? '',
    overlay: p.get('overlay') ?? '',
    generar: p.get('generar') ?? '',
    sinActivos: p.get('sinActivos') ?? '',
  };
}

function urlFor(e: Escenario) {
  const q = new URLSearchParams({ escenario: e.id });
  if (e.paso) q.set('paso', e.paso);
  if (e.overlay) q.set('overlay', e.overlay);
  if (e.generar) q.set('generar', e.generar);
  if (e.sinActivos) q.set('sinActivos', '1');
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
          Surtido → Datos del traspaso → Embarque → Uber (flujo de pedido: Facturación). Selecciona un escenario para saltar a esa pantalla con el estado ya sembrado.
        </p>
      </header>
      <div className={styles.grupos}>
        {GRUPOS.map((g) => (
          <section key={g.titulo} className={styles.grupo}>
            <h3 className={styles.grupoTitulo}>{g.titulo}</h3>
            <ol className={styles.list}>
              {g.escenarios.map((e, i) => {
                const activo =
                  q.escenario === e.id &&
                  (e.paso ? q.paso === e.paso : true) &&
                  (e.overlay ? q.overlay === e.overlay : true) &&
                  (e.generar ? q.generar === e.generar : true) &&
                  (e.sinActivos ? q.sinActivos === '1' : q.sinActivos !== '1');
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
