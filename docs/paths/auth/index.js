const signIn = require("./signIn");
const signUp = require("./signUp");
module.exports = {
  "/signIn": {
    ...signIn,
  },
  "/signUp": {
    ...signUp,
  },
};
