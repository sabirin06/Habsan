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
    const group_size_max_raw = Number(req.body.groupSizeMax || 0);
    const rating_min_raw = Number(req.body.ratingMin || 0);

    const price_min =
      Number.isFinite(price_min_raw) && price_min_raw >= 0 ? price_min_raw : 0;
    const price_max =
      Number.isFinite(price_max_raw) && price_max_raw >= 0 ? price_max_raw : 0;
    const group_size_max =
      Number.isFinite(group_size_max_raw) && group_size_max_raw > 0
        ? group_size_max_raw
        : 0;
    const rating_min =
      Number.isFinite(rating_min_raw) && rating_min_raw >= 0
        ? rating_min_raw
        : 0;

    const categories = [
      category,
      ...(Array.isArray(req.body.categories)
        ? req.body.categories
        : typeof req.body.categories === "string"
          ? req.body.categories.split(",")
          : []),
    ]
      .map((item) => String(item).trim())
      .filter((item) => item && item.toLowerCase() !== "all");
    const duration_values = (
      Array.isArray(req.body.duration)
        ? req.body.duration
        : typeof req.body.duration === "string"
          ? req.body.duration.split(",")
          : []
    )
      .map((item) => String(item).trim())
      .filter(Boolean);
    const duration_ranges = [];
    duration_values.forEach((item) => {
      const normalized = String(item)
        .trim()
        .toLowerCase()
        .replace("+", "_plus");
      const parts = normalized.split(/[_-]/).filter(Boolean);

      if (!parts.length) {
        return;
      }

      if (parts.length === 1) {
        const max = Number(parts[0]);
        if (Number.isFinite(max) && max > 0) {
          duration_ranges.push({ duration_hours: { $lte: max } });
        }
        return;
      }

      const min = Number(parts[0]);
      if (!Number.isFinite(min) || min < 0) {
        return;
      }

      if (["plus", "more", "up"].includes(parts[1])) {
        duration_ranges.push({ duration_hours: { $gte: min } });
        return;
      }

      const max = Number(parts[1]);
      if (Number.isFinite(max) && max >= min) {
        duration_ranges.push({ duration_hours: { $gte: min, $lte: max } });
      }
    });
    const locations = (
      Array.isArray(req.body.locations)
        ? req.body.locations
        : typeof req.body.locations === "string"
          ? req.body.locations.split(",")
          : []
    )
      .map((item) => String(item).trim())
      .filter(Boolean);
    const group_types = (
      Array.isArray(req.body.groupType)
        ? req.body.groupType
        : typeof req.body.groupType === "string"
          ? req.body.groupType.split(",")
          : []
    )
      .map((item) => String(item).trim())
      .map((item) => item.toLowerCase())
      .filter((item) => item && item !== "all");
    const languages = (
      Array.isArray(req.body.languages)
        ? req.body.languages
        : typeof req.body.languages === "string"
          ? req.body.languages.split(",")
          : []
    )
      .map((item) => String(item).trim())
      .filter(Boolean);
    const operators = (
      Array.isArray(req.body.operators)
        ? req.body.operators
        : typeof req.body.operators === "string"
          ? req.body.operators.split(",")
          : []
    )
      .map((item) => String(item).trim())
      .filter(Boolean);

    const filter = { status: "active" };
    const and_filters = [];

    if (destination) {
      const destination_regex = new RegExp(
        String(destination).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );
      and_filters.push({
        $or: [
          { city_name: destination_regex },
          { country_name: destination_regex },
          { location_name: destination_regex },
          { title: destination_regex },
          { operator_name: destination_regex },
        ],
      });
    }

    if (categories.length) {
      filter.category =
        categories.length === 1
          ? new RegExp(
              `^${String(categories[0]).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
              "i",
            )
          : {
              $in: categories.map(
                (item) =>
                  new RegExp(
                    `^${String(item).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                    "i",
                  ),
              ),
            };
    }

    if (travelers > 0) {
      and_filters.push({
        $or: [
          { max_people: { $gte: travelers } },
          { group_size_max: { $gte: travelers } },
        ],
      });
    }

    if (price_min > 0 || price_max > 0) {
      filter.price = {};
      if (price_min > 0) filter.price.$gte = price_min;
      if (price_max > 0) filter.price.$lte = price_max;
    }

    if (duration_ranges.length) {
      and_filters.push({ $or: duration_ranges });
    }

    if (locations.length) {
      and_filters.push({
        $or: locations.flatMap((item) => {
          const location_regex = new RegExp(
            String(item).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            "i",
          );
          return [
            { city_name: location_regex },
            { country_name: location_regex },
            { location_name: location_regex },
          ];
        }),
      });
    }

    if (group_types.length) {
      filter.group_type =
        group_types.length === 1 ? group_types[0] : { $in: group_types };
    }

    if (group_size_max > 0) {
      and_filters.push({
        $or: [
          { group_size_max: { $gt: 0, $lte: group_size_max } },
          {
            group_size_max: { $in: [0, null] },
            max_people: { $gt: 0, $lte: group_size_max },
          },
        ],
      });
    }

    if (languages.length) {
      filter.languages =
        languages.length === 1
          ? new RegExp(
              `^${String(languages[0]).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
              "i",
            )
          : {
              $in: languages.map(
                (item) =>
                  new RegExp(
                    `^${String(item).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                    "i",
                  ),
              ),
            };
    }

    if (operators.length) {
      const operator_ids = operators
        .filter((item) => mongoose.Types.ObjectId.isValid(item))
        .map((item) => new mongoose.Types.ObjectId(String(item)));
      const operator_names = operators.filter(
        (item) => !mongoose.Types.ObjectId.isValid(item),
      );
      const operator_conditions = [];

      if (operator_ids.length) {
        operator_conditions.push({ vendor_id: { $in: operator_ids } });
      }

      operator_names.forEach((item) => {
        operator_conditions.push({
          operator_name: new RegExp(
            String(item).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            "i",
          ),
        });
      });

      if (operator_conditions.length) {
        and_filters.push({ $or: operator_conditions });
      }
    }

    if (rating_min > 0) {
      filter.rating_score = { $gte: rating_min };
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
    } else if (sort_value === "duration_short") {
      sort_stage = { duration_hours: 1, createdAt: -1 };
    }

    const query = and_filters.length
      ? { ...filter, $and: and_filters }
      : filter;

    const [items, total] = await Promise.all([
      Experience.find(query).sort(sort_stage).skip(skip).limit(limit),
      Experience.countDocuments(query),
    ]);

    const mapped_items = items.map((item) => ({
      id: String(item._id),
      title: item.title || "",
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
      durationLabel: (() => {
        const numeric_hours = Number(item.duration_hours || 0);
        if (!Number.isFinite(numeric_hours) || numeric_hours <= 0) {
          return "";
        }

        if (numeric_hours < 1) {
          const minutes = Math.round(numeric_hours * 60);
          return `${minutes} minute${minutes === 1 ? "" : "s"}`;
        }

        if (Number.isInteger(numeric_hours)) {
          return `${numeric_hours} hour${numeric_hours === 1 ? "" : "s"}`;
        }

        return `${numeric_hours} hours`;
      })(),
      groupType: item.group_type || "shared",
      groupSizeMax: Number(item.group_size_max || item.max_people || 0),
      languages: Array.isArray(item.languages) ? item.languages : [],
      rating: {
        score: Number(item.rating_score || 0),
        reviewsCount: Number(item.reviews_count || 0),
      },
      pricePerPerson: Number(item.price || 0),
      currency: item.currency || "USD",
      images: Array.isArray(item.images)
        ? item.images.map((img) => ({
            url: String(img),
            alt: item.title || "Experience image",
          }))
        : [],
    }));

    return res.status(200).json({
      success: true,
      message: "Experiences fetched",
      data: {
        items: mapped_items,
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
