import { NextResponse } from "next/server";

const ALLOWED_ORIGINS = new Set([
  "https://halmaheramotowash.vercel.app",

  // Android Capacitor
  "https://localhost",
  "http://localhost",
  "capacitor://localhost",

  // Local mobile development
  "http://localhost:5173",
  "http://localhost:5174",
  "http://172.20.10.9:5173",
]);

export function getCorsOrigin(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return null;
  }

  return ALLOWED_ORIGINS.has(origin) ? origin : null;
}

export function applyCors(
  response: NextResponse,
  request: Request
) {
  const origin = getCorsOrigin(request);

  if (origin) {
    response.headers.set(
      "Access-Control-Allow-Origin",
      origin
    );
    response.headers.set(
      "Access-Control-Allow-Credentials",
      "true"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Client-Type"
    );
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    response.headers.set(
      "Vary",
      "Origin"
    );
  }

  return response;
}

export function corsOptions(request: Request) {
  const response = new NextResponse(null, {
    status: 204,
  });

  return applyCors(response, request);
}
