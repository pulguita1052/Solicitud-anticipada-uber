import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Menu } from './screens/menu/Menu';
import { AsignacionTareas } from './screens/tareas/AsignacionTareas';
import { SurtidoOrdenes } from './screens/surtido/SurtidoOrdenes';
import { SurtidoUnificado } from './screens/surtido/SurtidoUnificado';
import { DetalleProducto } from './screens/surtido/DetalleProducto';
import { useStore } from './store/AppStore';
import { DatosFactura } from './screens/facturacion/DatosFactura';
import { DatosTraspaso } from './screens/traspaso/DatosTraspaso';
import { Configuraciones } from './screens/configuraciones/Configuraciones';
import { Sonido } from './screens/configuraciones/Sonido';
import { Impresion } from './screens/configuraciones/Impresion';
import { SolicitudUber } from './screens/uber/SolicitudUber';
import { ToastHost } from './navigation/ToastHost';
import { EscenariosPanel } from './navigation/EscenariosPanel';
import { ProductosCheatsheet } from './navigation/ProductosCheatsheet';

export function App() {
  const { pathname } = useLocation();
  const { etapa } = useStore();
  const rutasConPanel = ['/tareas', '/surtido', '/facturacion', '/traspaso', '/embarque', '/uber'];
  const mostrarPanel = rutasConPanel.some((r) => pathname.startsWith(r));
  const mostrarProductos = pathname.startsWith('/surtido');
  return (
    <>
      <div className="app-frame">
        <Routes>
          <Route path="/" element={<Navigate to="/menu" replace />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/tareas" element={<AsignacionTareas />} />
          <Route path="/surtido" element={etapa === 'surtido-unificado' ? <SurtidoUnificado /> : <SurtidoOrdenes />} />
          <Route path="/surtido/producto/:codigo" element={<DetalleProducto />} />
          <Route path="/facturacion" element={<DatosFactura />} />
          <Route path="/traspaso" element={<DatosTraspaso />} />
          {/* Embarque vive dentro de DatosFactura como overlay (Figma no lo separa como pantalla). */}
          <Route path="/embarque" element={<DatosFactura />} />
          <Route path="/configuraciones" element={<Configuraciones />} />
          <Route path="/configuraciones/sonido" element={<Sonido />} />
          <Route path="/configuraciones/impresion" element={<Impresion />} />
          <Route path="/uber" element={<SolicitudUber />} />
          <Route path="*" element={<Navigate to="/menu" replace />} />
        </Routes>
        <ToastHost />
      </div>
      {mostrarProductos && <ProductosCheatsheet />}
      {mostrarPanel && <EscenariosPanel />}
    </>
  );
}
