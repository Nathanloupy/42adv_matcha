import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	server: {
		proxy: {
			'/api': {
				target: 'http://backend:8000',
				changeOrigin: true,
			},
		},
		allowedHosts: ['k0r4p14'],
	},
	resolve: {
		alias: {
			'@': '/src'
		}
	}
})
