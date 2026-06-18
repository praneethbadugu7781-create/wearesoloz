"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export default function TermsModal({ isOpen, onClose, onAccept }: TermsModalProps) {
  const [accepted, setAccepted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accepted) {
      onAccept();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative bg-white text-stone-900 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-5 top-5 text-stone-400 hover:text-stone-600 transition-colors p-1.5 rounded-full hover:bg-stone-50"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="p-6 pb-4 border-b border-stone-100 shrink-0">
              <h3 className="font-display text-xl font-bold text-stone-900">
                WeAreSoloZ Terms & Conditions
              </h3>
              <p className="text-[11px] text-stone-400 mt-1 font-medium">
                Please review and accept our travel policies to complete your submission.
              </p>
            </div>

            {/* Terms Body */}
            <div className="overflow-y-auto p-6 space-y-5 text-xs text-stone-600 font-body leading-relaxed custom-scrollbar max-h-[50vh]">
              <div>
                <h4 className="font-bold text-stone-900 mb-1">1. Booking Confirmation</h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li>A seat is confirmed only after payment of the advance amount.</li>
                  <li>Remaining balance must be paid before the trip starts.</li>
                  <li>Seats are allocated on a first-come, first-served basis.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 mb-1">2. Cancellation Policy</h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Advance payment is non-refundable.</li>
                  <li>No refunds will be provided for no-shows or last-minute cancellations.</li>
                  <li>In case of trip cancellation by WeAreSoloZ due to unforeseen circumstances, participants may be offered an alternate trip date or refund (excluding non-recoverable expenses).</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 mb-1">3. Participant Responsibility</h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Travelers are responsible for their own belongings and valuables.</li>
                  <li>Participants must follow instructions provided by trip coordinators and local guides.</li>
                  <li>Any damage caused to property, vehicles, campsites, or accommodations will be borne by the participant.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 mb-1">4. Health & Fitness</h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Participants should ensure they are medically fit for the trip.</li>
                  <li>Any pre-existing medical conditions must be disclosed before booking.</li>
                  <li>WeAreSoloZ is not responsible for any illness, injury, allergies, altitude sickness, or health complications during the trip.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 mb-1">5. Assumption of Risk</h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Trekking, camping, water activities, forest safaris, and adventure activities involve inherent risks.</li>
                  <li>By joining the trip, participants voluntarily accept all risks associated with travel and adventure activities.</li>
                  <li>WeAreSoloZ, its organizers, coordinators, and partners shall not be held liable for accidents, injuries, loss of life, loss of baggage, theft, delays, natural calamities, or unforeseen events.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 mb-1">6. Optional Activities</h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Activities such as kayaking, boating, rafting, horse riding, etc., are optional and at the participant’s own risk and expense.</li>
                  <li>Charges for optional activities are not included unless explicitly mentioned.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 mb-1">7. Itinerary Changes</h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li>WeAreSoloZ reserves the right to modify the itinerary, accommodation, timings, or route due to weather conditions, government regulations, road closures, safety concerns, or any unavoidable circumstances.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 mb-1">8. Alcohol & Substance Abuse</h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Consumption of alcohol, drugs, or any illegal substances during the trip is strictly prohibited.</li>
                  <li>Any misconduct affecting other travelers may result in immediate removal from the trip without any refund.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 mb-1">9. Code of Conduct</h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Participants are expected to respect fellow travelers, local culture, wildlife, and the environment.</li>
                  <li>Harassment, abusive behavior, or misconduct will not be tolerated.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 mb-1">10. Delays & Force Majeure</h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li>WeAreSoloZ shall not be liable for delays or disruptions caused by weather conditions, landslides, strikes, traffic, natural disasters, pandemics, government restrictions, or any force majeure events.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 mb-1">11. Photography & Media Consent</h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Photos and videos captured during the trip may be used by WeAreSoloZ for promotional purposes unless the participant explicitly requests otherwise.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 mb-1">12. Liability Waiver</h4>
                <p>
                  By booking a trip with WeAreSoloZ, participants acknowledge that they understand the risks involved and agree that WeAreSoloZ, its founder Akhil, trip coordinators, guides, employees, and partners shall not be held responsible for any injury, accident, illness, loss, theft, delay, damage, or death arising during the course of the trip. Participation is entirely voluntary and at the participant’s own risk.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 mb-1">13. Emergency Situations</h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li>In case of emergencies, medical expenses, rescue costs, evacuation charges, or hospital expenses shall be borne by the participant or their family.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 mb-1">14. Jurisdiction</h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Any disputes arising out of these terms shall be subject to the jurisdiction of Hyderabad, Telangana, India.</li>
                </ul>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 mt-6">
                <h4 className="font-bold text-stone-950 mb-1 uppercase tracking-wider text-[10px]">Declaration</h4>
                <p className="text-[11px] text-stone-600 font-medium">
                  I have read and understood the Terms & Conditions of WeAreSoloZ and agree to participate in the trip voluntarily, accepting all risks associated with travel and adventure activities.
                </p>
              </div>
            </div>

            {/* Footer Form */}
            <form onSubmit={handleSubmit} className="p-6 border-t border-stone-100 bg-stone-50/50 shrink-0 space-y-4">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-md border transition-all flex items-center justify-center ${
                    accepted 
                      ? "border-[#ea580c] bg-[#ea580c] text-white" 
                      : "border-stone-300 bg-white"
                  }`}>
                    {accepted && <Check size={13} strokeWidth={3} />}
                  </div>
                </div>
                <span className="text-xs text-stone-600 font-medium leading-normal">
                  I read, understood, and accept the WeAreSoloZ Terms & Conditions and Liability Waiver.
                </span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border border-stone-250 text-stone-600 hover:bg-stone-50 font-bold uppercase tracking-wider text-xs h-12 rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!accepted}
                  className={`flex-1 font-bold uppercase tracking-wider text-xs h-12 rounded-full transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                    accepted
                      ? "gradient-orange text-white hover:opacity-95 cursor-pointer"
                      : "bg-stone-200 text-stone-400 cursor-not-allowed"
                  }`}
                >
                  Accept & Submit
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
