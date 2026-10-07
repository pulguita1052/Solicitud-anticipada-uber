/**
 * Query string actual de la app (`?escenario=`, `?paso=`, `?overlay=`, `?sinActivos=`, `?generar=`).
 *
 * En el sitio normal (BrowserRouter) coincide con `window.location.search`. En la vista previa publicada como
 * Artifact (build con `VITE_ARTIFACT=1`) la app corre en un MemoryRouter —el visor no permite rutas ni query
 * string propias—, así que la búsqueda se toma de la ubicación del router (`SincronizarQuery`).
 */
import { createContext, useContext } from 'react';
import { useLocation } from 'react-router-dom';

export const MODO_ARTIFACT = import.meta.env.VITE_ARTIFACT === '1';

let busqueda = typeof window === 'undefined' ? '' : window.location.search;

export function queryActual(): URLSearchParams {
  return new URLSearchParams(busqueda);
}

/** Se monta dentro del router, antes de la app, para que `queryActual()` refleje la ubicación vigente. */
export function SincronizarQuery() {
  busqueda = useLocation().search;
  return null;
}

/** En modo Artifact el panel de escenarios abre un escenario re-montando la app con su semilla (sin recargar). */
export const AbrirEscenarioCtx = createContext<((url: string) => void) | null>(null);
export const useAbrirEscenario = () => useContext(AbrirEscenarioCtx);
