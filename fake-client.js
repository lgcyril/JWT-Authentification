const axios = require("axios");
const { response } = require("express");

const instance = axios.create({
  baseURL: "http://localhost:3000/api/",
});

console.log("Trying to login");

let refreshedToken;

instance
  .post("/login", {
    email: "EmmaDaBest@FBI.GOV",
    password: "EmmaInZMoon",
  })
  .then((res) => {
    console.log("Auth success : ", res.data);

    instance.defaults.headers.common[
      "Authorization"
    ] = `Bearer dfgdf${res.data.accessToken}`;  // test : modifiy the bearer with "Bearer dfgdf"
    refreshedToken = res.data.refreshToken;
    loadUserInfos();
  })
  .catch((err) => {
    console.log(err.response.status);
  });

function loadUserInfos() {
  instance
    .get("/user")
    .then((res) => {
      console.log("User infos : ", res.data);
    })
    .catch((err) => {
      console.log(err.response.status);
    });
}

// Ig we have a valid token it will work but if we have a invalid token it will not work
// So we need to refresh the token
// FOR REFRESH TOKEN
instance.interceptors.response.use(response => response, error => {
  const originalRequest = error.config;
  if (error.response.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    return instance.post('/refresh', {
      refreshToken: refreshedToken
    }).then(res => {
      if (res.status === 201) {
        console.log('New access token generated');
        instance.defaults.headers.common['Authorization'] = `Bearer ${res.data.accessToken}`;
        return instance(originalRequest);
      }
    })
  }
  return Promise.reject(error);
}