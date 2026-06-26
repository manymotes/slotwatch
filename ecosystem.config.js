module.exports = {
  apps: [
    {
      name: 'watcher',
      script: '/app/watcher/dist/index.js',
      env: {
        DATA_DIR: '/data',
        NODE_ENV: 'production'
      }
    },
    {
      name: 'dashboard',
      script: '/app/dashboard/dist/server.js',
      env: {
        DATA_DIR: '/data',
        PORT: '3001',
        NODE_ENV: 'production'
      }
    }
  ]
}
