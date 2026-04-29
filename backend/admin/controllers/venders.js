import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Vendor from "../../configs/models/models/vendors.js";

export const create_vendor = async (req, res) => {
  try {
    const {
      company_name,
      business_type,
      email,
      phone,
      password,
      company_logo,
      description,
      country_id,
      city_id,
      address,
      license_number,
      commission_rate,
    } = req.body || {};

    if (
      !company_name ||
      business_type === undefined ||
      !email ||
      !phone ||
      !password ||
      !country_id ||
      !city_id
    ) {
      return res.status(400).json({
        success: false,
        message:
          "company_name, business_type, email, phone, password, country_id and city_id are required",
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

    const normalized_email = String(email).trim().toLowerCase();
    const normalized_phone = String(phone).trim();
    const normalized_business_type = Number(business_type);

    if (![1, 2, 3].includes(normalized_business_type)) {
      return res.status(400).json({
        success: false,
        message: "business_type must be 1, 2, or 3",
      });
    }

    const existing_vendor = await Vendor.findOne({
      is_deleted: false,
      $or: [{ email: normalized_email }, { phone: normalized_phone }],
    });

    if (existing_vendor) {
      return res.status(409).json({
        success: false,
        message:
          existing_vendor.email === normalized_email
            ? "Email already exists"
            : "Phone already exists",
      });
    }

    const hashed_password = await bcrypt.hash(String(password), 10);

    const payload = {
      company_name: String(company_name).trim(),
      business_type: normalized_business_type,
      email: normalized_email,
      phone: normalized_phone,
      password: hashed_password,
      company_logo: company_logo ? String(company_logo).trim() : "",
      description: description ? String(description).trim() : "",
      country_id: new mongoose.Types.ObjectId(String(country_id)),
      city_id: new mongoose.Types.ObjectId(String(city_id)),
      address: address ? String(address).trim() : "",
      license_number: license_number ? String(license_number).trim() : "",
      commission_rate:
        commission_rate !== undefined && commission_rate !== null
          ? Number(commission_rate)
          : 10,
      status: 0,
    };

    const vendor = await Vendor.create(payload);

    return res.status(201).json({
      success: true,
      message: "Vendor created successfully",
      data: {
        vendor: {
          id: String(vendor._id),
          company_name: vendor.company_name,
          business_type: vendor.business_type,
          email: vendor.email,
          phone: vendor.phone,
          country_id: String(vendor.country_id),
          city_id: String(vendor.city_id),
          status: vendor.status,
          createdAt: vendor.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("create_vendor error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create vendor",
      error: error.message,
    });
  }
};

export const vendor_list = async (req, res) => {
  try {
    const body = req.body || {};
    const page_raw = Number(body.page || 1);
    const limit_raw = Number(body.limit || 20);
    const page = Number.isFinite(page_raw) && page_raw > 0 ? page_raw : 1;
    const limit =
      Number.isFinite(limit_raw) && limit_raw > 0
        ? Math.min(limit_raw, 100)
        : 20;
    const skip = (page - 1) * limit;

    const filter = { is_deleted: false };

    if (body.business_type !== undefined && body.business_type !== "") {
      const business_type = Number(body.business_type);
      if (Number.isFinite(business_type)) {
        filter.business_type = business_type;
      }
    }

    if (body.status !== undefined && body.status !== "") {
      const status = Number(body.status);
      if (Number.isFinite(status)) {
        filter.status = status;
      }
    }

    if (body.country_id && mongoose.Types.ObjectId.isValid(body.country_id)) {
      filter.country_id = new mongoose.Types.ObjectId(String(body.country_id));
    }

    if (body.city_id && mongoose.Types.ObjectId.isValid(body.city_id)) {
      filter.city_id = new mongoose.Types.ObjectId(String(body.city_id));
    }

    const and_filters = [];
    if (body.search) {
      const search_regex = new RegExp(
        String(body.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );
      and_filters.push({
        $or: [
          { company_name: search_regex },
          { email: search_regex },
          { phone: search_regex },
          { license_number: search_regex },
        ],
      });
    }

    const query = and_filters.length
      ? { ...filter, $and: and_filters }
      : filter;

    const [vendors, total] = await Promise.all([
      Vendor.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Vendor.countDocuments(query),
    ]);

    const items = vendors.map((vendor) => ({
      id: String(vendor._id),
      company_name: vendor.company_name || "",
      business_type: Number(vendor.business_type || 0),
      email: vendor.email || "",
      phone: vendor.phone || "",
      company_logo: vendor.company_logo || "",
      description: vendor.description || "",
      country_id: vendor.country_id ? String(vendor.country_id) : "",
      city_id: vendor.city_id ? String(vendor.city_id) : "",
      address: vendor.address || "",
      license_number: vendor.license_number || "",
      commission_rate: Number(vendor.commission_rate || 0),
      status: Number(vendor.status || 0),
      approved_by: vendor.approved_by ? String(vendor.approved_by) : "",
      approved_at: vendor.approved_at || null,
      last_login_at: vendor.last_login_at || null,
      last_login_ip: vendor.last_login_ip || "",
      created_at: vendor.createdAt,
      updated_at: vendor.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      message: "Vendor list fetched",
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          has_more: page * limit < total,
        },
      },
    });
  } catch (error) {
    console.error("vendor_list error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch vendor list",
    });
  }
};
