const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Product name is required"], trim: true, minlength: 2, maxlength: 100 },
  sku: { type: String, required: [true, "SKU is required"], unique: true, trim: true, uppercase: true, minlength: 3, maxlength: 30 },
  category: { type: String, required: [true, "Category is required"], trim: true, maxlength: 60 },
  price: { type: Number, required: true, min: [0, "Price cannot be negative"] },
  quantity: { type: Number, required: true, min: [0, "Quantity cannot be negative"], validate: Number.isInteger },
  reorderLevel: { type: Number, required: true, min: 0, validate: Number.isInteger },
  supplier: { type: String, trim: true, maxlength: 100, default: "Not specified" }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

productSchema.virtual("stockValue").get(function () {
  return Number((this.price * this.quantity).toFixed(2));
});
module.exports = mongoose.model("Product", productSchema);
