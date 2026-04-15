import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../../configs/models/models/users.js";

export const register_user = async (req, res) => {
  try {
    const first_name = req.body.first_name ?? req.body.firstName;
    const last_name = req.body.last_name ?? req.body.lastName;
    const email = req.body.email;
    const phone = req.body.phone;
    const password = req.body.password;
    const accept_terms = req.body.accept_terms ?? req.body.acceptTerms;

    if (!first_name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "first_name, email, phone and password are required",
      });
    }

    if (accept_terms !== undefined && !accept_terms) {
      return res.status(400).json({
        success: false,
        message: "Please accept terms",
      });
    }

    const first_name_value = String(first_name).trim();
    const last_name_value = last_name ? String(last_name).trim() : "";
    const email_value = String(email).trim().toLowerCase();
    const phone_value = String(phone).trim();

    const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email_regex.test(email_value)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const password_regex = {
      min_length: /.{8,}/,
      has_upper_case: /[A-Z]/,
      has_lower_case: /[a-z]/,
      has_number: /[0-9]/,
      has_symbol: /[^A-Za-z0-9]/,
    };

    if (!password_regex.min_length.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    if (!password_regex.has_upper_case.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must include at least one uppercase letter",
      });
    }

    if (!password_regex.has_lower_case.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must include at least one lowercase letter",
      });
    }

    if (!password_regex.has_number.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must include at least one number",
      });
    }

    if (!password_regex.has_symbol.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must include at least one special character",
      });
    }

    const existing_user = await User.findOne({
      is_deleted: false,
      $or: [{ email: email_value }, { phone: phone_value }],
    });

    if (existing_user) {
      return res.status(409).json({
        success: false,
        message:
          existing_user.email === email_value
            ? "Email already exists"
            : "Phone already exists",
      });
    }

    const hashed_password = await bcrypt.hash(password, 10);

    const user = await User.create({
      first_name: first_name_value,
      last_name: last_name_value,
      email: email_value,
      phone: phone_value,
      password: hashed_password,
    });

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: "user",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    user.auth_token = token;
    user.last_login_at = new Date();
    await user.save();

    const is_production = process.env.NODE_ENV === "production";
    const cookie_domain = process.env.AUTH_COOKIE_DOMAIN?.trim();
    const cookie_options = {
      httpOnly: true,
      secure: is_production,
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    if (is_production && cookie_domain) {
      cookie_options.domain = cookie_domain;
    }

    res.cookie("user_auth_token", token, cookie_options);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        token,
        user: {
          id: String(user._id),
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          phone: user.phone,
        },
      },
    });
  } catch (error) {
    console.error("register_user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to register user",
      error: error.message,
    });
  }
};

export const login_user = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const email_value = email ? String(email).trim().toLowerCase() : "";

    if (!email_value || !password) {
      return res.status(400).json({
        success: false,
        message: "email and password are required",
      });
    }

    const user = await User.findOne({ email: email_value, is_deleted: false });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "User is blocked",
      });
    }

    const is_password_valid = await bcrypt.compare(password, user.password);

    if (!is_password_valid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: "user",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    user.auth_token = token;
    user.last_login_at = new Date();
    user.last_login_ip = req.ip;
    await user.save();

    const is_production = process.env.NODE_ENV === "production";
    const cookie_domain = process.env.AUTH_COOKIE_DOMAIN?.trim();
    const cookie_options = {
      httpOnly: true,
      secure: is_production,
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    if (is_production && cookie_domain) {
      cookie_options.domain = cookie_domain;
    }

    res.cookie("user_auth_token", token, cookie_options);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: String(user._id),
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          phone: user.phone,
          userType: "customer",
        },
      },
    });
  } catch (error) {
    console.error("login_user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to login user",
      error: error.message,
    });
  }
};

export const get_current_user = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthenticated",
      });
    }

    const user = await User.findOne({
      _id: req.user.id,
      is_deleted: false,
    }).select("-password -otp");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthenticated",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Session loaded",
      data: {
        user: {
          id: String(user._id),
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          phone: user.phone,
        },
      },
    });
  } catch (error) {
    console.error("get_current_user error:", error);
    return res.status(401).json({
      success: false,
      message: "Unauthenticated",
    });
  }
};

