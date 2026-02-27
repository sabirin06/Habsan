import Admin from "../../configs/models/models/admin.js";
import bcrypt from "bcryptjs";

// Find admin by username
export const find_admin_by_username = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    const admin = await Admin.findOne({
      username: username.trim().toLowerCase(),
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Return admin ID only, not the whole object for security
    return res.status(200).json({
      success: true,
      message: "Admin found",
      admin_id: admin._id,
    });
  } catch (error) {
    console.error("find_admin_by_username error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while finding admin",
      error: error.message,
    });
  }
};

// Verify PIN
export const verify_pin = async (req, res) => {
  try {
    const { admin_id, pin } = req.body;

    if (!admin_id || !pin) {
      return res.status(400).json({
        success: false,
        message: "Admin ID and PIN are required",
      });
    }

    const admin = await Admin.findById(admin_id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Check if PIN exists and is not expired
    if (!admin.pin_hash || !admin.pin_expires_at) {
      return res.status(400).json({
        success: false,
        message: "No PIN has been generated or PIN has been used already",
      });
    }

    // Check if PIN is expired
    const now = new Date();
    if (now > new Date(admin.pin_expires_at)) {
      return res.status(400).json({
        success: false,
        message: "PIN has expired. Please request a new PIN",
      });
    }

    // Verify PIN
    const isPinValid = await bcrypt.compare(pin, admin.pin_hash);
    if (!isPinValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid PIN",
      });
    }

    // PIN is valid
    return res.status(200).json({
      success: true,
      message: "PIN verified successfully",
    });
  } catch (error) {
    console.error("verify_pin error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while verifying PIN",
      error: error.message,
    });
  }
};

// Reset password
export const reset_password = async (req, res) => {
  try {
    const { admin_id, newPassword, confirmPassword } = req.body;

    if (!admin_id || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Admin ID, new password, and confirm password are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const admin = await Admin.findById(admin_id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Check if PIN exists and is not expired (required for security)
    if (!admin.pin_hash || !admin.pin_expires_at) {
      return res.status(400).json({
        success: false,
        message: "No PIN has been generated or PIN has been used already",
      });
    }

    // Check if PIN is expired
    const now = new Date();
    if (now > new Date(admin.pin_expires_at)) {
      return res.status(400).json({
        success: false,
        message: "PIN has expired. Please request a new PIN",
      });
    }

    // Validate password complexity (server-side validation)
    const passwordRegex = {
      minLength: /.{8,}/,
      hasUpperCase: /[A-Z]/,
      hasLowerCase: /[a-z]/,
      hasNumber: /[0-9]/,
      hasSymbol: /[^A-Za-z0-9]/,
    };

    if (!passwordRegex.minLength.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    if (!passwordRegex.hasUpperCase.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must include at least one capital letter",
      });
    }

    if (!passwordRegex.hasLowerCase.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must include at least one small letter",
      });
    }

    if (!passwordRegex.hasNumber.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must include at least one number",
      });
    }

    if (!passwordRegex.hasSymbol.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must include at least one symbol",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear PIN
    admin.password = hashedPassword;
    admin.pin_hash = null;
    admin.pin_expires_at = null;
    admin.password_changed_at = new Date();

    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("reset_password error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while resetting password",
      error: error.message,
    });
  }
};
