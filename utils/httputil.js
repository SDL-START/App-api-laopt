const axios = require("axios");

// Add a request interceptor
axios.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
axios.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
  }
);

const httputil = {};
httputil.post = async function (url, param, headers) {
  return await axios.post(url, param, { headers: headers });
};

httputil.get = async function (url, param, headers) {
  // return await axios.get(url, { headers: headers });
  return await axios({
    method: "get",
    url: url,
    data: param,
    headers: headers,
  });
};
module.exports = httputil;
