import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    // 1. Forward form data to Render backend to update database status
    let backendBookingId = "";
    try {
      const backendRes = await fetch(`${API_URL}/payment/payu-callback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (backendRes.ok) {
        const resData = await backendRes.json().catch(() => ({}));
        backendBookingId = resData.bookingId || resData.booking?.bookingId || "";
      }
    } catch (backendErr) {
      console.error("Backend callback forwarding error:", backendErr);
    }

    const status = (data.status || "").toLowerCase();
    const unmappedstatus = (data.unmappedstatus || "").toLowerCase();
    const txnid = data.txnid || data.udf1 || backendBookingId || "";
    const mihpayid = data.mihpayid || txnid;
    const tripSlug = data.udf2 || "";
    const errorMsg = data.error_Message || data.field9 || "Payment was cancelled or failed";

    const origin = new URL(request.url).origin;

    // 2. Redirect browser to corresponding Success or Failed page
    if (status === "success" || unmappedstatus === "captured") {
      const successUrl = new URL(`${origin}/booking-success`);
      successUrl.searchParams.set("bookingId", txnid);
      if (mihpayid) successUrl.searchParams.set("paymentId", mihpayid);
      return NextResponse.redirect(successUrl.toString(), 303);
    } else if (status === "usercancelled" || unmappedstatus === "usercancelled" || status === "cancelled") {
      const failedUrl = new URL(`${origin}/booking-failed`);
      failedUrl.searchParams.set("bookingId", txnid);
      if (tripSlug) failedUrl.searchParams.set("slug", tripSlug);
      failedUrl.searchParams.set("error", "Payment was cancelled by user.");
      return NextResponse.redirect(failedUrl.toString(), 303);
    } else {
      const failedUrl = new URL(`${origin}/booking-failed`);
      failedUrl.searchParams.set("bookingId", txnid);
      if (tripSlug) failedUrl.searchParams.set("slug", tripSlug);
      failedUrl.searchParams.set("error", errorMsg);
      return NextResponse.redirect(failedUrl.toString(), 303);
    }
  } catch (error: any) {
    console.error("Error handling PayU callback route:", error);
    const origin = new URL(request.url).origin;
    return NextResponse.redirect(`${origin}/booking-failed?error=${encodeURIComponent(error.message || "Callback processing error")}`, 303);
  }
}

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  return NextResponse.redirect(`${origin}/`, 303);
}
