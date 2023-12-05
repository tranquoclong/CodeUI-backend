const fs = require("fs");
const _ = require("lodash");
const Account = require("../models/account");

exports.allAccounts = (req, res) => {
  const currentPage = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 20;
  const name = req.query.name || "";
  const ne = req.query.ne;
  let totalItems;
  const filterName = { name: { $regex: name, $options: "i" } };
  const filterNe = { id: { $ne: ne } };
  Account.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Account.find(ne ? filterNe : filterName)
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .sort({ created: -1 });
    })
    .then((accounts) => {
      res.status(200).json({
        totalPage: Math.ceil(totalItems / perPage),
        totalItems,
        perPage,
        currentPage,
        list: accounts,
      });
    })
    .catch((err) => console.log(err));
};
exports.accountById = (req, res) => {
  Account.findOne({ id: req.query.id }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }
    res.status(200).json({
      data: user,
    });
  });
};
