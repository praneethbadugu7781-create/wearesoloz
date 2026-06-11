import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Trip from "@/models/Trip";
import Destination from "@/models/Destination";
import Blog from "@/models/Blog";
import Gallery from "@/models/Gallery";
import Testimonial from "@/models/Testimonial";
import Contact from "@/models/Contact";
import SiteSetting from "@/models/SiteSetting";

const models = {
  trips: Trip,
  destinations: Destination,
  blogs: Blog,
  gallery: Gallery,
  testimonials: Testimonial,
  contacts: Contact,
  site_settings: SiteSetting
} as const;

type Resource = keyof typeof models;

function getModel(resource: string) {
  return models[resource as Resource];
}

async function requireAdmin() {
  const session = await auth();
  return Boolean(session?.user);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ resource: string; id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { resource, id } = await params;
  const Model = getModel(resource);
  if (!Model) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  await connectDB();
  const body = await request.json();
  const record = await Model.findByIdAndUpdate(id, body, { new: true });
  return NextResponse.json(record);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ resource: string; id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { resource, id } = await params;
  const Model = getModel(resource);
  if (!Model) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  await connectDB();
  await Model.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
