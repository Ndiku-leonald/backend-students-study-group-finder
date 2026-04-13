module.exports = {
  apps: [
    {
      name: "study-group-backend",
      cwd: __dirname,
      script: "server.js",
      interpreter: "node",
      env: {
        NODE_ENV: "development"
      }
    }
  ]
};
