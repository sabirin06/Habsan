import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
  {
    vendor_id: {
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

    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: Number,
    type: {
      type: String,
      enum: ["SUV", "Sedan", "Hatchback", "Van", "Luxury"],
    },

    transmission: {
      type: String,
      enum: ["automatic", "manual"],
    },

    fuel_type: {
      type: Number, // 1: Petrol, 2: Diesel, 3: Electric, 4: Hybrid
    },

    seats: Number,
    price_per_day: { type: Number, required: true },

    images: [String],

    status: {
      type: String,
      enum: ["available", "rented", "inactive"],
      default: "available",
    },

    is_deleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

carSchema.index({ city_id: 1 });
carSchema.index({ vendor_id: 1 });
carSchema.index({ brand: 1, model: 1 });

export default mongoose.model("Car", carSchema);
