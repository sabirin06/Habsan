import mongoose from "mongoose";

const hotelBookingSchema = new mongoose.Schema(
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

    property_id: {
      type: mongoose.Schema.Types.ObjectId,

      required: true,
    },
    room_id: {
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

    check_in: Date,
    check_out: Date,
    guests: Number,

    total_price: Number,
    currency: String,

    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    booking_status: {
      type: String,
      enum: ["confirmed", "cancelled", "completed"],
      default: "confirmed",
    },
  },
  { timestamps: true },
);

hotelBookingSchema.index({ user_id: 1 });
hotelBookingSchema.index({ vendor_id: 1 });
hotelBookingSchema.index({ country_id: 1, city_id: 1 });

export default mongoose.model("HotelBooking", hotelBookingSchema);
