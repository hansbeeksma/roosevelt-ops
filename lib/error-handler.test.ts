import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  AppError,
  ErrorCodes,
  ErrorSeverity,
  handleError,
  handleApiError,
  createValidationError,
  createAuthError,
  createForbiddenError,
  createNotFoundError,
  createRateLimitError,
  createDatabaseError,
} from "./error-handler";

describe("AppError", () => {
  it("creates error with default values", () => {
    const err = new AppError("Something failed");
    expect(err.message).toBe("Something failed");
    expect(err.code).toBe(ErrorCodes.INTERNAL_ERROR);
    expect(err.severity).toBe(ErrorSeverity.HIGH);
    expect(err.statusCode).toBe(500);
    expect(err.name).toBe("AppError");
    expect(err.stack).toBeDefined();
  });

  it("creates error with custom values", () => {
    const err = new AppError(
      "Not found",
      ErrorCodes.NOT_FOUND,
      ErrorSeverity.LOW,
      404,
    );
    expect(err.code).toBe("NOT_FOUND");
    expect(err.severity).toBe("low");
    expect(err.statusCode).toBe(404);
  });

  it("is an instance of Error", () => {
    const err = new AppError("test");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
  });
});

describe("Error factory functions", () => {
  it("createValidationError", () => {
    const err = createValidationError("Invalid email");
    expect(err.code).toBe(ErrorCodes.VALIDATION_ERROR);
    expect(err.severity).toBe(ErrorSeverity.LOW);
    expect(err.statusCode).toBe(422);
    expect(err.message).toBe("Invalid email");
  });

  it("createAuthError with default message", () => {
    const err = createAuthError();
    expect(err.code).toBe(ErrorCodes.UNAUTHORIZED);
    expect(err.severity).toBe(ErrorSeverity.MEDIUM);
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe("Unauthorized");
  });

  it("createAuthError with custom message", () => {
    const err = createAuthError("Token expired");
    expect(err.message).toBe("Token expired");
  });

  it("createForbiddenError", () => {
    const err = createForbiddenError();
    expect(err.code).toBe(ErrorCodes.FORBIDDEN);
    expect(err.statusCode).toBe(403);
    expect(err.message).toBe("Access denied");
  });

  it("createNotFoundError", () => {
    const err = createNotFoundError();
    expect(err.code).toBe(ErrorCodes.NOT_FOUND);
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe("Resource not found");
  });

  it("createRateLimitError", () => {
    const err = createRateLimitError();
    expect(err.code).toBe(ErrorCodes.RATE_LIMIT_EXCEEDED);
    expect(err.statusCode).toBe(429);
    expect(err.message).toBe("Too many requests");
  });

  it("createDatabaseError", () => {
    const err = createDatabaseError();
    expect(err.code).toBe(ErrorCodes.DATABASE_ERROR);
    expect(err.severity).toBe(ErrorSeverity.CRITICAL);
    expect(err.statusCode).toBe(500);
  });
});

