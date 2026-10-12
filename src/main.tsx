import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@fontsource/roboto/100.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/600.css';
import '@fontsource/roboto/700.css';
import './styles/global.css';
import { App } from './App';
import { AppStoreProvider } from './store/AppStore';
import { semillaDesdeUrl } from './navigation/escenarios';

const semilla = semillaDesdeUrl();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* En GitHub Pages el sitio vive bajo /Solicitud-anticipada-uber/; BASE_URL viene de vite.config. */}
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppStoreProvider semilla={semilla}>
        <App />
      </AppStoreProvider>
    </BrowserRouter>
  </StrictMode>,
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => undefined);
}
