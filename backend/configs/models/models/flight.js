import mongoose from "mongoose";

const flightSchema = new mongoose.Schema(
  {
    airline: { type: String, required: true },
    flight_number: { type: String, required: true },

    departure_airport_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    arrival_airport_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    departure_time: { type: Date, required: true },
    arrival_time: { type: Date, required: true },

    seat_class: {
      type: String,
      enum: ["economy", "business", "first"],
    },

    price: { type: Number, required: true },
    seats_available: Number,

    status: {
      type: String,
      enum: ["scheduled", "cancelled", "completed"],
      default: "scheduled",
    },
  },
  { timestamps: true },
);

flightSchema.index({ departure_airport_id: 1, arrival_airport_id: 1 });
flightSchema.index({ departure_time: 1 });

export default mongoose.model("Flight", flightSchema);
