import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// viteSingleFile empaqueta todo el simulador en un solo index.html:
// se publica en Cloudflare y, como respaldo, también abre con doble clic sin servidor.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: './'
});
