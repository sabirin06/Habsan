import mongoose from "mongoose";

const bookingLogSchema = new mongoose.Schema(
  {
    booking_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    booking_type: {
      type: String,
      enum: ["hotel", "car", "flight", "experience"],
      required: true,
    },

    action: String, // created, updated, cancelled

    performed_by: mongoose.Schema.Types.ObjectId,
    performer_type: {
      type: String,
      enum: ["user", "vendor", "admin"],
    },

    old_data: Object,
    new_data: Object,

    ip_address: String,
    user_agent: String,
  },
  { timestamps: true },
);

bookingLogSchema.index({ booking_id: 1 });

export default mongoose.model("BookingLog", bookingLogSchema);
