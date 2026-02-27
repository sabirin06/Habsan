import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Customer from "../../configs/models/models/customer.js";

// Register User

export const Register = async (req, res) => {
  try {
    const { name, phone, password, confirmPassword } = req.body;
    if (
      !name ||
      !phone ||
      !phone.phone_code ||
      !phone.number ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Full name validation (first, middle, last)
    const nameParts = name.trim().split(/\s+/);

    if (nameParts.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Full name must include first, middle, and last name",
      });
    }

    if (!/^[A-Za-z\s]+$/.test(name)) {
      return res.status(400).json({
        success: false,
        message: "Name must contain only letters and spaces",
      });
    }

    const invalidPart = nameParts.find((part) => part.length < 2);
    if (invalidPart) {
      return res.status(400).json({
        success: false,
        message: "Each part of the name must have at least 2 characters",
      });
    }

    const phoneCodeRegex = /^\+\d{2,4}$/;
    if (!phoneCodeRegex.test(phone.phone_code)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone code format. Example: +252",
      });
    }

    const phoneNumberRegex = /^\d{9}$/;
    if (!phoneNumberRegex.test(phone.number.toString())) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be exactly 9 digits",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const existingUser = await Customer.findOne({
      "phone.phone_code": phone.phone_code,
      "phone.number": phone.number,
      is_quick_registered: false,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Phone number already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new Customer({
      name,
      phone: {
        phone_code: phone.phone_code,
        number: phone.number,
      },
      password: hashedPassword,
    });

    // Generate OTP, Later Real OTP
    const otp = String(Math.floor(1000 + Math.random() * 9000));
    newUser.verifyOtp = 2522;
    newUser.verifyOtpExpireAt = Date.now() + 5 * 60 * 1000; // 15 minutes

    const token = jwt.sign(
      {
        id: newUser._id,
        phone_code: newUser.phone.phone_code,
        phone_number: newUser.phone.number,
        name: newUser.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "90d" }
    );

    newUser.server_token = token;
    await newUser.save();

    // Later Send OTP via SMS
    return res.status(201).json({
      success: true,
      message: "Registered successfully. OTP sent to your phone.",
      user: {
        ...newUser._doc,
        password: undefined,
        verifyOtp: undefined,
        resetOtp: undefined,
        verifyOtpExpireAt: undefined,
        resetOtpExpireAt: undefined,
      },
      token,
    });
  } catch (error) {
    console.error(" Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again later.",
    });
  }
};

export const login = async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
  }
  try {
    const user = await Customer.findOne({
      "phone.phone_code": phone.phone_code,
      "phone.number": phone.number,
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User Not Exist, Please Register First.",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }

    // Get user data without sensitive fields
    const userData = await Customer.findById(user._id).select(
      "-password -verifyOtp -verifyOtpExpireAt -resetOtp -resetOtpExpireAt"
    );
    // Generate token
    // Generate JWT token
    const token = jwt.sign(
      {
        id: userData._id,
        phone_code: userData.phone.phone_code,
        phone_number: userData.phone.number,
        name: userData.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "90d" }
    );

    user.server_token = token;
    await user.save();

    return res.json({
      success: true,
      message: "Login successful",
      user: userData,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
};

export const verifyOTP = async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) {
    return res.status(400).json({
      success: false,
      message: "Missing Details",
    });
  }
  try {
    const user = await Customer.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found.",
      });
    }
    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.json({
        success: false,
        message: "Invalid OTP",
      });
    }
    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({
        success: false,
        message: "OTP expired",
      });
    }

    // Update user verification status
    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();

    // Get updated user data without sensitive fields
    const userData = await Customer.findById(userId).select(
      "-password -verifyOtp -verifyOtpExpireAt -resetOtp -resetOtpExpireAt"
    );

    return res.status(200).json({
      success: true,
      message: "Account verified successfully",
      user: userData,
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify email. Please try again.",
    });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || !phone.phone_code || !phone.number) {
      return res.json({
        success: false,
        message: "Phone code and number are required",
      });
    }

    // Find user by phone object
    const user = await Customer.findOne({
      "phone.phone_code": phone.phone_code,
      "phone.number": phone.number,
    });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found. Please register first.",
      });
    }

    // Generate new OTP
    const otp = String(Math.floor(1000 + Math.random() * 9000));

    // Update OTP and expiry
    user.verifyOtp = 2522;
    user.verifyOtpExpireAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Send OTP via SMS
    return res.status(200).json({
      success: true,
      message: "OTP resent successfully",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to resend OTP. Please try again later.",
    });
  }
};
