/**
 * Figma: Datos de la factura (🧾 Facturación, ERB-47986/47985/47988/47984)
 * nodeId: 3841:818 · Estados: 6004:5275 (scroll dirección) · 6004:4347 (selector) · 6004:6726 (generando)
 *         6004:6594 (error) · 6004:7618 (facturada con folio)
 * URL: https://www.figma.com/design/zZBoCtJor0tdJ91umiqb7l/?node-id=3841-818
 * Última sincronización: 2026-09-29
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import idCard from '@assets/icons/id-card.svg';
import listAlt from '@assets/icons/list-alt.svg';
import receiptLong from '@assets/icons/receipt-long.svg';
import personIcon from '@assets/icons/person.svg';
import ordersIcon from '@assets/icons/orders.svg';
import locationOn from '@assets/icons/location-on.svg';
import handPackage from '@assets/icons/hand-package.svg';
import printIcon24 from '@assets/icons/print-24.svg';
import loading from '@assets/icons/loading-indicator.svg';
import stepperMenos from '@assets/icons/stepper-menos.svg';
import stepperMas from '@assets/icons/stepper-mas.svg';
import { AppHeader } from '@ds/components/organisms/AppHeader/AppHeader';
import { ContentPanel } from '@ds/components/organisms/ContentPanel/ContentPanel';
import { BottomBar } from '@ds/components/organisms/BottomBar/BottomBar';
import { Button } from '@ds/components/atoms/Button/Button';
import { Stepper } from '@ds/components/atoms/Stepper/Stepper';
import { Divider } from '@ds/components/atoms/Divider/Divider';
import { FloatingLabelInput } from '@ds/components/molecules/FloatingLabelInput/FloatingLabelInput';
import { FACTURACION, EMBARQUES_ACTIVOS } from '../../mocks/facturacion';
import { evaluarCandidatura } from '../../domain/uber';
import { montoPedido, totalArticulos } from '../../domain/pedido';
import { SUCURSAL_ACTUAL, TIPO_PAGO_ACTUAL, tieneActivoParaCliente } from '../../mocks/uber';
import { useStore } from '../../store/AppStore';
import { queryActual } from '../../navigation/query';
import { AgregarEmbarqueEleccionModal, AgregarEmbarqueSelectorModal, EmbarqueCreadoModal, FacturaAgregadaModal, NuevoEmbarqueModal } from './overlays/FacturacionModals';
import { ConsolidacionModal, OfrecimientoUberModal } from '../uber/UberModals';
import styles from './DatosFactura.module.css';

type Estado = 'formulario' | 'generando' | 'error' | 'facturada';
type Overlay =
  | { k: 'direcciones' }
  | { k: 'nuevoEmbarque' }
  | { k: 'embarqueCreado'; numero: string }
  | { k: 'agregarEleccion' }
  | { k: 'agregarSelector' }
  | { k: 'facturaAgregada'; numero: string; facturas: number; fecha: string };

/** Overlay a preabrir desde ?overlay=... (para los escenarios de verificación visual). */
function overlayDesdeUrl(): Overlay | null {
  const v = queryActual().get('overlay');
  switch (v) {
    case 'nuevoEmbarque': return { k: 'nuevoEmbarque' };
    case 'embarqueCreado': return { k: 'embarqueCreado', numero: '147707' };
    case 'agregarEleccion': return { k: 'agregarEleccion' };
    case 'agregarSelector': return { k: 'agregarSelector' };
    case 'facturaAgregada': return { k: 'facturaAgregada', numero: '147707', facturas: 2, fecha: '2026-09-17 15:48' };
    case 'direcciones': return { k: 'direcciones' };
    default: return null;
  }
}

const TOAST_IMPRIMIENDO = { kind: 'success' as const, title: 'Imprimiendo factura', message: 'La factura ha sido generada correctamente.' };
const TOAST_ERROR_FACTURA = {
  kind: 'error' as const,
  title: 'Error al generar la factura',
  message: 'Podría ser la conexión a internet, acercate al Wi-Fi de tu sucursal e inténtalo nuevamente.',
};

const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

/** Simula el escenario para pruebas: ?generar=error fuerza el estado de error. */
function forzarError(): boolean {
  return queryActual().get('generar') === 'error';
}

const CLIENTE_ID = '536983'; // FACTURACION.cliente ("536983 | FRANCISCO JAVIER HERNADEZ MELENDREZ")

