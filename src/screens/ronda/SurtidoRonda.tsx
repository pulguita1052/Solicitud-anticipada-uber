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
import styles from './SurtidoRonda.module.css';

type Overlay =
  | { k: 'cantidad'; codigo: string; inicial?: string }
  /** Código de 7 dígitos: dónde colocar la cantidad capturada, repartida por prioridad (D52). */
  | { k: 'colocar'; codigo: string; cantidad: number; asignaciones: Asignacion[]; sobrante: number }
  | { k: 'menu' }
  | { k: 'finalizar' }
  | { k: 'faltantes' };

const TOAST = {
  codigoInvalido: { kind: 'error' as const, title: 'Código inválido', message: 'El código de barras capturado no es válido.' },
  incorrecto: { kind: 'error' as const, title: 'Producto incorrecto', message: 'El producto escaneado no pertenece a esta ronda.' },
  cero: {
    kind: 'error' as const,
    title: 'Cantidad inválida',
    message: 'No es posible surtir un producto con cantidad cero. Por favor, ingresa una cantidad mayor.',
  },
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
   * Registra piezas de un código. Etiqueta de 18 dígitos: se separan de inmediato y un toast dice dónde van.
   * Código de 7 dígitos (`confirmar`): primero el modal "Coloca la mercancía en los contenedores".
   */
  const registrar = (codigo: string, cantidad: number, confirmar = false) => {
    const linea = lineas.find((l) => l.codigo === codigo)!;
    if (esB && codigo !== lineaParada.codigo) {
      sonar('error');
      mostrarToast({ kind: 'error', title: 'Producto de otra parada', message: `Escanea el código ${lineaParada.codigo} de la parada actual.` });
      return;
    }
    if (recolectandoC) {
      const falta = linea.total - linea.avance;
      if (falta <= 0) {
        sonar('error');
        mostrarToast({ kind: 'error', title: 'Código completo', message: 'Ya recolectaste todas las piezas de este código.' });
        return;
      }
      sonar('ok');
      rondaDispatch({ type: 'recolectar', codigo, cantidad });
      if (cantidad > falta) avisarSobrante(codigo, cantidad - falta);
      return;
    }
    const { asignaciones, sobrante } = repartir(ronda, codigo, cantidad);
    if (!asignaciones.length) {
      sonar('error');
      mostrarToast(
        linea.avance < linea.total
          ? { kind: 'error', title: 'Sin piezas recolectadas', message: 'Ya separaste todas las piezas que se recolectaron de este código.' }
          : { kind: 'error', title: 'Código completo', message: 'Ya se separaron todas las piezas de este código.' },
      );
      return;
    }
    sonar('ok');
    if (confirmar && !esB) return setOverlay({ k: 'colocar', codigo, cantidad, asignaciones, sobrante });
    aplicar(codigo, asignaciones, sobrante, !confirmar);
  };

  /** Separa las piezas y avisa: sobrante, pedido completo o (con `avisarDestino`) dónde va cada pieza. */
  const aplicar = (codigo: string, asignaciones: Asignacion[], sobrante: number, avisarDestino: boolean) => {
    const antes = avancePedidos(ronda);
    rondaDispatch({ type: 'separar', codigo, asignaciones });
    // En el flujo del código de 7 dígitos el sobrante ya se avisó en el modal
    if (sobrante > 0 && avisarDestino) return avisarSobrante(codigo, sobrante);
    // Dónde va cada pieza (los mockups no tienen aviso fijo: se usa el toast, D49)
    const destino = asignaciones.map((x) => `${x.contenedor}: ${x.cantidad} pz`).join(' · ');
    // ¿Algún pedido quedó completo con este escaneo?
    const listo = antes.find((a) => {
      if (a.completo) return false;
      const extra = asignaciones.find((x) => x.pedido === a.pedido.id)?.cantidad ?? 0;
      return a.separado + extra >= a.solicitado;
    });
    if (listo) {
      mostrarToast({
        kind: 'success',
        title: `Pedido ${listo.pedido.id} completo`,
        message: avisarDestino
          ? `Coloca ${codigo} en ${destino}. El contenedor ${listo.pedido.contenedor} está listo.`
          : `El contenedor ${listo.pedido.contenedor} está listo.`,
      });
    } else if (avisarDestino) {
      mostrarToast({ kind: 'success', title: `Coloca ${codigo}`, message: `Contenedor ${destino}` });
    }
  };

  const avisarSobrante = (codigo: string, n: number) =>
    mostrarToast({ kind: 'warning', title: 'Piezas de más', message: `Sobran ${n} pz de ${codigo}. Regrésalas al anaquel.` });

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
        <OrderProgress variante="ronda" completado={c.completado} negado={c.negado} parcial={c.parcial} pendientes={c.pendientes} />
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
            if (n <= 0) {
              sonar('error');
              return mostrarToast(TOAST.cero);
            }
            setOverlay(null);
            registrar(ov.codigo, n, true);
          }}
        />
      )}
      {ov?.k === 'colocar' && (
        <ColocarModal
          codigo={ov.codigo}
          asignaciones={ov.asignaciones}
          sobrante={ov.sobrante}
          // ✕ vuelve a capturar la cantidad (por si se tecleó mal)
          onCancel={() => setOverlay({ k: 'cantidad', codigo: ov.codigo, inicial: String(ov.cantidad) })}
          onConfirm={() => {
            aplicar(ov.codigo, ov.asignaciones, ov.sobrante, false);
            cerrar();
          }}
        />
      )}
      {ov?.k === 'menu' && (
        <MenuModal
          finalizarLabel={recolectandoC ? 'Finalizar surtido' : 'Finalizar ronda'}
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
