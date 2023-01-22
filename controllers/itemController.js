const Category = require("../models/category");
const Item = require("../models/item");

const { body, validationResult } = require("express-validator");
const async = require("async")

exports.item_list = (req, res, next) => {
  Item.find({}, "name")
    .sort({ name: 1 })
    .exec(function (err, list_item) {
      if (err) {
        return next(err);
      }
      res.render("item_list", {
        title: "Store Inventory",
        list_item: list_item,
      });
    });
};

exports.item_detail = (req, res, next) => {
  Item.findById(req.params.id)
    .populate("category")
    .exec(function (err, item_details) {
      if (err) {
        return next(err);
      }
      res.render("item_detail", {
        title: item_details.name,
        data: item_details,
      });
    });
};

exports.item_create_get = (req, res, next) => {
  Category.find({}, "name")
    .sort({ name: 1 })
    .exec(function (err, category_names) {
      if (err) {
        return next(err);
      }
      res.render("create_item", {
        title: "Add Item to inventory",
        category_names: category_names,
      });
    });
};

exports.item_create_post = [
  body("name", "Name is required").trim().isLength({ min: 1 }).escape(),
  body("description", "Description required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("category", "Category needed").trim().isLength({ min: 1 }).escape(),
  body("price", "Price needed").trim().isLength({ min: 1 }).escape(),
  body("number_in_stock", "Number in stock needed")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      number_in_stock: req.body.number_in_stock,
      picture: req.file ? req.file.filename : ""
    });
    
    //Need to check error
    if(!errors.isEmpty()) {
      Category.find({}, "name").sort({name: 1}).exec((err, categorys) => {
        if(err) {
          return next(err);
        }
        res.render("create_item", {
          title: "Add Item to Inventory",
          category_names: categorys,
          selected_category: item.category._id,
          item: item,
          errors: errors.array() 
        })
      })
      return;
    }
    item.save((err) => {
      if(err) {
        return next(err);
      }
      res.redirect(item.url);
    })
  },
];

exports.item_delete_get = (req, res, next) => {
  Item.findById(req.params.id)
    .populate("category")
    .exec((err, item_info) => {
      if(err) {
        return next(err);
      }
      if(item_info == null) {
        res.redirect("/inventory/item")
      }
      res.render("delete_item", {
        title: "Delete Item",
        item: item_info
      })
    })
};

exports.item_delete_post = (req, res, next) => {
  Item.findByIdAndRemove(req.body.itemid, (err) => {
    if(err) {
      return next(err);
    }

    res.redirect("/inventory/item");
  })
};

exports.item_update_get = (req, res, next) => {
  async.parallel({
    item_info(callback) {
      Item.findById(req.params.id)
        .populate("category")
        .exec(callback)
    },
    category_list(callback) {
      Category.find({}, "name")
        .sort({name: 1})
        .exec(callback)
    }
  },
  (err, results) => {
    if(err) {
        return next(err);
      }
      if(results.item_info == null) {
        const err = new Error("Item not found");
        err.status = 404;
        return next(err);
      }
      res.render("create_item", {
        title: "Update Item",
        category_names: results.category_list,
        selected_category: results.item_info.category._id,
        item: results.item_info,
      })
  }) 
};

exports.item_update_post = [
  body("name", "Name is required").trim().isLength({ min: 1 }).escape(),
  body("description", "Description required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("category", "Category needed").trim().isLength({ min: 1 }).escape(),
  body("price", "Price needed").trim().isLength({ min: 1 }).escape(),
  body("number_in_stock", "Number in stock needed")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      number_in_stock: req.body.number_in_stock,
      picture: req.file ? req.file.filename : "",
      _id: req.params.id,
    });
    
    //Need to check error
    if(!errors.isEmpty()) {
      Category.find({}, "name").sort({name: 1}).exec((err, categorys) => {
        if(err) {
          return next(err);
        }
        res.render("create_item", {
          title: "Add Item to Inventory",
          category_names: categorys,
          selected_category: item.category._id,
          item: item,
          errors: errors.array()
        })
      })
      return;
    }  

    Item.findByIdAndUpdate(req.params.id, item, {}, (err, theitem) => {
      if(err) {
        return next(err);
      }
      res.redirect(theitem.url);
    })
}];
