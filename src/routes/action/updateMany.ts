import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { connectToClient, headerSchema } from "../../lib/mongo.js";
import { z } from "zod";

const app = new Hono();

// Schema for the request body
const bodySchema = z.object({
	database: z.string(),
	collection: z.string(),
	filter: z.record(z.any()),
	update: z.record(z.any()),
	upsert: z.boolean().optional(),
});

app.post(
	"/",
	zValidator("json", bodySchema),
	zValidator("header", headerSchema),

	async (c) => {
		let client;
		let auth = c.req.header("authorization");
		try {
			if (auth !== process.env.MONGO_DB) {
				return c.json({ success: false, message: "Invalid authorization header." }, 401);
			}
			client = await connectToClient(
				auth as string
			);
			const parsedBody = bodySchema.parse(await c.req.json());

			const db = client.db(parsedBody.database);
			const collection = db.collection(parsedBody.collection);
			const result = await collection.updateMany(
				parsedBody.filter,
				parsedBody.update,
				{ upsert: parsedBody.upsert }
			);

			await client.close();
			return c.json({
				matchedCount: result.matchedCount,
				modifiedCount: result.modifiedCount,
			});
		} catch {
			if (client) {
				await client.close();
			}
			return c.json({ success: false, message: "An error occurred" }, 500);
		}
	}
);

app.all("/", (c) => {
	return c.json({ success: false, message: "Method not allowed" }, 405);
});

export default app;
