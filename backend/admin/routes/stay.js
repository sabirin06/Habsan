import { search_stays, get_stay_details } from "../controllers/stay.js";

export default (app) => {
  app.route("/api/stays").post(search_stays);
  app.route("/api/stays/:stayId").post(get_stay_details);
};
