const getAllUser = require("./getAllUser");
const getUserById = require("./getUserById");
module.exports = {
  "/users": {
    ...getAllUser,
  },
  "/user/{userId}": {
    ...getUserById,
  },
};
