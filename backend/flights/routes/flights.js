import {
  accept_cancellation_penalty,
  add_booking,
  generate_ipay_africa_payment,
  get_airlines,
  get_airport_by_code,
  get_airports,
  get_booking_by_parent_pnr,
  get_booking_history,
  get_countries,
  get_fare_rules,
  get_my_bookings,
  get_my_cancellations,
  get_payment_options,
  login_user,
  logout,
  process_payment,
  refresh_token,
  reject_cancellation_penalty,
  request_cancellation,
  resend_ticket_email,
  search_airports,
  search_flights,
} from "../controllers/flights.js";

export default (app) => {
  app.route("/api/authenticator/loginUser").post(login_user);
  app.route("/api/authenticator/RefreshToken").post(refresh_token);
  app.route("/api/authenticator/logout").post(logout);

  app.route("/api/Airport/search").post(search_airports);
  app.route("/api/Airport/code/:code").get(get_airport_by_code);
  app.route("/api/Airport").get(get_airports);
  app.route("/api/Country").get(get_countries);
  app.route("/api/Airline").get(get_airlines);

  app
    .route("/api/FlightBooking/paymentOptions/microSiteClientId/:microSiteClientId")
    .get(get_payment_options);
  app.route("/api/FlightQuote/search").post(search_flights);
  app.route("/api/FlightBooking/addBooking").post(add_booking);

  app.route("/api/payment/generate/iPayAfrica").post(generate_ipay_africa_payment);
  app.route("/api/payment/process").post(process_payment);

  app.route("/api/FlightBooking/parentPnr/:parentPnr").get(get_booking_by_parent_pnr);
  app
    .route("/api/FlightBooking/parentPnr/:parentPnr/email/:email")
    .get(resend_ticket_email);
  app.route("/api/FlightBooking/myBookings").post(get_my_bookings);
  app.route("/api/FlightBooking/:flightBookingId/history").get(get_booking_history);
  app.route("/api/FlightBooking/parentPnr/:parentPnr/fareRules").get(get_fare_rules);

  app.route("/api/Cancellation/client/requestCancellation").post(request_cancellation);
  app
    .route("/api/Cancellation/client/acceptPenalty/:requestId")
    .put(accept_cancellation_penalty);
  app
    .route("/api/Cancellation/client/rejectPenalty/:requestId")
    .put(reject_cancellation_penalty);
  app
    .route("/api/Cancellation/client/getMyCancellation/module/:module")
    .get(get_my_cancellations);
};
