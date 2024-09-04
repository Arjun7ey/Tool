import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',  // or '127.0.0.1'
    port: 3000,          // or any other port you prefer
  },
});
