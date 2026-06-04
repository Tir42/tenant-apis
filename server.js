const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./db");

dotenv.config();

const app = express();
const userRoutes = require("./user.routes");
const propertyRoutes = require("./property.routes");
const inspectionRoutes = require("./inspection.routes");
const uploadRoutes = require("./upload.routes");

app.use('/uploads', express.static('uploads'));



app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/users", userRoutes);
app.use("/api/property", propertyRoutes);
app.use("/api/inspection", inspectionRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/", (req, res) => {
  res.send("Tenant APIs running successfully");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});