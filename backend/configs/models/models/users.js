import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
    },
    otp: String,
    token: String,
    auth_token: String,

    password: {
      type: String,
      required: true,
    },
    profile: String,
    country_id: {
      type: mongoose.Schema.Types.ObjectId,
    },

    city_id: {
      type: mongoose.Schema.Types.ObjectId,
    },

    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },

    email_verified: {
      type: Boolean,
      default: false,
    },
    reset_otp: String,
    reset_otp_expires_at: Date,
    reset_otp_attempts: {
      type: Number,
      default: 0,
    },

    last_login_at: Date,
    last_login_ip: String,

    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// userSchema.index({ email: 1 });
// userSchema.index({ phone: 1 });

export default mongoose.model("User", userSchema);
