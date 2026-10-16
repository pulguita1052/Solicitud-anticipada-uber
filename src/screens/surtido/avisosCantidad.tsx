/**
 * Toasts "Cantidad inválida" — 131:6181 (mayor a la solicitada) · 986:3915 (cantidad cero) · 188:10280 (mayor a la
 * existencia). Con las negritas de las capturas del usuario (2026-10-15). Se usan en el surtido de un pedido y en la ronda.
 * "Escaneo sobrante" — 4762:2069 (🔎 Revisión - Independiente): se escanea un código que ya está completo.
 */
const toast = (message: JSX.Element) => ({ kind: 'error' as const, title: 'Cantidad inválida', message });

export const TOAST_ESCANEO_SOBRANTE = {
  kind: 'error' as const,
  title: 'Escaneo sobrante',
  message: (
    <>
      La cantidad ingresada es <b>mayor a la cantidad surtida</b>. Por favor, ingresa una cantidad menor.
    </>
  ),
};

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
