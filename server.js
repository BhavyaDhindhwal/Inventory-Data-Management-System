require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.json({
  success: true,
  message: "Inventory and Data Management System API",
  endpoints: ["/api/products", "/api/products/low-stock", "/api/products/summary"]
}));
app.get("/api/health", (req, res) => res.json({ success: true }));
app.use("/api/products", require("./routes/productRoutes"));
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
}).catch(error => {
  console.error("Application startup failed:", error.message);
  process.exit(1);
});
