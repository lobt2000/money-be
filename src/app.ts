import { authRoutes } from "./modules/auth/routes/auth.route";
import { userRoutes } from "./modules/user/routes/user.route";
import { walletRoutes } from "./modules/wallet/routes/wallet.route";
import { transactionRoutes } from "./modules/transaction/routes/transaction.route";
import { historyRoutes } from "./modules/history/routes/history.route";
import { chatRoutes } from "./modules/chat/routes/chat.route";
import { VerifyToken } from "./modules/auth/decorator/auth.decorator";
import { Transporter } from "nodemailer";
import { PostgresDb, fastifyPostgres } from "@fastify/postgres";
import { fastifyWebsocket } from "@fastify/websocket";
import { emitter } from "./emitter/chat-emitter";
import { Client } from "pg";
import fastifyJwt, { JWT } from "@fastify/jwt";
import FastifyCors from "@fastify/cors";
import fastify from "fastify";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";
import * as WebSocket from "ws";
import { IMessages } from "./interfaces/chat.interface";

declare module "fastify" {
  interface FastifyInstance {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    authenticate: any;
  }
  interface FastifyRequest {
    jwt: JWT;
    mailer: Transporter;
    db: PostgresDb;
    socketIo: WebSocket.Server;
  }
}

const server = fastify();
dotenv.config();

server.register(fastifyWebsocket);

server.register(FastifyCors, {
  origin: "*", // You can restrict this to a specific domain if needed
  methods: ["GET", "PUT", "POST", "DELETE"],
  allowedHeaders: ["Content-Type"], // Дозволені заголовки запитів
});

server.register(async function (fastify) {
  fastify.get("/ws", { websocket: true }, (connection) => {
    connection.on("message", (data) => {
      const newData = JSON.parse(data.toString());

      const messageListener = (event: {
        client: string;
        chat_id: string;
        message: IMessages;
      }) => {
        if (event.client == newData.clientId)
          connection.send(
            JSON.stringify({
              event: "get_message",
              chat_id: event.chat_id,
              message: event.message,
            })
          );
      };

      emitter.on("room-event", messageListener);
    });
  });
});

server.register(fastifyJwt, {
  secret: "supersecret",
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
server.register(require("fastify-mailer"), {
  defaults: { from: "Destini Goodwin <destini46@ethereal.email>" },
  transport: {
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: process.env.MAILER_USER,
      pass: process.env.MAILER_PASS,
    },
  },
});

server.register(fastifyPostgres, {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  port: Number(process.env.DB_PORT!),
  database: process.env.DB_NAME!,
});

async function runMigrations(): Promise<void> {
  const client = new Client({
    host: process.env.DB_HOST!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASS!,
    port: Number(process.env.DB_PORT!),
    database: process.env.DB_NAME!,
  });

  try {
    await client.connect();
    const script = fs.readFileSync(
      path.join(__dirname, "./mock/create-tables.sql"),
      "utf8"
    );

    await client.query(script);
  } catch (error) {
    server.log.error("Error running migrations:", error);
  }
}

// Hook to run migrations on first launch
server.addHook("onReady", function (done) {
  runMigrations()
    .then(() => done())
    .catch((e) => {
      console.log(e);
    });
});

server.decorate("authenticate", VerifyToken);

server.addHook("onSend", (request, reply, payload, done) => {
  reply.headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  done();
});

server.addHook("preHandler", (req, res, next) => {
  req.jwt = server.jwt;
  req.mailer = ("mailer" in server ? server.mailer : null) as Transporter;
  req.db = server.pg;
  req.socketIo = server.websocketServer;

  return next();
});

// routes
server.register(authRoutes, { prefix: "api/v1/auth" });
server.register(userRoutes, { prefix: "api/v1/user" });
server.register(walletRoutes, { prefix: "api/v1/wallet" });
server.register(transactionRoutes, { prefix: "api/v1/transaction" });
server.register(historyRoutes, { prefix: "api/v1/history" });
server.register(chatRoutes, { prefix: "api/v1/chat" });

const port = process.env.PORT || 3000;
const host = process.env.HOST;

server.listen({ port: +port, host: host }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
