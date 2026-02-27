import mongoose from "mongoose";

const citySchema = new mongoose.Schema(
  {
    country_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    name: { type: String, required: true },
    state: String,
    lat: Number,
    lng: Number,
    timezone: String,
    status: { type: String, default: "active" },
  },
  { timestamps: true },
);

citySchema.index({ country_id: 1 });
citySchema.index({ name: 1, country_id: 1 });

export default mongoose.model("City", citySchema);
