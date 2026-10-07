/**
 * Estado global: pedido (surtido/revisión), etapa del flujo y avisos (toasts).
 * Flujo definido por el usuario: surtido y revisión → factura → embarque → solicitud anticipada de Uber.
 * Flujo de traspaso: surtido y revisión → datos del traspaso (sin factura) → embarque → Uber.
 */
import { createContext, useCallback, useContext, useMemo, useReducer, useState, type Dispatch, type ReactNode } from 'react';
import { estadoInicial, pedidoReducer, type PedidoAction, type PedidoState } from '../domain/pedido';
import type { ToastKind } from '../design-system/components/organisms/Toast/Toast';

export type Etapa = 'surtido' | 'surtido-unificado' | 'facturacion' | 'traspaso' | 'embarque' | 'uber';

export type ToastData = { id: number; kind: ToastKind; title: string; message: string };

export type FacturaState = {
  folio?: string;
  embarque?: { numero: string; facturas: number; fecha: string };
  copias: number;
  direccionEntrega: number;
};

type Store = {
  pedido: PedidoState;
  dispatch: Dispatch<PedidoAction>;
  etapa: Etapa;
  setEtapa: (e: Etapa) => void;
  factura: FacturaState;
  setFactura: (f: (prev: FacturaState) => FacturaState) => void;
  toast: ToastData | null;
  mostrarToast: (t: Omit<ToastData, 'id'>) => void;
  cerrarToast: () => void;
};

const Ctx = createContext<Store | null>(null);

export type Semilla = { pedido?: PedidoState; etapa?: Etapa; factura?: Partial<FacturaState>; toast?: Omit<ToastData, 'id'> };

export function AppStoreProvider({ children, semilla }: { children: ReactNode; semilla?: Semilla }) {
  const [pedido, dispatch] = useReducer(pedidoReducer, undefined, () => semilla?.pedido ?? estadoInicial());
  const [etapa, setEtapa] = useState<Etapa>(semilla?.etapa ?? 'surtido');
  const [factura, setFacturaState] = useState<FacturaState>({ copias: 1, direccionEntrega: 1, ...semilla?.factura });
  const [toast, setToast] = useState<ToastData | null>(semilla?.toast ? { id: 0, ...semilla.toast } : null);

  const mostrarToast = useCallback((t: Omit<ToastData, 'id'>) => setToast({ id: Date.now(), ...t }), []);
  const cerrarToast = useCallback(() => setToast(null), []);
  const setFactura = useCallback((f: (prev: FacturaState) => FacturaState) => setFacturaState(f), []);

  const value = useMemo(
    () => ({ pedido, dispatch, etapa, setEtapa, factura, setFactura, toast, mostrarToast, cerrarToast }),
    [pedido, etapa, factura, setFactura, toast, mostrarToast, cerrarToast],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore fuera de AppStoreProvider');
  return s;
}
