import { login, Register, resendOTP, verifyOTP } from "../controllers/auth.js";
export default (app) => {
  app.route("/mobile/user_register").post(Register);
  app.route("/mobile/user_login").post(login);
  app.route("/mobile/user_verify_otp").post(verifyOTP);
  app.route("/mobile/user_resend_otp").post(resendOTP);
};
