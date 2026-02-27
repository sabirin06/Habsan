import mongoose from "mongoose";

const paymentLogSchema = new mongoose.Schema(
  {
    payment_id: { type: mongoose.Schema.Types.ObjectId, required: true },

    action: String, // initiated, verified, failed, refunded

    old_data: Object,
    new_data: Object,

    ip_address: String,
  },
  { timestamps: true },
);

paymentLogSchema.index({ payment_id: 1 });

export default mongoose.model("PaymentLog", paymentLogSchema);
