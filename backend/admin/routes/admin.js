import express from "express";
import {
  create_admin,
  edit_admin,
  get_all_admins,
  reset_admin_lockout,
  signin_admin,
  verify_auth,
  signout_admin,
  get_managed_by_admins,
  get_current_admin,
  change_admin_status,
  generate_admin_pin,
  create_first_admin,
} from "../controllers/admin.js";
import multer from "multer";
import { adminProfileStorage } from "../middlewares/upload.js";
// import { verifyToken } from "../middlewares/auth.js";
const uploadAdmin = multer({ storage: adminProfileStorage });
import { verifyAdminToken } from "../middlewares/auth.js";
export default (app) => {
  app
    .route("/admin/create_admin")
    .post(verifyAdminToken, uploadAdmin.single("profile_image"), create_admin);

  app.post("/admin/bootstrap", create_first_admin);

  app.route("/admin/get_all_admins").post(get_all_admins);
  app.route("/admin/signin").post(signin_admin);
  app.route("/admin/signout").post(signout_admin);
  app.route("/admin/verify_auth").get(verify_auth);
  app.route("/admin/reset_lockout").post(reset_admin_lockout);
  app.route("/admin/get_managed_by_admins").post(get_managed_by_admins);
  app
    .route("/admin/edit_admin")
    .post(uploadAdmin.single("profile_image"), edit_admin);
  app.route("/admin/get_current_admin").get(get_current_admin);
  app.route("/admin/change_admin_status").post(change_admin_status);
  app.route("/admin/generate_pin").post(generate_admin_pin);
};
