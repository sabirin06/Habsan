import mongoose from "mongoose";
import Car from "../../configs/models/models/car.js";

export const search_transportation = async (req, res) => {
  try {
    const page_raw = Number(req.body.page || 1);
    const limit_raw = Number(req.body.limit || 18);
    const page = Number.isFinite(page_raw) && page_raw > 0 ? page_raw : 1;
    const limit =
      Number.isFinite(limit_raw) && limit_raw > 0
        ? Math.min(limit_raw, 100)
        : 18;
    const skip = (page - 1) * limit;

    const price_min_raw = Number(req.body.price_min || req.body.priceMin || 0);
    const price_max_raw = Number(req.body.price_max || req.body.priceMax || 0);
    const seats_min_raw = Number(req.body.seats_min || req.body.seatsMin || 0);
    const year_min_raw = Number(req.body.year_min || req.body.yearMin || 0);
    const year_max_raw = Number(req.body.year_max || req.body.yearMax || 0);

    const price_min =
      Number.isFinite(price_min_raw) && price_min_raw >= 0 ? price_min_raw : 0;
    const price_max =
      Number.isFinite(price_max_raw) && price_max_raw >= 0 ? price_max_raw : 0;
    const seats_min =
      Number.isFinite(seats_min_raw) && seats_min_raw > 0 ? seats_min_raw : 0;
    const year_min =
      Number.isFinite(year_min_raw) && year_min_raw > 0 ? year_min_raw : 0;
    const year_max =
      Number.isFinite(year_max_raw) && year_max_raw > 0 ? year_max_raw : 0;

    const brands = (
      Array.isArray(req.body.brands)
        ? req.body.brands
        : typeof req.body.brands === "string"
          ? req.body.brands.split(",")
          : req.body.brand
            ? [req.body.brand]
            : []
    )
      .map((item) => String(item).trim())
      .filter(Boolean);
    const models = (
      Array.isArray(req.body.models)
        ? req.body.models
        : typeof req.body.models === "string"
          ? req.body.models.split(",")
          : req.body.model
            ? [req.body.model]
            : []
    )
      .map((item) => String(item).trim())
      .filter(Boolean);
    const types = (
      Array.isArray(req.body.types)
        ? req.body.types
        : typeof req.body.types === "string"
          ? req.body.types.split(",")
          : req.body.type
            ? [req.body.type]
            : []
    )
      .map((item) => String(item).trim())
      .filter(Boolean);
    const transmissions = (
      Array.isArray(req.body.transmissions)
        ? req.body.transmissions
        : typeof req.body.transmissions === "string"
          ? req.body.transmissions.split(",")
          : req.body.transmission
            ? [req.body.transmission]
            : []
    )
      .map((item) => String(item).trim().toLowerCase())
      .filter(Boolean);
    const fuel_types = (
      Array.isArray(req.body.fuel_types)
        ? req.body.fuel_types
        : typeof req.body.fuel_types === "string"
          ? req.body.fuel_types.split(",")
          : req.body.fuel_type
            ? [req.body.fuel_type]
            : []
    )
      .map((item) => Number(item))
      .filter((item) => Number.isFinite(item));

    const filter = {
      is_deleted: false,
      status: req.body.status ? String(req.body.status).trim() : "available",
    };
    const and_filters = [];

    if (
      req.body.vendor_id &&
      mongoose.Types.ObjectId.isValid(req.body.vendor_id)
    ) {
      filter.vendor_id = new mongoose.Types.ObjectId(String(req.body.vendor_id));
    }

    if (
      req.body.country_id &&
      mongoose.Types.ObjectId.isValid(req.body.country_id)
    ) {
      filter.country_id = new mongoose.Types.ObjectId(
        String(req.body.country_id),
      );
    }

    if (req.body.city_id && mongoose.Types.ObjectId.isValid(req.body.city_id)) {
      filter.city_id = new mongoose.Types.ObjectId(String(req.body.city_id));
    }

    if (req.body.search) {
      const search_regex = new RegExp(
        String(req.body.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );
      and_filters.push({
        $or: [{ brand: search_regex }, { model: search_regex }],
      });
    }

    if (brands.length) {
      filter.brand =
        brands.length === 1
          ? new RegExp(
              `^${String(brands[0]).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
              "i",
            )
          : {
              $in: brands.map(
                (item) =>
                  new RegExp(
                    `^${String(item).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                    "i",
                  ),
              ),
            };
    }

    if (models.length) {
      filter.model =
        models.length === 1
          ? new RegExp(
              `^${String(models[0]).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
              "i",
            )
          : {
              $in: models.map(
                (item) =>
                  new RegExp(
                    `^${String(item).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                    "i",
                  ),
              ),
            };
    }

    if (types.length) {
      filter.type =
        types.length === 1
          ? new RegExp(
              `^${String(types[0]).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
              "i",
            )
          : {
              $in: types.map(
                (item) =>
                  new RegExp(
                    `^${String(item).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                    "i",
                  ),
              ),
            };
    }

    if (transmissions.length) {
      filter.transmission =
        transmissions.length === 1
          ? transmissions[0]
          : { $in: transmissions };
    }

    if (fuel_types.length) {
      filter.fuel_type =
        fuel_types.length === 1 ? fuel_types[0] : { $in: fuel_types };
    }

    if (price_min > 0 || price_max > 0) {
      filter.price_per_day = {};
      if (price_min > 0) filter.price_per_day.$gte = price_min;
      if (price_max > 0) filter.price_per_day.$lte = price_max;
    }

    if (seats_min > 0) {
      filter.seats = { $gte: seats_min };
    }

    if (year_min > 0 || year_max > 0) {
      filter.year = {};
      if (year_min > 0) filter.year.$gte = year_min;
      if (year_max > 0) filter.year.$lte = year_max;
    }

    const sort_value = String(req.body.sort || "recommended")
      .trim()
      .toLowerCase();
    let sort_stage = { createdAt: -1 };
    if (sort_value === "price_low") {
      sort_stage = { price_per_day: 1, createdAt: -1 };
    } else if (sort_value === "price_high") {
      sort_stage = { price_per_day: -1, createdAt: -1 };
    } else if (sort_value === "newest") {
      sort_stage = { createdAt: -1 };
    } else if (sort_value === "year_new") {
      sort_stage = { year: -1, createdAt: -1 };
    } else if (sort_value === "seats_high") {
      sort_stage = { seats: -1, createdAt: -1 };
    }

    const query = and_filters.length
      ? { ...filter, $and: and_filters }
      : filter;

    const [items, total] = await Promise.all([
      Car.find(query).sort(sort_stage).skip(skip).limit(limit),
      Car.countDocuments(query),
    ]);

    const mapped_items = items.map((item) => ({
      id: String(item._id),
      vendor_id: item.vendor_id ? String(item.vendor_id) : "",
      country_id: item.country_id ? String(item.country_id) : "",
      city_id: item.city_id ? String(item.city_id) : "",
      brand: item.brand || "",
      model: item.model || "",
      year: Number(item.year || 0),
      type: item.type || "",
      transmission: item.transmission || "",
      fuel_type: Number(item.fuel_type || 0),
      seats: Number(item.seats || 0),
      price_per_day: Number(item.price_per_day || 0),
      images: Array.isArray(item.images)
        ? item.images.map((img) => ({
            url: String(img),
            alt: `${item.brand || ""} ${item.model || ""}`.trim(),
          }))
        : [],
      status: item.status || "available",
    }));

    return res.status(200).json({
      success: true,
      message: "Transportation fetched",
      data: {
        items: mapped_items,
        pagination: {
          page,
          limit,
          total,
          has_more: page * limit < total,
        },
      },
    });
  } catch (error) {
    console.error("search_transportation error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch transportation",
    });
  }
};

