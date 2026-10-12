// Casos de verificación visual: ruta + escenario de la app ↔ frame de Figma (docs/figma/cache/frames/<nodeId>.png).
// Rama feature-rechazar-traspaso: frames de ❌ Negar totalidad traspaso (6874:864). Los productos del mock son los de
// Figma, así que estas pantallas sí se comparan píxel a píxel.

const menu = (page) => page.getByRole('button', { name: 'Menú', exact: true }).last().click();
const rechazar = async (page) => {
  await menu(page);
  await page.waitForTimeout(900);
  await page.getByRole('button', { name: 'Rechazar traspaso' }).click();
};
const motivo = async (page) => {
  await rechazar(page);
  await page.waitForTimeout(900);
  await page.getByRole('button', { name: 'Aceptar' }).click();
};

export const CASOS = [
  { id: 'menu', figma: '3048:10103', url: '/menu' },

  /* Propuesta #1 */
  { id: 'p1-tareas', figma: '7020:21323', url: '/tareas?escenario=p1-tareas' },
  { id: 'p1-surtido', figma: '7020:22451', url: '/surtido?escenario=p1-inicio' },
  { id: 'p1-menu', figma: '7020:25284', url: '/surtido?escenario=p1-inicio', acciones: menu },
  { id: 'p1-rechazar', figma: '7020:25471', url: '/surtido?escenario=p1-inicio', acciones: rechazar },
  { id: 'p1-motivo', figma: '7040:25851', url: '/surtido?escenario=p1-inicio', acciones: motivo },

  /* Propuesta #2 */
  { id: 'p2-surtido', figma: '7053:26345', url: '/surtido?escenario=p2-inicio' },
  { id: 'p2-parcial', figma: '7053:27466', url: '/surtido?escenario=p2-parcial' },
  { id: 'p2-menu', figma: '7053:26392', url: '/surtido?escenario=p2-inicio', acciones: menu },
  { id: 'p2-rechazar', figma: '7053:26457', url: '/surtido?escenario=p2-inicio', acciones: rechazar },
];
