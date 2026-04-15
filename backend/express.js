import express from "express";
import bodyParser from "body-parser";
import path from "path";
import compression from "compression";
import async from "async";
import { fileURLToPath } from "url";
import helmet from "helmet";
import ejs from "ejs";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import { createClient } from "redis";
import Admin from "./admin/routes/admin.js";
import AdminSettings from "./admin/routes/settings.js";
import UserRoutes from "./users/routes/user.js";

function parallel(middlewares) {
  return (req, res, next) => {
    async.each(
      middlewares,
      (mw, cb) => {
        mw(req, res, cb);
      },
      next,
    );
  };
}

export default function () {
  var app = express();
  app.use(cookieParser());

  const rawAllowedOrigins = process.env.CORS_ALLOWED_ORIGINS;
  if (!rawAllowedOrigins) {
    throw new Error("CORS_ALLOWED_ORIGINS is required");
  }

  const allowedOrigins = rawAllowedOrigins
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  if (!allowedOrigins.length) {
    throw new Error(
      "CORS_ALLOWED_ORIGINS must contain at least one comma-separated origin",
    );
  }

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like curl or mobile apps)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );

  // OPTIONAL: Keep this only if you need to manually set headers
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Access-Control-Allow-Credentials", "true");
      res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH");
      res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
    }
    next();
  });
  if (process.env.NODE_ENV === "development") {
    app.use(
      session({
        resave: true,
        saveUninitialized: false,
        secret: "MySecretSystem",
        cookie: { maxAge: 60 * 60 * 1000 },
      }),
    );
  }

  console.log("process.env.NODE_ENV", process.env.NODE_ENV);
  if (process.env.NODE_ENV === "production") {
    // Helmet implementation
    app.use(helmet.frameguard({ action: "deny" }));
    app.use(helmet.hidePoweredBy());
    app.use(helmet.hsts({ maxAge: 31104000, includeSubDomains: true }));
    app.use(helmet.noSniff());
    app.use(helmet.xssFilter());

    // const client = createClient();
    // client.connect().catch("messege redis error", console.error);
    // app.use(
    //   session({
    //     resave: true,
    //     saveUninitialized: true,
    //     secret: "SOMERANDOMSECRETHERE",
    //     cookie: { secure: false },
    //     maxAge: "1h",
    //     store: new RedisStore({
    //       host: "localhost",
    //       port: 6379,
    //       client: client,
    //       ttl: 1440,
    //     }),
    //   })
    // );
  }

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(compression());
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  app.use("/dist", express.static("dist"));
  app.use("/uploads", express.static("uploads"));
  app.set("views", [path.join(__dirname, "views")]);

  app.engine("html", ejs.renderFile);
  app.set("view engine", "html");
  Admin(app);
  AdminSettings(app);
  UserRoutes(app);
  return app;
}
