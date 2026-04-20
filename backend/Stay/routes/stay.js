import { create_stay } from "../controllers/stay.js";

export default (app) => {
  app.route("/api/stays/create").post(create_stay);
};
