import Admin from "../../configs/models/models/admin.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import Twilio from "twilio";

export const create_first_admin = async (req, res) => {
  try {
    const adminExists = await Admin.findOne();
    if (adminExists) {
      return res.status(403).json({
        message: "Super admin already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const admin = await Admin.create({
      full_name: req.body.full_name,
      email: req.body.email,
      password: hashedPassword,
      username: req.body.username,
      type: 0, // 👈 highest level
      admin_type: 0,
      sqn: 1,
    });

    return res.status(201).json({
      success: true,
      message: "Super admin created",
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

const getAuthCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";
  const cookieDomain = process.env.AUTH_COOKIE_DOMAIN?.trim();

  const options = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
  };

  // Share auth cookie across subdomains (e.g. admin/api) in production.
  if (isProduction && cookieDomain) {
    options.domain = cookieDomain;
  }

  return options;
};

export const create_admin = async (req, res) => {
  try {
    const {
      full_name,
      phone_number,
      email,
      role_id,
      password,
      managed_by,
      username,
      admin_type,
      country_code,
      country_id,
      city_id,
    } = req.body;

    const emailToCheck = email?.trim().toLowerCase();
    const usernameToCheck = username?.trim().toLowerCase();
    const phoneToCheck = phone_number?.trim();

    const existing = await Admin.findOne({
      $or: [
        { email: emailToCheck },
        { username: usernameToCheck },
        { phone: phoneToCheck },
      ],
    });

    if (existing) {
      let conflictField = "";
      if (existing.email === emailToCheck) conflictField = "Email";
      else if (existing.username === usernameToCheck)
        conflictField = "Username";
      else if (existing.phone === phoneToCheck) conflictField = "Phone number";
      else conflictField = "Email, username, or phone number";

      return res
        .status(409)
        .json({ success: false, message: `${conflictField} already exists` });
    }

    // Build phone string from country code + phone number if provided
    const phone = [null ?? "", phone_number ?? ""].join("");

    // Handle uploaded file via multer
    const profileFileName = req.file ? req.file.filename : null;

    // Hash password (sha256 to avoid extra deps; replace with bcrypt if desired)
    const hashedPassword = await bcrypt.hash(password, 10);

    const createdBy = new mongoose.Types.ObjectId(req.admin.id);
    const roleId = new mongoose.Types.ObjectId(role_id);
    let managedBy;
    if (req.admin.admin_type === 0) {
      switch (admin_type) {
        case "0":
          managedBy = null;
          break;
        case "1":
          managedBy = new mongoose.Types.ObjectId(req.admin.id);
          break;
        case "2":
        case "3":
          managedBy = new mongoose.Types.ObjectId(managed_by);
          break;
        // Optionally, add a default case if needed
      }
    }

    if (req.admin.admin_type === 1 && admin_type === "2") {
      managedBy = new mongoose.Types.ObjectId(req.admin.id);
    }
    if (req.admin.admin_type === 2 && admin_type === "3") {
      managedBy = new mongoose.Types.ObjectId(req.admin.id);
    }
    const last_admin = await Admin.findOne().sort({ sqn: -1 });
    const nextSqn = last_admin ? last_admin.sqn + 1 : 1;

    const adminDoc = await Admin.create({
      sqn: nextSqn,
      full_name,
      email,
      country_id: country_id ? new mongoose.Types.ObjectId(country_id) : null,
      city_id: city_id ? new mongoose.Types.ObjectId(city_id) : null,
      country_code: country_code,
      password: hashedPassword,
      phone: `${country_code} ${phone_number}`,
      profile: profileFileName || undefined,
      role_id: roleId ?? null,
      managed_by: managedBy ?? null,
      created_by: createdBy ?? null,
      username: username,
      type: +admin_type,
    });

    const admin = adminDoc.toObject();

    return res.status(201).json({
      success: true,
      message: "Admin created successfully",
    });
  } catch (error) {
    console.error("create_admin error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create admin",
      error: error.message,
    });
  }
};

export const edit_admin = async (req, res) => {
  try {
    const {
      admin_id,
      full_name,
      phone_number,
      email,
      role_id,
      managed_by,
      username,
      admin_type,
      country_code,
      country_id,
      city_id,
    } = req.body;

    // Check if admin exists
    const adminToUpdate = await Admin.findById(admin_id);
    if (!adminToUpdate) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Check for duplicate email, username, or phone (excluding the current admin)
    const emailToCheck = email?.trim().toLowerCase();
    const usernameToCheck = username?.trim().toLowerCase();
    const phoneToCheck = `${country_code} ${phone_number}`.trim();

    const existing = await Admin.findOne({
      _id: { $ne: admin_id }, // Exclude the current admin
      $or: [
        { email: emailToCheck },
        { username: usernameToCheck },
        { phone: phoneToCheck },
      ],
    });

    if (existing) {
      let conflictField = "";
      if (existing.email === emailToCheck) conflictField = "Email";
      else if (existing.username === usernameToCheck)
        conflictField = "Username";
      else if (existing.phone === phoneToCheck) conflictField = "Phone number";
      else conflictField = "Email, username, or phone number";

      return res
        .status(409)
        .json({ success: false, message: `${conflictField} already exists` });
    }

    // Handle uploaded file via multer
    const profileFileName = req.file
      ? req.file.filename
      : adminToUpdate.profile;

    // Determine managed_by based on admin_type and current admin
    let managedBy = adminToUpdate.managed_by;
    if (admin_type !== undefined) {
      if (req.admin.admin_type === 0) {
        switch (admin_type) {
          case "0":
            managedBy = null;
            break;
          case "1":
            managedBy = new mongoose.Types.ObjectId(req.admin.id);
            break;
          case "2":
          case "3":
            managedBy = managed_by
              ? new mongoose.Types.ObjectId(managed_by)
              : managedBy;
            break;
        }
      }

      if (req.admin.admin_type === 1 && admin_type === "2") {
        managedBy = new mongoose.Types.ObjectId(req.admin.id);
      }
      if (req.admin.admin_type === 2 && admin_type === "3") {
        managedBy = new mongoose.Types.ObjectId(req.admin.id);
      }
    }

    // Prepare update object
    const updateData = {
      full_name,
      email,
      username,
      phone: `${country_code} ${phone_number}`,
      phone_code: country_code,
      country_id: country_id
        ? new mongoose.Types.ObjectId(country_id)
        : adminToUpdate.country_id,
      city_id: city_id
        ? new mongoose.Types.ObjectId(city_id)
        : adminToUpdate.city_id,
      profile: profileFileName,
      updated_at: new Date(),
    };

    // Only update role_id if provided
    if (role_id) {
      updateData.role_id = new mongoose.Types.ObjectId(role_id);
    }

    // Only update type and managed_by if admin_type is provided
    if (admin_type !== undefined) {
      updateData.type = +admin_type;
      updateData.managed_by = managedBy;
    }

    // Update the admin
    const updatedAdmin = await Admin.findByIdAndUpdate(
      admin_id,
      { $set: updateData },
      { new: true },
    );

    return res.status(200).json({
      success: true,
      message: "Admin updated successfully",
    });
  } catch (error) {
    console.error("edit_admin error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update admin",
      error: error.message,
    });
  }
};

export const get_all_admins = async (req, res) => {
  try {
    const page = req.body.page ?? 1;
    const limit = req.body.limit || 15;
    const skip = (page - 1) * limit;

    const { admin_type, search_by, search, filter_by, filter_value } = req.body;
    console.log(typeof admin_type);
    let matchCondition = {};

    // Apply admin type filtering based on user's admin type
    if (admin_type !== 0) {
      matchCondition.managed_by = new mongoose.Types.ObjectId(req.admin.id);
    }

    // Apply search logic based on search_by parameter
    if (search && search_by) {
      switch (search_by) {
        case "0": // Name
          matchCondition.full_name = { $regex: search, $options: "i" };
          break;
        case "1": // Username
          matchCondition.username = { $regex: search, $options: "i" };
          break;
        case "2": // Email
          matchCondition.email = { $regex: search, $options: "i" };
          break;
        case "3": // Phone
          matchCondition.phone = { $regex: search, $options: "i" };
          break;
      }
    }

    // Apply filter logic based on filter_by parameter
    if (filter_by && filter_value) {
      switch (filter_by) {
        case "status":
          matchCondition.status = parseInt(filter_value);
          break;
        case "type":
          matchCondition.type = parseInt(filter_value);
          break;
        case "role":
          matchCondition.role_id = new mongoose.Types.ObjectId(filter_value);
          break;
      }
    }

    const totalAdmins = await Admin.countDocuments(matchCondition);
    const totalPages = Math.ceil(totalAdmins / limit);
    const country_lookup = {
      $lookup: {
        from: "countries",
        localField: "country_id",
        foreignField: "_id",
        as: "country",
        pipeline: [
          {
            $project: {
              _id: 1,
              name: 1,
              phone_code: 1,
            },
          },
        ],
      },
    };
    const city_lookup = {
      $lookup: {
        from: "cities",
        localField: "city_id",
        foreignField: "_id",
        as: "city",
        pipeline: [
          {
            $project: {
              _id: 1,
              name: 1,
            },
          },
        ],
      },
    };
    const role_lookup = {
      $lookup: {
        from: "rolepermissions",
        localField: "role_id",
        foreignField: "_id",
        as: "role",
        pipeline: [
          {
            $project: {
              _id: 1,
              title: 1,
            },
          },
        ],
      },
    };
    const managed_by_lookup = {
      $lookup: {
        from: "admins",
        localField: "managed_by",
        foreignField: "_id",
        as: "managed_by",
        pipeline: [
          {
            $project: {
              _id: 1,
              full_name: 1,
            },
          },
        ],
      },
    };
    const created_by_lookup = {
      $lookup: {
        from: "admins",
        localField: "created_by",
        foreignField: "_id",
        as: "created_by",
        pipeline: [
          {
            $project: {
              _id: 1,
              full_name: 1,
            },
          },
        ],
      },
    };

    const unwind_country = {
      $unwind: { path: "$country", preserveNullAndEmptyArrays: true },
    };
    const unwind_city = {
      $unwind: { path: "$city", preserveNullAndEmptyArrays: true },
    };
    const unwind_role = {
      $unwind: { path: "$role", preserveNullAndEmptyArrays: true },
    };
    const unwind_managed_by = {
      $unwind: { path: "$managed_by", preserveNullAndEmptyArrays: true },
    };
    const unwind_created_by = {
      $unwind: { path: "$created_by", preserveNullAndEmptyArrays: true },
    };

    const projection = {
      $project: {
        _id: 1,
        sqn: 1,
        full_name: 1,
        username: 1,
        email: 1,
        phone: 1,
        profile: 1,
        country: 1,
        city: 1,
        role: 1,
        managed_by: 1,
        created_by: 1,
        type: 1,
        status: 1,
        created_at: 1,
      },
    };

    const pipeline = [];
    if (Object.keys(matchCondition).length > 0) {
      pipeline.push({ $match: matchCondition });
    }
    pipeline.push(country_lookup);
    pipeline.push(city_lookup);
    pipeline.push(role_lookup);
    pipeline.push(managed_by_lookup);
    pipeline.push(created_by_lookup);
    pipeline.push(unwind_country);
    pipeline.push(unwind_city);
    pipeline.push(unwind_role);
    pipeline.push(unwind_managed_by);
    pipeline.push(unwind_created_by);
    pipeline.push(projection);

    const admins = await Admin.aggregate(pipeline).skip(skip).limit(limit);
    return res.status(200).json({
      success: true,
      message: "Admins fetched successfully",
      admins: admins,
      total_pages: totalPages,
      total_records: totalAdmins,
      page: page,
      limit: limit,
    });
  } catch (error) {
    console.error("get_all_admins error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admins",
      error: error.message,
    });
  }
};

