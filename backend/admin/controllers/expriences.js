import mongoose from "mongoose";
import Experience from "../../configs/models/models/experience.js";

export const search_experiences = async (req, res) => {
  try {
    const page_raw = Number(req.body.page || 1);
    const limit_raw = Number(req.body.limit || 18);
    const page = Number.isFinite(page_raw) && page_raw > 0 ? page_raw : 1;
    const limit =
      Number.isFinite(limit_raw) && limit_raw > 0
        ? Math.min(limit_raw, 100)
        : 18;
    const skip = (page - 1) * limit;

    const destination = req.body.destination
      ? String(req.body.destination).trim()
      : "";
    const category = req.body.category ? String(req.body.category).trim() : "";
    const adults_raw = Number(req.body.adults || 1);
    const children_raw = Number(req.body.children || 0);
    const adults =
      Number.isFinite(adults_raw) && adults_raw >= 0 ? adults_raw : 1;
    const children =
      Number.isFinite(children_raw) && children_raw >= 0 ? children_raw : 0;
    const travelers = adults + children;

    const price_min_raw = Number(req.body.priceMin || 0);
    const price_max_raw = Number(req.body.priceMax || 0);
    const price_min =
      Number.isFinite(price_min_raw) && price_min_raw >= 0 ? price_min_raw : 0;
    const price_max =
      Number.isFinite(price_max_raw) && price_max_raw >= 0 ? price_max_raw : 0;

    const group_size_max_raw = Number(req.body.groupSizeMax || 0);
    const group_size_max =
      Number.isFinite(group_size_max_raw) && group_size_max_raw > 0
        ? group_size_max_raw
        : 0;

    const rating_min_raw = Number(req.body.ratingMin || 0);
    const rating_min =
      Number.isFinite(rating_min_raw) && rating_min_raw > 0
        ? rating_min_raw
        : 0;

    const locations = Array.isArray(req.body.locations)
      ? req.body.locations.map((item) => String(item).trim()).filter(Boolean)
      : typeof req.body.locations === "string"
        ? req.body.locations
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

    const categories = Array.isArray(req.body.categories)
      ? req.body.categories.map((item) => String(item).trim()).filter(Boolean)
      : typeof req.body.categories === "string"
        ? req.body.categories
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

    const group_types = Array.isArray(req.body.groupType)
      ? req.body.groupType.map((item) => String(item).trim()).filter(Boolean)
      : typeof req.body.groupType === "string"
        ? req.body.groupType
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

    const languages = Array.isArray(req.body.languages)
      ? req.body.languages.map((item) => String(item).trim()).filter(Boolean)
      : typeof req.body.languages === "string"
        ? req.body.languages
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

    const operators = Array.isArray(req.body.operators)
      ? req.body.operators.map((item) => String(item).trim()).filter(Boolean)
      : typeof req.body.operators === "string"
        ? req.body.operators
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

    const durations = Array.isArray(req.body.duration)
      ? req.body.duration.map((item) => String(item).trim()).filter(Boolean)
      : typeof req.body.duration === "string"
        ? req.body.duration
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

    const filter = { status: "active" };

    if (destination) {
      const destination_regex = new RegExp(destination, "i");
      filter.$or = [
        { city_name: destination_regex },
        { country_name: destination_regex },
        { location_name: destination_regex },
        { title: destination_regex },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (categories.length) {
      filter.category = { $in: categories };
    }

    if (travelers > 0) {
      filter.max_people = { $gte: travelers };
    }

    if (price_min > 0 || price_max > 0) {
      filter.price = {};
      if (price_min > 0) filter.price.$gte = price_min;
      if (price_max > 0) filter.price.$lte = price_max;
    }

    if (group_types.length) {
      filter.group_type = { $in: group_types };
    }

    if (group_size_max > 0) {
      filter.group_size_max = { $lte: group_size_max };
    }

    if (languages.length) {
      filter.languages = { $in: languages };
    }

    if (rating_min > 0) {
      filter.rating_score = { $gte: rating_min };
    }

    if (locations.length) {
      const location_regexes = locations.map((value) => new RegExp(value, "i"));
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { city_name: { $in: location_regexes } },
          { country_name: { $in: location_regexes } },
          { location_name: { $in: location_regexes } },
        ],
      });
    }

    if (operators.length) {
      const operator_ids = operators
        .filter((value) => mongoose.Types.ObjectId.isValid(value))
        .map((value) => new mongoose.Types.ObjectId(value));
      const operator_regexes = operators.map((value) => new RegExp(value, "i"));

      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          ...(operator_ids.length
            ? [{ vendor_id: { $in: operator_ids } }]
            : []),
          { operator_name: { $in: operator_regexes } },
        ],
      });
    }

    if (durations.length) {
      const duration_conditions = [];
      durations.forEach((value) => {
        if (value === "1_3") {
          duration_conditions.push({ duration_hours: { $gte: 1, $lte: 3 } });
        } else if (value === "4_6") {
          duration_conditions.push({ duration_hours: { $gte: 4, $lte: 6 } });
        } else if (value === "7_plus") {
          duration_conditions.push({ duration_hours: { $gte: 7 } });
        }
      });

      if (duration_conditions.length) {
        filter.$and = filter.$and || [];
        filter.$and.push({ $or: duration_conditions });
      }
    }

    const sort_value = String(req.body.sort || "recommended")
      .trim()
      .toLowerCase();
    let sort_stage = { rating_score: -1, reviews_count: -1, createdAt: -1 };
    if (sort_value === "price_low") {
      sort_stage = { price: 1, createdAt: -1 };
    } else if (sort_value === "price_high") {
      sort_stage = { price: -1, createdAt: -1 };
    } else if (sort_value === "rating") {
      sort_stage = { rating_score: -1, reviews_count: -1, createdAt: -1 };
    } else if (sort_value === "newest") {
      sort_stage = { createdAt: -1 };
    }

    const [items, total] = await Promise.all([
      Experience.find(filter).sort(sort_stage).skip(skip).limit(limit),
      Experience.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Experiences fetched",
      data: {
        items: items.map((item) => {
          const duration_hours = Number(item.duration_hours || 0);
          const duration_label =
            Number.isFinite(duration_hours) && duration_hours > 0
              ? Number.isInteger(duration_hours)
                ? `${duration_hours}h`
                : `${duration_hours}h`
              : "Flexible";

          return {
            id: String(item._id),
            title: item.title,
            category: item.category || "general",
            location: {
              city: item.city_name || "",
              country: item.country_name || "",
            },
            operator: {
              id: item.vendor_id ? String(item.vendor_id) : "",
              name: item.operator_name || "",
              verified: Boolean(item.operator_verified),
            },
            durationLabel: duration_label,
            groupType: item.group_type || "shared",
            groupSizeMax: Number(item.group_size_max || item.max_people || 0),
            languages: Array.isArray(item.languages) ? item.languages : [],
            rating: {
              score: Number(item.rating_score || 0),
              reviewsCount: Number(item.reviews_count || 0),
            },
            pricePerPerson: Number(item.price || 0),
            currency: item.currency || "USD",
            images: Array.isArray(item.images) ? item.images : [],
          };
        }),
        pagination: {
          page,
          limit,
          total,
          hasMore: page * limit < total,
        },
      },
    });
  } catch (error) {
    console.error("search_experiences error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch experiences",
    });
  }
};

