import app from "./boot.js";

// Vercel Serverless Function expects a standard Web API handler
// (request: Request) => Response | Promise<Response>
export default function handler(request: Request): Response | Promise<Response> {
  return app.fetch(request);
}
