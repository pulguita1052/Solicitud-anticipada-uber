/**
 * Estado global: pedido (surtido de un pedido), ronda (surtido multipedido), etapa del flujo y avisos (toasts).
 * Alcance de esta rama: surtido sin revisión.
 *   - Un pedido (📲 Surtido - Un pedido x ronda): 'surtido' → 'revision' (REVISAR PEDIDO CLIENTE, 197:20499, bloqueada).
 *   - Multipedido (sin Figma): 'ronda-surtido' → ('ronda-revision' solo en la propuesta C) → 'ronda-fin' (bloqueada).
 */
import { createContext, useCallback, useContext, useMemo, useReducer, useState, type Dispatch, type ReactNode } from 'react';
import { estadoInicial, pedidoReducer, type PedidoAction, type PedidoState } from '../domain/pedido';
import { rondaInicial, rondaReducer, type RondaAction, type RondaState } from '../domain/ronda';
import type { ToastKind } from '../design-system/components/organisms/Toast/Toast';

export type Etapa = 'surtido' | 'revision' | 'ronda-surtido' | 'ronda-revision' | 'ronda-fin';

export type ToastData = { id: number; kind: ToastKind; title: string; message: ReactNode };

type Store = {
  pedido: PedidoState;
  dispatch: Dispatch<PedidoAction>;
  ronda: RondaState;
  rondaDispatch: Dispatch<RondaAction>;
  etapa: Etapa;
  setEtapa: (e: Etapa) => void;
  toast: ToastData | null;
  mostrarToast: (t: Omit<ToastData, 'id'>) => void;
  cerrarToast: () => void;
};

const Ctx = createContext<Store | null>(null);

export type Semilla = { pedido?: PedidoState; ronda?: RondaState; etapa?: Etapa; toast?: Omit<ToastData, 'id'> };

export function AppStoreProvider({ children, semilla }: { children: ReactNode; semilla?: Semilla }) {
  const [pedido, dispatch] = useReducer(pedidoReducer, undefined, () => semilla?.pedido ?? estadoInicial());
  const [ronda, rondaDispatch] = useReducer(rondaReducer, undefined, () => semilla?.ronda ?? rondaInicial());
  // El flujo principal (Menú › Tareas) es el surtido multipedido; el de un pedido se abre desde el panel de escenarios.
  const [etapa, setEtapa] = useState<Etapa>(semilla?.etapa ?? 'ronda-surtido');
  const [toast, setToast] = useState<ToastData | null>(semilla?.toast ? { id: 0, ...semilla.toast } : null);

  const mostrarToast = useCallback((t: Omit<ToastData, 'id'>) => setToast({ id: Date.now(), ...t }), []);
  const cerrarToast = useCallback(() => setToast(null), []);

  const value = useMemo(
    () => ({ pedido, dispatch, ronda, rondaDispatch, etapa, setEtapa, toast, mostrarToast, cerrarToast }),
    [pedido, ronda, etapa, toast, mostrarToast, cerrarToast],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore fuera de AppStoreProvider');
  return s;
}
