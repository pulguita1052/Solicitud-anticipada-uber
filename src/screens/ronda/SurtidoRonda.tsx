/**
 * Surtido multipedido — ronda de hasta 3 pedidos (A, B, C). Sin respaldo en Figma: la página
 * 📲 Surtido - Multi. pedido x ronda (2888:9537) está vacía y el flujo se diseña primero en código (D48).
 *
 * Propuestas (se eligen desde el panel de escenarios; docs/figma/flujos-surtido.md, sección "Multipedido"):
 *   A · Lista consolidada por ubicación + separación en la mesa: cada escaneo dice en qué contenedor va la pieza.
 *       Interfaz principal y vista filtrada por pedido: mockups 15:1437 / 15:1661 (Handheld for Claude).
 *       Es la propuesta elegida (2026-10-15); B y C quedan ocultas en el panel de escenarios.
 *   B · Batch pick a contenedores: una parada (ubicación) a la vez; se escanea en el anaquel y se deposita en el contenedor.
 *   C · Separación en la revisión: el surtido solo recolecta; la tarea REVISAR Y SEPARAR RONDA reparte en contenedores.
 * Reglas comunes: reparto del pedido más antiguo al más reciente, aviso por pedido completo, cierre con faltantes informativo.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppHeader } from '@ds/components/organisms/AppHeader/AppHeader';
import { ContentPanel } from '@ds/components/organisms/ContentPanel/ContentPanel';
import { BottomBar } from '@ds/components/organisms/BottomBar/BottomBar';
import { ScanInput, type ScanInputHandle } from '@ds/components/molecules/ScanInput/ScanInput';
import { OrderProgress } from '@ds/components/molecules/OrderProgress/OrderProgress';
import { Divider } from '@ds/components/atoms/Divider/Divider';
import { leerCodigo } from '../../domain/codigos';
import { decir, sonar } from '../../domain/sonidos';
import {
  avancePedidos,
  conteosRonda,
  type Asignacion,
  consolidado,
  faltantes,
  faltantesRecoleccion,
  productoRonda,
  repartir,
  rondaCompleta,
  separaAlEscanear,
} from '../../domain/ronda';
import { useStore } from '../../store/AppStore';
import { CantidadModal, MenuModal } from '../surtido/overlays/SurtidoModals';
import { ColocarModal, FaltantesModal, FinalizarRondaModal, type GrupoFaltante } from './RondaModals';
import { ContenedoresResumen, LineaRonda, Parada } from './RondaPartes';
import { TOAST_CANTIDAD } from '../surtido/avisosCantidad';
import styles from './SurtidoRonda.module.css';

type Overlay =
  | { k: 'cantidad'; codigo: string; inicial?: string }
  /** Código de 7 dígitos: dónde colocar la cantidad capturada, repartida por prioridad (D52). */
  | { k: 'colocar'; codigo: string; cantidad: number; asignaciones: Asignacion[] }
  | { k: 'menu' }
  | { k: 'finalizar' }
  | { k: 'faltantes' };

const TOAST = {
  codigoInvalido: { kind: 'error' as const, title: 'Código inválido', message: 'El código de barras capturado no es válido.' },
  incorrecto: { kind: 'error' as const, title: 'Producto incorrecto', message: 'El producto escaneado no pertenece a esta ronda.' },
};

