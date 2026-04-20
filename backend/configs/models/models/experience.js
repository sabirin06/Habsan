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
    category: {
      type: String,
      default: "general",
    },
    description: String,

    city_name: String,
    country_name: String,
    location_name: String,

    duration_hours: Number,
    price: { type: Number, required: true },
    currency: {
      type: String,
      default: "USD",
    },
    max_people: Number,
    group_type: {
      type: String,
      enum: ["private", "shared"],
      default: "shared",
    },
    group_size_max: Number,
    languages: [String],

    operator_name: String,
    operator_verified: {
      type: Boolean,
      default: false,
    },

    rating_score: {
      type: Number,
      default: 0,
    },
    reviews_count: {
      type: Number,
      default: 0,
    },

    images: [String],

    included: [String],
    excluded: [String],
    itinerary: [
      {
        title: String,
        description: String,
        duration_minutes: Number,
      },
    ],
    cancellation_policy: {
      type: String,
      default: "Non-refundable",
    },
    meeting_point_label: String,

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
experienceSchema.index({ status: 1, category: 1, price: 1 });
experienceSchema.index({ city_name: 1, country_name: 1, location_name: 1 });
experienceSchema.index({ rating_score: -1, reviews_count: -1 });

export default mongoose.model("Experience", experienceSchema);
