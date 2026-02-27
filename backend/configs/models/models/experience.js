import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema(
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

    title: { type: String, required: true },
    description: String,

    duration_hours: Number,
    price: { type: Number, required: true },
    max_people: Number,

    images: [String],

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true },
);

experienceSchema.index({ city_id: 1 });
experienceSchema.index({ vendor_id: 1 });

export default mongoose.model("Experience", experienceSchema);
