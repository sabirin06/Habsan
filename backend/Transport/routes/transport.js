import { create_transportation } from "../controllers/transport.js";

export default (app) => {
  app.route("/api/transportation/create").post(create_transportation);
};
