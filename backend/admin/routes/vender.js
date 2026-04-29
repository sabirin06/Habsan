import { create_vendor, vendor_list } from "../controllers/venders.js";
import { verifyAdminToken } from "../middlewares/auth.js";

export default (app) => {
  app.route("/admin/create_vendor").post(create_vendor);
  app.route("/admin/vendor_list").post(vendor_list);
};
