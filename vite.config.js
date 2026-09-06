import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  build: {
    emptyOutDir: true,
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        services: resolve(__dirname, 'services.html'),
        accounts: resolve(__dirname, 'accounts.html'),
        orders: resolve(__dirname, 'orders.html'),
        whyUs: resolve(__dirname, 'why-us.html'),
        faq: resolve(__dirname, 'faq.html'),
        order: resolve(__dirname, 'order.html'),
        admin: resolve(__dirname, 'admin.html'),
        login: resolve(__dirname, 'login.html'),
        signup: resolve(__dirname, 'signup.html'),
        notFound: resolve(__dirname, '404.html'),
        thankYou: resolve(__dirname, 'thank-you.html'),
        privacy: resolve(__dirname, 'privacy.html'),
      },
    },
  },
});
