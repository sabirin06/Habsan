import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    company_name: {
      type: String,
      required: true,
    },

    business_type: {
      type: Number, // 1: Hotel, 2: Car Rental, 3: Experience Provider
      required: true,
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

    password: {
      type: String,
      required: true,
    },
    company_logo: String,
    description: String,
    country_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    city_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    address: String,
    license_number: String,
    commission_rate: {
      type: Number,
      default: 10,
    },

    status: {
      type: Number, // 0: pending, 1: approved, 2: rejected
      default: 0,
    },

    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
    },

    approved_at: Date,
    last_login_at: Date,
    last_login_ip: String,
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

vendorSchema.index({ email: 1 });
vendorSchema.index({ business_type: 1 });
vendorSchema.index({ city_id: 1 });

export default mongoose.model("Vendor", vendorSchema);
