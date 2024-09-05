import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => {
  const config = {
    plugins: [react()],
    server: {
      host: 'localhost',  // or '127.0.0.1'
      port: 3000,         // or any other port you prefer
    },
  };

  if (command !== 'serve') {
    config.build = {
      manifest: true,
      outDir: 'dist',
      rollupOptions: {
        input: 'src/main.jsx'  // Adjust this if your main file has a different name/path
      }
    };
  }

  return config;
});