import mongoose from "mongoose";
import Property from "../../configs/models/models/property.js";

export const create_stay = async (req, res) => {
  try {
    const vendor_id = req.body.vendor_id;
    const country_id = req.body.country_id;
    const city_id = req.body.city_id;
    const type = req.body.type;

    if (!vendor_id || !country_id || !city_id || !type) {
      return res.status(400).json({
        success: false,
        message: "vendor_id, country_id, city_id and type are required",
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

    const type_value = String(type).trim().toLowerCase();
    const normalized_type =
      type_value === "appartment" ? "apartment" : type_value;

    if (!["hotel", "apartment", "house"].includes(normalized_type)) {
      return res.status(400).json({
        success: false,
        message: "type must be hotel, apartment or house",
      });
    }

    const payload = {
      vendor_id: new mongoose.Types.ObjectId(String(vendor_id)),
      country_id: new mongoose.Types.ObjectId(String(country_id)),
      city_id: new mongoose.Types.ObjectId(String(city_id)),
      type: normalized_type,
      name: req.body.name ? String(req.body.name).trim() : "",
      title: req.body.title ? String(req.body.title).trim() : "",
      description: req.body.description
        ? String(req.body.description).trim()
        : "",
      address: req.body.address ? String(req.body.address).trim() : "",
      city_name: req.body.city_name ? String(req.body.city_name).trim() : "",
      country_name: req.body.country_name
        ? String(req.body.country_name).trim()
        : "",
      location:
        Number.isFinite(Number(req.body.lng)) &&
        Number.isFinite(Number(req.body.lat))
          ? {
              type: "Point",
              coordinates: [Number(req.body.lng), Number(req.body.lat)],
            }
          : undefined,
      price_per_night: Number(req.body.price_per_night || 0),
      currency: req.body.currency ? String(req.body.currency).trim() : "USD",
      max_guests: Number(req.body.max_guests || 0),
      rooms_count: Number(req.body.rooms_count || 0),
      bedrooms: Number(req.body.bedrooms || 0),
      star_rating: Number(req.body.star_rating || 0),
      hotel_chain: req.body.hotel_chain
        ? String(req.body.hotel_chain).trim()
        : "",
      breakfast_included: Boolean(req.body.breakfast_included),
      free_cancellation: Boolean(req.body.free_cancellation),
      long_stay_discount: Boolean(req.body.long_stay_discount),
      entire_place: Boolean(req.body.entire_place),
      kitchen: Boolean(req.body.kitchen),
      washing_machine: Boolean(req.body.washing_machine),
      amenities: Array.isArray(req.body.amenities)
        ? req.body.amenities.map((item) => String(item).trim()).filter(Boolean)
        : [],
      images: Array.isArray(req.body.images)
        ? req.body.images.map((item) => String(item).trim()).filter(Boolean)
        : [],
      rooms: Array.isArray(req.body.rooms) ? req.body.rooms : [],
      policies:
        req.body.policies && typeof req.body.policies === "object"
          ? req.body.policies
          : {},
      host:
        req.body.host && typeof req.body.host === "object" ? req.body.host : {},
      house_rules: Array.isArray(req.body.house_rules)
        ? req.body.house_rules
            .map((item) => String(item).trim())
            .filter(Boolean)
        : [],
      status: req.body.status ? String(req.body.status).trim() : "active",
    };

    if (!payload.name && !payload.title) {
      return res.status(400).json({
        success: false,
        message: "name or title is required",
      });
    }

    const stay = await Property.create(payload);

    return res.status(201).json({
      success: true,
      message: "Stay created successfully",
      data: {
        stay: {
          id: String(stay._id),
          type: stay.type,
          name: stay.name || stay.title,
          city: stay.city_name,
          country: stay.country_name,
          price_per_night: stay.price_per_night,
          currency: stay.currency,
          status: stay.status,
          createdAt: stay.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("create_stay error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create stay",
    });
  }
};
