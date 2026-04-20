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
    } = req.body;

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
