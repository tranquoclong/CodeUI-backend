const auth = require("./auth");
const post = require("./post");
const user = require("./user");

module.exports = {
  paths: {
    ...auth,
    ...post,
    ...user,
  },
};
