import mongoose from "mongoose";
import Experience from "../../configs/models/models/experience.js";

export const search_experiences = async (req, res) => {
  try {
    const experiences = await Experience.find({}).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Experiences fetched",
      data: experiences,
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
