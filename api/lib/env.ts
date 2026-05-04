import "dotenv/config";

export const env = {
  appId: process.env.APP_ID ?? "golden-palm-bet",
  appSecret: process.env.APP_SECRET ?? "default-secret-change-me",
  isProduction: process.env.NODE_ENV === "production",
};
