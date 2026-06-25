const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = require("./config/db");

dotenv.config();

const app = express();
const userRoutes = require("./routes/user.routes");
const propertyRoutes = require("./routes/property.routes");
const inspectionRoutes = require("./routes/inspection.routes");
const uploadRoutes = require("./routes/upload.routes");

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));



app.use(cors());
app.use(express.json());

// Request/Response Logger Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Body:", JSON.stringify(req.body));

  const oldWrite = res.write;
  const oldEnd = res.end;
  const chunks = [];

  res.write = (...args) => {
    chunks.push(Buffer.from(args[0]));
    return oldWrite.apply(res, args);
  };

  res.end = (...args) => {
    if (args[0]) {
      chunks.push(Buffer.from(args[0]));
    }
    const body = Buffer.concat(chunks).toString('utf8');
    console.log(`Response Status: ${res.statusCode}`);
    console.log(`Response Body: ${body}`);
    console.log("-----------------------------------------");
    return oldEnd.apply(res, args);
  };

  next();
});

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