import mongoose from "mongoose";

const countrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    iso_code: { type: String, required: true, unique: true },
    currency: String,
    phone_code: String,
    status: { type: String, default: "active" },
  },
  { timestamps: true },
);

// countrySchema.index({ iso_code: 1 });

export default mongoose.model("Country", countrySchema);
