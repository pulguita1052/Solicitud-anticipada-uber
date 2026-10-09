// Casos de verificación visual: ruta + escenario de la app ↔ frame de Figma (docs/figma/cache/frames/<nodeId>.png).
export const CASOS = [
  { id: 'menu', figma: '3048:10103', url: '/menu' },
  { id: 'asignacion-surtido', figma: '3048:10014', url: '/tareas?escenario=inicial' },
  { id: 'surtido-inicial', figma: '3048:10138', url: '/surtido?escenario=inicial' },
  { id: 'surtido-revisado-1964000', figma: '3086:11303', url: '/surtido?escenario=revisado-1964000', espera: 400 },
  { id: 'surtido-parcial-2546000', figma: '3089:13509', url: '/surtido?escenario=parcial-2546000' },
  { id: 'detalle-1964000', figma: '3199:6362', url: '/surtido/producto/1964000?escenario=revisado-1964000' },
  { id: 'detalle-2546000-parcial', figma: '3091:14568', url: '/surtido/producto/2546000?escenario=parcial-2546000' },
];
