import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "./firebase-admin";

export async function verifyAuth(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Unauthorized: Missing token", status: 401 };
  }

  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return { user: decodedToken };
  } catch (error) {
    console.error("Token verification failed:", error);
    return { error: "Unauthorized: Invalid token", status: 401 };
  }
}

export type AuthResponse = Awaited<ReturnType<typeof verifyAuth>>;
