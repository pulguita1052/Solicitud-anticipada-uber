/**
 * Figma: Surtido de órdenes ("Interfaz principal - NO INICIADO")
 * nodeId: 3048:10138 — estados y overlays en las secciones 3048:10013, 3236:4916, 3089:13312, 3168:15884, 3126:12245, 4582:20083
 * URL: https://www.figma.com/design/zZBoCtJor0tdJ91umiqb7l/?node-id=3048-10138
 * Última sincronización: 2026-09-29
 */
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@ds/components/organisms/AppHeader/AppHeader';
import { ContentPanel } from '@ds/components/organisms/ContentPanel/ContentPanel';
import { BottomBar } from '@ds/components/organisms/BottomBar/BottomBar';
import { OrderProgress } from '@ds/components/molecules/OrderProgress/OrderProgress';
import { OrderItemRow } from '@ds/components/molecules/OrderItemRow/OrderItemRow';
import { ScanInput, type ScanInputHandle } from '@ds/components/molecules/ScanInput/ScanInput';
import { Divider } from '@ds/components/atoms/Divider/Divider';
import { leerCodigo } from '../../domain/codigos';
import { conteos, listoParaFinalizar, pendientesDeRevision, producto, promocionIncompleta, statusDe, tipoRevision } from '../../domain/pedido';
import { decir, sonar } from '../../domain/sonidos';
import { PROMOCIONES } from '../../mocks/pedido';
import { useStore } from '../../store/AppStore';
import { RevisionModal } from './overlays/RevisionModal';
import { CantidadModal, FinalizarModal, MenuModal, ParcialesModal, PromoEscaneoModal, PromoNegadaModal, PromoParcialModal, type PromoRow } from './overlays/SurtidoModals';
import { useRevision } from './useRevision';
import styles from './SurtidoOrdenes.module.css';

type Overlay =
  | { k: 'cantidad'; codigo: string }
  | { k: 'revision'; codigo: string; finalizacion: boolean }
  | { k: 'menu' }
  | { k: 'parciales' }
  | { k: 'finalizar' }
  | { k: 'promoParcial' }
  | { k: 'promoEscaneo' }
  | { k: 'promoNegada' };

export const TOAST_FINALIZADO = { kind: 'success' as const, title: 'Surtido y revisión finalizados', message: '¡Se completó la ronda de surtido exitosamente!' };
const TOAST_CODIGO_INVALIDO = { kind: 'error' as const, title: 'Código inválido', message: 'El código escaneado no no pertenece a los códigos con promoción.' };

