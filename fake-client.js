const axios = require('axios');
//const { response } = require('express');

// Create an axios instance with alias
const instance = axios.create({
  baseURL: 'http://localhost:3000/api/',
});

console.log('Trying to login');

let refreshToken;

// Try to login
instance
  .post('/login', {
    email: 'EmmaDaBest@FBI.GOV',  // test false email : error 401
    password: 'EmmaInZMoon',
  })
  .then((response) => {
    console.log('Auth success : ', response.data);

    instance.defaults.headers.common['authorization'] = `Bearer ${response.data.accessToken}`; // test : modifiy the bearer with 'Bearer dfgdf' : the auth works but the token is invalid 401
    refreshToken = response.data.refreshToken;
    loadUserInfos();  // call user infos after login
  })
  .catch((err) => {
    console.log(err.response.status);  // if errors 401
  });

function loadUserInfos() {
  instance
    .get('/user')
    .then((response) => {
      console.log('User infos : ', response.data);
    })
    .catch((err) => {
      console.log(err.response.status);  // if errors 401
    });
}

// If we have a valid token it will work but if we have an invalid token it will not work, it is expired so we need to refresh the token
// We need to send the refresh token to the server to get a new access token
// FOR REFRESH TOKEN : we will intercept the response and check if the token is expired
instance.interceptors.response.use(
  (response) => {
    return response;  // when everything is ok, we just return the response
  },
  async (error) => {
    const originalRequest = error.config;  // we get the original request that was sent to the server
    if (
      error.config.url != '/refreshToken' &&  // to avoid infinite loop
      error.response.status === 401 && // to avoid dealing with other errors
      originalRequest._retry !== true  // to avoid infinite loop if it is the same request that has initiate the error
    ) {
      originalRequest._retry = true;   // if it execute again we won't enter again : ie the refresh doesn't work
      if (refreshToken && refreshToken != '') {  // if we have a refresh token and it is not empty
        instance.defaults.headers.common['authorization'] = `Bearer ${refreshToken}`;  // we add the refresh token to the header
        console.log('refresh token');
        await instance // we send the request to the server to get a new access token
          .post('/refreshToken')
          .then((response) => {
            instance.defaults.headers.common['authorization'] = `Bearer ${response.data.accessToken}`; // if it succeed we update the access token
            originalRequest.headers['authorization'] = `Bearer ${response.data.accessToken}`; // we update the original request with the new access token
          })
          .catch((error) => {
            console.log(error.response.status); // 401
            refreshToken = null;  // so that will not enter again in the loop, it is not valid anymore
          });
        return instance(originalRequest); // we send the original request with the new access token, to reload it again
      }
    }
  }
);

