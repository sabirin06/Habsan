import {
  search_transportation,
  get_transportation_detail,
} from "../controllers/transport.js";

export default (app) => {
  app.route("/api/transportation").post(search_transportation);
  app.route("/api/transportation/:transport_id").post(get_transportation_detail);
};
