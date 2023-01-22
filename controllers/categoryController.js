const Category = require("../models/category");
const Item = require("../models/item");

const async = require("async");
const { body, validationResult } = require("express-validator");

exports.index = (req, res) => {
  async.parallel(
    {
      category_count(callback) {
        Category.countDocuments({}, callback);
      },
      item_count(callback) {
        Item.countDocuments({}, callback);
      },
    },
    (err, results) => {
      res.render("index", {
        title: "Grocery Inventory",
        error: err,
        data: results,
      });
    }
  );
};

exports.category_list = (req, res, next) => {
  Category.find({}, "name")
    .sort({ name: 1 })
    .exec(function (err, list_category) {
      if (err) {
        return next(err);
      }
      res.render("category_list", {
        title: "List of Categories",
        list_category: list_category,
      });
    });
};

exports.category_detail = (req, res, next) => {
  async.parallel(
    {
      category_name(callback) {
        Category.findById(req.params.id).exec(callback);
      },
      category_items(callback) {
        Item.find({ category: req.params.id }, "name")
          .populate("category")
          .sort({ name: 1 })
          .exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.render("category_items", {
        title: `${results.category_name.name} Items`,
        item_category: results.category_items,
        category_name: results.category_name,
      });
    }
  );
};

exports.category_create_get = (req, res) => {
  res.render("create_category", { title: "Create New Category" });
};

exports.category_create_post = [
  body("name", "Category name required").trim().isLength({ min: 1 }).escape(),
  body("description", "Description needed")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    console.log(req.file);

    const category = new Category({
      name: req.body.name,
      description: req.body.description,
      picture: req.file ? req.file.filename : '',
    });

    if (!errors.isEmpty()) {
      res.render("create_category", {
        title: "Create New Category",
        category,
        errors: errors.array(),
      });
      return;
    } else {
      //Check if category already exists
      Category.findOne({ name: req.body.name }).exec((err, category_found) => {
        if (err) {
          return next(err);
        }

        if (category_found) {
          res.redirect(category_found.url);
        } else {
          category.save((err) => {
            if (err) {
              return next(err);
            }
            res.redirect(category.url);
          });
        }
      });
    }
  },
];

exports.category_delete_get = (req, res, next) => {
  async.parallel(
    {
      category_info(callback) {
        Category.findById(req.params.id).exec(callback);
      },
      category_items(callback) {
        Item.find({ category: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.category_items == null) {
        res.redirect("/inventory/category");
      }
      res.render("delete_category", {
        title: "Delete Category",
        category: results.category_info,
        items: results.category_items,
      });
    }
  );
};

exports.category_delete_post = (req, res, next) => {
  async.parallel(
    {
      category_info(callback) {
        Category.findById(req.body.categoryid).exec(callback);
      },
      category_item(callback) {
        Item.find({ category: req.body.categoryid }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.category_item.length > 0) {
        res.render("delete_category", {
          title: "Delete Category",
          category: results.category_info,
          items: results.category_item,
        });
        return;
      }
      Category.findByIdAndRemove(req.body.categoryid, (err) => {
        if (err) {
          return next(err);
        }
        res.redirect("/inventory/category");
      });
    }
  );
};

exports.category_update_get = (req, res, next) => {
  Category.findById(req.params.id).exec((err, category) => {
    if (err) {
      return next(err);
    }
    if (category == null) {
      const err = new Error("Category not found.");
      err.status = 404;
      return next(err);
    }
    res.render("create_category", {
      title: "Update Category",
      category: category,
    });
  });
};

exports.category_update_post = [
  body("name", "Category name required").trim().isLength({ min: 1 }).escape(),
  body("description", "Description needed")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    console.log(req.body)
    
    const category = new Category({
      name: req.body.name,
      description: req.body.description,
      picture: req.file ? req.file.filename : '',
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.render("create_category", {
        title: "Update Category",
        category,
        errors: errors.array(),
      });
      return;
    }

    Category.findByIdAndUpdate(
      req.params.id,
      category,
      {},
      (err, thecategory) => {
        if (err) {
          return next(err);
        }
        res.redirect(thecategory.url);
      }
    );
  },
];
