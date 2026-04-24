module.exports = {
  apps: [
    {
      name: "backend",
      cwd: "/var/www/html/Habsan/backend",
      script: "app.js",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
        PORT: "8001",
      },
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      time: true,
    },
  ],
};
