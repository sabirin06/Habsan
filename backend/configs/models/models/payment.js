import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    payment_reference: { type: String, unique: true },

    booking_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    booking_type: {
      type: String,
      enum: ["hotel", "car", "flight", "experience"],
      required: true,
    },

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    amount: { type: Number, required: true },
    currency: { type: String, required: true },

    method: {
      type: String,
      enum: ["card", "mobile_money", "paypal"],
    },

    transaction_id: String,

    status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      default: "pending",
    },
  },
  { timestamps: true },
);

paymentSchema.index({ booking_id: 1 });
paymentSchema.index({ user_id: 1 });

export default mongoose.model("Payment", paymentSchema);