export const get_transportation_detail = async (req, res) => {
  try {
    const transport_id = req.params.transport_id;

    if (!mongoose.Types.ObjectId.isValid(transport_id)) {
      return res.status(404).json({
        success: false,
        message: "Transportation not found",
      });
    }

    const transportation = await Car.findOne({
      _id: transport_id,
      is_deleted: false,
    });

    if (!transportation) {
      return res.status(404).json({
        success: false,
        message: "Transportation not found",
      });
    }

    const pickup_date = req.body.pickup_date
      ? String(req.body.pickup_date).trim()
      : "";
    const return_date = req.body.return_date
      ? String(req.body.return_date).trim()
      : "";

    let total_days = 1;
    if (pickup_date && return_date) {
      const pickup = new Date(pickup_date);
      const dropoff = new Date(return_date);
      const diff_ms = dropoff.getTime() - pickup.getTime();
      const parsed_days = Math.ceil(diff_ms / (1000 * 60 * 60 * 24));
      if (Number.isFinite(parsed_days) && parsed_days > 0) {
        total_days = parsed_days;
      }
    }

    const price_per_day = Number(transportation.price_per_day || 0);
    const subtotal = price_per_day * total_days;
    const fees = 0;
    const total = subtotal + fees;

    return res.status(200).json({
      success: true,
      message: "Transportation detail fetched",
      data: {
        transportation: {
          id: String(transportation._id),
          vendor_id: transportation.vendor_id
            ? String(transportation.vendor_id)
            : "",
          country_id: transportation.country_id
            ? String(transportation.country_id)
            : "",
          city_id: transportation.city_id ? String(transportation.city_id) : "",
          brand: transportation.brand || "",
          model: transportation.model || "",
          year: Number(transportation.year || 0),
          type: transportation.type || "",
          transmission: transportation.transmission || "",
          fuel_type: Number(transportation.fuel_type || 0),
          seats: Number(transportation.seats || 0),
          price_per_day,
          images: Array.isArray(transportation.images)
            ? transportation.images.map((img) => ({
                url: String(img),
                alt: `${transportation.brand || ""} ${
                  transportation.model || ""
                }`.trim(),
              }))
            : [],
          status: transportation.status || "available",
        },
        pricing: {
          total_days,
          price_per_day,
          subtotal,
          fees,
          total,
        },
      },
    });
  } catch (error) {
    console.error("get_transportation_detail error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch transportation detail",
    });
  }
};
