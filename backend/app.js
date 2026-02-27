import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import db from "./configs/models/mongoose.js";
import { app, server } from "./socket.js";
// import seedRoutes from "./admin/routes/protect_routes.js";
import adminRoutes from "./admin/routes/admin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: envPath, debug: true });

const port = process.env.PORT_ADMIN || 8001;

// Connect DB
db();

// Routes
// app.use("/admin", seedRoutes);
app.use("/admin", adminRoutes);

// Example index route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// ✅ Start ONE server (with sockets + API together)
server.listen(port, () => {
  console.log(`fullbooking is running with sockets on port: ${port}`);
});

export default app;
