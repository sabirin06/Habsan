import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: String,
    password_hash: { type: String, required: true },

    type: {
      type: String,
      enum: ["user", "vendor"],
      required: true,
    },

    country_id: { type: mongoose.Schema.Types.ObjectId},
    city_id: { type: mongoose.Schema.Types.ObjectId},

    vendor_status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
    },

    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },

    last_login_at: Date,
    last_login_ip: String,

    is_deleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

accountSchema.index({ email: 1 });
accountSchema.index({ type: 1 });
accountSchema.index({ country_id: 1, city_id: 1 });

export default mongoose.model("Account", accountSchema);
