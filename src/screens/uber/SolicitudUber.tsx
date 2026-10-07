/**
 * Solicitud anticipada de Uber (ERB-53024) — solo pantallas de formulario y confirmación.
 *
 * El ofrecimiento y la consolidación ahora se muestran como modales sobre Datos de la factura
 * (ver `src/screens/facturacion/DatosFactura.tsx` + `src/screens/uber/UberModals.tsx`).
 * Cuando se llega a `/uber` sin `?paso=`, se entra directo al formulario.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import handPackage from '@assets/icons/hand-package.svg';
import personIcon from '@assets/icons/person.svg';
import locationOn from '@assets/icons/location-on.svg';
import { AppHeader } from '@ds/components/organisms/AppHeader/AppHeader';
import { ContentPanel } from '@ds/components/organisms/ContentPanel/ContentPanel';
import { BottomBar } from '@ds/components/organisms/BottomBar/BottomBar';
import { Button } from '@ds/components/atoms/Button/Button';
import { Divider } from '@ds/components/atoms/Divider/Divider';
import { RESTRICCIONES_VEHICULO, type TipoVehiculo } from '../../domain/uber';
import { FACTURACION } from '../../mocks/facturacion';
import { precargar } from '../../mocks/uber';
import { PEDIDO_ID } from '../../mocks/pedido';
import { SUCURSAL_DESTINO, TRASPASO } from '../../mocks/traspaso';
import { useStore } from '../../store/AppStore';
import styles from './SolicitudUber.module.css';

type Estado = 'formulario' | 'confirmada';

const TOAST_SOLICITUD_CREADA = {
  kind: 'success' as const,
  title: 'Solicitud creada',
  message: 'Uber recibirá la solicitud. El repartidor se desplazará a la sucursal.',
};

/** Genera un número de solicitud de 5 dígitos (mock; en producción vendría de Uber Direct). */
function nuevoNumeroSolicitud() {
  return String(Math.floor(10000 + Math.random() * 90000));
}

/** `?paso=formulario|confirmada` para saltar directamente a esa pantalla desde los escenarios. */
function pasoInicialDesdeUrl(): Estado | null {
  if (typeof window === 'undefined') return null;
  const v = new URLSearchParams(window.location.search).get('paso');
  return v === 'formulario' || v === 'confirmada' ? v : null;
}

