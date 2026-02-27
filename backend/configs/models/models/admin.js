import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Basic Information
    sqn: {
      type: Number,
      default: 1,
    },
    full_name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    profile: {
      type: String,
    },
    country_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    city_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    role_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    type: {
      type: Number, // this field identifies the type of the admin
      default: 3,
    },

    managed_by: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    // Status & Security
    status: {
      type: Number,
      enum: [1, 2], // ["active", "inactive", "suspended"],
      default: 1,
    },

    deactivated_at: {
      type: Date,
    },
    deactivated_by: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    deactivated_reason: {
      type: String,
      default: null,
    },

    // One-time PIN for actions (e.g., login reset, verification)
    pin_hash: {
      type: String,
    },
    pin_expires_at: {
      type: Date,
    },

    create_for: {
      type: Number,
      default: null,
    }, // yaaloo abuuraa admin kaan
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    }, // adminka naftirkiisa
    // is_email_verified: {
    //   type: Boolean,
    //   default: false,
    // },
    // email_verification_token: {
    //   type: String,
    // },
    // email_verification_expiry: {
    //   type: Date,
    // },

    // Two-Factor Authentication
    two_factor_enabled: {
      type: Boolean,
      default: false,
    },
    two_factor_secret: {
      type: String,
    },
    two_factor_backup_codes: [
      {
        type: String,
      },
    ],
    two_factor_verified: {
      type: Boolean,
      default: false,
    },

    // Password Security
    password_changed_at: {
      type: Date,
    },

    // Login Security & Tracking
    login_attempts: {
      type: Number,
      default: 0,
    },
    lock_until: {
      type: Date,
    },
    login_at: {
      type: Date,
    },
    last_login_ip: {
      type: String,
    },
    last_login_at: {
      type: Date,
      default: null,
    },
    login_history: [
      {
        ip: {
          type: String,
        },
        user_agent: {
          type: String,
        },
        login_time: {
          type: Date,
        },
        success: {
          type: Boolean,
        },
        location: {
          type: {
            type: String,
            enum: ["Point"],
            default: "Point",
          },
          coordinate: [
            {
              type: Number,
            },
          ],
        },
      },
    ],

    // IP Whitelisting
    allowed_ips: [
      {
        type: String,
      },
    ],
    ip_whitelist_enabled: {
      type: Boolean,
      default: false,
    },

    // Session Management
    current_session_id: {
      type: String,
    },
    session_timeout: {
      type: Number,
    },
    refresh_token: {
      type: String,
    },
    refresh_token_expiry: {
      type: Date,
    },

    // Audit & Timestamps
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    last_modified_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    deleted_at: {
      type: Date,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },

    // Additional Metadata
    timezone: {
      type: String,
    },
    language: {
      type: String,
    },
    preferences: {
      dashboard_layout: {
        type: String,
      },
      notification_settings: {
        type: Object,
      },
      theme: {
        type: String,
      },
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true, // This automatically adds createdAt and updatedAt
  }
);

// Create indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ isDeleted: 1 });
userSchema.index({ lastLogin: 1 });
userSchema.index({ "loginHistory.location": "2dsphere" }); // For geospatial queries

export default mongoose.model("Admin", userSchema);
