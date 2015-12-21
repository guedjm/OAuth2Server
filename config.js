
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
    session_secret: "fezfezgzekrgeger",
    fullUrl: "http://login.example.local:3000"
  },
  auth: {
    accessCodeDuration: 10
  },
  test: {
    client: {
      client_id: "4a593f6f67d86099264e5f00e30de8fb4c95f182",
      client_secret: "e2e04574198b7a031aae79cd5f48b29d20242f17",
      client_redirect_uri: "http://google.fr"
    },
    user: {
      email: 't@gmail.com',
      password: 'toto'
    }
  }
};