export function SurtidoRonda() {
  const navigate = useNavigate();
  const { ronda, rondaDispatch, setEtapa, mostrarToast } = useStore();
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const [autoDescartado, setAutoDescartado] = useState(false);
  /** Vista filtrada por pedido (15:1661): undefined = lista consolidada de la ronda. */
  // Se guarda en la URL (?pedido=) para que al regresar del Detalle de producto la lista siga filtrada
  const [params, setParams] = useSearchParams();
  const filtro = params.get('pedido') ?? undefined;
  const setFiltro = (pedido: string | undefined) =>
    setParams(
      (prev) => {
        const q = new URLSearchParams(prev);
        if (pedido) q.set('pedido', pedido);
        else q.delete('pedido');
        return q;
      },
      { replace: true },
    );
  /** "Avance de la ronda" oculto desde el menú ⋮ (?avance=oculto, también se conserva al volver del Detalle). */
  const avanceOculto = params.get('avance') === 'oculto';
  const alternarAvance = () =>
    setParams(
      (prev) => {
        const q = new URLSearchParams(prev);
        if (avanceOculto) q.delete('avance');
        else q.set('avance', 'oculto');
        return q;
      },
      { replace: true },
    );
  const scanRef = useRef<ScanInputHandle>(null);

  const separando = separaAlEscanear(ronda);
  const lineas = useMemo(() => consolidado(ronda), [ronda]);
  const visibles = filtro ? lineas.filter((l) => l.porPedido.some((x) => x.pedido === filtro)) : lineas;
  const c = conteosRonda(ronda);
  const avances = useMemo(() => avancePedidos(ronda), [ronda]);
  const esB = ronda.propuesta === 'B';
  const recolectandoC = ronda.propuesta === 'C' && ronda.fase === 'surtido';

  // Propuesta B: parada actual (empieza en la primera incompleta)
  const [parada, setParada] = useState(() => Math.max(0, lineas.findIndex((l) => l.avance < l.total)));
  const lineaParada = lineas[parada];

  const cerrar = () => {
    setOverlay(null);
    window.setTimeout(() => scanRef.current?.focus(), 0);
  };

  // ---- Escaneo
  /**
   * ¿Se puede registrar esta cantidad? Cantidad cero, mayor a lo que falta por surtir del código (o a lo recolectado en
   * la revisión de C) o mayor a la existencia → toast "Cantidad inválida" y no se registra nada.
   */
  const validar = (codigo: string, cantidad: number) => {
    const linea = lineas.find((l) => l.codigo === codigo)!;
    if (esB && codigo !== lineaParada.codigo) {
      return { kind: 'error' as const, title: 'Producto de otra parada', message: `Escanea el código ${lineaParada.codigo} de la parada actual.` };
    }
    if (linea.avance >= linea.total) {
      return {
        kind: 'error' as const,
        title: 'Código completo',
        message: recolectandoC ? 'Ya recolectaste todas las piezas de este código.' : 'Ya se separaron todas las piezas de este código.',
      };
    }
    if (cantidad <= 0) return TOAST_CANTIDAD.cero;
    if (cantidad > linea.total - linea.avance) return TOAST_CANTIDAD.mayorSolicitada;
    const yaSurtido = recolectandoC ? linea.avance : linea.porPedido.reduce((n, x) => n + x.separado, 0);
    if (yaSurtido + cantidad > productoRonda(codigo)!.existencia) return TOAST_CANTIDAD.mayorExistencia;
    // Revisión de C: no se separa más de lo que se recolectó
    if (!recolectandoC && repartir(ronda, codigo, cantidad).sobrante > 0) return TOAST_CANTIDAD.mayorSolicitada;
    return null;
  };

  /**
   * Registra piezas de un código. Etiqueta de 18 dígitos: se separan de inmediato. Código de 7 dígitos (`confirmar`):
   * primero el modal "Coloca la mercancía en los contenedores" (D52). Devuelve false si la cantidad no es válida.
   */
  const registrar = (codigo: string, cantidad: number, confirmar = false) => {
    const error = validar(codigo, cantidad);
    if (error) {
      sonar('error');
      mostrarToast(error);
      return false;
    }
    sonar('ok');
    if (recolectandoC) {
      rondaDispatch({ type: 'recolectar', codigo, cantidad });
      return true;
    }
    const { asignaciones } = repartir(ronda, codigo, cantidad);
    if (confirmar && !esB) setOverlay({ k: 'colocar', codigo, cantidad, asignaciones });
    else aplicar(codigo, asignaciones);
    return true;
  };

  /** Separa las piezas; si con ellas se completa un pedido, lo avisa. */
  const aplicar = (codigo: string, asignaciones: Asignacion[]) => {
    const antes = avancePedidos(ronda);
    rondaDispatch({ type: 'separar', codigo, asignaciones });
    const listo = antes.find((a) => {
      if (a.completo) return false;
      const extra = asignaciones.find((x) => x.pedido === a.pedido.id)?.cantidad ?? 0;
      return a.separado + extra >= a.solicitado;
    });
    if (listo) {
      mostrarToast({ kind: 'success', title: `Pedido ${listo.pedido.id} completo`, message: `El contenedor ${listo.pedido.contenedor} está listo.` });
    }
  };

  const onScan = (valor: string) => {
    const l = leerCodigo(valor);
    if (l.tipo === 'invalido') {
      sonar('error');
      return mostrarToast(TOAST.codigoInvalido);
    }
    if (!lineas.some((x) => x.codigo === l.codigo)) {
      sonar('error');
      return mostrarToast(TOAST.incorrecto);
    }
    if (l.tipo === 'codigo') return setOverlay({ k: 'cantidad', codigo: l.codigo });
    registrar(l.codigo, l.cantidad);
  };

  // Propuesta B: al completar la parada, pasa sola a la siguiente incompleta
  useEffect(() => {
    if (!esB || !lineaParada || lineaParada.avance < lineaParada.total) return;
    const siguiente = lineas.findIndex((l) => l.avance < l.total);
    if (siguiente < 0) return;
    const t = window.setTimeout(() => setParada(siguiente), 800);
    return () => window.clearTimeout(t);
  }, [esB, lineaParada, lineas]);

  // ---- Finalización
  const terminar = () => {
    if (recolectandoC) {
      rondaDispatch({ type: 'terminarRecoleccion' });
      setEtapa('ronda-revision');
      mostrarToast({ kind: 'success', title: 'Surtido finalizado', message: 'Las piezas de la ronda están listas para revisar y separar.' });
    } else {
      rondaDispatch({ type: 'finalizar' });
      setEtapa('ronda-fin');
      mostrarToast({
        kind: 'success',
        title: 'Ronda finalizada',
        message: ronda.propuesta === 'C' ? '¡Se revisaron y separaron los pedidos de la ronda!' : '¡Se completó la ronda de surtido exitosamente!',
      });
    }
    navigate('/tareas');
  };

  const finalizarManual = () => {
    const hayFaltantes = recolectandoC ? faltantesRecoleccion(ronda).length > 0 : faltantes(ronda).length > 0;
    if (hayFaltantes) setOverlay({ k: 'faltantes' });
    else terminar();
  };

  const completa = rondaCompleta(ronda);
  useEffect(() => {
    if (!completa) setAutoDescartado(false);
  }, [completa]);
  useEffect(() => {
    if (!completa || overlay || autoDescartado || ronda.fase === 'finalizada') return;
    const t = window.setTimeout(() => setOverlay({ k: 'finalizar' }), 600);
    return () => window.clearTimeout(t);
  }, [completa, overlay, autoDescartado, ronda.fase]);

  const gruposFaltantes = (): GrupoFaltante[] =>
    recolectandoC
      ? [{ titulo: 'Códigos incompletos', filas: faltantesRecoleccion(ronda).map((l) => ({ codigo: l.codigo, avance: l.avance, total: l.total })) }]
      : faltantes(ronda).map((f) => ({
          contenedor: f.pedido.contenedor,
          titulo: `Pedido ${f.pedido.id}`,
          filas: f.partidas.map((x) => ({ codigo: x.codigo, avance: x.solicitado - x.faltan, total: x.solicitado })),
        }));

  const titulo = ronda.propuesta === 'C' && ronda.fase === 'separacion' ? 'Revisión y separación' : 'Surtido de órdenes';
  const ov = overlay;
  return (
    <div className={styles.screen}>
      <AppHeader backLabel="Menú" onBack={() => navigate('/menu')} onMenu={() => setOverlay({ k: 'menu' })} />
      <ContentPanel title={titulo}>
        {/* Siempre montado: al ocultarse se desliza hacia arriba y el resto sube a ocupar su lugar */}
        <div className={`${styles.avance} ${avanceOculto ? styles.avanceOculto : ''}`} aria-hidden={avanceOculto}>
          <div className={styles.avanceRecorte}>
            <OrderProgress variante="ronda" completado={c.completado} negado={c.negado} parcial={c.parcial} pendientes={c.pendientes} />
          </div>
        </div>
        {separando ? (
          <ContenedoresResumen avances={avances} seleccionado={esB ? undefined : filtro} onSeleccionar={esB ? undefined : setFiltro} />
        ) : (
          <p className={styles.nota}>Recolecta las piezas de los 3 pedidos. La separación por contenedor se hace en la revisión.</p>
        )}
        {esB && lineaParada ? (
          <Parada
            linea={lineaParada}
            indice={parada}
            total={lineas.length}
            onAnterior={() => setParada((i) => Math.max(0, i - 1))}
            onSiguiente={() => setParada((i) => Math.min(lineas.length - 1, i + 1))}
          />
        ) : (
          <div className={styles.list}>
            {visibles.map((l, i) => (
              <div key={l.codigo} className={styles.itemContainer}>
                {i > 0 && <Divider variant="list" />}
                <LineaRonda linea={l} pedido={filtro} separando={separando} onClick={esB ? undefined : () => navigate(`/ronda/producto/${l.codigo}`)} />
              </div>
            ))}
          </div>
        )}
      </ContentPanel>
      <BottomBar>
        <ScanInput ref={scanRef} onScan={onScan} autoFocus={!ov} />
      </BottomBar>

      {ov?.k === 'cantidad' && (
        <CantidadModal
          key={`${ov.codigo}-${ov.inicial ?? ''}`}
          codigo={ov.codigo}
          titulo={separando && !esB ? 'Ingresa la cantidad surtida' : undefined}
          inicial={ov.inicial}
          onCancel={cerrar}
          onConfirm={(n) => {
            // Si la cantidad no es válida, el modal se queda abierto para corregirla
            if (!registrar(ov.codigo, n, true)) return;
            if (recolectandoC || esB) cerrar();
          }}
        />
      )}
      {ov?.k === 'colocar' && (
        <ColocarModal
          codigo={ov.codigo}
          asignaciones={ov.asignaciones}
          // ✕ vuelve a capturar la cantidad (por si se tecleó mal)
          onCancel={() => setOverlay({ k: 'cantidad', codigo: ov.codigo, inicial: String(ov.cantidad) })}
          onConfirm={() => {
            aplicar(ov.codigo, ov.asignaciones);
            cerrar();
          }}
        />
      )}
      {ov?.k === 'menu' && (
        <MenuModal
          finalizarLabel={recolectandoC ? 'Finalizar surtido' : 'Finalizar ronda'}
          extra={{
            label: avanceOculto ? 'Mostrar avance de la ronda' : 'Ocultar avance de la ronda',
            onClick: () => {
              alternarAvance();
              cerrar();
            },
          }}
          onRepetirAudio={() => {
            const sig = esB ? lineaParada : lineas.find((l) => l.avance < l.total);
            if (sig) decir(`Código ${sig.codigo.split('').join(' ')}. ${productoRonda(sig.codigo)!.ubicacion.join(', ')}`);
          }}
          onFinalizar={finalizarManual}
          onCancel={cerrar}
        />
      )}
      {ov?.k === 'finalizar' && (
        <FinalizarRondaModal
          titulo={recolectandoC ? 'Finalizar surtido' : 'Finalizar ronda'}
          texto={
            recolectandoC
              ? 'Recolectaste todas las piezas de la ronda. ¿Deseas finalizar el surtido?'
              : `${ronda.propuesta === 'C' ? 'Separaste' : 'Surtiste'} todas las piezas de los 3 pedidos. ¿Deseas finalizar la ronda?`
          }
          onCancel={() => {
            setAutoDescartado(true);
            cerrar();
          }}
          onConfirm={terminar}
        />
      )}
      {ov?.k === 'faltantes' && (
        <FaltantesModal
          titulo={recolectandoC ? 'Finalizar surtido' : 'Finalizar ronda'}
          texto={
            recolectandoC
              ? 'Hay códigos con piezas faltantes. En la revisión se asignarán primero a los pedidos más antiguos. ¿Deseas continuar?'
              : 'Hay pedidos incompletos. Las piezas se asignaron primero a los pedidos más antiguos. ¿Deseas finalizar la ronda con faltantes?'
          }
          grupos={gruposFaltantes()}
          onCancel={cerrar}
          onConfirm={terminar}
        />
      )}
    </div>
  );
}
