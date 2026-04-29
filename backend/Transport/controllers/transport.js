import mongoose from "mongoose";
import Car from "../../configs/models/models/car.js";

export const create_transportation = async (req, res) => {
  try {
    const vendor_id = req.body.vendor_id;
    const country_id = req.body.country_id;
    const city_id = req.body.city_id;
    const brand = req.body.brand ? String(req.body.brand).trim() : "";
    const model = req.body.model ? String(req.body.model).trim() : "";
    const price_per_day = Number(req.body.price_per_day);

    if (
      !vendor_id ||
      !country_id ||
      !city_id ||
      !brand ||
      !model ||
      req.body.price_per_day === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "vendor_id, country_id, city_id, brand, model and price_per_day are required",
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

    if (!Number.isFinite(price_per_day) || price_per_day < 0) {
      return res.status(400).json({
        success: false,
        message: "price_per_day must be a valid non-negative number",
      });
    }

    const type_value = req.body.type
      ? String(req.body.type).trim().toLowerCase()
      : "";
    const type_map = {
      suv: "SUV",
      sedan: "Sedan",
      hatchback: "Hatchback",
      van: "Van",
      luxury: "Luxury",
    };
    const type = type_value ? type_map[type_value] : undefined;

    if (type_value && !type) {
      return res.status(400).json({
        success: false,
        message: "type must be SUV, Sedan, Hatchback, Van or Luxury",
      });
    }

    const transmission = req.body.transmission
      ? String(req.body.transmission).trim().toLowerCase()
      : "";
    if (transmission && !["automatic", "manual"].includes(transmission)) {
      return res.status(400).json({
        success: false,
        message: "transmission must be automatic or manual",
      });
    }

    const fuel_type =
      req.body.fuel_type === undefined ? undefined : Number(req.body.fuel_type);
    if (
      fuel_type !== undefined &&
      (!Number.isFinite(fuel_type) || ![1, 2, 3, 4].includes(fuel_type))
    ) {
      return res.status(400).json({
        success: false,
        message: "fuel_type must be 1, 2, 3 or 4",
      });
    }

    const seats =
      req.body.seats === undefined ? undefined : Number(req.body.seats);
    if (seats !== undefined && (!Number.isFinite(seats) || seats < 0)) {
      return res.status(400).json({
        success: false,
        message: "seats must be a valid non-negative number",
      });
    }

    const year = req.body.year === undefined ? undefined : Number(req.body.year);
    if (year !== undefined && (!Number.isFinite(year) || year < 0)) {
      return res.status(400).json({
        success: false,
        message: "year must be a valid non-negative number",
      });
    }

    const status = req.body.status
      ? String(req.body.status).trim()
      : "available";
    if (!["available", "rented", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "status must be available, rented or inactive",
      });
    }

    const payload = {
      vendor_id: new mongoose.Types.ObjectId(String(vendor_id)),
      country_id: new mongoose.Types.ObjectId(String(country_id)),
      city_id: new mongoose.Types.ObjectId(String(city_id)),
      brand,
      model,
      year,
      type,
      transmission: transmission || undefined,
      fuel_type,
      seats,
      price_per_day,
      images: Array.isArray(req.body.images)
        ? req.body.images.map((item) => String(item).trim()).filter(Boolean)
        : [],
      status,
      is_deleted: Boolean(req.body.is_deleted),
    };

    const transportation = await Car.create(payload);

    return res.status(201).json({
      success: true,
      message: "Transportation created successfully",
      data: {
        transportation: {
          id: String(transportation._id),
          vendor_id: String(transportation.vendor_id),
          country_id: String(transportation.country_id),
          city_id: String(transportation.city_id),
          brand: transportation.brand,
          model: transportation.model,
          year: Number(transportation.year || 0),
          type: transportation.type || "",
          transmission: transportation.transmission || "",
          fuel_type: Number(transportation.fuel_type || 0),
          seats: Number(transportation.seats || 0),
          price_per_day: Number(transportation.price_per_day || 0),
          images: Array.isArray(transportation.images)
            ? transportation.images
            : [],
          status: transportation.status,
          created_at: transportation.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("create_transportation error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create transportation",
    });
  }
};
