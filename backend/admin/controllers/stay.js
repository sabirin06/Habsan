import mongoose from "mongoose";
import Property from "../../configs/models/models/property.js";

export const search_stays = async (req, res) => {
  try {
    console.log("search_stays called with body:", req.body);
    const body = req.body || {};
    const page_raw = Number(body.page || 1);
    const limit_raw = Number(body.limit || 18);
    const page = Number.isFinite(page_raw) && page_raw > 0 ? page_raw : 1;
    const limit =
      Number.isFinite(limit_raw) && limit_raw > 0
        ? Math.min(limit_raw, 100)
        : 18;
    const skip = (page - 1) * limit;

    const type_value = body.type
      ? String(body.type).trim().toLowerCase()
      : "";
    const normalized_type =
      type_value === "appartment" ? "apartment" : type_value;
    const destination = body.destination
      ? String(body.destination).trim()
      : "";

    const adults_raw = Number(body.adults || 1);
    const children_raw = Number(body.children || 0);
    const rooms_raw = Number(body.rooms || 1);
    const adults =
      Number.isFinite(adults_raw) && adults_raw >= 0 ? adults_raw : 1;
    const children =
      Number.isFinite(children_raw) && children_raw >= 0 ? children_raw : 0;
    const rooms = Number.isFinite(rooms_raw) && rooms_raw > 0 ? rooms_raw : 1;
    const travelers = adults + children;

    const entire_place = Boolean(body.entirePlace);

    const price_min_raw = Number(body.priceMin || 0);
    const price_max_raw = Number(body.priceMax || 0);
    const guest_rating_min_raw = Number(body.guestRatingMin || 0);
    const bedrooms_min_raw = Number(body.bedroomsMin || 0);
    const location_radius_raw = Number(body.locationRadiusKm || 0);

    const price_min =
      Number.isFinite(price_min_raw) && price_min_raw >= 0 ? price_min_raw : 0;
    const price_max =
      Number.isFinite(price_max_raw) && price_max_raw >= 0 ? price_max_raw : 0;
    const guest_rating_min =
      Number.isFinite(guest_rating_min_raw) && guest_rating_min_raw >= 0
        ? guest_rating_min_raw
        : 0;
    const bedrooms_min =
      Number.isFinite(bedrooms_min_raw) && bedrooms_min_raw > 0
        ? bedrooms_min_raw
        : 0;
    const location_radius_km =
      Number.isFinite(location_radius_raw) && location_radius_raw > 0
        ? location_radius_raw
        : 0;

    const amenities = Array.isArray(body.amenities)
      ? body.amenities.map((item) => String(item).trim()).filter(Boolean)
      : typeof body.amenities === "string"
        ? body.amenities
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

    const star_ratings = Array.isArray(body.starRatings)
      ? body.starRatings
          .map((item) => Number(item))
          .filter((item) => Number.isFinite(item))
      : typeof body.starRatings === "string"
        ? body.starRatings
            .split(",")
            .map((item) => Number(item.trim()))
            .filter((item) => Number.isFinite(item))
        : [];

    const hotel_chains = Array.isArray(body.hotelChains)
      ? body.hotelChains.map((item) => String(item).trim()).filter(Boolean)
      : typeof body.hotelChains === "string"
        ? body.hotelChains
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

    const breakfast_included = body.breakfastIncluded === true;
    const free_cancellation = body.freeCancellation === true;
    const kitchen = body.kitchen === true;
    const washing_machine = body.washingMachine === true;
    const long_stay_discount = body.longStayDiscount === true;

    const filter = { status: "active" };

    if (normalized_type) {
      if (normalized_type === "apartment") {
        filter.type = { $in: ["apartment", "appartment"] };
      } else {
        filter.type = normalized_type;
      }
    }

    if (destination) {
      const destination_regex = new RegExp(destination, "i");
      filter.$or = [
        { city_name: destination_regex },
        { country_name: destination_regex },
        { address: destination_regex },
        { name: destination_regex },
        { title: destination_regex },
      ];
    }

    if (travelers > 0) {
      filter.max_guests = { $gte: travelers };
    }

    if (rooms > 0) {
      filter.rooms_count = { $gte: rooms };
    }

    if (entire_place) {
      filter.entire_place = true;
    }

    if (price_min > 0 || price_max > 0) {
      filter.price_per_night = {};
      if (price_min > 0) filter.price_per_night.$gte = price_min;
      if (price_max > 0) filter.price_per_night.$lte = price_max;
    }

    if (guest_rating_min > 0) {
      filter.rating = { $gte: guest_rating_min };
    }

    if (amenities.length) {
      filter.amenities = { $all: amenities };
    }

    if (star_ratings.length) {
      filter.star_rating = { $in: star_ratings };
    }

    if (breakfast_included) {
      filter.breakfast_included = true;
    }

    if (free_cancellation) {
      filter.free_cancellation = true;
    }

    if (hotel_chains.length) {
      filter.hotel_chain = { $in: hotel_chains };
    }

    if (bedrooms_min > 0) {
      filter.bedrooms = { $gte: bedrooms_min };
    }

    if (kitchen) {
      filter.kitchen = true;
    }

    if (washing_machine) {
      filter.washing_machine = true;
    }

    if (long_stay_discount) {
      filter.long_stay_discount = true;
    }

    const sort_value = String(body.sort || "recommended")
      .trim()
      .toLowerCase();
    let sort_stage = { rating: -1, review_count: -1, createdAt: -1 };
    if (sort_value === "price_low") {
      sort_stage = { price_per_night: 1, createdAt: -1 };
    } else if (sort_value === "price_high") {
      sort_stage = { price_per_night: -1, createdAt: -1 };
    } else if (sort_value === "rating") {
      sort_stage = { rating: -1, review_count: -1, createdAt: -1 };
    } else if (sort_value === "newest") {
      sort_stage = { createdAt: -1 };
    }

    const [items, total] = await Promise.all([
      Property.find(filter).sort(sort_stage).skip(skip).limit(limit),
      Property.countDocuments(filter),
    ]);

    const visitor_lat = Number(body.visitorLat);
    const visitor_lng = Number(body.visitorLng);
    const has_visitor_coordinates =
      Number.isFinite(visitor_lat) && Number.isFinite(visitor_lng);

    const mapped_items = items
      .map((item) => {
        let distance_km = 0;
        const latitude = Number(item.location?.coordinates?.[1]);
        const longitude = Number(item.location?.coordinates?.[0]);

        if (
          has_visitor_coordinates &&
          Number.isFinite(latitude) &&
          Number.isFinite(longitude)
        ) {
          const to_rad = (value) => (value * Math.PI) / 180;
          const earth_radius = 6371;
          const d_lat = to_rad(latitude - visitor_lat);
          const d_lng = to_rad(longitude - visitor_lng);
          const a =
            Math.sin(d_lat / 2) * Math.sin(d_lat / 2) +
            Math.cos(to_rad(visitor_lat)) *
              Math.cos(to_rad(latitude)) *
              Math.sin(d_lng / 2) *
              Math.sin(d_lng / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          distance_km = Number((earth_radius * c).toFixed(2));
        }

        return {
          id: String(item._id),
          type: item.type === "appartment" ? "apartment" : item.type,
          name: item.name || item.title || "",
          location: {
            city: item.city_name || "",
            country: item.country_name || "",
            lat: Number(item.location?.coordinates?.[1] || 0),
            lng: Number(item.location?.coordinates?.[0] || 0),
          },
          images: Array.isArray(item.images)
            ? item.images.map((img) => ({
                url: String(img),
                alt: item.name || "Stay image",
              }))
            : [],
          pricePerNight: Number(item.price_per_night || 0),
          guestRating: Number(item.rating || 0),
          reviewsCount: Number(item.review_count || 0),
          amenities: Array.isArray(item.amenities) ? item.amenities : [],
          distanceKm: distance_km,
        };
      })
      .filter((item) => {
        if (!location_radius_km || !has_visitor_coordinates) {
          return true;
        }
        return item.distanceKm <= location_radius_km;
      });

    return res.status(200).json({
      success: true,
      message: "Stays fetched",
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
    console.error("search_stays error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch stays",
    });
  }
};

export const get_stay_details = async (req, res) => {
  try {
    const body = req.body || {};
    const stay_id = req.params.stayId;

    if (!mongoose.Types.ObjectId.isValid(stay_id)) {
      return res.status(404).json({
        success: false,
        message: "Stay not found",
      });
    }

    const stay = await Property.findOne({
      _id: stay_id,
      status: "active",
    });

    if (!stay) {
      return res.status(404).json({
        success: false,
        message: "Stay not found",
      });
    }

    const check_in = body.checkIn ? String(body.checkIn).trim() : "";
    const check_out = body.checkOut ? String(body.checkOut).trim() : "";

    const adults_raw = Number(body.adults || 1);
    const children_raw = Number(body.children || 0);
    const rooms_raw = Number(body.rooms || 1);
    const adults =
      Number.isFinite(adults_raw) && adults_raw >= 0 ? adults_raw : 1;
    const children =
      Number.isFinite(children_raw) && children_raw >= 0 ? children_raw : 0;
    const rooms = Number.isFinite(rooms_raw) && rooms_raw > 0 ? rooms_raw : 1;

    let nights = 1;
    if (check_in && check_out) {
      const check_in_date = new Date(check_in);
      const check_out_date = new Date(check_out);
      const diff_ms = check_out_date.getTime() - check_in_date.getTime();
      const parsed_nights = Math.ceil(diff_ms / (1000 * 60 * 60 * 24));
      if (Number.isFinite(parsed_nights) && parsed_nights > 0) {
        nights = parsed_nights;
      }
    }

    const price_per_night = Number(stay.price_per_night || 0);
    const subtotal = price_per_night * nights * rooms;
    const fees = 0;
    const discount =
      stay.long_stay_discount && nights >= 7 ? subtotal * 0.1 : 0;
    const total = subtotal + fees - discount;

    return res.status(200).json({
      success: true,
      message: "Stay details fetched",
      data: {
        stay: {
          id: String(stay._id),
          type: stay.type === "appartment" ? "apartment" : stay.type,
          name: stay.name || stay.title || "",
          location: {
            city: stay.city_name || "",
            country: stay.country_name || "",
            address: stay.address || "",
            lat: Number(stay.location?.coordinates?.[1] || 0),
            lng: Number(stay.location?.coordinates?.[0] || 0),
          },
          images: Array.isArray(stay.images)
            ? stay.images.map((img) => ({
                url: String(img),
                alt: stay.name || "Stay image",
              }))
            : [],
          amenities: Array.isArray(stay.amenities) ? stay.amenities : [],
          reviewsCount: Number(stay.review_count || 0),
          guestRating: Number(stay.rating || 0),
          policies: stay.policies || {},
          rooms: Array.isArray(stay.rooms)
            ? stay.rooms
            : [
                {
                  name: "Standard",
                  capacity: adults + children,
                  price_per_night: price_per_night,
                  available_count: stay.rooms_count || 1,
                  amenities: Array.isArray(stay.amenities)
                    ? stay.amenities
                    : [],
                },
              ],
          host: stay.host || {},
          houseRules: Array.isArray(stay.house_rules) ? stay.house_rules : [],
        },
        pricing: {
          nights,
          pricePerNight: price_per_night,
          subtotal,
          fees,
          discount,
          total,
          currency: stay.currency || "USD",
        },
      },
    });
  } catch (error) {
    console.error("get_stay_details error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch stay details",
    });
  }
};
