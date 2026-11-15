const router = require("express").Router();
const controller = require("../controllers/productController");

// Put named routes before /:id to avoid route conflicts.
router.get("/low-stock", controller.lowStockReport);
router.get("/summary", controller.categorySummary);
router.patch("/:id/stock", controller.adjustStock);
router.route("/").post(controller.createProduct).get(controller.getProducts);
router.route("/:id").get(controller.getProductById)
  .put(controller.updateProduct).delete(controller.deleteProduct);
module.exports = router;