export function DatosFactura() {
  const navigate = useNavigate();
  const { factura, pedido, setFactura, mostrarToast, setEtapa } = useStore();
  const [estado, setEstado] = useState<Estado>(factura.folio ? 'facturada' : 'formulario');
  const [overlay, setOverlay] = useState<Overlay | null>(() => overlayDesdeUrl());
  /** El operador rechazó el ofrecimiento de Uber ("Ahora no"); no se vuelve a mostrar hasta recargar. */
  const [ofrecimientoRechazado, setOfrecimientoRechazado] = useState(false);
  const dirRef = useRef<HTMLDivElement>(null);

  const monto = montoPedido(pedido);
  const articulos = totalArticulos(pedido);
  const direccionActualTexto =
    FACTURACION.direccionesEntrega.find((d) => d.id === factura.direccionEntrega)?.texto ?? FACTURACION.direccionesEntrega[0].texto;
  const candidatura = useMemo(
    () => evaluarCandidatura({ sucursal: SUCURSAL_ACTUAL, monto, tipoPago: TIPO_PAGO_ACTUAL }),
    [monto],
  );
  const activo = tieneActivoParaCliente(CLIENTE_ID, direccionActualTexto);
  /** `?sinActivos=1` fuerza el flujo donde el cliente no tiene embarques activos previos y "Continuar a
      embarque" salta directo al modal "Nuevo embarque". Sin el flag se usa `EMBARQUES_ACTIVOS` del mock. */
  const sinActivos = queryActual().get('sinActivos') === '1';
  const embarquesActivos = sinActivos ? [] : EMBARQUES_ACTIVOS;
  /** Modal de Uber sobre Datos factura: aparece al terminar de crear el embarque y cumplir la candidatura. */
  const mostrarOfrecimiento =
    estado === 'facturada' && !!factura.embarque && candidatura.candidato && !ofrecimientoRechazado && overlay === null;

  const irAFormularioUber = () => {
    setEtapa('uber');
    navigate('/uber?paso=formulario');
  };

  const generar = () => {
    setEstado('generando');
    window.setTimeout(() => {
      if (forzarError()) {
        setEstado('error');
        mostrarToast(TOAST_ERROR_FACTURA);
      } else {
        setFactura((prev) => ({ ...prev, folio: FACTURACION.folioFactura }));
        setEstado('facturada');
        mostrarToast(TOAST_IMPRIMIENDO);
      }
    }, 2500);
  };

  const continuarEmbarque = () => {
    // Existen embarques activos → mostrar elección; en caso contrario → nuevo embarque directo
    if (embarquesActivos.length > 0) setOverlay({ k: 'agregarEleccion' });
    else setOverlay({ k: 'nuevoEmbarque' });
  };

  const direccionActual = FACTURACION.direccionesEntrega.find((d) => d.id === factura.direccionEntrega) ?? FACTURACION.direccionesEntrega[0];

  // Scroll al abrir dirección (Figma 6004:4347)
  useEffect(() => {
    if (overlay?.k === 'direcciones') dirRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [overlay]);

  return (
    <div className={styles.screen}>
      {/* En Figma 3841:818 el header no muestra flecha de regreso; se cancela con el botón inferior. */}
      <AppHeader showBack={false} />
      <ContentPanel title="Datos de la factura" paddingBottom={45} align="center" bottom={0}>
        {estado === 'generando' ? (
          <div className={styles.centered}>
            <img className={styles.spin} src={loading} alt="" width={66} height={66} />
            <p className={styles.title24}>Generando factura…</p>
            <div className={styles.barContainer}>
              <div className={styles.barTrack}>
                <div className={styles.barFill} />
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.content}>
            <div className={styles.form}>
              <div className={styles.totalBlock}>
                <p className={styles.totalLabel}>Total</p>
                <p className={styles.totalValue}>{currency.format(FACTURACION.total)}</p>
                {estado === 'facturada' && factura.folio && (
                  <div className={styles.folioBox}>
                    <div className={styles.folioRow}>
                      <span>Folio factura</span>
                      <b>{factura.folio}</b>
                    </div>
                    {factura.embarque && (
                      <div className={styles.folioRow}>
                        <span>No. de embarque</span>
                        <b>{factura.embarque.numero}</b>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className={styles.inputs}>
                <FloatingLabelInput label="Empleado" icon={idCard} value={FACTURACION.empleado} />
                <FloatingLabelInput label="Pedido" icon={listAlt} value={FACTURACION.pedido} />
                <FloatingLabelInput label="Forma de pago" icon={receiptLong} value={FACTURACION.formaPago} />
                <FloatingLabelInput label="Cliente" icon={personIcon} value={FACTURACION.cliente} />
                <FloatingLabelInput label="Método de entrega" icon={ordersIcon} value={FACTURACION.metodoEntrega} />
                <FloatingLabelInput label="Dirección fiscal" icon={locationOn} value={FACTURACION.direccionFiscal} tall />
                <div ref={dirRef}>
                  <FloatingLabelInput
                    label="Dirección de entrega"
                    icon={handPackage}
                    labelFont="select"
                    isSelect
                    tall
                    value={direccionActual.texto}
                    onClick={() => setOverlay({ k: 'direcciones' })}
                  />
                </div>
              </div>
            </div>
            <div className={styles.printSection}>
              <div className={styles.printTitle}>
                <img src={printIcon24} alt="" width={24} height={24} />
                <p>Impresión</p>
              </div>
              <div className={styles.copiesRow}>
                <p className={styles.copiesLabel}>Copias</p>
                <div className={styles.stepper}>
                  <Stepper
                    value={factura.copias}
                    min={1}
                    max={9}
                    onChange={(n) => setFactura((prev) => ({ ...prev, copias: n }))}
                    minusAsset={factura.copias <= 1 ? stepperMenos : undefined}
                    plusAsset={stepperMas}
                  />
                </div>
              </div>
            </div>
            <div className={styles.gap90} />
          </div>
        )}
      </ContentPanel>
      {estado === 'formulario' && (
        <BottomBar>
          <div className="row">
            <Button variant="error" label="Cancelar" className={styles.flex1} onClick={() => navigate('/tareas')} />
            <Button variant="success" label="Generar factura" className={styles.flex1} onClick={generar} />
          </div>
        </BottomBar>
      )}
      {estado === 'error' && (
        <BottomBar>
          <div className="row">
            <Button variant="error" label="Cancelar" className={styles.flex1} onClick={() => navigate('/tareas')} />
            <Button variant="success" label="Generar factura" className={styles.flex1} onClick={generar} />
          </div>
        </BottomBar>
      )}
      {estado === 'facturada' && !factura.embarque && (
        <BottomBar>
          <div className="row">
            <Button variant="default" label="Reimprimir factura" className={styles.flex1} onClick={() => mostrarToast(TOAST_IMPRIMIENDO)} />
            <Button variant="success" label="Continuar a embarque" className={styles.flex1} onClick={continuarEmbarque} />
          </div>
        </BottomBar>
      )}
      {estado === 'facturada' && factura.embarque && (
        <BottomBar>
          <div className="row">
            <Button
              variant="success"
              label="Regresar a tareas"
              className={styles.flex1}
              onClick={() => {
                setEtapa('surtido');
                navigate('/tareas');
              }}
            />
            <Button variant="default" label="Reimprimir factura" className={styles.flex1} onClick={() => mostrarToast(TOAST_IMPRIMIENDO)} />
          </div>
        </BottomBar>
      )}

      {overlay?.k === 'direcciones' && (
        <div className={styles.direccionesOverlay} onClick={() => setOverlay(null)}>
          <div className={styles.direccionesBox} onClick={(e) => e.stopPropagation()}>
            {FACTURACION.direccionesEntrega.map((d, i) => (
              <div key={d.id}>
                {i > 0 && <Divider variant="modal" />}
                <button
                  type="button"
                  className={styles.direccionOpcion}
                  onClick={() => {
                    setFactura((prev) => ({ ...prev, direccionEntrega: d.id }));
                    setOverlay(null);
                  }}
                >
                  {d.texto}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {overlay?.k === 'nuevoEmbarque' && (
        <NuevoEmbarqueModal
          onCancel={() => setOverlay(null)}
          onConfirm={() => setOverlay({ k: 'embarqueCreado', numero: '147707' })}
        />
      )}

      {overlay?.k === 'embarqueCreado' && (
        <EmbarqueCreadoModal
          numero={overlay.numero}
          onConfirm={() => {
            // ERB-53024: al aceptar el modal "Embarque creado" el ofrecimiento de Uber aparece
            // automáticamente sobre esta misma pantalla (ver `mostrarOfrecimiento` arriba).
            setFactura((prev) => ({ ...prev, embarque: { numero: overlay.numero, facturas: 1, fecha: '2026-09-29 12:00' } }));
            setOverlay(null);
          }}
        />
      )}

      {overlay?.k === 'agregarEleccion' && (
        <AgregarEmbarqueEleccionModal
          cantidad={embarquesActivos.length}
          // Ya se informó al operador que existen embarques activos y aun así eligió "Nuevo embarque":
          // saltamos la confirmación intermedia "¿continuar con la creación?" y creamos el embarque directo.
          onNuevo={() => setOverlay({ k: 'embarqueCreado', numero: '147707' })}
          onAgregar={() => setOverlay({ k: 'agregarSelector' })}
          onCancel={() => setOverlay(null)}
        />
      )}

      {overlay?.k === 'agregarSelector' && (
        <AgregarEmbarqueSelectorModal
          onCancel={() => setOverlay(null)}
          onConfirm={(numero) => {
            const emb = embarquesActivos.find((e) => e.numero === numero)!;
            setOverlay({ k: 'facturaAgregada', numero: emb.numero, facturas: emb.facturas + 1, fecha: emb.fecha });
          }}
        />
      )}

      {overlay?.k === 'facturaAgregada' && (
        <FacturaAgregadaModal
          numero={overlay.numero}
          facturas={overlay.facturas}
          fecha={overlay.fecha}
          onConfirm={() => {
            setFactura((prev) => ({ ...prev, embarque: { numero: overlay.numero, facturas: overlay.facturas, fecha: overlay.fecha } }));
            setOverlay(null);
          }}
        />
      )}

      {/* Ofrecimiento Uber (o consolidación si el cliente ya tiene una solicitud creada para esta dirección) */}
      {mostrarOfrecimiento && !activo && (
        <OfrecimientoUberModal
          monto={monto}
          articulos={articulos}
          onCancelar={() => setOfrecimientoRechazado(true)}
          onContinuar={irAFormularioUber}
        />
      )}
      {mostrarOfrecimiento && !!activo && (
        <ConsolidacionModal
          onCancelar={() => setOfrecimientoRechazado(true)}
          onContinuar={irAFormularioUber}
        />
      )}
    </div>
  );
}
