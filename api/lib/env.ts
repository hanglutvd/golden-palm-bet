import "dotenv/config";

export const env: {
  appId: string;
  appSecret: string;
  isProduction: boolean;
} = {
  appId: process.env.APP_ID ?? "golden-palm-bet",
  appSecret: process.env.APP_SECRET ?? "",
  isProduction: process.env.NODE_ENV === "production",
};

// Security: reject startup if production without a real secret
if (env.isProduction && !env.appSecret) {
  console.error("[FATAL] APP_SECRET environment variable is required in production");
  process.exit(1);
}

// Fallback only for development (never production)
if (!env.appSecret) {
  env.appSecret = "dev-only-secret-do-not-use-in-production";
}
