import { serve } from "@hono/node-server";
import { handle } from "hono/vercel";
import { Hono } from "hono";
// import { logger } from "hono/logger";
import { Routes } from "./lib/apiSchema.js";
import dotenv from "dotenv";

dotenv.config();

const app = new Hono();

// app.use(logger());

Routes.forEach((route) => {
	route.Middleware.forEach((middleware) => app.use(route.Route, middleware));
	app.route(route.Route, route.Handler);
});

app.get("/", (c) => {
	return c.json({ message: "OK" });
});

const handler = handle(app);

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const OPTIONS = handler;

/*
const port = 3001;

serve({
	fetch: app.fetch,
	port,
});

console.log(process.env.MONGO_DB);
console.log(
	`[RONGO] Server is running on port ${port}\nOpen http://localhost:${port} to view it in the browser.`
);
*/