import mongoose from "mongoose";

const experienceBookingSchema = new mongoose.Schema(
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

    experience_id: {
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

    booking_date: Date,
    people_count: Number,

    total_price: Number,
    currency: String,

    payment_status: String,
    booking_status: String,
  },
  { timestamps: true },
);

experienceBookingSchema.index({ user_id: 1 });
experienceBookingSchema.index({ vendor_id: 1 });

export default mongoose.model("ExperienceBooking", experienceBookingSchema);
