import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
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

    type: {
      type: String,
      enum: ["hotel", "apartment", "house"],
      required: true,
    },

    title: String,
    description: String,
    address: String,

    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: [Number],
    },

    amenities: [String],
    images: [String],

    rating: { type: Number, default: 0 },
    review_count: { type: Number, default: 0 },

    status: { type: String, default: "active" },
  },
  { timestamps: true },
);

propertySchema.index({ city_id: 1 });
propertySchema.index({ location: "2dsphere" });

export default mongoose.model("Property", propertySchema);
