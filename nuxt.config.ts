export default defineNuxtConfig({
  ssr: false,
  srcDir: 'app/',
  modules: ['@pinia/nuxt'],
  css: ['~/assets/css/tokens.css'],
  app: {
    head: {
      title: 'МедиаПлан Pro — Калькулятор Яндекс.Директ',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap' }
      ],
      script: [
        { src: 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js', defer: true }
      ]
    }
  },
  typescript: {
    strict: false
  }
})
