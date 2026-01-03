/**
 * Security utilities for XSS protection and input sanitization.
 */

import DOMPurify from "dompurify";

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Use this when rendering user-generated HTML content.
 *
 * @param html - Raw HTML string to sanitize
 * @returns Sanitized HTML safe for rendering
 *
 * @example
 * ```tsx
 * <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(userContent) }} />
 * ```
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === "undefined") {
    // Server-side: return empty string or raw text
    return "";
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "b",
      "i",
      "em",
      "strong",
      "a",
      "p",
      "br",
      "ul",
      "ol",
      "li",
      "blockquote",
      "code",
      "pre",
    ],
    ALLOWED_ATTR: ["href", "title", "target"],
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true,
  });
}

/**
 * Sanitize plain text input to prevent XSS.
 * Removes all HTML tags and special characters.
 *
 * @param text - Raw text input
 * @returns Sanitized plain text
 */
export function sanitizeText(text: string): string {
  if (typeof window === "undefined") {
    return text.replace(/<[^>]*>/g, "");
  }

  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true,
  });
}

/**
 * Validate and sanitize URL to prevent javascript: or data: URL attacks.
 *
 * @param url - URL to validate
 * @returns Safe URL or empty string if invalid
 */
export function sanitizeUrl(url: string): string {
  const trimmedUrl = url.trim();

  // Block dangerous protocols
  const dangerousProtocols = ["javascript:", "data:", "vbscript:"];
  const lowerUrl = trimmedUrl.toLowerCase();

  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return "";
    }
  }

  // Allow http, https, mailto, and relative URLs
  const allowedProtocolRegex = /^(https?:\/\/|mailto:|\/|\.\/|\.\.\/)/i;
  if (!allowedProtocolRegex.test(trimmedUrl)) {
    return "";
  }

  return trimmedUrl;
}

/**
 * Rate limiting helper for client-side rate limiting.
 * Prevents rapid-fire submissions.
 *
 * @param key - Unique key for the action (e.g., "login-attempt")
 * @param maxAttempts - Maximum attempts allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if rate limit exceeded, false otherwise
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number,
): boolean {
  if (typeof window === "undefined") return false;

  const storageKey = `ratelimit_${key}`;
  const now = Date.now();

  try {
    const stored = localStorage.getItem(storageKey);
    const data = stored ? JSON.parse(stored) : { attempts: [] };

    // Remove old attempts outside the window
    const recentAttempts = data.attempts.filter(
      (timestamp: number) => now - timestamp < windowMs,
    );

    // Check if limit exceeded
    if (recentAttempts.length >= maxAttempts) {
      return true;
    }

    // Add current attempt
    recentAttempts.push(now);
    localStorage.setItem(
      storageKey,
      JSON.stringify({ attempts: recentAttempts }),
    );

    return false;
  } catch (error) {
    // If localStorage fails, allow the action
    console.error("Rate limit check failed:", error);
    return false;
  }
}

/**
 * Clear rate limit data for a specific key.
 *
 * @param key - Unique key for the action
 */
export function clearRateLimit(key: string): void {
  if (typeof window === "undefined") return;
  const storageKey = `ratelimit_${key}`;
  localStorage.removeItem(storageKey);
}
