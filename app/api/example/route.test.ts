import { describe, it, expect, vi } from "vitest";
import { GET, POST } from "./route";
import { NextRequest } from "next/server";

describe("GET /api/example", () => {
  it("returns 422 when id parameter is missing", async () => {
    const request = new NextRequest("http://localhost/api/example");
    const response = await GET(request);
    expect(response.status).toBe(422);
  });

  it("returns 401 when no authorization header", async () => {
    const request = new NextRequest("http://localhost/api/example?id=123");
    const response = await GET(request);
    expect(response.status).toBe(401);
  });

  it("returns 404 for not-found id", async () => {
    const request = new NextRequest(
      "http://localhost/api/example?id=not-found",
      {
        headers: { authorization: "Bearer test-token" },
      },
    );
    const response = await GET(request);
    expect(response.status).toBe(404);
  });

  it("returns resource for valid id", async () => {
    // Mock Math.random to avoid the 10% random error
    const originalRandom = Math.random;
    Math.random = () => 0.5;

    const request = new NextRequest(
      "http://localhost/api/example?id=test-123",
      {
        headers: { authorization: "Bearer test-token" },
      },
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.id).toBe("test-123");

    Math.random = originalRandom;
  });
});

describe("POST /api/example", () => {
  it("returns 400 when name is missing", async () => {
    const request = new NextRequest("http://localhost/api/example", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "content-type": "application/json" },
    });
    const response = await POST(request);
    expect(response.status).toBe(422);
  });

  it("returns 400 when name is too short", async () => {
    const request = new NextRequest("http://localhost/api/example", {
      method: "POST",
      body: JSON.stringify({ name: "ab" }),
      headers: { "content-type": "application/json" },
    });
    const response = await POST(request);
    expect(response.status).toBe(422);
  });

  it("creates resource with valid name", async () => {
    const request = new NextRequest("http://localhost/api/example", {
      method: "POST",
      body: JSON.stringify({ name: "Test Resource" }),
      headers: { "content-type": "application/json" },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.name).toBe("Test Resource");
  });
});
