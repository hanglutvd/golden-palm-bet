/**
 * Get the public URL for a file in the `public/` directory.
 * Respects Vite's `base` config, so it works with sub-path deployments.
 */
export function publicUrl(path: string): string {
  const base = import.meta.env.BASE_URL || "/";
  const cleanPath = path.replace(/^\//, "");
  return base + cleanPath;
}
