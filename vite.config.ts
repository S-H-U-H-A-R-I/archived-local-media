import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		host: '0.0.0.0',
		port: 50100,
		strictPort: true
	},
	preview: {
		host: '0.0.0.0',
		port: 50100,
	},
	optimizeDeps: {
		exclude: []
	},
	build: {
		commonjsOptions: {
			transformMixedEsModules: true
		}
	}
});
