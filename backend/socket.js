import { createServer } from "http";
import { Server } from "socket.io";
import configureExpress from "./express.js";
import cookie from "cookie";
import jwt from "jsonwebtoken";

const app = configureExpress();
const server = createServer(app);

const rawAllowedOrigins = process.env.SOCKET_ALLOWED_ORIGINS;

if (!rawAllowedOrigins) {
  throw new Error("SOCKET_ALLOWED_ORIGINS is required");
}

const allowedOrigins = rawAllowedOrigins
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

if (!allowedOrigins.length) {
  throw new Error(
    "SOCKET_ALLOWED_ORIGINS must contain at least one comma-separated origin",
  );
}

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingInterval: 25000,
  pingTimeout: 30000,
});

console.log("Socket.IO allowed origins:", allowedOrigins);

const onlineSellers = new Map();

const addSellerSocket = (sellerId, socketId) => {
  if (!sellerId) return;
  const key = sellerId.toString();
  const sockets = onlineSellers.get(key) ?? new Set();
  sockets.add(socketId);
  onlineSellers.set(key, sockets);
};

const removeSellerSocket = (sellerId, socketId) => {
  if (!sellerId) return;
  const key = sellerId.toString();
  const sockets = onlineSellers.get(key);
  if (!sockets) return;
  sockets.delete(socketId);
  if (sockets.size === 0) {
    onlineSellers.delete(key);
  }
};

export const isSellerOnline = (sellerId) => {
  if (!sellerId) return false;
  return onlineSellers.has(sellerId.toString());
};

io.use((socket, next) => {
  const raw = socket.handshake.headers.cookie;
  if (!raw) return next();

  const { seller_auth_token } = cookie.parse(raw);
  if (!seller_auth_token) return next();

  try {
    const payload = jwt.verify(seller_auth_token, process.env.JWT_SECRET);
    socket.data.sellerId = payload.id;
    console.log("Authenticated seller ID:", payload.id);
  } catch (err) {
    console.warn("Invalid seller token:", err.message);
  }

  next();
});

io.on("connection", (socket) => {
  console.log(
    "[socket] connected",
    socket.id,
    "origin:",
    socket.handshake.headers.origin,
  );

  if (socket.data.sellerId) {
    console.log("Socket joined room for seller ID:", socket.data.sellerId);
    socket.join(`seller:${socket.data.sellerId}`);
    addSellerSocket(socket.data.sellerId, socket.id);
  }

  if (socket.data.customerId) {
    console.log("Socket joined room for customer ID:", socket.data.customerId);
    socket.join(`customer:${socket.data.customerId}`);
  }

  socket.on("disconnect", (reason) => {
    if (socket.data.sellerId) {
      removeSellerSocket(socket.data.sellerId, socket.id);
    }
    console.log("socket disconnected: ", reason);
  });

  socket.on("message", (msg) => {
    io.emit("message", msg);
  });
});

export { io, app, server };
