const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/products.routes");
const movementRoutes = require("./routes/movements.routes");
const reportRoutes = require("./routes/reports.routes");

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:4173',
    /\.render\.com$/,
  ],
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/movements", movementRoutes);
app.use("/api/reports", reportRoutes);

if (process.env.NODE_ENV === "production") {
  const staticPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(staticPath));

  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });
}

// 404 handler for API routes and missing assets
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

module.exports = app;
