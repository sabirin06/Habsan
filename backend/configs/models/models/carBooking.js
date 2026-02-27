import mongoose from "mongoose";

const carBookingSchema = new mongoose.Schema(
  {
    booking_number: { type: String, unique: true },

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    vendor_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    car_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    country_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    city_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    pickup_date: Date,
    return_date: Date,
    total_days: Number,

    total_price: Number,
    currency: String,

    payment_status: String,
    booking_status: String,
  },
  { timestamps: true },
);

carBookingSchema.index({ user_id: 1 });
carBookingSchema.index({ vendor_id: 1 });

export default mongoose.model("CarBooking", carBookingSchema);
