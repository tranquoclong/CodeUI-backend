const _ = require("lodash");
const Category = require("../models/category");

exports.getCategory = async (req, res) => {
  const currentPage = req.query.page || 1;
  const perPage = 6;
  let totalItems;
  await Category.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Category.find()
        .skip((currentPage - 1) * perPage)
        .select("_id description img name")
        .limit(perPage)
        .sort({ created: -1 });
    })
    .then((categories) => {
      res.status(200).json(categories);
    })
    .catch((err) => console.log(err));
};

exports.postCategory = (req, res) => {
  let category = new Category(req.body);
  category.save((err, result) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
    res.json(result);
  });
};
