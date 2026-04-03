import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function ofacProxyPlugin() {
  return {
    name: 'ofac-proxy',
    configureServer(server) {
      server.middlewares.use('/api/changes/latest', async (_req, res) => {
        try {
          const response = await fetch('https://sanctionslistservice.ofac.treas.gov/changes/latest')
          const text = await response.text()
          res.setHeader('Content-Type', 'text/xml')
          res.end(text)
        } catch (err) {
          res.statusCode = 500
          res.end('Error fetching sanctions data')
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    ofacProxyPlugin(),
  ],
})
