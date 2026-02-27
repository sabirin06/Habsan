import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    sqn: { type: Number, default: 1 },

    full_name: { type: String, required: true },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password_hash: { type: String, required: true },

    role: {
      type: String,
      enum: ["super_admin", "admin", "country_admin"],
      default: "admin",
    },

    country_id: { type: mongoose.Schema.Types.ObjectId},
    city_id: { type: mongoose.Schema.Types.ObjectId },

    status: {
      type: Number,
      enum: [1, 2, 3], // active, inactive, suspended
      default: 1,
    },

    two_factor_enabled: { type: Boolean, default: false },
    two_factor_secret: String,

    login_attempts: { type: Number, default: 0 },
    lock_until: Date,

    last_login_at: Date,
    last_login_ip: String,

    refresh_token: String,
    refresh_token_expiry: Date,

    is_deleted: { type: Boolean, default: false },
    deleted_at: Date,
    deleted_by: { type: mongoose.Schema.Types.ObjectId},
  },
  { timestamps: true },
);

adminSchema.index({ email: 1 });
adminSchema.index({ username: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ country_id: 1 });

export default mongoose.model("Admin", adminSchema);
