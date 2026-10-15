/**
 * Toasts "Cantidad inválida" — 131:6181 (mayor a la solicitada) · 986:3915 (cantidad cero) · 188:10280 (mayor a la
 * existencia). Con las negritas de las capturas del usuario (2026-10-15). Se usan en el surtido de un pedido y en la ronda.
 */
const toast = (message: JSX.Element) => ({ kind: 'error' as const, title: 'Cantidad inválida', message });

export const TOAST_CANTIDAD = {
  mayorSolicitada: toast(
    <>
      La cantidad que intentas ingresar es <b>mayor a la solicitada</b>. Por favor, ingresa una cantidad igual o menor.
    </>,
  ),
  cero: toast(
    <>
      No es posible surtir un producto con <b>cantidad cero</b>. Por favor, ingresa una cantidad mayor.
    </>,
  ),
  mayorExistencia: toast(
    <>
      La cantidad que intentas ingresar es <b>mayor a la existencia actual</b>. Por favor, ingresa una cantidad igual o menor.
    </>,
  ),
};
