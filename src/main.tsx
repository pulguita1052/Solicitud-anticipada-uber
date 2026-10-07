import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import '@fontsource/roboto/100.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/700.css';
import './styles/global.css';
import { App } from './App';
import { AppStoreProvider } from './store/AppStore';
import { semillaDesdeUrl } from './navigation/escenarios';
import { AbrirEscenarioCtx, MODO_ARTIFACT, SincronizarQuery } from './navigation/query';

/** Vista previa como Artifact: sin rutas de navegador; cada escenario re-monta la app con su semilla. */
function RaizArtifact() {
  const [entrada, setEntrada] = useState({ url: '/menu', n: 0 });
  const search = entrada.url.includes('?') ? entrada.url.slice(entrada.url.indexOf('?')) : '';
  return (
    <AbrirEscenarioCtx.Provider value={(url) => setEntrada((e) => ({ url, n: e.n + 1 }))}>
      <MemoryRouter key={entrada.n} initialEntries={[entrada.url]}>
        <SincronizarQuery />
        <AppStoreProvider semilla={semillaDesdeUrl(search)}>
          <App />
        </AppStoreProvider>
      </MemoryRouter>
    </AbrirEscenarioCtx.Provider>
  );
}

const semilla = MODO_ARTIFACT ? undefined : semillaDesdeUrl();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {MODO_ARTIFACT ? (
      <RaizArtifact />
    ) : (
      /* En GitHub Pages el sitio vive bajo /Solicitud-anticipada-uber/; BASE_URL viene de vite.config. */
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <SincronizarQuery />
        <AppStoreProvider semilla={semilla}>
          <App />
        </AppStoreProvider>
      </BrowserRouter>
    )}
  </StrictMode>,
);

if ('serviceWorker' in navigator && import.meta.env.PROD && !MODO_ARTIFACT) {
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => undefined);
}
