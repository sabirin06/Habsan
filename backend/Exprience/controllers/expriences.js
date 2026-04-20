import mongoose from "mongoose";
import Experience from "../../configs/models/models/experience.js";

export const create_experience = async (req, res) => {
  try {
    const vendor_id = req.body.vendor_id;
    const country_id = req.body.country_id;
    const city_id = req.body.city_id;
    const title = req.body.title;
    const price = req.body.price;

    if (
      !vendor_id ||
      !country_id ||
      !city_id ||
      !title ||
      price === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "vendor_id, country_id, city_id, title and price are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(vendor_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vendor_id",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(country_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid country_id",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(city_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid city_id",
      });
    }

    const numeric_price = Number(price);
    if (!Number.isFinite(numeric_price) || numeric_price < 0) {
      return res.status(400).json({
        success: false,
        message: "price must be a valid non-negative number",
      });
    }

    const payload = {
      vendor_id: new mongoose.Types.ObjectId(String(vendor_id)),
      country_id: new mongoose.Types.ObjectId(String(country_id)),
      city_id: new mongoose.Types.ObjectId(String(city_id)),
      title: String(title).trim(),
      category: req.body.category
        ? String(req.body.category).trim()
        : "general",
      description: req.body.description
        ? String(req.body.description).trim()
        : "",
      city_name: req.body.city_name ? String(req.body.city_name).trim() : "",
      country_name: req.body.country_name
        ? String(req.body.country_name).trim()
        : "",
      location_name: req.body.location_name
        ? String(req.body.location_name).trim()
        : "",
      duration_hours: Number(req.body.duration_hours || 0),
      price: numeric_price,
      currency: req.body.currency ? String(req.body.currency).trim() : "USD",
      max_people: Number(req.body.max_people || 0),
      group_type: req.body.group_type
        ? String(req.body.group_type).trim()
        : "shared",
      group_size_max: Number(req.body.group_size_max || 0),
      languages: Array.isArray(req.body.languages)
        ? req.body.languages.map((item) => String(item).trim()).filter(Boolean)
        : [],
      operator_name: req.body.operator_name
        ? String(req.body.operator_name).trim()
        : "",
      operator_verified: Boolean(req.body.operator_verified),
      images: Array.isArray(req.body.images)
        ? req.body.images.map((item) => String(item).trim()).filter(Boolean)
        : [],
      included: Array.isArray(req.body.included)
        ? req.body.included.map((item) => String(item).trim()).filter(Boolean)
        : [],
      excluded: Array.isArray(req.body.excluded)
        ? req.body.excluded.map((item) => String(item).trim()).filter(Boolean)
        : [],
      itinerary: Array.isArray(req.body.itinerary) ? req.body.itinerary : [],
      cancellation_policy: req.body.cancellation_policy
        ? String(req.body.cancellation_policy).trim()
        : "Non-refundable",
      meeting_point_label: req.body.meeting_point_label
        ? String(req.body.meeting_point_label).trim()
        : "",
      status: req.body.status ? String(req.body.status).trim() : "active",
    };

    const experience = await Experience.create(payload);

    return res.status(201).json({
      success: true,
      message: "Experience created successfully",
      data: {
        experience: {
          id: String(experience._id),
          title: experience.title,
          category: experience.category,
          price: experience.price,
          currency: experience.currency,
          status: experience.status,
          createdAt: experience.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("create_experience error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create experience",
    });
  }
};
