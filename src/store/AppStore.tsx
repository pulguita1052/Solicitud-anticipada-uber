/**
 * Estado global: pedido (surtido), etapa del flujo y avisos (toasts).
 * Alcance de esta rama: surtido (📲 Surtido - Un pedido x ronda, sin revisión). Al finalizar, la etapa pasa a
 * 'revision' solo para mostrar la siguiente tarea (REVISAR PEDIDO CLIENTE, 197:20499) en Asignación de tareas;
 * esa tarea no se puede abrir aquí.
 */
import { createContext, useCallback, useContext, useMemo, useReducer, useState, type Dispatch, type ReactNode } from 'react';
import { estadoInicial, pedidoReducer, type PedidoAction, type PedidoState } from '../domain/pedido';
import type { ToastKind } from '../design-system/components/organisms/Toast/Toast';

export type Etapa = 'surtido' | 'revision';

export type ToastData = { id: number; kind: ToastKind; title: string; message: ReactNode };

type Store = {
  pedido: PedidoState;
  dispatch: Dispatch<PedidoAction>;
  etapa: Etapa;
  setEtapa: (e: Etapa) => void;
  toast: ToastData | null;
  mostrarToast: (t: Omit<ToastData, 'id'>) => void;
  cerrarToast: () => void;
};

const Ctx = createContext<Store | null>(null);

export type Semilla = { pedido?: PedidoState; etapa?: Etapa; toast?: Omit<ToastData, 'id'> };

export function AppStoreProvider({ children, semilla }: { children: ReactNode; semilla?: Semilla }) {
  const [pedido, dispatch] = useReducer(pedidoReducer, undefined, () => semilla?.pedido ?? estadoInicial());
  const [etapa, setEtapa] = useState<Etapa>(semilla?.etapa ?? 'surtido');
  const [toast, setToast] = useState<ToastData | null>(semilla?.toast ? { id: 0, ...semilla.toast } : null);

  const mostrarToast = useCallback((t: Omit<ToastData, 'id'>) => setToast({ id: Date.now(), ...t }), []);
  const cerrarToast = useCallback(() => setToast(null), []);

  const value = useMemo(
    () => ({ pedido, dispatch, etapa, setEtapa, toast, mostrarToast, cerrarToast }),
    [pedido, etapa, toast, mostrarToast, cerrarToast],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore fuera de AppStoreProvider');
  return s;
}
