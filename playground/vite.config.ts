import { defineConfig, searchForWorkspaceRoot } from 'vite';
import { fileURLToPath, URL } from 'url';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@websublime/essential': fileURLToPath(new URL('../src/index', import.meta.url)),
    }
  },
  server: {
    fs: {
      allow: [searchForWorkspaceRoot(resolve('../'))]
    }
  }
});