export function SurtidoOrdenes({ overlayInicial }: { overlayInicial?: Overlay }) {
  const navigate = useNavigate();
  const { pedido, dispatch, mostrarToast, setEtapa } = useStore();
  const { escanearRevision, toastRevision } = useRevision();
  const [overlay, setOverlay] = useState<Overlay | null>(overlayInicial ?? null);
  const [autoDescartado, setAutoDescartado] = useState(false);
  const scanRef = useRef<ScanInputHandle>(null);
  const c = conteos(pedido);

  const cerrar = () => {
    setOverlay(null);
    window.setTimeout(() => scanRef.current?.focus(), 0);
  };

  /** Tras completar el surtido de una partida: 400 ms y abre la revisión (3056:11810 → 3058:12380). */
  const revisarSiCompleta = (codigo: string, surtidoNuevo: number) => {
    const p = producto(codigo)!;
    const item = pedido.items.find((i) => i.codigo === codigo)!;
    if (pedido.banderaRevision && surtidoNuevo >= p.solicitado && !item.revisionCompleta) {
      window.setTimeout(() => setOverlay({ k: 'revision', codigo, finalizacion: false }), 400);
    }
  };

  const onScan = (valor: string) => {
    const l = leerCodigo(valor);
    if (l.tipo === 'invalido') return sonar('error');
    const item = pedido.items.find((i) => i.codigo === l.codigo);
    if (!item || item.negado) return sonar('error'); // PENDIENTE: Figma no define el aviso para un código ajeno al pedido
    const p = producto(l.codigo)!;
    if (l.tipo === 'codigo') {
      // Captura manual del código → modal de cantidad (3236:15851 → 3236:16031)
      setOverlay({ k: 'cantidad', codigo: l.codigo });
      return;
    }
    if (item.surtido >= p.solicitado) return sonar('error');
    sonar('ok');
    const nuevo = Math.min(p.solicitado, item.surtido + l.cantidad);
    dispatch({ type: 'surtir', codigo: l.codigo, cantidad: l.cantidad });
    revisarSiCompleta(l.codigo, nuevo);
  };

  // ---- Finalización
  const terminar = () => {
    const promo = promocionIncompleta(pedido);
    if (promo) return setOverlay({ k: 'promoParcial' });
    dispatch({ type: 'finalizar' });
    setEtapa('traspaso');
    navigate('/tareas');
    mostrarToast(TOAST_FINALIZADO);
  };

  const siguienteRevision = (excluir?: string) => {
    const pendientes = pendientesDeRevision(pedido).filter((i) => i.codigo !== excluir);
    if (pendientes.length) setOverlay({ k: 'revision', codigo: pendientes[0].codigo, finalizacion: true });
    else terminar();
  };

  const iniciarFinalizacion = () => {
    if (pedido.items.some((i) => statusDe(i) === 'parcial')) setOverlay({ k: 'parciales' });
    else siguienteRevision();
  };

  // Finalización automática: todo surtido y revisado → 3000 ms → "Finalizar surtido y revisión" (4582:20084 → 4582:20287)
  const listo = listoParaFinalizar(pedido);
  useEffect(() => {
    if (!listo || overlay || autoDescartado || pedido.finalizado) return;
    const t = window.setTimeout(() => setOverlay({ k: 'finalizar' }), 3000);
    return () => window.clearTimeout(t);
  }, [listo, overlay, autoDescartado, pedido.finalizado]);

  // ---- Revisión
  const revisionCompletada = (codigo: string, finalizacion: boolean) => {
    toastRevision();
    if (finalizacion) siguienteRevision(codigo);
    else cerrar();
  };

  const promoRows = (): PromoRow[] => {
    const promo = promocionIncompleta(pedido) ?? PROMOCIONES[0];
    return promo.codigos.map((cod) => {
      const it = pedido.items.find((i) => i.codigo === cod)!;
      return { codigo: cod, negado: it.negado, surtido: it.surtido, solicitado: producto(cod)!.solicitado };
    });
  };

  const ov = overlay;
  return (
    <div className={styles.screen}>
      <AppHeader backLabel="Menú" onBack={() => navigate('/menu')} onMenu={() => setOverlay({ k: 'menu' })} />
      <ContentPanel title="Surtido de órdenes">
        <OrderProgress pedido={pedido.id} completado={c.completado} negado={c.negado} parcial={c.parcial} pendientes={c.pendientes} />
        <div className={styles.list}>
          {pedido.items.map((it, idx) => {
            const p = producto(it.codigo)!;
            return (
              <div key={it.codigo} className={styles.itemContainer}>
                {idx > 0 && <Divider variant="list" />}
                <OrderItemRow
                  codigo={it.codigo}
                  status={statusDe(it)}
                  surtido={it.surtido}
                  solicitado={p.solicitado}
                  revisado={it.revisionCompleta}
                  ubicacion={p.ubicacion}
                  onClick={() => navigate(`/surtido/producto/${it.codigo}`)}
                />
              </div>
            );
          })}
        </div>
      </ContentPanel>
      <BottomBar>
        <ScanInput ref={scanRef} onScan={onScan} autoFocus={!ov} />
      </BottomBar>

      {ov?.k === 'cantidad' && (
        <CantidadModal
          codigo={ov.codigo}
          sugerida={producto(ov.codigo)!.solicitado - pedido.items.find((i) => i.codigo === ov.codigo)!.surtido}
          onCancel={cerrar}
          onConfirm={(n) => {
            const item = pedido.items.find((i) => i.codigo === ov.codigo)!;
            const nuevo = Math.min(producto(ov.codigo)!.solicitado, item.surtido + n);
            sonar('ok');
            dispatch({ type: 'surtir', codigo: ov.codigo, cantidad: n });
            cerrar();
            revisarSiCompleta(ov.codigo, nuevo);
          }}
        />
      )}
      {ov?.k === 'revision' &&
        (() => {
          const it = pedido.items.find((i) => i.codigo === ov.codigo)!;
          const p = producto(ov.codigo)!;
          return (
            <RevisionModal
              producto={p}
              tipo={tipoRevision(p)}
              revisado={it.revisado}
              total={it.surtido}
              onScan={(v) => {
                if (escanearRevision(ov.codigo, v)) window.setTimeout(() => revisionCompletada(ov.codigo, ov.finalizacion), 500);
              }}
              onConfirm={() => {
                dispatch({ type: 'completarRevision', codigo: ov.codigo });
                revisionCompletada(ov.codigo, ov.finalizacion);
              }}
              onCancel={() => {
                dispatch({ type: 'cancelarRevision', codigo: ov.codigo });
                cerrar();
              }}
            />
          );
        })()}
      {ov?.k === 'menu' && (
        <MenuModal
          onRepetirAudio={() => {
            const sig = pedido.items.find((i) => statusDe(i) === 'no-iniciado' || statusDe(i) === 'parcial');
            if (sig) decir(`Código ${sig.codigo.split('').join(' ')}. ${producto(sig.codigo)!.ubicacion.join(', ')}`);
          }}
          onFinalizar={iniciarFinalizacion}
          onCancel={cerrar}
        />
      )}
      {ov?.k === 'parciales' && (
        <ParcialesModal
          rows={pedido.items
            .filter((i) => statusDe(i) === 'parcial')
            .map((i) => ({ codigo: i.codigo, surtido: i.surtido, solicitado: producto(i.codigo)!.solicitado, existencia: producto(i.codigo)!.existencia }))}
          onCancel={cerrar}
          onConfirm={() => siguienteRevision()}
        />
      )}
      {ov?.k === 'finalizar' && (
        <FinalizarModal
          onCancel={() => {
            setAutoDescartado(true);
            cerrar();
          }}
          onConfirm={terminar}
        />
      )}
      {ov?.k === 'promoParcial' && <PromoParcialModal rows={promoRows()} onEliminar={() => setOverlay({ k: 'promoEscaneo' })} onCancel={cerrar} />}
      {ov?.k === 'promoEscaneo' && (
        <PromoEscaneoModal
          rows={promoRows()}
          onCancel={() => setOverlay({ k: 'promoParcial' })}
          onScan={(v) => {
            const l = leerCodigo(v);
            const codigos = (promocionIncompleta(pedido) ?? PROMOCIONES[0]).codigos;
            if (l.tipo !== 'invalido' && codigos.includes(l.codigo)) {
              sonar('ok');
              setOverlay({ k: 'promoNegada' });
            } else {
              sonar('error');
              mostrarToast(TOAST_CODIGO_INVALIDO);
            }
          }}
        />
      )}
      {ov?.k === 'promoNegada' && (
        <PromoNegadaModal
          rows={promoRows()}
          onConfirm={() => {
            const codigos = (promocionIncompleta(pedido) ?? PROMOCIONES[0]).codigos;
            dispatch({ type: 'negarPromocion', codigos });
            dispatch({ type: 'finalizar' });
            setEtapa('traspaso');
            navigate('/tareas');
            mostrarToast(TOAST_FINALIZADO);
          }}
        />
      )}
    </div>
  );
}

export type { Overlay as SurtidoOverlay };
