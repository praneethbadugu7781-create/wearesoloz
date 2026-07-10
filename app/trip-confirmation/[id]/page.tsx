"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ShieldAlert, Check, Loader2, Compass, Calendar, MapPin, User, FileText, Heart, CheckCircle2 } from "lucide-react";
import { CloudinaryUpload } from "@/components/cloudinary-upload";
import Reveal from "@/components/Reveal";

interface TripDetails {
  _id: string;
  destination: string;
  title?: string;
  date: string;
  pickupLocation: string;
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
    "I understand that WeAreSoloZ is not liable for personal injury, illness, accidents, delays, weather conditions, natural disasters, or any unforeseen circumstances beyond its reasonable control.",
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
          medicalConditions: form.medicalConditions,
          allergies: form.allergies,
          medications: form.medications,
          emergencyNotes: form.emergencyNotes,
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
    } catch (err: any) {
      toast.error(err.message || "An error occurred during submission.");
    } finally {
      setSubmitting(false);
    }
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

          <div className="pt-4">
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

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Blood Group</label>
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
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Optional ID Proof Copy Upload</label>
                  <div className="bg-stone-50 rounded-lg p-1 border border-stone-200">
                    <CloudinaryUpload
                      value={form.idUpload}
                      onChange={(url) => setForm({ ...form, idUpload: url })}
                      label="Upload ID Proof (Image)"
                    />
                  </div>
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
