module.exports = {
  apps: [
    {
      name: 'health-monitor',
      script: 'scripts/health-check.ts',
      interpreter: 'npx',
      interpreter_args: 'ts-node',
      cron_restart: '0 */4 * * *',  // Every 4 hours
      autorestart: false,
      watch: false,
    }
  ]
}
