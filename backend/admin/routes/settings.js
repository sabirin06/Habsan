import {
  create_country,
  get_country_list,
  create_city,
  get_city_list,
  get_city_by_country,
} from "../controllers/settings.js";
import { verifyAdminToken } from "../middlewares/auth.js";

export default (app) => {
  app
    .route("/admin/settings/create_country")
    .post( create_country);
  app.route("/admin/settings/get_country_list")
    .post(verifyAdminToken, get_country_list);

  app.route("/admin/settings/create_city").post(create_city);
  app.route("/admin/settings/get_city_list")
    .post(verifyAdminToken, get_city_list);

  app.route("/admin/settings/get_city_by_country").get(get_city_by_country);
};
