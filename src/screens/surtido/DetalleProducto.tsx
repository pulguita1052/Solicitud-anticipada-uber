/**
 * Figma: Detalle de producto — 📲 Surtido - Un pedido x ronda, sección "Detalle del producto" (131:4807)
 * nodeId: 131:6465 — motivo negado 1232:6734 (inact.) / 1246:7165 (act.) · toast 1308:6293
 * URL: https://www.figma.com/design/zZBoCtJor0tdJ91umiqb7l/?node-id=131-6465
 * Última sincronización: 2026-10-09
 *
 * Reglas:
 *   - La cantidad surtida solo se edita si ya se escaneó el producto (sticky note 325:3051; spinner gris 325:3041).
 *   - "Negar producto" con cantidad surtida > 0 → aviso "No es posible negar el producto" (1308:6293).
 *   - Con cantidad 0 → "Selección de motivo negado"; el ✓ se habilita al elegir motivo (1246:7339 → 1246:7590).
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppHeader } from '@ds/components/organisms/AppHeader/AppHeader';
import { ContentPanel } from '@ds/components/organisms/ContentPanel/ContentPanel';
import { BottomBar } from '@ds/components/organisms/BottomBar/BottomBar';
import { Button } from '@ds/components/atoms/Button/Button';
import { Stepper } from '@ds/components/atoms/Stepper/Stepper';
import { LabeledField } from '@ds/components/molecules/LabeledField/LabeledField';
import { ProductSummary } from '@ds/components/molecules/ProductSummary/ProductSummary';
import { producto } from '../../domain/pedido';
import { MOTIVOS_NEGADO } from '../../mocks/pedido';
import { useStore } from '../../store/AppStore';
import { MotivoNegadoModal } from './overlays/SurtidoModals';
import styles from './DetalleProducto.module.css';

const TOAST_NO_NEGAR = {
  kind: 'warning' as const,
  title: 'No es posible negar el producto',
  message: (
    <>
      Para poder negar un producto la <b>cantidad surtida debe ser cero. </b>
    </>
  ),
};

export function DetalleProducto() {
  const { codigo = '' } = useParams();
  const navigate = useNavigate();
  const { pedido, dispatch, mostrarToast } = useStore();
  const [negando, setNegando] = useState(false);
  const item = pedido.items.find((i) => i.codigo === codigo);
  const p = producto(codigo);
  if (!item || !p) return null;

  const regresar = () => navigate('/surtido');

  const negar = () => {
    if (item.surtido > 0) return mostrarToast(TOAST_NO_NEGAR);
    setNegando(true);
  };

  return (
    <div className={styles.screen}>
      <AppHeader onBack={regresar} />
      <ContentPanel title="Detalle del producto" bottom={0}>
        <div className={styles.body}>
          <div className={styles.datos}>
            <ProductSummary foto={p.foto ?? ''} codigo={p.codigo} descripcion={p.descripcion} photoStyle="framed" />
            <div className={styles.grid}>
              <div className={styles.pair}>
                <LabeledField label="Ubicación" value={p.planta} />
                <LabeledField label="Pasillo" value={p.pasillo} />
              </div>
              <div className={styles.pair}>
                <LabeledField label="Torre" value={p.torre} />
                <LabeledField label="Nivel" value={p.nivel} />
              </div>
              <div className={styles.pair}>
                <LabeledField label="Existencia" value={p.existencia} valueBold />
                <LabeledField label="Solicitado" value={p.solicitado} />
              </div>
            </div>
          </div>
          <div className={styles.cantidad}>
            <p className={styles.cantidadLabel}>Cantidad surtida:</p>
            <Stepper
              value={item.surtido}
              min={0}
              max={p.solicitado}
              disabled={!item.escaneado || item.negado}
              onChange={(cantidad) => dispatch({ type: 'fijarSurtido', codigo, cantidad })}
            />
          </div>
        </div>
      </ContentPanel>
      <BottomBar variant="footer">
        <Button variant="default" label="Regresar" className={styles.flex1} onClick={regresar} />
        <Button variant="default" label="Negar producto" disabled={item.negado} className={styles.flex1} onClick={negar} />
      </BottomBar>

      {negando && (
        <MotivoNegadoModal
          codigo={p.codigo}
          descripcion={p.descripcion}
          motivos={MOTIVOS_NEGADO}
          onCancel={() => setNegando(false)}
          onConfirm={(motivo) => {
            dispatch({ type: 'negar', codigo, motivo });
            // PENDIENTE: el prototipo no define el destino del ✓ (1246:7612); se regresa a Surtido de órdenes.
            regresar();
          }}
        />
      )}
    </div>
  );
}