export const logout_user = async (req, res) => {
  try {
    const auth_header = req.headers.authorization;
    const bearer_token = auth_header?.startsWith("Bearer ")
      ? auth_header.split(" ")[1]
      : null;
    const token = bearer_token || req.cookies?.user_auth_token;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        await User.findByIdAndUpdate(decoded.id, {
          $set: { auth_token: null },
        });
      } catch (error) {
        // Do not fail signout for invalid token; cookie cleanup still applies.
      }
    }

    const is_production = process.env.NODE_ENV === "production";
    const cookie_domain = process.env.AUTH_COOKIE_DOMAIN?.trim();
    const cookie_options = {
      httpOnly: true,
      secure: is_production,
      sameSite: "strict",
      path: "/",
      maxAge: undefined,
    };

    if (is_production && cookie_domain) {
      cookie_options.domain = cookie_domain;
    }

    res.clearCookie("user_auth_token", {
      ...cookie_options,
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
      data: {},
    });
  } catch (error) {
    console.error("logout_user error:", error);
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

export const forgot_password = async (req, res) => {
  try {
    const email = req.body.email;
    const email_value = email ? String(email).trim().toLowerCase() : "";

    if (!email_value) {
      return res.status(400).json({
        success: false,
        message: "Unable to send reset email",
      });
    }

    const user = await User.findOne({ email: email_value, is_deleted: false });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Unable to send reset email",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password reset instructions sent",
      data: {},
    });
  } catch (error) {
    console.error("forgot_password error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to send reset email",
    });
  }
};

export const update_user = async (req, res) => {
  try {
    const user_id = req.user?.id || req.body.user_id;

    if (!user_id || !mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({
        success: false,
        message: "Valid user_id is required",
      });
    }

    const first_name =
      typeof req.body.first_name === "string" ? req.body.first_name.trim() : "";
    const last_name =
      typeof req.body.last_name === "string" ? req.body.last_name.trim() : "";
    const phone =
      typeof req.body.phone === "string" ? req.body.phone.trim() : "";
    const country_id =
      typeof req.body.country_id === "string" ? req.body.country_id.trim() : "";
    const city_id =
      typeof req.body.city_id === "string" ? req.body.city_id.trim() : "";

    const user = await User.findOne({ _id: user_id, is_deleted: false });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (phone) {
      const phone_exists = await User.findOne({
        _id: { $ne: user_id },
        phone,
        is_deleted: false,
      });

      if (phone_exists) {
        return res.status(409).json({
          success: false,
          message: "Phone already exists",
        });
      }
    }

    if (country_id && !mongoose.Types.ObjectId.isValid(country_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid country_id",
      });
    }

    if (city_id && !mongoose.Types.ObjectId.isValid(city_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid city_id",
      });
    }

    const update_payload = {};

    if (first_name) update_payload.first_name = first_name;
    if (last_name) update_payload.last_name = last_name;
    if (phone) update_payload.phone = phone;
    if (country_id)
      update_payload.country_id = new mongoose.Types.ObjectId(country_id);
    if (city_id) update_payload.city_id = new mongoose.Types.ObjectId(city_id);

    const updated_user = await User.findByIdAndUpdate(
      user_id,
      { $set: update_payload },
      { new: true },
    );

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: {
        _id: updated_user._id,
        first_name: updated_user.first_name,
        last_name: updated_user.last_name,
        email: updated_user.email,
        phone: updated_user.phone,
        profile: updated_user.profile,
        country_id: updated_user.country_id,
        city_id: updated_user.city_id,
        status: updated_user.status,
        email_verified: updated_user.email_verified,
        createdAt: updated_user.createdAt,
        updatedAt: updated_user.updatedAt,
      },
    });
  } catch (error) {
    console.error("update_user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error.message,
    });
  }
};

export const get_user_list = async (req, res) => {
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

    const filter = { is_deleted: false };

    if (search) {
      filter.$or = [
        { first_name: { $regex: search, $options: "i" } },
        { last_name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      filter.status = status;
    }

    const [users, total_records] = await Promise.all([
      User.find(filter)
        .select("-password -otp -token")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "User list fetched successfully",
      users: users.map((item) => ({
        _id: item._id,
        first_name: item.first_name,
        last_name: item.last_name,
        email: item.email,
        phone: item.phone,
        profile: item.profile,
        country_id: item.country_id,
        city_id: item.city_id,
        status: item.status,
        email_verified: item.email_verified,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      page,
      limit,
      total_records,
      total_pages: Math.ceil(total_records / limit),
    });
  } catch (error) {
    console.error("get_user_list error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user list",
      error: error.message,
    });
  }
};
