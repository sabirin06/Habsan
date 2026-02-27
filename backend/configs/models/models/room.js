import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    property_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    name: String,
    price_per_night: Number,
    capacity: Number,
    quantity: Number,

    status: { type: String, default: "available" },
  },
  { timestamps: true },
);

roomSchema.index({ property_id: 1 });

export default mongoose.model("Room", roomSchema);
