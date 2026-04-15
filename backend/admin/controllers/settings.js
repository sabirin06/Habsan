import mongoose from "mongoose";
import Country from "../../configs/models/models/country.js";
import City from "../../configs/models/models/city.js";

export const create_country = async (req, res) => {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const iso_code =
      typeof req.body.iso_code === "string"
        ? req.body.iso_code.trim().toUpperCase()
        : "";
    const currency =
      typeof req.body.currency === "string" ? req.body.currency.trim() : "";
    const phone_code =
      typeof req.body.phone_code === "string" ? req.body.phone_code.trim() : "";
    const status =
      typeof req.body.status === "string" && req.body.status.trim()
        ? req.body.status.trim()
        : "active";

    if (!name || !iso_code) {
      return res.status(400).json({
        success: false,
        message: "name and iso_code are required",
      });
    }

    if (iso_code.length < 2 || iso_code.length > 3) {
      return res.status(400).json({
        success: false,
        message: "iso_code must be 2 or 3 characters",
      });
    }

    const existing_country = await Country.findOne({
      $or: [{ iso_code }, { name: new RegExp(`^${name}$`, "i") }],
    });

    if (existing_country) {
      return res.status(409).json({
        success: false,
        message: "Country already exists with same name or iso_code",
      });
    }

    const country = await Country.create({
      name,
      iso_code,
      currency,
      phone_code,
      status,
    });

    return res.status(201).json({
      success: true,
      message: "Country created successfully",
      country,
    });
  } catch (error) {
    console.error("create_country error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create country",
      error: error.message,
    });
  }
};

export const get_country_list = async (req, res) => {
  try {
    const page = Number(req.body.page || req.query.page || 1);
    const limit = Number(req.body.limit || req.query.limit || 20);
    const skip = (page - 1) * limit;

    const search_source = req.body.search || req.query.search;
    const status_source = req.body.status || req.query.status;
    const search =
      typeof search_source === "string" ? search_source.trim() : "";
    const status =
      typeof status_source === "string" ? status_source.trim() : "";

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { iso_code: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      filter.status = status;
    }

    const [countries, total_records] = await Promise.all([
      Country.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Country.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Country list fetched successfully",
      countries,
      page,
      limit,
      total_records,
      total_pages: Math.ceil(total_records / limit),
    });
  } catch (error) {
    console.error("get_country_list error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch country list",
      error: error.message,
    });
  }
};

export const create_city = async (req, res) => {
  try {
    const country_id =
      typeof req.body.country_id === "string" ? req.body.country_id.trim() : "";
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const state =
      typeof req.body.state === "string" ? req.body.state.trim() : "";
    const timezone =
      typeof req.body.timezone === "string" ? req.body.timezone.trim() : "";
    const status =
      typeof req.body.status === "string" && req.body.status.trim()
        ? req.body.status.trim()
        : "active";
    const lat = req.body.lat;
    const lng = req.body.lng;

    if (!country_id || !name) {
      return res.status(400).json({
        success: false,
        message: "country_id and name are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(country_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid country_id",
      });
    }

    const country = await Country.findById(country_id);
    if (!country) {
      return res.status(404).json({
        success: false,
        message: "Country not found",
      });
    }

    const existing_city = await City.findOne({
      country_id: new mongoose.Types.ObjectId(country_id),
      name: new RegExp(`^${name}$`, "i"),
    });

    if (existing_city) {
      return res.status(409).json({
        success: false,
        message: "City already exists for this country",
      });
    }

    const city = await City.create({
      country_id: new mongoose.Types.ObjectId(country_id),
      name,
      state,
      timezone,
      status,
      lat: lat !== undefined ? Number(lat) : undefined,
      lng: lng !== undefined ? Number(lng) : undefined,
    });

    return res.status(201).json({
      success: true,
      message: "City created successfully",
      city,
    });
  } catch (error) {
    console.error("create_city error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create city",
      error: error.message,
    });
  }
};

export const get_city_list = async (req, res) => {
  try {
    const page = Number(req.body.page || req.query.page || 1);
    const limit = Number(req.body.limit || req.query.limit || 20);
    const skip = (page - 1) * limit;

    const search_source = req.body.search || req.query.search;
    const country_id_source = req.body.country_id || req.query.country_id;
    const status_source = req.body.status || req.query.status;

    const search =
      typeof search_source === "string" ? search_source.trim() : "";
    const country_id =
      typeof country_id_source === "string" ? country_id_source.trim() : "";
    const status =
      typeof status_source === "string" ? status_source.trim() : "";

    const filter = {};

    if (country_id) {
      if (!mongoose.Types.ObjectId.isValid(country_id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid country_id",
        });
      }
      filter.country_id = new mongoose.Types.ObjectId(country_id);
    }

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    if (status) {
      filter.status = status;
    }

    const [cities, total_records] = await Promise.all([
      City.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "countries",
            localField: "country_id",
            foreignField: "_id",
            as: "country",
          },
        },
        { $unwind: { path: "$country", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            country_id: 1,
            name: 1,
            state: 1,
            lat: 1,
            lng: 1,
            timezone: 1,
            status: 1,
            createdAt: 1,
            country_name: "$country.name",
            country_iso_code: "$country.iso_code",
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]),
      City.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "City list fetched successfully",
      cities,
      page,
      limit,
      total_records,
      total_pages: Math.ceil(total_records / limit),
    });
  } catch (error) {
    console.error("get_city_list error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch city list",
      error: error.message,
    });
  }
};

export const get_city_by_country = async (req, res) => {
  try {
    const country_id_source =
      req.body.country_id || req.query.country_id || req.params.country_id;
    const country_id =
      typeof country_id_source === "string" ? country_id_source.trim() : "";

    if (!country_id) {
      return res.status(400).json({
        success: false,
        message: "country_id is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(country_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid country_id",
      });
    }

    const country =
      await Country.findById(country_id).select("_id name iso_code");

    if (!country) {
      return res.status(404).json({
        success: false,
        message: "Country not found",
      });
    }

    const cities = await City.find({
      country_id: new mongoose.Types.ObjectId(country_id),
      status: "active",
    })
      .sort({ name: 1 })
      .select("_id country_id name state lat lng timezone status");

    return res.status(200).json({
      success: true,
      message: "Cities fetched successfully",
      country,
      cities,
    });
  } catch (error) {
    console.error("get_city_by_country error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch cities by country",
      error: error.message,
    });
  }
};
