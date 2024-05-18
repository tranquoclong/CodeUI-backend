const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const expressJwt = require("express-jwt");
const _ = require("lodash");
const { sendEmail } = require("../helpers");
const axios = require("axios");
dotenv.config();

exports.verifyEmail = (req, res) => {
  if (!req.body) return res.status(400).json({ message: "No request body" });
  if (!req.body.email)
    return res.status(400).json({ message: "No Email in request body" });
  const { email, code } = req.body;
  const emailData = {
    from: "noreply@dragon-cute.com",
    to: email,
    subject: "Password Reset Instructions",
    html: `<p>hi, ${email}</p><p>code: ${code}</p>`,
  };
  sendEmail(emailData);
  res.status(200).json({
    message: `Email has been sent to ${email}. Follow the instructions to reset your password.`,
  });
};

exports.signIn = async (req, res) => {
  const { code } = req.query;
  const params =
    "?client_id=fac8f66eb69598dd2c8b" +
    // process.env.CLIENT_ID +
    "&client_secret=684f3a8735ce9939b9587d1d251a3ac26267153c" +
    // process.env.CLIENT_SECRET +
    "&code=" +
    code;
  await axios({
    method: "GET",
    url: "https://github.com/login/oauth/access_token" + params,
    headers: { Accept: "application/json" },
  }).then((response) => {
    if (response.data.access_token) {
      axios({
        method: "GET",
        url: "https://api.github.com/user",
        headers: { Authorization: "Bearer " + response.data.access_token },
      }).then((response) => {
        User.findOne({ node_id: response.data.node_id }, (err, user) => {
          if (err || !user) {
            const user = new User({
              node_id: response.data.node_id,
              login: response.data.login,
              name: response.data.name,
              email: response.data.email || "codeui",
              avatar_url: response.data.avatar_url,
              bio: response.data.bio || "",
              location: response.data.location || "",
              company: response.data.company || "",
              html_url: response.data.html_url,
            });
            user.save();
            const token = jwt.sign(
              { _id: user._id, role: user.role },
              process.env.JWT_SECRET
            );
            return res.json({ token });
          }
          const token = jwt.sign(
            { _id: user._id, role: user.role },
            process.env.JWT_SECRET
          );
          return res.json({ token });
        });
      });
    }
  });
};

exports.signOut = (req, res) => {
  res.clearCookie("t");
  return res.json({ message: "SignOut success!" });
};

exports.requireSignIn = () => {
  return expressJwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
    userProperty: "auth",
  });
};
// exports.requireSignIn = expressJwt({
//   secret: process.env.JWT_SECRET,
//   algorithms: ["HS256"],
//   userProperty: "auth",
// });
