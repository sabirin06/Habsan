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
import AdminVender from "./admin/routes/vender.js";
import AdminSettings from "./admin/routes/settings.js";
import AdminExperiences from "./admin/routes/expriences.js";
import AdminStay from "./admin/routes/stay.js";
import ExperiencePanelRoutes from "./Exprience/routes/expriences.js";
import StayPanelRoutes from "./Stay/routes/stay.js";
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

  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );
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
  AdminVender(app);
  AdminSettings(app);
  AdminExperiences(app);
  AdminStay(app);
  ExperiencePanelRoutes(app);
  StayPanelRoutes(app);
  UserRoutes(app);
  return app;
}