describe("handleError", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "production");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("handles AppError with sanitized message", () => {
    const err = new AppError(
      "Error at /usr/local/path",
      ErrorCodes.BAD_REQUEST,
      ErrorSeverity.LOW,
      400,
    );
    const { response, statusCode } = handleError(err);

    expect(statusCode).toBe(400);
    expect(response.error.code).toBe("BAD_REQUEST");
    expect(response.error.message).toContain("[PATH]");
    expect(response.error.requestId).toBeDefined();
    expect(response.error.timestamp).toBeDefined();
    expect(response.stack).toBeUndefined(); // No stack in production
  });

  it("handles standard Error in production", () => {
    const err = new Error("Something internal broke");
    const { response, statusCode } = handleError(err);

    expect(statusCode).toBe(500);
    expect(response.error.code).toBe("INTERNAL_ERROR");
    expect(response.error.message).toBe(
      "An unexpected error occurred. Please try again later.",
    );
    expect(response.stack).toBeUndefined();
  });

  it("handles standard Error in development with sanitized message", () => {
    vi.stubEnv("NODE_ENV", "development");
    const err = new Error("Failed for user@example.com");
    const { response, statusCode } = handleError(err);

    expect(statusCode).toBe(500);
    expect(response.error.message).toContain("[EMAIL]");
    expect(response.stack).toBeDefined(); // Stack in development
  });

  it("handles unknown error type", () => {
    const { response, statusCode } = handleError("string error");

    expect(statusCode).toBe(500);
    expect(response.error.code).toBe("INTERNAL_ERROR");
    expect(response.error.message).toBe(
      "An unexpected error occurred. Please try again later.",
    );
  });

  it("sanitizes file paths in messages", () => {
    const err = new AppError("Error reading /home/user/secret/file.txt");
    const { response } = handleError(err);
    expect(response.error.message).not.toContain("/home/user");
    expect(response.error.message).toContain("[PATH]");
  });

  it("sanitizes email addresses in messages", () => {
    const err = new AppError("Failed for admin@company.com");
    const { response } = handleError(err);
    expect(response.error.message).not.toContain("admin@company.com");
    expect(response.error.message).toContain("[EMAIL]");
  });

  it("sanitizes long base64/hex strings in messages", () => {
    const err = new AppError(
      "Token: secret_key_ABCDEFGHIJKLMNOPQRSTUVWXYZ1234",
    );
    const { response } = handleError(err);
    expect(response.error.message).toContain("[REDACTED]");
  });

  it("includes request context when available", () => {
    const err = new AppError("test");
    const mockRequest = {
      nextUrl: { pathname: "/api/test" },
      method: "POST",
      headers: { get: () => null },
    } as any;

    const { response } = handleError(err, mockRequest);
    expect(response.error.requestId).toBeDefined();
  });
});

describe("handleApiError", () => {
  it("returns NextResponse with correct status and headers", () => {
    const err = createNotFoundError("User not found");
    const mockRequest = {
      nextUrl: { pathname: "/api/users/123" },
      method: "GET",
      headers: { get: () => null },
    } as any;

    const response = handleApiError(err, mockRequest);
    expect(response.status).toBe(404);
    expect(response.headers.get("Content-Type")).toBe("application/json");
    expect(response.headers.get("X-Request-ID")).toBeDefined();
  });
});

describe("ErrorCodes", () => {
  it("has all expected error codes", () => {
    expect(ErrorCodes.BAD_REQUEST).toBe("BAD_REQUEST");
    expect(ErrorCodes.UNAUTHORIZED).toBe("UNAUTHORIZED");
    expect(ErrorCodes.FORBIDDEN).toBe("FORBIDDEN");
    expect(ErrorCodes.NOT_FOUND).toBe("NOT_FOUND");
    expect(ErrorCodes.VALIDATION_ERROR).toBe("VALIDATION_ERROR");
    expect(ErrorCodes.RATE_LIMIT_EXCEEDED).toBe("RATE_LIMIT_EXCEEDED");
    expect(ErrorCodes.INTERNAL_ERROR).toBe("INTERNAL_ERROR");
    expect(ErrorCodes.SERVICE_UNAVAILABLE).toBe("SERVICE_UNAVAILABLE");
    expect(ErrorCodes.DATABASE_ERROR).toBe("DATABASE_ERROR");
    expect(ErrorCodes.EXTERNAL_API_ERROR).toBe("EXTERNAL_API_ERROR");
  });
});

describe("ErrorSeverity", () => {
  it("has all severity levels", () => {
    expect(ErrorSeverity.LOW).toBe("low");
    expect(ErrorSeverity.MEDIUM).toBe("medium");
    expect(ErrorSeverity.HIGH).toBe("high");
    expect(ErrorSeverity.CRITICAL).toBe("critical");
  });
});
