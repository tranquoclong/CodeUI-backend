const dotenv = require("dotenv");
const _ = require("lodash");
const axios = require("axios");
dotenv.config();

exports.convert = async (req, res) => {
  const { type, css, scss } = req.body;
  switch (type) {
    case "scss":
      axios({
        method: "POST",
        url: "https://webtoolfree.com/api/v1/features/css-to-scss/convert",
        withCredentials: false,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: {
          input: css,
          options: { indent: 2 },
        },
      })
        .then((response) => {
          console.log("css");
          return res.json(response.data);
        })
        .catch((err) => {
          console.error(err);
        });
      break;
    case "css":
      axios({
        method: "POST",
        url: "https://webtoolfree.com/api/v1/features/scss-to-css/convert",
        withCredentials: false,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: {
          input: scss,
          options: { indent: 2, style: "expanded" },
        },
      })
        .then((response) => {
          console.log("scss");
          return res.json(response.data);
        })
        .catch((err) => {
          console.error(err);
        });
      break;
    default:
      break;
  }
};

exports.goldPrice = async (req, res) => {
  axios({
    method: "GET",
    url: "http://api.btmc.vn/api/BTMCAPI/getpricebtmc?key=3kd8ub1llcg9t45hnoh8hmn7t5kc2v",
    withCredentials: false,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
    .then((response) => {
      return res.json(response.data);
    })
    .catch((err) => {
      console.error(err);
    });
};
