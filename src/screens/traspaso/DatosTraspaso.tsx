/**
 * Datos del traspaso — SIN respaldo en Figma (variante de "Datos de la factura", 🧾 Facturación 3841:818).
 * Un traspaso es un movimiento de inventario entre sucursales: no genera factura, así que se omiten la
 * forma de pago, la impresión y "Generar factura". El botón principal es "Continuar a embarque", y desde ahí
 * el flujo es el mismo que con un pedido: agregar a un embarque activo hacia la misma sucursal o crear uno
 * nuevo, y una vez embarcado se evalúa la candidatura para Uber (ERB-53024).
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import idCard from '@assets/icons/id-card.svg';
import listAlt from '@assets/icons/list-alt.svg';
import ordersIcon from '@assets/icons/orders.svg';
import locationOn from '@assets/icons/location-on.svg';
import { AppHeader } from '@ds/components/organisms/AppHeader/AppHeader';
import { ContentPanel } from '@ds/components/organisms/ContentPanel/ContentPanel';
import { BottomBar } from '@ds/components/organisms/BottomBar/BottomBar';
import { Button } from '@ds/components/atoms/Button/Button';
import { FloatingLabelInput } from '@ds/components/molecules/FloatingLabelInput/FloatingLabelInput';
import { EMBARQUES_ACTIVOS } from '../../mocks/facturacion';
import { SUCURSAL_DESTINO, TRASPASO } from '../../mocks/traspaso';
import { SUCURSAL_ACTUAL, TIPO_PAGO_ACTUAL, tieneActivoParaCliente } from '../../mocks/uber';
import { evaluarCandidatura } from '../../domain/uber';
import { montoPedido, producto, totalArticulos } from '../../domain/pedido';
import { useStore } from '../../store/AppStore';
import { queryActual } from '../../navigation/query';
import {
  AgregarEmbarqueEleccionModal,
  AgregarEmbarqueSelectorModal,
  EmbarqueCreadoModal,
  FacturaAgregadaModal,
  NuevoEmbarqueModal,
} from '../facturacion/overlays/FacturacionModals';
import { ConsolidacionModal, OfrecimientoUberModal } from '../uber/UberModals';
import facturaStyles from '../facturacion/DatosFactura.module.css';
import styles from './DatosTraspaso.module.css';

type Overlay =
  | { k: 'nuevoEmbarque' }
  | { k: 'embarqueCreado'; numero: string }
  | { k: 'agregarEleccion' }
  | { k: 'agregarSelector' }
  | { k: 'traspasoAgregado'; numero: string; traspasos: number; fecha: string };

/** Overlay a preabrir desde ?overlay=... (para los escenarios de verificación visual). */
function overlayDesdeUrl(): Overlay | null {
  const v = queryActual().get('overlay');
  switch (v) {
    case 'nuevoEmbarque': return { k: 'nuevoEmbarque' };
    case 'embarqueCreado': return { k: 'embarqueCreado', numero: '147707' };
    case 'agregarEleccion': return { k: 'agregarEleccion' };
    case 'agregarSelector': return { k: 'agregarSelector' };
    case 'traspasoAgregado': return { k: 'traspasoAgregado', numero: '147707', traspasos: 2, fecha: '2026-09-17 15:48' };
    default: return null;
  }
}