// Reset admin login lockout
export const reset_admin_lockout = async (req, res) => {
  try {
    const { admin_id } = req.body;

    if (!admin_id) {
      return res.status(400).json({
        success: false,
        message: "Admin ID is required",
      });
    }

    const admin = await Admin.findById(admin_id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Reset login attempts
    admin.login_attempts = 0;
    await admin.save();

    return res.status(200).json({
      success: true,
      message:
        "Login attempts reset successfully. You can now try logging in again.",
    });
  } catch (error) {
    console.error("reset_admin_lockout error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while resetting login attempts",
      error: error.message,
    });
  }
};

export const signin_admin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const identifier = username.trim().toLowerCase();
    const admin = await Admin.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or email",
      });
    }

    const loginAttempts = admin.login_attempts || 0;

    if (admin.status === 2 || admin.status === 3) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is inactive or suspended. Please contact an administrator.",
      });
    }
    if (loginAttempts >= 3 && admin.login_at) {
      const lockoutTime = 15; // minutes
      const currentTime = new Date();
      const loginAtTime = new Date(admin.login_at);
      const timeDiffInMinutes = Math.floor(
        (currentTime - loginAtTime) / (1000 * 60),
      );

      if (timeDiffInMinutes < lockoutTime) {
        const remainingMinutes = lockoutTime - timeDiffInMinutes;
        return res.json({
          success: false,
          message: `Account is temporarily locked due to multiple failed attempts. Please try again in ${remainingMinutes} minutes or use the "Reset Lockout" option.`,
          lockout: true,
          remainingMinutes,
          admin_id: admin._id,
        });
      } else {
        admin.login_attempts = 0;
        await admin.save();
      }
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      admin.login_attempts = loginAttempts + 1;
      admin.login_at = new Date();
      await admin.save();

      return res.json({
        success: false,
        message: `Invalid password. ${
          3 - admin.login_attempts
        } attempts remaining before lockout.`,
        attemptsRemaining: 3 - admin.login_attempts,
      });
    }

    admin.login_attempts = 0;
    admin.login_at = null;
    admin.last_login_at = new Date();
    await admin.save();

    const token = jwt.sign(
      {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        admin_type: admin.type,
        role_id: admin.role_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.cookie("auth_token", token, {
      ...getAuthCookieOptions(),
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    console.error("signin_admin error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred during login",
      error: error.message,
    });
  }
};

// Verify authentication and return admin data
export const verify_auth = async (req, res) => {
  try {
    // The verifyToken middleware should have already verified the token and added admin data to req.admin
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Authentication verified",
      admin: req.admin,
    });
  } catch (error) {
    console.error("verify_auth error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify authentication",
      error: error.message,
    });
  }
};
// Sign out admin by clearing auth cookie
export const signout_admin = async (req, res) => {
  try {
    res.clearCookie("auth_token", {
      ...getAuthCookieOptions(),
    });
    return res
      .status(200)
      .json({ success: true, message: "Signed out successfully" });
  } catch (error) {
    console.error("signout_admin error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to sign out",
      error: error.message,
    });
  }
};

