import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Contact from "@/models/Contact";

const contactSchema = z.object({
  fullName: z.string().min(2),
  mobile: z.string().min(7),
  email: z.string().email(),
  destination: z.string().optional(),
  message: z.string().min(5)
});

export async function GET() {
  await connectDB();
  const contacts = await Contact.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(contacts);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid contact form data" }, { status: 400 });
  }

  await connectDB();
  const contact = await Contact.create(parsed.data);
  return NextResponse.json(contact, { status: 201 });
}
