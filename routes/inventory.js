const express = require("express");
const router = express.Router();
const multer = require('multer');

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/images/");
    },
    filename: (req, file, cb) => {
      cb(
        null,
        new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
      );
    },
  });

  const upload = multer({storage: fileStorage});
// const upload = multer({dest: 'uploads/'});

const item = require("../controllers/itemController");
const category = require("../controllers/categoryController");

router.get("/", category.index);

router.get("/item/create", item.item_create_get);

router.post("/item/create", upload.single("picture"), item.item_create_post);

router.get("/item/:id/delete", item.item_delete_get);

router.post("/item/:id/delete", item.item_delete_post);

router.get("/item/:id/update", item.item_update_get);

router.post("/item/:id/update", upload.single("picture"), item.item_update_post);

router.get("/item/:id", item.item_detail);

router.get("/item", item.item_list);


router.get("/category/create", category.category_create_get);

router.post("/category/create", upload.single("picture"), category.category_create_post);

router.get("/category/:id/delete", category.category_delete_get);

router.post("/category/:id/delete", category.category_delete_post);

router.get("/category/:id/update", category.category_update_get);

router.post("/category/:id/update", upload.single("picture"), category.category_update_post);

router.get("/category/:id", category.category_detail);

router.get("/category", category.category_list);

module.exports = router;