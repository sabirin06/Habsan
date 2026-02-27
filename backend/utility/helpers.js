import mongoose from "mongoose";
import Product from "../configs/models/models/product.js";
import Order from "../configs/models/models/order.js";
export const normalizeProductVariants = (product) => {
  if (!product) return null;

  const variants = [];
  const options = {
    color: new Set(),
    shade: new Set(),
    size: new Map(),
  };

  // 1. Add BASE product as default variant
  variants.push({
    variant_id: "base",
    is_default: true,
    attributes: product.attributes || {},
    price: product.price,
    stock_quantity: product.stock_quantity,
    stock_status: product.stock_status,
    images: product.images || [],
  });

  // Collect options from base attributes
  if (product.attributes?.color) options.color.add(product.attributes.color);
  if (product.attributes?.shade) options.shade.add(product.attributes.shade);
  if (product.attributes?.size) {
    const key = `${product.attributes.size.value}${product.attributes.size.unit}`;
    options.size.set(key, product.attributes.size);
  }

  // 2. Add variants if they exist
  if (product.has_variants && Array.isArray(product.variants)) {
    for (const v of product.variants) {
      variants.push({
        variant_id: v._id.toString(),
        attributes: v.attributes,
        price: v.price,
        stock_quantity: v.stock_quantity,
        stock_status: v.stock_status,
        images: v.image || [],
      });

      // Collect options from variant attributes
      if (v.attributes?.color) options.color.add(v.attributes.color);
      if (v.attributes?.shade) options.shade.add(v.attributes.shade);
      if (v.attributes?.size) {
        const key = `${v.attributes.size.value}${v.attributes.size.unit}`;
        options.size.set(key, v.attributes.size);
      }
    }
  }

  return {
    product: {
      id: product._id,
      name: product.name,
      description: product.description,
      short_description: product.short_description,
      how_to_use: product.how_to_use,
      benefits: product.benefits,
      average_rating: product.average_rating,
      total_reviews: product.total_reviews,
      seller: product.seller_info || null,
      category: product.category_info.name || null,
    },

    variation_axes: product.has_variants ? product.variation_options || [] : [],

    options: {
      color: [...options.color],
      shade: [...options.shade],
      size: [...options.size.values()],
    },

    variants,
  };
};

export const buildOrderItems = async (items) => {
  const itemIds = items.map((i) => new mongoose.Types.ObjectId(i.item_id));

  const pipeline = [
    {
      $match: {
        $or: [{ _id: { $in: itemIds } }, { "variants.id": { $in: itemIds } }],
      },
    },
    // Lookup for category names
    {
      $lookup: {
        from: "categories",
        localField: "category_id",
        foreignField: "_id",
        as: "category_info",
      },
    },
    {
      $lookup: {
        from: "subcategories",
        localField: "subcategory_id",
        foreignField: "_id",
        as: "subcategory_info",
      },
    },
    {
      $lookup: {
        from: "undersubcategories",
        localField: "undersubcategory_id",
        foreignField: "_id",
        as: "undersubcategory_info",
      },
    },
    {
      $addFields: {
        category_name: { $arrayElemAt: ["$category_info.name", 0] },
        subcategory_name: { $arrayElemAt: ["$subcategory_info.name", 0] },
        undersubcategory_name: {
          $arrayElemAt: ["$undersubcategory_info.name", 0],
        },
      },
    },
    {
      $project: {
        category_info: 0,
        subcategory_info: 0,
        undersubcategory_info: 0,
      },
    },
  ];

  const products = await Product.aggregate(pipeline);

  // Now combine with items array (to include quantity and variant resolution)
  const result = items.map((item) => {
    const product = products.find(
      (p) =>
        p._id.toString() === item.item_id ||
        p.variants?.some((v) => v.id?.toString() === item.item_id)
    );

    if (!product) return null;

    // Variant resolution
    const variant = product.variants?.find(
      (v) => v.id?.toString() === item.item_id
    );

    const size = variant?.attributes?.size
      ? `${variant.attributes.size.value}${variant.attributes.size.unit}`
      : product?.attributes?.size
      ? `${product.attributes.size.value}${product.attributes.size.unit}`
      : "";

    const color =
      variant?.attributes?.color || product?.attributes?.color || "";
    const shade =
      variant?.attributes?.shade || product?.attributes?.shade || "";

    const unit_price = variant?.price || product?.price || 0;
    const quantity = item.item_quantity;
    const total_price = unit_price * quantity;

    const image =
      variant?.image?.[0] ||
      product.featured_image ||
      product.images?.[0] ||
      "";

    return {
      product_id: product._id.toString(),
      seller_id: product.store_id?.toString() || "",
      name: product.name,
      short_description: product.short_description || "",
      category: product.category_name || "",
      subcategory: product.subcategory_name || "",
      undersubcategory: product.undersubcategory_name || "",
      size,
      color,
      shade,
      quantity,
      unit_price,
      total_price,
      image,
    };
  });

  return result.filter(Boolean);
};

export const generateUniqueCode = async () => {
  while (true) {
    const code = Math.floor(100000 + Math.random() * 900000); // 6-digit number
    const exists = await Order.findOne({ unique_code: code });
    if (!exists) return code;
  }
};

export const generateReferenceId = async () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  while (true) {
    let code = "";
    for (let i = 0; i < 9; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const exists = await Order.findOne({
      reference_id: code,
      payment_status: "paid",
    });
    if (!exists) return code;
  }
};
