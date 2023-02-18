const axios = require("axios");

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
    ] = `Bearer dfgdf${res.data.accessToken}`;
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
