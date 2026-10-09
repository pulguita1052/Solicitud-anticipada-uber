import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Menu } from './screens/menu/Menu';
import { AsignacionTareas } from './screens/tareas/AsignacionTareas';
import { SurtidoOrdenes } from './screens/surtido/SurtidoOrdenes';
import { DetalleProducto } from './screens/surtido/DetalleProducto';
import { ToastHost } from './navigation/ToastHost';
import { EscenariosPanel } from './navigation/EscenariosPanel';
import { ProductosCheatsheet } from './navigation/ProductosCheatsheet';

export function App() {
  const { pathname } = useLocation();
  const rutasConPanel = ['/tareas', '/surtido'];
  const mostrarPanel = rutasConPanel.some((r) => pathname.startsWith(r));
  const mostrarProductos = pathname.startsWith('/surtido');
  return (
    <>
      <div className="app-frame">
        <Routes>
          <Route path="/" element={<Navigate to="/menu" replace />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/tareas" element={<AsignacionTareas />} />
          <Route path="/surtido" element={<SurtidoOrdenes />} />
          <Route path="/surtido/producto/:codigo" element={<DetalleProducto />} />
          <Route path="*" element={<Navigate to="/menu" replace />} />
        </Routes>
        <ToastHost />
      </div>
      {mostrarProductos && <ProductosCheatsheet />}
      {mostrarPanel && <EscenariosPanel />}
    </>
  );
}