export const get_experience_details = async (req, res) => {
  try {
    const experience_id = req.params.experienceId;

    if (!mongoose.Types.ObjectId.isValid(experience_id)) {
      return res.status(404).json({
        success: false,
        message: "Experience not found",
      });
    }

    const experience = await Experience.findOne({
      _id: experience_id,
      status: "active",
    });

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: "Experience not found",
      });
    }

    const adults_raw = Number(req.body.adults || 1);
    const children_raw = Number(req.body.children || 0);
    const adults =
      Number.isFinite(adults_raw) && adults_raw >= 0 ? adults_raw : 1;
    const children =
      Number.isFinite(children_raw) && children_raw >= 0 ? children_raw : 0;
    const travelers = Math.max(adults + children, 1);

    const price_per_person = Number(experience.price || 0);
    const fees = 0;
    const total = price_per_person * travelers + fees;

    return res.status(200).json({
      success: true,
      message: "Experience details fetched",
      data: {
        experience: {
          id: String(experience._id),
          title: experience.title,
          location: {
            city: experience.city_name || "",
            country: experience.country_name || "",
            label: experience.location_name || "",
          },
          operator: {
            id: experience.vendor_id ? String(experience.vendor_id) : "",
            name: experience.operator_name || "",
            verified: Boolean(experience.operator_verified),
          },
          overview: {
            description: experience.description || "",
            category: experience.category || "general",
            durationHours: Number(experience.duration_hours || 0),
            maxPeople: Number(experience.max_people || 0),
            groupType: experience.group_type || "shared",
            groupSizeMax: Number(
              experience.group_size_max || experience.max_people || 0,
            ),
            languages: Array.isArray(experience.languages)
              ? experience.languages
              : [],
            rating: {
              score: Number(experience.rating_score || 0),
              reviewsCount: Number(experience.reviews_count || 0),
            },
          },
          included: Array.isArray(experience.included)
            ? experience.included
            : [],
          excluded: Array.isArray(experience.excluded)
            ? experience.excluded
            : [],
          itinerary: Array.isArray(experience.itinerary)
            ? experience.itinerary
            : [],
          cancellationPolicy:
            experience.cancellation_policy || "Non-refundable",
          meetingPoint: {
            label: experience.meeting_point_label || "",
          },
        },
        pricing: {
          pricePerPerson: price_per_person,
          travelers,
          fees,
          total,
          currency: experience.currency || "USD",
        },
        relatedStays: [],
      },
    });
  } catch (error) {
    console.error("get_experience_details error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch experience details",
    });
  }
};
