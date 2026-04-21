module.exports = {
  apps: [
    {
      name: 'daria-mediaplan',
      script: '.output/server/index.mjs',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
        PORT: 3050,
        HOST: '0.0.0.0'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M'
    }
  ]
}
