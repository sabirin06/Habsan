import { create_experience } from "../controllers/expriences.js";

export default (app) => {
  app.route("/api/experiences/create").post(create_experience);
};
