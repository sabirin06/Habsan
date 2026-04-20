import {
  search_experiences,
  get_experience_details,
} from "../controllers/expriences.js";

export default (app) => {
  app.route("/api/experiences").post(search_experiences);
  app.route("/api/experiences/:experienceId").post(get_experience_details);
};
