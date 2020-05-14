const OAuth2Server = require('oauth2-server');
const Request = OAuth2Server.Request;
const Response = OAuth2Server.Response;

const oauth = new OAuth2Server({
  model: require('./model/userSchema')
})

let request = new Request({
  /*
  method: 'GET',
  query: {},
  headers: {Authorization: 'Bearer foobar'}
  */
})

let response = new Response({
  headers: {}
})

oauth.authenticate(request, response)
  .then((token) => {
    // The request was successfully authenticated.
  })
  .catch((err) => {
    // The request failed authentication.
  })