export function DatosTraspaso() {
  const navigate = useNavigate();
  const { factura, pedido, setFactura, setEtapa } = useStore();
  const [overlay, setOverlay] = useState<Overlay | null>(() => overlayDesdeUrl());
  /** El operador rechazó el ofrecimiento de Uber ("Ahora no"); no se vuelve a mostrar hasta recargar. */
  const [ofrecimientoRechazado, setOfrecimientoRechazado] = useState(false);

  // Contenido del traspaso = piezas surtidas (las partidas negadas no viajan).
  const partidas = pedido.items.filter((i) => !i.negado && i.surtido > 0);
  const piezas = totalArticulos(pedido);
  const valor = montoPedido(pedido);

  const candidatura = useMemo(
    () => evaluarCandidatura({ sucursal: SUCURSAL_ACTUAL, monto: valor, tipoPago: TIPO_PAGO_ACTUAL }),
    [valor],
  );
  const activo = tieneActivoParaCliente(SUCURSAL_DESTINO.id, SUCURSAL_DESTINO.direccion);
  /** `?sinActivos=1` fuerza el flujo sin embarques activos hacia esta sucursal ("Continuar a embarque" va directo a "Nuevo embarque"). */
  const sinActivos = queryActual().get('sinActivos') === '1';
  const embarquesActivos = sinActivos ? [] : EMBARQUES_ACTIVOS;
  /** Ofrecimiento de Uber sobre esta pantalla: al terminar de asignar el embarque y cumplir la candidatura. */
  const mostrarOfrecimiento = !!factura.embarque && candidatura.candidato && !ofrecimientoRechazado && overlay === null;

  const irAFormularioUber = () => {
    setEtapa('uber');
    navigate('/uber?paso=formulario');
  };

  const continuarEmbarque = () => {
    if (embarquesActivos.length > 0) setOverlay({ k: 'agregarEleccion' });
    else setOverlay({ k: 'nuevoEmbarque' });
  };

  return (
    <div className={facturaStyles.screen}>
      <AppHeader showBack={false} />
      <ContentPanel title="Datos del traspaso" paddingBottom={45} align="center" bottom={0}>
        <div className={facturaStyles.content}>
          <div className={facturaStyles.form}>
            <div className={facturaStyles.totalBlock}>
              <p className={facturaStyles.totalLabel}>Total de piezas</p>
              <p className={facturaStyles.totalValue}>{piezas}</p>
              <div className={facturaStyles.folioBox}>
                <div className={facturaStyles.folioRow}>
                  <span>Partidas</span>
                  <b>{partidas.length}</b>
                </div>
                {factura.embarque && (
                  <div className={facturaStyles.folioRow}>
                    <span>No. de embarque</span>
                    <b>{factura.embarque.numero}</b>
                  </div>
                )}
              </div>
            </div>
            <div className={facturaStyles.inputs}>
              <FloatingLabelInput label="Empleado" icon={idCard} value={TRASPASO.empleado} />
              <FloatingLabelInput label="Traspaso" icon={listAlt} value={TRASPASO.traspaso} />
              <FloatingLabelInput label="Sucursal destino" icon={ordersIcon} value={TRASPASO.sucursalDestino} />
              <FloatingLabelInput label="Dirección de la sucursal destino" icon={locationOn} value={TRASPASO.direccionSucursal} tall />
            </div>
          </div>
          <div className={styles.contenido}>
            <p className={styles.contenidoTitulo}>Contenido del traspaso</p>
            <ul className={styles.lista}>
              {partidas.map((i) => {
                const p = producto(i.codigo)!;
                return (
                  <li key={i.codigo} className={styles.fila}>
                    <div className={styles.filaTexto}>
                      <b>{p.codigo}</b>
                      <span>{p.descripcion}</span>
                    </div>
                    <span className={styles.filaPiezas}>{i.surtido} pzas</span>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className={facturaStyles.gap90} />
        </div>
      </ContentPanel>

      {!factura.embarque ? (
        <BottomBar>
          <div className="row">
            <Button variant="error" label="Cancelar" className={styles.cancelar} onClick={() => navigate('/tareas')} />
            <Button variant="success" label="Continuar a embarque" className={facturaStyles.flex1} onClick={continuarEmbarque} />
          </div>
        </BottomBar>
      ) : (
        <BottomBar variant="exit">
          <Button
            variant="success"
            label="Regresar a tareas"
            className={styles.full}
            onClick={() => {
              setEtapa('surtido');
              navigate('/tareas');
            }}
          />
        </BottomBar>
      )}

      {overlay?.k === 'nuevoEmbarque' && (
        <NuevoEmbarqueModal
          unidad="traspaso"
          onCancel={() => setOverlay(null)}
          onConfirm={() => setOverlay({ k: 'embarqueCreado', numero: '147707' })}
        />
      )}

      {overlay?.k === 'embarqueCreado' && (
        <EmbarqueCreadoModal
          unidad="traspaso"
          numero={overlay.numero}
          onConfirm={() => {
            // Al aceptar, el ofrecimiento de Uber aparece sobre esta misma pantalla (ver `mostrarOfrecimiento`).
            setFactura((prev) => ({ ...prev, embarque: { numero: overlay.numero, facturas: 1, fecha: '2026-09-29 12:00' } }));
            setOverlay(null);
          }}
        />
      )}

      {overlay?.k === 'agregarEleccion' && (
        <AgregarEmbarqueEleccionModal
          unidad="traspaso"
          cantidad={embarquesActivos.length}
          onNuevo={() => setOverlay({ k: 'embarqueCreado', numero: '147707' })}
          onAgregar={() => setOverlay({ k: 'agregarSelector' })}
          onCancel={() => setOverlay(null)}
        />
      )}

      {overlay?.k === 'agregarSelector' && (
        <AgregarEmbarqueSelectorModal
          unidad="traspaso"
          onCancel={() => setOverlay(null)}
          onConfirm={(numero) => {
            const emb = embarquesActivos.find((e) => e.numero === numero)!;
            setOverlay({ k: 'traspasoAgregado', numero: emb.numero, traspasos: emb.facturas + 1, fecha: emb.fecha });
          }}
        />
      )}

      {overlay?.k === 'traspasoAgregado' && (
        <FacturaAgregadaModal
          unidad="traspaso"
          numero={overlay.numero}
          facturas={overlay.traspasos}
          fecha={overlay.fecha}
          onConfirm={() => {
            setFactura((prev) => ({ ...prev, embarque: { numero: overlay.numero, facturas: overlay.traspasos, fecha: overlay.fecha } }));
            setOverlay(null);
          }}
        />
      )}

      {/* Ofrecimiento Uber (o consolidación si ya hay una solicitud creada para la misma sucursal + dirección) */}
      {mostrarOfrecimiento && !activo && (
        <OfrecimientoUberModal
          totalLabel="Valor del traspaso"
          monto={valor}
          articulos={piezas}
          onCancelar={() => setOfrecimientoRechazado(true)}
          onContinuar={irAFormularioUber}
        />
      )}
      {mostrarOfrecimiento && !!activo && (
        <ConsolidacionModal onCancelar={() => setOfrecimientoRechazado(true)} onContinuar={irAFormularioUber} />
      )}
    </div>
  );
}
