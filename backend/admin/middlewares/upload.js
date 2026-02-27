// // upload.js
// import multer, { diskStorage } from "multer";
// import { extname } from "path";
// import fs from "fs";

// // Generalized helper to ensure directory exists
// function ensureDir(dir) {
//   if (!fs.existsSync(dir)) {
//     fs.mkdirSync(dir, { recursive: true });
//   }
// }

// // Default storage is for underSubcategories to keep backward compat
// const storage = diskStorage({
//   destination: function (req, file, cb) {
//     const dir = "uploads/undersubcategories/";
//     ensureDir(dir);
//     cb(null, dir);
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const ext = extname(file.originalname);
//     cb(null, file.fieldname + "-" + uniqueSuffix + ext);
//   },
// });

// // Additional storage configured for admins
// export const adminProfileStorage = diskStorage({
//   destination: function (req, file, cb) {
//     const dir = "uploads/admins/";
//     ensureDir(dir);
//     cb(null, dir);
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const ext = extname(file.originalname);
//     cb(null, file.fieldname + "-" + uniqueSuffix + ext);
//   },
// });

// // Memory storage for cloud uploads (used with storage services)
// export const memoryStorage = multer.memoryStorage();

// const upload = multer({ storage });

// // Export named upload instances
// export { upload };
// export default upload;


import multer, { diskStorage } from "multer";
import { extname } from "path";
import fs from "fs";

// Ensure directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Default storage (for underSubcategories)
const storage = diskStorage({
  destination: function (req, file, cb) {
    const dir = "uploads/undersubcategories/";
    ensureDir(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// Storage for admin profile
export const adminProfileStorage = diskStorage({
  destination: function (req, file, cb) {
    const dir = "uploads/admins/";
    ensureDir(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// Storage for store logos/banners
export const storeStorage = diskStorage({
  destination: function (req, file, cb) {
    const dir = "uploads/stores/";
    ensureDir(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage });
export default upload;