export const get_managed_by_admins = async (req, res) => {
  const { type } = req.body;
  try {
    const admins = await Admin.find({ type: type - 1, status: 1 }).select(
      "username _id",
    );
    return res.status(200).json({ success: true, admins });
  } catch (error) {
    console.error("get_managed_by_admins error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch managed by admins",
      error: error.message,
    });
  }
};

export const get_current_admin = async (req, res) => {
  try {
    // The admin data should be available in req.admin from the auth middleware
    if (!req.admin || !req.admin.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const adminId = req.admin.id;
    const admin = await Admin.findById(adminId).select("-password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    return res.status(200).json({
      success: true,
      admin: admin,
    });
  } catch (error) {
    console.error("get_current_admin error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin data",
      error: error.message,
    });
  }
};

export const change_admin_status = async (req, res) => {
  const { admin_id, status, reason } = req.body;
  try {
    const admin = await Admin.findById(admin_id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }
    admin.status = status;
    admin.deactivated_at = new Date();
    admin.deactivated_by = req.admin.id;
    admin.deactivated_reason = reason;
    await admin.save();
    return res
      .status(200)
      .json({ success: true, message: "Admin status changed successfully" });
  } catch (error) {
    console.error("change_admin_status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to change admin status",
      error: error.message,
    });
  }
};

