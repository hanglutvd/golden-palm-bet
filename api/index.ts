import { getRequestListener } from "@hono/node-server";
import app from "./boot";

// Vercel Node.js Serverless Function adapter
export default getRequestListener(app.fetch);
