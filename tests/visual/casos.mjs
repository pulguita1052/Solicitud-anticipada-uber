// Casos de verificación visual: ruta + escenario de la app ↔ frame de Figma (docs/figma/cache/frames/<nodeId>.png).
// Las pantallas de surtido no se comparan píxel a píxel: los frames de 📲 Surtido - Un pedido x ronda (24:16) muestran
// un pedido de 11 productos y el mock de la demo tiene 2. Se verifican visualmente contra docs/figma/cache/surtido/.
export const CASOS = [{ id: 'menu', figma: '3048:10103', url: '/menu' }];
