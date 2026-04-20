import { create_vendor } from "../controllers/venders.js";
import { verifyAdminToken } from "../middlewares/auth.js";

export default (app) => {
  app.route("/admin/create_vendor").post(create_vendor);
};
