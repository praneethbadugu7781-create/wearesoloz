import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await request.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
    }

    await connectDB();

    const email = session.user.email.toLowerCase();

    // Check if user exists in database
    const user = await User.findOne({ email }).select("+password");

    let isCurrentPasswordCorrect = false;

    if (user) {
      // Compare with database password
      isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    } else {
      // Compare with fallback env password
      const fallbackPassword = process.env.ADMIN_PASSWORD;
      if (fallbackPassword) {
        if (fallbackPassword.startsWith("$2")) {
          isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, fallbackPassword);
        } else {
          isCurrentPasswordCorrect = currentPassword === fallbackPassword;
        }
      }
    }

    if (!isCurrentPasswordCorrect) {
      return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Save to database (upsert user record)
    await User.findOneAndUpdate(
      { email },
      {
        name: session.user.name || "Akhil",
        email,
        password: hashedPassword,
        role: "admin"
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (error: any) {
    console.error("Change password error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