// Generate and send a one-time 6-digit PIN to an admin via WhatsApp
export const generate_admin_pin = async (req, res) => {
  try {
    const { admin_id } = req.body;
    if (!admin_id) {
      return res
        .status(400)
        .json({ success: false, message: "admin_id is required" });
    }

    const admin = await Admin.findById(admin_id);
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    // Generate 6-digit numeric PIN
    const pin = "" + Math.floor(100000 + Math.random() * 900000);

    // Hash the PIN for storage
    const pinHash = await bcrypt.hash(pin, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    admin.pin_hash = pinHash;
    admin.pin_expires_at = expiresAt;
    await admin.save();

    // Send via WhatsApp (placeholder utility using Meta Cloud API/Twilio)
    try {
      await sendWhatsappMessage({
        to: "+252616906500",
        from: "whatsapp:+14155238886", // Using Twilio's sandbox number
        message: `Your verification PIN is ${pin}. It expires in 5 minutes.`,
      });
    } catch (waError) {
      console.error("sendWhatsappMessage error:", waError);
      return res.status(500).json({
        success: false,
        message: "Failed to send PIN via WhatsApp",
      });
    }

    return res.status(200).json({
      success: true,
      message: "PIN generated, stored, and sent successfully",
    });
  } catch (error) {
    console.error("generate_admin_pin error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate PIN",
    });
  }
};

// Simple WhatsApp sender placeholder; replace with real provider integration
async function sendWhatsappMessage({ to, from, message }) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = new Twilio(accountSid, authToken);

  // Always use the Twilio sandbox number for testing
  // This number is available to all Twilio accounts for testing
  const sandboxNumber = "whatsapp:+14155238886";

  // Format destination number - remove spaces and ensure it has whatsapp: prefix
  const cleanedNumber = to.replace(/\s+/g, "");
  const formattedTo = cleanedNumber.startsWith("whatsapp:")
    ? cleanedNumber
    : `whatsapp:${cleanedNumber}`;

  console.log("Using Twilio sandbox number:", sandboxNumber);
  console.log("Sending to:", formattedTo);
  console.log("Message:", message);

  try {
    const messageResponse = await client.messages.create({
      body: message,
      from: sandboxNumber,
      to: formattedTo,
    });
    console.log("Message SID:", messageResponse.sid);
    return true;
  } catch (error) {
    console.error("sendWhatsappMessage error:", error);
    throw error;
  }
}
