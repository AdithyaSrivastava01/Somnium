import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Proxy CSRF token requests to the FastAPI backend
 */
export async function GET(request: NextRequest) {
  const backendUrl = `${BACKEND_URL}/csrf-token`;

  try {
    // Forward all headers except host
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "host") {
        headers.set(key, value);
      }
    });

    // Make request to backend
    const response = await fetch(backendUrl, {
      method: "GET",
      headers,
    });

    // Get response body
    const responseBody = await response.text();

    // Forward response headers
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      responseHeaders.set(key, value);
    });

    // Handle Set-Cookie separately since there can be multiple
    const setCookieHeaders = response.headers.getSetCookie?.() || [];

    // Create response
    const nextResponse = new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });

    // Set all cookies individually
    setCookieHeaders.forEach((cookie) => {
      nextResponse.headers.append("Set-Cookie", cookie);
    });

    return nextResponse;
  } catch (error) {
    console.error(`❌ Error proxying CSRF request:`, error);
    return NextResponse.json(
      { error: "Failed to fetch CSRF token" },
      { status: 500 },
    );
  }
}
