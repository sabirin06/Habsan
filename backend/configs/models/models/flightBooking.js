import mongoose from "mongoose";

const flightBookingSchema = new mongoose.Schema(
  {
    booking_number: { type: String, unique: true },

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    flight_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    passengers: [
      {
        full_name: String,
        passport_number: String,
        nationality: String,
      },
    ],

    seat_class: String,

    total_price: Number,
    currency: String,

    payment_status: String,
    booking_status: String,
  },
  { timestamps: true },
);

flightBookingSchema.index({ user_id: 1 });

export default mongoose.model("FlightBooking", flightBookingSchema);
