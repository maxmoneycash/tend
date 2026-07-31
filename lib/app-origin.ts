export class AppOriginConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppOriginConfigurationError";
  }
}

function configuredOrigin(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new AppOriginConfigurationError(
      "APP_BASE_URL must be a complete HTTP or HTTPS origin.",
    );
  }

  const hasExtraParts =
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash;
  if (!["http:", "https:"].includes(url.protocol) || hasExtraParts) {
    throw new AppOriginConfigurationError(
      "APP_BASE_URL must contain an HTTP or HTTPS origin without a path, query, or credentials.",
    );
  }
  return url.origin;
}

export function appOrigin(req: Request): string {
  const configured = process.env.APP_BASE_URL?.trim();
  if (configured) return configuredOrigin(configured);

  if (process.env.NODE_ENV === "production") {
    throw new AppOriginConfigurationError(
      "APP_BASE_URL is required for payment return links in production.",
    );
  }

  return new URL(req.url).origin;
}
