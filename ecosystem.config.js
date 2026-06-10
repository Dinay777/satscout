module.exports = {
  apps: [{
    name: 'satscout-backend',
    script: 'server.js',
    instances: 1,          // single instance — claude-cli is stateful per-process
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',

    env_production: {
      NODE_ENV: 'production',
      PROVIDER: 'gemini',
      GEMINI_MODEL: 'gemini-2.5-flash',
      MAX_CONCURRENT: '10',
    },

    // Log config
    out_file: '/home/satscout/logs/out.log',
    error_file: '/home/satscout/logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,

    // Auto-restart on crash, but back off if crashing repeatedly
    restart_delay: 3000,
    max_restarts: 10,
    min_uptime: '10s',
  }],
};
