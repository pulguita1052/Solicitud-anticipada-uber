/**
 * Tabla de la Handheld — SIN respaldo en Figma (replicada de una captura de referencia del componente de la HH).
 * Se ven hasta 3 columnas a la vez; con más columnas (o si una columna `ancho: 'contenido'` no cabe) aparece el
 * scroll horizontal y la flecha ▶ en el encabezado.
 * La primera y/o la segunda columna pueden quedar fijas (`columnasFijas`) mientras el resto se desplaza.
 * Última revisión: 2026-10-08
 */
import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import styles from './DataTable.module.css';

export type DataTableColumn<T> = {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  /** `'contenido'`: la columna crece al ancho de su texto (sin saltos de línea) y la tabla se desplaza. */
  ancho?: 'columna' | 'contenido';
};

type Props<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** Columnas que no se desplazan con el scroll horizontal (0, 1 o 2, desde la izquierda). */
  columnasFijas?: 0 | 1 | 2;
};

/** Columnas visibles a la vez en la HH. */
const VISIBLES = 3;

export function DataTable<T>({ columns, rows, rowKey, columnasFijas = 0 }: Props<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const visibles = Math.min(columns.length, VISIBLES);
  const [desborda, setDesborda] = useState(columns.length > VISIBLES);

  // Hay scroll si la tabla no cabe: más de 3 columnas o columnas al ancho del contenido.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    const table = tableRef.current;
    if (!el || !table) return;
    const medir = () => setDesborda(columns.length > VISIBLES || el.scrollWidth > el.clientWidth + 1);
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    ro.observe(table);
    return () => ro.disconnect();
  }, [columns.length]);

  const claseCelda = (c: DataTableColumn<T>, i: number) =>
    [
      c.ancho === 'contenido' ? styles.alContenido : '',
      i < columnasFijas && desborda ? styles.fija : '',
      i === columnasFijas - 1 && desborda ? styles.ultimaFija : '',
    ].join(' ');

  const avanzar = () => {
    const el = scrollRef.current;
    if (el) el.scrollBy({ left: el.clientWidth / VISIBLES, behavior: 'smooth' });
  };

  return (
    <div className={`${styles.tabla} ${desborda ? styles.conFlecha : ''}`} style={{ '--dt-visibles': visibles } as CSSProperties}>
      <div ref={scrollRef} className={styles.scroll}>
        <table ref={tableRef} className={styles.table}>
          <thead>
            <tr>
              {columns.map((c, i) => (
                <th key={c.key} className={claseCelda(c, i)} style={{ '--dt-i': i } as CSSProperties}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={rowKey(r)}>
                {columns.map((c, i) => (
                  <td key={c.key} className={claseCelda(c, i)} style={{ '--dt-i': i } as CSSProperties}>
                    {c.render(r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {desborda && (
        <button type="button" className={styles.flecha} aria-label="Ver más columnas" onClick={avanzar}>
          ▶
        </button>
      )}
    </div>
  );
}
