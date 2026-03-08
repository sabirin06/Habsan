import mongoose from "mongoose";

const flightBookingSchema = new mongoose.Schema(
  {
    booking_number: {
      type: String,
      unique: true,
    },

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    // Provider information
    provider: {
      type: String, // Daalo, Saaid, Maandeeq etc
    },

    provider_booking_reference: {
      type: String, // PNR or provider reference
    },

    // Flight snapshot
    flight: {
      airline: String,
      airline_code: String,
      flight_number: String,
      departure_airport: String,
      arrival_airport: String,
      departure_time: Date,
      arrival_time: Date,

      cabin_class: {
        type: String,
        enum: ["economy", "business", "first"],
      },
    },

    // Passengers
    passengers: [
      {
        first_name: String,
        last_name: String,
        gender: String,
        date_of_birth: Date,

        nationality: String,

        passport_number: String,
        passport_expiry: Date,

        ticket_number: String,
      },
    ],

    // Contact information
    contact: {
      email: String,
      phone: String,
    },

    // Pricing
    pricing: {
      base_fare: Number,
      taxes: Number,
      total_price: Number,
      currency: String,
    },

    // Payment
    payment_id: {
      type: mongoose.Schema.Types.ObjectId,
    },

    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    // Booking lifecycle
    booking_status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },

    // Optional: API response
    provider_response: {
      type: Object,
    },
  },
  { timestamps: true },
);

flightBookingSchema.index({ user_id: 1 });
flightBookingSchema.index({ booking_number: 1 });
flightBookingSchema.index({"flight.departure_airport": 1, "flight.arrival_airport": 1,
});

export default mongoose.model("FlightBooking", flightBookingSchema);
