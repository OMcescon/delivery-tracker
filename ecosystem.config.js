module.exports = {
  apps: [
    {
      name: "delivery-tracker",
      script: "server.prod.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      },
      watch: false,
      merge_logs: true,
      error_file: "logs/err.log",
      out_file: "logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    }
  ]
};