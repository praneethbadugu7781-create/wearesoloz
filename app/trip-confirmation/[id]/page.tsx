"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ShieldAlert, Check, Loader2, Compass, Calendar, MapPin, User, FileText, Heart, CheckCircle2, Download } from "lucide-react";
import { CloudinaryUpload } from "@/components/cloudinary-upload";
import Reveal from "@/components/Reveal";

interface TripDetails {
  _id: string;
  destination: string;
  title?: string;
  date: string;
  pickupLocation: string;
  price?: string;
}

export default function TripConfirmationPage() {
  const { id } = useParams() as { id: string };
  
  // States
  const [trip, setTrip] = useState<TripDetails | null>(null);
  const [loadingTrip, setLoadingTrip] = useState(true);
  const [tripError, setTripError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submissionId, setSubmissionId] = useState("");
  const [hasMedicalIssues, setHasMedicalIssues] = useState(false);

  // Form States
  const [form, setForm] = useState({
    fullName: "",
    age: "",
    gender: "Male",
    mobile: "",
    email: "",
    address: "",
    emergencyContactName: "",
    emergencyContactMobile: "",
    emergencyContactRelationship: "",
    bloodGroup: "A+",
    medicalConditions: "",
    allergies: "",
    medications: "",
    emergencyNotes: "",
    idType: "Aadhaar",
    idNumber: "",
    idUpload: "",
    signedName: ""
  });

  // Declarations checked state (13 total)
  const [declarations, setDeclarations] = useState<boolean[]>(new Array(13).fill(false));

  const declarationTexts = [
    "I confirm that the information provided is true.",
    "I am voluntarily participating in this trip.",
    "I am physically fit to participate.",
    "I will follow all instructions provided by the WeAreSoloZ team.",
    "I understand that travel and adventure activities involve certain risks.",
    "I am responsible for my own belongings. WeAreSoloZ is not responsible for any lost, stolen, or damaged items.",
    "I understand that WeAreSoloZ is not liable and holds no responsibility for personal injury, death, illness, accidents, delays, weather conditions, natural disasters, or any unforeseen circumstances beyond its reasonable control.",
    "I agree that any medical expenses incurred during the trip will be my responsibility.",
    "I agree to maintain respectful behavior with fellow travelers and organizers.",
    "I understand that misconduct, violence, illegal substances, or actions that endanger others may result in removal from the trip without any refund.",
    "I have read and agree to the cancellation and refund policy.",
    "I give permission to WeAreSoloZ to capture and use photographs/videos taken during the trip for promotional purposes.",
    "I have read, understood, and agree to all Terms & Conditions."
  ];

  // Fetch Trip details on mount
  useEffect(() => {
    async function fetchTripDetails() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${API_URL}/trip-confirmation/${id}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to load trip confirmation details.");
        }
        const data = await res.json();
        setTrip(data);
      } catch (err: any) {
        setTripError(err.message || "Invalid or disabled confirmation code.");
      } finally {
        setLoadingTrip(false);
      }
    }
    if (id) {
      fetchTripDetails();
    }
  }, [id]);

  const handleCheckboxChange = (index: number) => {
    setDeclarations(prev => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };

  const handleCheckAll = () => {
    const allChecked = declarations.every(d => d);
    setDeclarations(new Array(13).fill(!allChecked));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validation
    if (!form.fullName || form.fullName.trim().length < 2) {
      toast.error("Please enter your full name.");
      return;
    }
    const ageVal = Number(form.age);
    if (!form.age || isNaN(ageVal) || ageVal < 1 || ageVal > 110) {
      toast.error("Please enter a valid age.");
      return;
    }
    const phoneRegex = /^[+]?[0-9\s\-]{7,15}$/;
    if (!form.mobile || !phoneRegex.test(form.mobile.trim())) {
      toast.error("Please enter a valid mobile number.");
      return;
    }
    if (!form.emergencyContactName || !form.emergencyContactMobile || !form.emergencyContactRelationship) {
      toast.error("Please fill all emergency contact fields.");
      return;
    }
    if (!phoneRegex.test(form.emergencyContactMobile.trim())) {
      toast.error("Please enter a valid emergency contact mobile number.");
      return;
    }
    if (!form.idNumber) {
      toast.error("Please enter your Identity Document Number.");
      return;
    }
    if (!form.idUpload) {
      toast.error("Please upload a copy of your ID Document (Aadhaar, Driving License, Passport, etc.).");
      return;
    }

    // Check all declarations
    const allAccepted = declarations.every(d => d);
    if (!allAccepted) {
      toast.error("You must accept all mandatory declarations before confirming.");
      return;
    }

    // Verify signature matches full name
    if (form.signedName.trim().toLowerCase() !== form.fullName.trim().toLowerCase()) {
      toast.error("Digital signature must match your full name exactly.");
      return;
    }

    // 2. Submit Waiver
    setSubmitting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_URL}/trip-confirmation/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName: form.fullName,
          age: ageVal,
          gender: form.gender,
          mobile: form.mobile,
          email: form.email,
          address: form.address,
          emergencyContactName: form.emergencyContactName,
          emergencyContactMobile: form.emergencyContactMobile,
          emergencyContactRelationship: form.emergencyContactRelationship,
          bloodGroup: form.bloodGroup,
          medicalConditions: hasMedicalIssues ? form.medicalConditions : "None",
          allergies: hasMedicalIssues ? form.allergies : "None",
          medications: hasMedicalIssues ? form.medications : "None",
          emergencyNotes: hasMedicalIssues ? form.emergencyNotes : "None",
          idType: form.idType,
          idNumber: form.idNumber,
          idUpload: form.idUpload,
          signedName: form.signedName
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Submission failed. Please try again.");
      }

      const resData = await res.json();
      setSubmissionId(resData.submissionId);
      setSuccess(true);
      toast.success("Liability Waiver submitted successfully!");

      try {
        await generateConfirmationPDF(resData.submissionId);
      } catch (pdfErr) {
        console.error("Auto PDF generation failed:", pdfErr);
      }
      try {
        await generateInvoicePDF(resData.submissionId);
      } catch (pdfErr) {
        console.error("Auto Invoice PDF generation failed:", pdfErr);
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred during submission.");
    } finally {
      setSubmitting(false);
    }
  };

  const generateConfirmationPDF = async (subId = submissionId) => {
    if (!trip) return;
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Header card background
    doc.setFillColor(20, 17, 13);
    doc.rect(0, 0, pageWidth, 42, "F");

    // Add Logo
    try {
      const logoImg = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = "/logo.png";
      });
      doc.addImage(logoImg, "PNG", 15, 8, 12, 12);
    } catch (e) {
      console.error("Failed to load logo for PDF:", e);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("WeAreSoloZ", 32, 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(180, 180, 180);
    doc.text("TRAVEL SOLO. YOU'RE NOT ALONE.", 32, 18);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(255, 122, 26);
    doc.text("TRIP BOOKING CONFIRMATION & LIABILITY WAIVER", 15, 32);

    let y = 52;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(20, 17, 13);
    doc.text("TRIP DETAILS", 15, y);
    y += 2;
    doc.setDrawColor(230, 230, 230);
    doc.line(15, y, pageWidth - 15, y);
    y += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Trip Name:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 17, 13);
    doc.text(trip.title || `${trip.destination} Expedition`, 45, y);

    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 100);
    doc.text("Departure Date:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 17, 13);
    doc.text(new Date(trip.date).toLocaleDateString(), 45, y);

    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 100);
    doc.text("Pickup Location:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 17, 13);
    doc.text(trip.pickupLocation || "Default Meeting Point", 45, y);

    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 100);
    doc.text("Submission ID:", 15, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(234, 88, 12);
    doc.text(subId || "PENDING", 45, y);

    y += 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(20, 17, 13);
    doc.text("PASSENGER DETAILS", 15, y);
    y += 2;
    doc.line(15, y, pageWidth - 15, y);
    y += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Full Name:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 17, 13);
    doc.text(form.fullName, 45, y);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 100);
    doc.text("Age / Gender:", 110, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 17, 13);
    doc.text(`${form.age} / ${form.gender}`, 140, y);

    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 100);
    doc.text("Mobile Number:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 17, 13);
    doc.text(form.mobile, 45, y);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 100);
    doc.text("Email Address:", 110, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 17, 13);
    doc.text(form.email || "N/A", 140, y);

    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 100);
    doc.text("Home Address:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 17, 13);
    doc.text(form.address || "N/A", 45, y);

    y += 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(20, 17, 13);
    doc.text("EMERGENCY CONTACT & MEDICAL PROFILE", 15, y);
    y += 2;
    doc.line(15, y, pageWidth - 15, y);
    y += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Emergency Name:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 17, 13);
    doc.text(`${form.emergencyContactName} (${form.emergencyContactRelationship})`, 45, y);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 100);
    doc.text("Emergency Mobile:", 110, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 17, 13);
    doc.text(form.emergencyContactMobile, 140, y);

    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 100);
    doc.text("Blood Group:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 17, 13);
    doc.text(form.bloodGroup || "N/A", 45, y);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 100);
    doc.text("Allergies:", 110, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 17, 13);
    doc.text(form.allergies || "None", 140, y);

    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 100);
    doc.text("Conditions:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 17, 13);
    doc.text(form.medicalConditions || "None", 45, y);

    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 100);
    doc.text("Medications:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 17, 13);
    doc.text(form.medications || "None", 45, y);

    y += 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(20, 17, 13);
    doc.text("IDENTITY VERIFICATION", 15, y);
    y += 2;
    doc.line(15, y, pageWidth - 15, y);
    y += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Document Type:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 17, 13);
    doc.text(form.idType, 45, y);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 100);
    doc.text("Document Number:", 110, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 17, 13);
    doc.text(form.idNumber, 140, y);

    y += 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(20, 17, 13);
    doc.text("DECLARATION & SIGNATURE", 15, y);
    y += 2;
    doc.line(15, y, pageWidth - 15, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    const stmt = "I hereby confirm that I have read and voluntarily agree to all general rules, travel risks, and liability waiver terms of WeAreSoloZ.";
    doc.text(stmt, 15, y);
    y += 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Digital Signature:", 15, y);
    doc.setFont("helvetica", "bolditalic");
    doc.setTextColor(20, 17, 13);
    doc.text(form.signedName, 45, y);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 100);
    doc.text("Date Signed:", 110, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 17, 13);
    doc.text(new Date().toLocaleDateString(), 140, y);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.text("Page 1 of 2 | WeAreSoloZ - Travel Solo, You're Not Alone.", pageWidth / 2, pageHeight - 10, { align: "center" });

    // --- PAGE 2: TERMS AND LIABILITY DECLARATIONS ---
    doc.addPage();

    // Header strip for Page 2
    doc.setFillColor(20, 17, 13);
    doc.rect(0, 0, pageWidth, 28, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text("WeAreSoloZ - LIABILITY DECLARATIONS & TERMS", 15, 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(180, 180, 180);
    doc.text("ANNEXURE A: MANDATORY TRIP PARTICIPANT DECLARATION AGREEMENT", 15, 18);

    let nextY = 38;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(50, 50, 50);

    declarationTexts.forEach((term, index) => {
      const numberText = `${index + 1}. `;
      const splitText = doc.splitTextToSize(term, pageWidth - 32);
      
      doc.setFont("helvetica", "bold");
      doc.text(numberText, 15, nextY);
      doc.setFont("helvetica", "normal");
      doc.text(splitText, 20, nextY);
      nextY += (splitText.length * 4) + 2.2;
    });

    nextY += 4;
    doc.setDrawColor(230, 230, 230);
    doc.line(15, nextY, pageWidth - 15, nextY);
    nextY += 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Digital Signature:", 15, nextY);
    doc.setFont("helvetica", "bolditalic");
    doc.setTextColor(20, 17, 13);
    doc.text(form.signedName, 45, nextY);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 100);
    doc.text("Date Signed:", 110, nextY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 17, 13);
    doc.text(new Date().toLocaleDateString(), 140, nextY);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.text("Page 2 of 2 | WeAreSoloZ - Travel Solo, You're Not Alone.", pageWidth / 2, pageHeight - 10, { align: "center" });

    doc.save(`Confirmation_${subId}.pdf`);
  };

  const generateInvoicePDF = async (subId = submissionId) => {
    if (!trip) return;
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Dark Header card background
    doc.setFillColor(20, 17, 13);
    doc.rect(0, 0, pageWidth, 42, "F");

    // Add Logo
    try {
      const logoImg = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = "/logo.png";
      });
      doc.addImage(logoImg, "PNG", 15, 8, 12, 12);
    } catch (e) {
      console.error("Failed to load logo for PDF:", e);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("WeAreSoloZ", 32, 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(180, 180, 180);
    doc.text("TRAVEL SOLO. YOU'RE NOT ALONE.", 32, 18);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text("TAX INVOICE", pageWidth - 15, 16, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(200, 200, 200);
    doc.text(`Invoice No: INV-${subId || "PENDING"}`, pageWidth - 15, 22, { align: "right" });
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 15, 26, { align: "right" });

    let y = 52;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(20, 17, 13);
    
    // Draw columns headers
    doc.text("PROVIDER DETAILS (BILL FROM)", 15, y);
    doc.text("CLIENT DETAILS (BILL TO)", 110, y);
    
    y += 2;
    doc.setDrawColor(220, 220, 220);
    doc.line(15, y, pageWidth - 15, y);
    y += 5;
    
    // Left column (Company Info)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(20, 17, 13);
    doc.text("WEARESOLOZ", 15, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("Proprietor: Pasupuleti Akhil", 15, y + 4);
    doc.text("Udyam Reg: UDYAM-TS-09-0255691", 15, y + 8);
    doc.text("Shop Reg: NEST2026627990", 15, y + 12);
    doc.text("Activity: Travel Agency / Tour Operator", 15, y + 16);
    
    // Multi-line address for company
    const compAddress = "Plot no. 395, Ayan Nilayam, TNGO colony phase-2, Gachibowli, Ranga Reddy, Telangana - 500032";
    const splitCompAddr = doc.splitTextToSize(compAddress, 80);
    doc.text(splitCompAddr, 15, y + 20);
    
    doc.text("Mobile: +91 9966085310", 15, y + 28);
    doc.text("Email: wearesolozindia@gmail.com", 15, y + 32);

    // Right column (Client Info)
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 17, 13);
    doc.text(form.fullName, 110, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(`Age / Gender: ${form.age} / ${form.gender}`, 110, y + 4);
    doc.text(`Blood Group: ${form.bloodGroup || "N/A"}`, 110, y + 8);
    doc.text(`Mobile: ${form.mobile}`, 110, y + 12);
    doc.text(`Email: ${form.email}`, 110, y + 16);
    
    // Client Address
    const clientAddress = form.address || "N/A";
    const splitClientAddr = doc.splitTextToSize(clientAddress, 80);
    doc.text(splitClientAddr, 110, y + 20);

    y += 38;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(20, 17, 13);
    doc.text("TRIP SUMMARY", 15, y);
    y += 2;
    doc.line(15, y, pageWidth - 15, y);
    y += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Trip Name:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 17, 13);
    doc.text(trip.title || `${trip.destination} Expedition`, 40, y);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 100);
    doc.text("Departure Date:", 110, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 17, 13);
    doc.text(new Date(trip.date).toLocaleDateString(), 140, y);

    y += 5;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 100);
    doc.text("Pickup Point:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 17, 13);
    doc.text(trip.pickupLocation || "As communicated by Captain", 40, y);

    y += 10;

    // Table Header
    doc.setFillColor(245, 245, 245);
    doc.rect(15, y, pageWidth - 30, 8, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("ITEM DESCRIPTION", 18, y + 5.5);
    doc.text("QTY", 120, y + 5.5, { align: "center" });
    doc.text("UNIT PRICE", 150, y + 5.5, { align: "right" });
    doc.text("AMOUNT", pageWidth - 18, y + 5.5, { align: "right" });

    y += 8;

    // Table Row
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(20, 17, 13);
    doc.text(`Booking Registration Fee: ${trip.title}`, 18, y + 6);
    doc.text("1", 120, y + 6, { align: "center" });
    
    const rawPrice = trip.price || "₹4,999/-";
    doc.text(rawPrice, 150, y + 6, { align: "right" });
    doc.text(rawPrice, pageWidth - 18, y + 6, { align: "right" });

    y += 10;
    doc.line(15, y, pageWidth - 15, y);
    y += 4;

    // Totals Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Subtotal:", 130, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 17, 13);
    doc.text(rawPrice, pageWidth - 18, y, { align: "right" });

    y += 5;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 100);
    doc.text("GST / Taxes:", 130, y);
    doc.setFont("helvetica", "normal");
    doc.text("Included (0%)", pageWidth - 18, y, { align: "right" });

    y += 6;
    doc.setFillColor(255, 245, 235);
    doc.rect(125, y - 4, pageWidth - 140, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(234, 88, 12);
    doc.text("Grand Total Paid:", 130, y + 1.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 17, 13);
    doc.text(rawPrice, pageWidth - 18, y + 1.5, { align: "right" });

    y += 12;

    doc.setFillColor(220, 252, 231); // light green bg
    doc.rect(15, y, 40, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(22, 101, 52); // green text
    doc.text("PAYMENT STATUS: PAID", 17, y + 5.5);

    y += 15;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text("TERMS & CONDITIONS:", 15, y);
    y += 3.5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(140, 140, 140);
    const terms = [
      "1. All bookings are subject to the terms, conditions, and liability waiver signed by the traveler.",
      "2. This booking is confirmed and paid in full. Registration credentials are non-transferable.",
      "3. In case of cancellation or reschedule, refund policies will apply according to the package guidelines.",
      "4. Travel services are executed as proprietary operations of WEARESOLOZ.",
    ];
    terms.forEach((tStr, index) => {
      doc.text(tStr, 15, y + (index * 3.5));
    });

    // Signature/Verification Note
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.text("This is an electronically generated document. No physical signature is required.", pageWidth / 2, pageHeight - 15, { align: "center" });
    doc.text("Page 1 of 1 | WeAreSoloZ - Travel Solo, You're Not Alone.", pageWidth / 2, pageHeight - 10, { align: "center" });

    doc.save(`Invoice_${subId}.pdf`);
  };

  if (loadingTrip) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center flex-col gap-4">
        <Loader2 className="animate-spin text-[#ea580c]" size={36} />
        <p className="text-sm font-medium text-stone-600">Retrieving trip configuration details...</p>
      </div>
    );
  }

  if (tripError) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-200 shadow-xl text-center space-y-6">
          <div className="size-16 rounded-full bg-red-50 text-red-500 border border-red-100 flex items-center justify-center mx-auto">
            <ShieldAlert size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold text-stone-900">Link Inactive</h2>
            <p className="text-sm text-stone-500 leading-relaxed">{tripError}</p>
          </div>
          <p className="text-xs text-stone-400">If you believe this is an error, please reach out to your trip coordinator Akhil Pasupuleti.</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white rounded-3xl p-8 border border-stone-200 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="size-16 rounded-full bg-green-50 text-[#ea580c] border border-green-100 flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} />
          </div>
          
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold text-stone-900">🎉 Booking Confirmed!</h1>
            <p className="text-xs font-mono text-[#ea580c] uppercase tracking-wider font-bold">Submission ID: {submissionId}</p>
          </div>

          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 text-left space-y-4 text-sm text-stone-600 leading-relaxed">
            <p>Thank you for completing your Trip Confirmation Form.</p>
            <p>Your booking has been successfully confirmed.</p>
            <p>Our team will contact you shortly with trip updates and your WhatsApp group invitation.</p>
            <p className="font-bold text-stone-900">See you on the adventure!</p>
            <p className="font-display text-stone-800 text-right">— Team WeAreSoloZ 🌿</p>
          </div>

          <div className="pt-2 flex flex-col items-center gap-3">
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => generateConfirmationPDF(submissionId)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ea580c] hover:bg-[#ea580c]/90 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md"
              >
                <Download size={14} /> Download Confirmation PDF
              </button>
              <button
                onClick={() => generateInvoicePDF(submissionId)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md"
              >
                <FileText size={14} /> Download Invoice PDF
              </button>
            </div>
            <button
              onClick={() => window.close()}
              className="text-stone-400 hover:text-stone-600 text-xs font-semibold hover:underline"
            >
              You can safely close this window now.
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-screen pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Trip Card */}
        {trip && (
          <Reveal>
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-[#ea580c] font-bold uppercase tracking-wider">
                  <Compass size={14} />
                  Trip Confirmation Details
                </div>
                <h1 className="font-display text-2xl font-bold text-stone-900">
                  {trip.title || `${trip.destination} Expedition`}
                </h1>
              </div>

              <div className="flex flex-wrap gap-4 text-xs font-semibold text-stone-600 border-t md:border-t-0 md:border-l border-stone-100 pt-4 md:pt-0 md:pl-6 shrink-0">
                <div className="flex items-center gap-2">
                  <Calendar size={15} className="text-[#ea580c]" />
                  <span>DATE: {new Date(trip.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="text-[#ea580c]" />
                  <span>PICKUP: {trip.pickupLocation}</span>
                </div>
              </div>
            </div>
          </Reveal>
        )}

        {/* Waiver Consent Form */}
        <Reveal>
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xl space-y-8">
            
            {/* Section 1: Personal Information */}
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-2">
                <span className="size-6 rounded-full bg-[#ea580c]/10 text-[#ea580c] text-xs flex items-center justify-center font-bold">1</span>
                Personal Information
              </h2>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="As shown in your ID proof"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50/50 px-3 text-xs text-stone-900 focus:border-[#ea580c] focus:bg-white focus:outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Age *</label>
                  <input
                    type="number"
                    required
                    placeholder="Enter your age"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50/50 px-3 text-xs text-stone-900 focus:border-[#ea580c] focus:bg-white focus:outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Gender *</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="h-10 w-full rounded-lg border border-stone-200 bg-[#fbfbfa] px-3 text-xs text-stone-900 focus:border-[#ea580c] focus:outline-none transition-all"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 9966085310"
                    value={form.mobile}
                    onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                    className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50/50 px-3 text-xs text-stone-900 focus:border-[#ea580c] focus:bg-white focus:outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="yourname@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50/50 px-3 text-xs text-stone-900 focus:border-[#ea580c] focus:bg-white focus:outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Residential Address</label>
                  <input
                    type="text"
                    placeholder="City, State, Country"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50/50 px-3 text-xs text-stone-900 focus:border-[#ea580c] focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Emergency Contact */}
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-2">
                <span className="size-6 rounded-full bg-[#ea580c]/10 text-[#ea580c] text-xs flex items-center justify-center font-bold">2</span>
                Emergency Contact Details
              </h2>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Contact Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Emergency Contact Full Name"
                    value={form.emergencyContactName}
                    onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
                    className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50/50 px-3 text-xs text-stone-900 focus:border-[#ea580c] focus:bg-white focus:outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Contact Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Emergency Contact Number"
                    value={form.emergencyContactMobile}
                    onChange={(e) => setForm({ ...form, emergencyContactMobile: e.target.value })}
                    className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50/50 px-3 text-xs text-stone-900 focus:border-[#ea580c] focus:bg-white focus:outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Relationship *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mother, Father, Friend"
                    value={form.emergencyContactRelationship}
                    onChange={(e) => setForm({ ...form, emergencyContactRelationship: e.target.value })}
                    className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50/50 px-3 text-xs text-stone-900 focus:border-[#ea580c] focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Medical Information */}
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-2">
                <span className="size-6 rounded-full bg-[#ea580c]/10 text-[#ea580c] text-xs flex items-center justify-center font-bold">3</span>
                Medical Information
              </h2>

              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-stone-50 p-4 rounded-xl border border-stone-100 justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-stone-900">Do you have any medical conditions, active allergies, or take medications?</span>
                  <p className="text-[10px] text-stone-500">Select 'Yes' if you require daily medications, have severe allergies, or chronic health notes.</p>
                </div>
                <div className="flex gap-4 items-center shrink-0">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="hasMedicalIssues"
                      checked={!hasMedicalIssues}
                      onChange={() => setHasMedicalIssues(false)}
                      className="accent-[#ea580c] size-4"
                    />
                    No medical issues
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="hasMedicalIssues"
                      checked={hasMedicalIssues}
                      onChange={() => setHasMedicalIssues(true)}
                      className="accent-[#ea580c] size-4"
                    />
                    Yes
                  </label>
                </div>
              </div>

              <div className="w-full max-w-xs space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Blood Group *</label>
                <select
                  value={form.bloodGroup}
                  onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                  className="h-10 w-full rounded-lg border border-stone-200 bg-[#fbfbfa] px-3 text-xs text-stone-900 focus:border-[#ea580c] focus:outline-none transition-all"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              {hasMedicalIssues && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Allergies (If any)</label>
                      <input
                        type="text"
                        placeholder="e.g. Dust, Peanuts, Gluten"
                        value={form.allergies}
                        onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                        className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50/50 px-3 text-xs text-stone-900 focus:border-[#ea580c] focus:bg-white focus:outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Current Medications (If any)</label>
                      <input
                        type="text"
                        placeholder="List details of current medications"
                        value={form.medications}
                        onChange={(e) => setForm({ ...form, medications: e.target.value })}
                        className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50/50 px-3 text-xs text-stone-900 focus:border-[#ea580c] focus:bg-white focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Medical Conditions (If any)</label>
                      <textarea
                        rows={2}
                        placeholder="Describe any chronic medical conditions (e.g. Asthma, Hypertension, Diabetes)..."
                        value={form.medicalConditions}
                        onChange={(e) => setForm({ ...form, medicalConditions: e.target.value })}
                        className="w-full rounded-lg border border-stone-200 bg-stone-50/50 p-3 text-xs text-stone-900 focus:border-[#ea580c] focus:bg-white focus:outline-none resize-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Emergency Medical Notes</label>
                      <textarea
                        rows={2}
                        placeholder="Any critical notes for emergency responders..."
                        value={form.emergencyNotes}
                        onChange={(e) => setForm({ ...form, emergencyNotes: e.target.value })}
                        className="w-full rounded-lg border border-stone-200 bg-stone-50/50 p-3 text-xs text-stone-900 focus:border-[#ea580c] focus:bg-white focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 4: Identity Verification */}
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-2">
                <span className="size-6 rounded-full bg-[#ea580c]/10 text-[#ea580c] text-xs flex items-center justify-center font-bold">4</span>
                Identity Verification
              </h2>

              <div className="grid gap-6 sm:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">ID Document Type *</label>
                  <select
                    value={form.idType}
                    onChange={(e) => setForm({ ...form, idType: e.target.value })}
                    className="h-10 w-full rounded-lg border border-stone-200 bg-[#fbfbfa] px-3 text-xs text-stone-900 focus:border-[#ea580c] focus:outline-none transition-all"
                  >
                    <option value="Aadhaar">Aadhaar Card</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Passport">Passport</option>
                    <option value="Other">Other ID</option>
                  </select>
                  <p className="text-[10px] text-stone-400 font-medium mt-1">Note: Any government-approved ID is accepted.</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">ID Document Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter ID number"
                    value={form.idNumber}
                    onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
                    className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50/50 px-3 text-xs text-stone-900 focus:border-[#ea580c] focus:bg-white focus:outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">ID Proof Copy Upload *</label>
                  <div className="bg-stone-50 rounded-lg p-1 border border-stone-200">
                    <CloudinaryUpload
                      value={form.idUpload}
                      onChange={(url) => setForm({ ...form, idUpload: url })}
                      label="Upload ID Proof (Image)"
                    />
                  </div>
                  <p className="text-[10px] text-stone-400 font-medium mt-1">Note: Uploading just a copy of Aadhaar Front is enough.</p>
                </div>
              </div>
            </div>

            {/* Section 5: Mandatory Declarations */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <h2 className="font-display text-lg font-bold text-stone-900 flex items-center gap-2">
                  <span className="size-6 rounded-full bg-[#ea580c]/10 text-[#ea580c] text-xs flex items-center justify-center font-bold">5</span>
                  Mandatory Declarations
                </h2>
                <button
                  type="button"
                  onClick={handleCheckAll}
                  className="text-xs font-semibold text-[#ea580c] hover:underline"
                >
                  {declarations.every(d => d) ? "Deselect All" : "Select All"}
                </button>
              </div>

              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-2 border border-stone-100 rounded-2xl p-4 bg-stone-50/40">
                {declarationTexts.map((text, index) => (
                  <label 
                    key={index} 
                    className="flex items-start gap-3 text-xs text-stone-600 leading-relaxed cursor-pointer hover:text-stone-900 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={declarations[index]}
                      onChange={() => handleCheckboxChange(index)}
                      className="mt-0.5 size-4 accent-[#ea580c] shrink-0 rounded border-stone-300 focus:ring-[#ea580c]"
                    />
                    <span>{text}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Section 6: Digital Signature */}
            <div className="space-y-4 pt-4 border-t border-stone-100">
              <h2 className="font-display text-lg font-bold text-stone-900 flex items-center gap-2">
                <span className="size-6 rounded-full bg-[#ea580c]/10 text-[#ea580c] text-xs flex items-center justify-center font-bold">6</span>
                Digital Signature
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    Participant Full Name Signature *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Type your full name exactly as entered above"
                    value={form.signedName}
                    onChange={(e) => setForm({ ...form, signedName: e.target.value })}
                    className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50/50 px-3 text-xs font-serif italic text-stone-900 focus:border-[#ea580c] focus:bg-white focus:outline-none transition-all"
                  />
                  <p className="text-[10px] text-stone-400 italic">Typing your name acts as a legally binding digital signature.</p>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Date Signed</label>
                  <input
                    type="text"
                    disabled
                    value={new Date().toLocaleDateString(undefined, { dateStyle: "long" })}
                    className="h-10 w-full rounded-lg border border-stone-100 bg-stone-100 px-3 text-xs font-bold text-stone-500 select-none"
                  />
                </div>
              </div>
            </div>

            {/* Submit block */}
            <div className="pt-6 border-t border-stone-100 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto min-w-[200px] h-12 rounded-xl bg-stone-900 hover:bg-[#ea580c] text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> Confirming...
                  </>
                ) : (
                  <>
                    <Check size={16} /> Confirm My Booking
                  </>
                )}
              </button>
            </div>

          </form>
        </Reveal>

      </div>
    </div>
  );
}
