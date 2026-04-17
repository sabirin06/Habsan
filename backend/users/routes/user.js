import {
  register_user,
  login_user,
  send_reset_otp,
  reset_password,
  get_current_user,
  logout_user,
} from "../controllers/user.js";
import { verifyUserToken } from "../middlewares/auth.js";

export default (app) => {
  app.route("/api/auth/register").post(register_user);
  app.route("/api/auth/login").post(login_user);
  app.route("/api/auth/send-reset-otp").post(send_reset_otp);
  app.route("/api/auth/reset-password").post(reset_password);
  app.route("/api/auth/me").get(verifyUserToken, get_current_user);
  app.route("/api/auth/logout").post(logout_user);
};
