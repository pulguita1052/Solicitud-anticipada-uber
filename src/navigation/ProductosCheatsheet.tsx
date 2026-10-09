/**
 * Panel lateral (izquierdo) con la tabla de productos del pedido — ayuda de demo para copiar SKU
 * durante el surtido. Vive fuera del `.app-frame` (mismo tratamiento que EscenariosPanel a la derecha),
 * se oculta bajo 900 px de viewport, y no altera la lógica de negocio. Se muestra solo en `/surtido`.
 *
 * Los datos vienen del mismo mock que alimenta la app (PRODUCTOS, mocks/pedido.ts) para que la tabla
 * siempre refleje el estado real del pedido; los precios se suman al total del pedido.
 */
import { useState } from 'react';
import { etiqueta } from '../domain/codigos';
import { PRODUCTOS } from '../mocks/pedido';
import styles from './ProductosCheatsheet.module.css';

const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

/**
 * Etiqueta APYMSA de 18 dígitos que el lector emite y el input de escaneo valida
 * en `src/domain/codigos.ts` — [7 código][6 cantidad][5 peso]. Genera una por 1 pieza
 * y peso 0 para poder pegarla directo en el input del surtido.
 */
function etiquetaPz1(codigo: string) {
  return etiqueta(codigo, 1, 0);
}

export function ProductosCheatsheet() {
  const [copiado, setCopiado] = useState<string | null>(null);
  const total = PRODUCTOS.reduce((n, p) => n + p.precioUnitario * p.solicitado, 0);
  const piezas = PRODUCTOS.reduce((n, p) => n + p.solicitado, 0);

  const copiar = async (codigo: string) => {
    try {
      await navigator.clipboard.writeText(etiquetaPz1(codigo));
      setCopiado(codigo);
      window.setTimeout(() => setCopiado((c) => (c === codigo ? null : c)), 1400);
    } catch {
      /* clipboard bloqueado — la fila queda igual */
    }
  };

  return (
    <aside className={styles.panel} aria-label="Productos del pedido">
      <header className={styles.header}>
        <span className={styles.badge}>Pedido</span>
        <h2 className={styles.title}>Productos</h2>
        <p className={styles.subtitle}>
          Click en el código para copiar la etiqueta APYMSA de 18 dígitos (formato del lector:
          <b> 7 código + 6 cantidad + 5 peso</b>) y pegarla en el input del surtido.
        </p>
      </header>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thNum}>#</th>
              <th>Etiqueta (18 dígitos)</th>
              <th className={styles.thPz}>Pzs</th>
              <th className={styles.thPr}>Precio</th>
            </tr>
          </thead>
          <tbody>
            {PRODUCTOS.map((p, i) => (
              <tr key={p.codigo}>
                <td className={styles.tdNum}>{i + 1}</td>
                <td>
                  <button
                    type="button"
                    className={`${styles.sku} ${copiado === p.codigo ? styles.skuCopiado : ''}`}
                    onClick={() => copiar(p.codigo)}
                    title={`Copiar etiqueta para SKU ${p.codigo} (1 pza)`}
                  >
                    {copiado === p.codigo ? '¡Copiado!' : etiquetaPz1(p.codigo)}
                  </button>
                </td>
                <td className={styles.tdPz}>{p.solicitado}</td>
                <td className={styles.tdPr}>{currency.format(p.precioUnitario * p.solicitado)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} className={styles.footLabel}>
                Total
              </td>
              <td className={styles.tdPz}>{piezas}</td>
              <td className={styles.tdPr}>
                <b>{currency.format(total)}</b>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className={styles.hint}>
        Pedido reducido a 2 artículos para simplificar la demo. Para pedir la cantidad en un modal, escribe solo el
        código de 7 dígitos (p. ej. <b>1394000</b>).
      </p>
    </aside>
  );
}
