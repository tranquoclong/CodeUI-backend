const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const expressJwt = require("express-jwt");
const _ = require("lodash");
const { OAuth2Client } = require("google-auth-library");
const { sendEmail } = require("../helpers");
const axios = require("axios");
dotenv.config();

const CLIENT_ID = "fac8f66eb69598dd2c8b";
const CLIENT_SECRET = "d9db2ad94b6bd486ef3330810d9d3cc4e6edd8ad";

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
    "?client_id=" +
    CLIENT_ID +
    "&client_secret=" +
    CLIENT_SECRET +
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
              email: response.data.email ? response.data.email : "red",
              avatar_url: response.data.avatar_url,
              bio: response.data.bio ? response.data.bio : "",
              location: response.data.location ? response.data.location : "",
              company: response.data.company ? response.data.company : "",
              html_url: response.data.html_url,
            });
            user.save();
            const token = jwt.sign(
              { _id: user._id, role: user.role },
              process.env.JWT_SECRET
            );
            res.cookie("t", token, { expire: new Date() + 9999 });
            const {
              login,
              name,
              email,
              avatar_url,
              bio,
              location,
              company,
              html_url,
            } = user;
            return res.json({
              token,
              user: {
                login,
                name,
                email,
                avatar_url,
                bio,
                location,
                company,
                html_url,
              },
            });
          }
          const token = jwt.sign(
            { _id: user._id, role: user.role },
            process.env.JWT_SECRET
          );
          res.cookie("t", token, { expire: new Date() + 9999 });
          const {
            login,
            name,
            email,
            avatar_url,
            bio,
            location,
            company,
            html_url,
          } = user;
          return res.json({
            token,
            user: {
              login,
              name,
              email,
              avatar_url,
              bio,
              location,
              company,
              html_url,
            },
          });
        });
      });
    }
  });
};

exports.signOut = (req, res) => {
  res.clearCookie("t");
  return res.json({ message: "SignOut success!" });
};

exports.requireSignIn = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
  userProperty: "auth",
});