export function SolicitudUber() {
  const navigate = useNavigate();
  const { factura, mostrarToast, setEtapa } = useStore();

  /** Sin folio de factura = flujo de traspaso (movimiento entre sucursales: destino = sucursal, sin factura). */
  const esTraspaso = !factura.folio;
  const clienteId = esTraspaso ? SUCURSAL_DESTINO.id : '536983'; // pedido: FACTURACION.cliente ("536983 | FRANCISCO JAVIER HERNADEZ MELENDREZ")
  const direccion = esTraspaso
    ? SUCURSAL_DESTINO.direccion
    : (FACTURACION.direccionesEntrega.find((d) => d.id === factura.direccionEntrega)?.texto ?? FACTURACION.direccionesEntrega[0].texto);
  const embarqueNumero = factura.embarque?.numero ?? '—';
  const tituloEmbarque = `Solicitud de Uber - Embarque ${embarqueNumero}`;

  const previa = precargar(clienteId, direccion);

  const pasoInicial = pasoInicialDesdeUrl();
  const [estado, setEstado] = useState<Estado>(pasoInicial ?? 'formulario');
  // Precarga: nombre, teléfono, referencias, dpto/oficina. La descripción del paquete siempre inicia VACÍA (criterio del usuario).
  const [nombre, setNombre] = useState(previa?.nombre ?? '');
  const [telefono, setTelefono] = useState(previa?.telefono ?? '');
  const [referencias, setReferencias] = useState(previa?.referencias ?? '');
  const [departamento, setDepartamento] = useState(previa?.departamento ?? '');
  const [descripcion, setDescripcion] = useState('');
  const [tipoVehiculo, setTipoVehiculo] = useState<TipoVehiculo>(previa?.tipoVehiculo ?? 'moto');
  const [numeroSolicitud, setNumeroSolicitud] = useState<string | null>(() =>
    pasoInicial === 'confirmada' ? nuevoNumeroSolicitud() : null,
  );

  const puedeContinuar =
    nombre.trim() && telefono.trim() && referencias.trim() && departamento.trim() && descripcion.trim();

  const generar = () => {
    setNumeroSolicitud(nuevoNumeroSolicitud());
    mostrarToast(TOAST_SOLICITUD_CREADA);
    setEstado('confirmada');
  };

  const irACapturas = () => {
    setEtapa('surtido');
    navigate('/tareas');
  };

  /* ---------------- Formulario ---------------- */
  if (estado === 'formulario') {
    return (
      <div className={styles.screen}>
        <AppHeader showBack={false} />
        <ContentPanel title={tituloEmbarque} paddingBottom={45} bottom={0}>
          <div className={styles.form}>
            <div className={styles.readonlyBox}>
              <div className={styles.readonlyLabel}>
                <img src={locationOn} alt="" width={20} height={20} />
                <b>Dirección de entrega</b>
                <span className={styles.readonlyTag}>Solo lectura</span>
              </div>
              <p className={styles.readonlyValue}>{direccion}</p>
            </div>
            <FieldFloating label="Nombre de quién recibe" icon={personIcon}>
              <input className={styles.input} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre completo" />
            </FieldFloating>
            <FieldFloating label="Teléfono" icon={personIcon}>
              <input className={styles.input} value={telefono} onChange={(e) => setTelefono(e.target.value)} inputMode="tel" placeholder="33-XXXX-XXXX" />
            </FieldFloating>
            <FieldFloating label="Referencias" icon={locationOn}>
              <input className={styles.input} value={referencias} onChange={(e) => setReferencias(e.target.value)} placeholder="Ej. Casa con portón negro" />
            </FieldFloating>
            <FieldFloating label="Dpto/Oficina/Piso" icon={locationOn}>
              <input className={styles.input} value={departamento} onChange={(e) => setDepartamento(e.target.value)} placeholder="Ej. Interior" />
            </FieldFloating>
            <FieldFloating label="Descripción del paquete" icon={handPackage}>
              <input className={styles.input} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Ej. Varios" />
            </FieldFloating>
            <p className={styles.subtitle}>Tipo de vehículo</p>
            <div className={styles.vehiculos}>
              {(['moto', 'coche'] as const).map((tv) => {
                const r = RESTRICCIONES_VEHICULO[tv];
                return (
                  <button
                    type="button"
                    key={tv}
                    className={`${styles.vehiculo} ${tipoVehiculo === tv ? styles.vehiculoActivo : ''}`}
                    onClick={() => setTipoVehiculo(tv)}
                  >
                    <p className={styles.vehiculoTitulo}>{tv === 'moto' ? 'Moto' : 'Coche'}</p>
                    <p className={styles.vehiculoDesc}>{r.descripcion}</p>
                  </button>
                );
              })}
            </div>
            <div className={styles.gap40} />
          </div>
        </ContentPanel>
        <BottomBar>
          <div className="row">
            <Button
              variant="error"
              label="Cancelar"
              className={styles.flex1}
              onClick={() => {
                if (esTraspaso) {
                  setEtapa('traspaso');
                  navigate('/traspaso');
                } else {
                  setEtapa('facturacion');
                  navigate('/facturacion');
                }
              }}
            />
            <Button
              variant="success"
              label="Solicitar Uber"
              disabled={!puedeContinuar}
              className={styles.flex1}
              onClick={generar}
            />
          </div>
        </BottomBar>
      </div>
    );
  }

  /* ---------------- Confirmada ---------------- */
  return (
    <div className={styles.screen}>
      <AppHeader showBack={false} />
      <ContentPanel title="Solicitud de Uber" paddingBottom={45} bottom={0}>
        <div className={styles.center}>
          <div className={styles.checkBadge}>✓</div>
          <p className={styles.h1}>Solicitud creada</p>
          <p className={styles.text}>Uber recibirá la solicitud. El repartidor se desplazará a la sucursal mientras {esTraspaso ? 'el traspaso' : 'el pedido'} termina de prepararse.</p>
          <div className={styles.info}>
            <div className={styles.infoRow}>
              <b>No. de solicitud</b>
              <span className={styles.infoRowValueBig}>{numeroSolicitud ?? '—'}</span>
            </div>
            <Divider variant="modal" />
            <div className={styles.infoRow}>
              <b>{esTraspaso ? 'No. de traspaso' : 'No. de pedido'}</b>
              <span>{esTraspaso ? TRASPASO.id : PEDIDO_ID}</span>
            </div>
            <Divider variant="modal" />
            <div className={styles.infoRow}>
              <b>Embarque</b>
              <span>{embarqueNumero}</span>
            </div>
            {!esTraspaso && (
              <>
                <Divider variant="modal" />
                <div className={styles.infoRow}>
                  <b>Factura</b>
                  <span>{factura.folio ?? '—'}</span>
                </div>
              </>
            )}
            <Divider variant="modal" />
            <div className={styles.infoRow}>
              <b>Vehículo</b>
              <span>{tipoVehiculo === 'moto' ? 'Moto' : 'Coche'}</span>
            </div>
          </div>
        </div>
      </ContentPanel>
      <BottomBar variant="exit">
        <Button variant="default" label="Regresar a tareas" className={styles.fullBtn} onClick={irACapturas} />
      </BottomBar>
    </div>
  );
}

/**
 * Campo con etiqueta flotante: dibuja el borde 1 px alrededor con la etiqueta
 * "cortando" el borde superior izquierdo (patrón Material). Diseñado para inputs editables,
 * a diferencia del FloatingLabelInput (que solo muestra un valor).
 */
function FieldFloating({ label, icon, children }: { label: string; icon: string; children: React.ReactNode }) {
  return (
    <div className={styles.field}>
      <img src={icon} alt="" width={20} height={20} className={styles.fieldIcon} />
      <div className={styles.fieldBody}>{children}</div>
      <span className={styles.fieldLabel}>{label}</span>
    </div>
  );
}
