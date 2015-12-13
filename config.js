
module.exports = {
  database: {
    server: "localhost",
    port: 27017,
    database: "login"
  },
  server: {
    vhost: false,
    port: 3000,
    url: "login.example.local",
    session_secret: "fezfezgzekrgeger"
  },
  auth: {
    accessCodeDuration: 10
  }
};