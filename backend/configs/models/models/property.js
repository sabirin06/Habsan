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
      enum: ["hotel", "apartment", "house", "appartment"],
      required: true,
    },

    name: String,
    title: String,
    description: String,
    address: String,
    city_name: String,
    country_name: String,

    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: [Number],
    },

    price_per_night: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "USD",
    },

    max_guests: Number,
    rooms_count: Number,
    bedrooms: Number,
    star_rating: Number,
    hotel_chain: String,
    breakfast_included: {
      type: Boolean,
      default: false,
    },
    free_cancellation: {
      type: Boolean,
      default: false,
    },
    long_stay_discount: {
      type: Boolean,
      default: false,
    },
    entire_place: {
      type: Boolean,
      default: false,
    },
    kitchen: {
      type: Boolean,
      default: false,
    },
    washing_machine: {
      type: Boolean,
      default: false,
    },

    amenities: [String],
    images: [String],

    rooms: [
      {
        name: String,
        capacity: Number,
        price_per_night: Number,
        available_count: Number,
        amenities: [String],
      },
    ],

    policies: {
      check_in_from: String,
      check_out_until: String,
      smoking_allowed: Boolean,
      pets_allowed: Boolean,
      cancellation: String,
    },

    host: {
      id: mongoose.Schema.Types.ObjectId,
      name: String,
      avatar: String,
      is_superhost: Boolean,
    },

    house_rules: [String],

    rating: { type: Number, default: 0 },
    review_count: { type: Number, default: 0 },

    status: { type: String, default: "active" },
  },
  { timestamps: true },
);

propertySchema.index({ city_id: 1 });
propertySchema.index({ location: "2dsphere" });
propertySchema.index({ status: 1, type: 1, price_per_night: 1 });
propertySchema.index({ city_name: 1, country_name: 1, name: 1, title: 1 });
propertySchema.index({ rating: -1, review_count: -1 });

export default mongoose.model("Property", propertySchema);
