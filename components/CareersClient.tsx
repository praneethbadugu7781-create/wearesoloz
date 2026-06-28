"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Phone, Instagram, MessageCircle, MapPin, ArrowRight, Briefcase, Calendar, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Reveal, { SectionLabel } from "@/components/Reveal";
import { getApiUrl } from "@/lib/api";
import TermsModal from "./TermsModal";
import SuccessModal from "./SuccessModal";
import { useLanguage } from "@/lib/LanguageContext";

interface CareersClientProps {
  settings: any;
}

export default function CareersClient({ settings = {} }: CareersClientProps) {
  const { t, locale } = useLanguage();
  const whatsappLink = settings.whatsapp_link || "https://wa.me/919966085310";
  const instagramLink = settings.instagram_link || "https://www.instagram.com/wearesolozindia";
  const phone = settings.phone || "+91 9966085310";
  const formattedPhone = phone.replace(/\s/g, "");

  const [form, setForm] = useState({
    fullName: "",
    gender: "",
    age: "",
    bloodGroup: "",
    email: "",
    mobile: "",
    instagram: "",
    experience: "",
    whyJoin: "",
  });
  const [busy, setBusy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [waUrl, setWaUrl] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || form.fullName.length < 2) {
      toast.error(locale === "te" ? "పూర్తి పేరు కనీసం 2 అక్షరాలు ఉండాలి" : locale === "hi" ? "पूरा नाम कम से कम 2 अक्षर होना चाहिए" : "Full name must be at least 2 characters");
      return;
    }
    if (!form.gender) {
      toast.error(locale === "te" ? "దయచేసి మీ లింగాన్ని ఎంచుకోండి" : locale === "hi" ? "कृपया अपना लिंग चुनें" : "Please select your gender");
      return;
    }
    const ageNum = Number(form.age);
    if (!form.age || isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
      toast.error(locale === "te" ? "దయచేసి సరైన వయస్సును నమోదు చేయండి (18 లేదా అంతకంటే ఎక్కువ)" : locale === "hi" ? "कृपया एक मान्य आयु दर्ज करें (18 या उससे अधिक)" : "Please enter a valid age (18 or older)");
      return;
    }
    if (!form.bloodGroup) {
      toast.error(locale === "te" ? "దయచేసి మీ రక్త గ్రూపును ఎంచుకోండి" : locale === "hi" ? "कृपया अपना रक्त समूह चुनें" : "Please select your blood group");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email || !emailRegex.test(form.email.trim())) {
      toast.error(locale === "te" ? "దయచేసి సరైన ఈమెయిల్ చిరునామాను నమోదు చేయండి" : locale === "hi" ? "कृपया एक मान्य ईमेल पता दर्ज करें" : "Please enter a valid email address (e.g. name@example.com)");
      return;
    }
    const phoneRegex = /^[+]?[0-9\s\-]{7,15}$/;
    if (!form.mobile || !phoneRegex.test(form.mobile.trim())) {
      toast.error(locale === "te" ? "దయచేసి సరైన మొబైల్ నంబర్ నమోదు చేయండి" : locale === "hi" ? "कृपया एक मान्य मोबाइल नंबर दर्ज करें" : "Please enter a valid 10-digit mobile number (e.g. +91 9966085310)");
      return;
    }
    if (!form.experience || form.experience.length < 10) {
      toast.error(locale === "te" ? "ప్రయాణ అనుభవం కనీసం 10 అక్షరాలు ఉండాలి" : locale === "hi" ? "यात्रा का अनुभव विवरण कम से कम 10 अक्षर होना चाहिए" : "Travel experience description must be at least 10 characters");
      return;
    }
    if (!form.whyJoin || form.whyJoin.length < 10) {
      toast.error(locale === "te" ? "వివరణ కనీసం 10 అక్షరాలు ఉండాలి" : locale === "hi" ? "स्पष्टीकरण कम से कम 10 अक्षर होना चाहिए" : "Explanation must be at least 10 characters");
      return;
    }

    setShowTerms(true);
  };

  const handleActualSubmit = async () => {
    setBusy(true);
    try {
      const API_URL = getApiUrl();
      const res = await fetch(`${API_URL}/careers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Failed to submit");
      }

      // Open WhatsApp chat prefilled with form data
      const waText = encodeURIComponent(
        `Hi Akhil, my name is ${form.fullName}. I just submitted my travel careers application on WeAreSoloz.\nAge: ${form.age}\nBlood Group: ${form.bloodGroup}\nGender: ${form.gender}\nInstagram: ${form.instagram || "N/A"}\nLooking forward to co-hosting and traveling together!`
      );
      const generatedWaUrl = `https://wa.me/919966085310?text=${waText}`;
      setWaUrl(generatedWaUrl);
      window.open(generatedWaUrl, "_blank");

      // Reset Form
      setForm({
        fullName: "",
        gender: "",
        age: "",
        bloodGroup: "",
        email: "",
        mobile: "",
        instagram: "",
        experience: "",
        whyJoin: "",
      });
      setShowSuccess(true);
    } catch {
      toast.error("Couldn't submit application. Please try again.");
    }
    setBusy(false);
  };

  return (
    <div data-testid="careers-page" className="bg-white min-h-screen text-[#1c1917] pt-20">
      <section className="pt-40 pb-24 px-6 md:px-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
          
          {/* Left Panel: Description */}
          <Reveal>
            <SectionLabel>{locale === "te" ? "మేము నియామకం చేస్తున్నాము" : locale === "hi" ? "हम काम पर रख रहे हैं" : "We Are Hiring"}</SectionLabel>
            <h1 className="font-display text-5xl md:text-7xl font-light tracking-tighter mt-5 text-stone-900 leading-tight">
              {locale === "te" ? <>అఖిల్‌తో కలిసి <span className="gradient-text font-medium">ప్రయాణించండి & కో-హోస్ట్ చేయండి</span>.</> : locale === "hi" ? <>अखिल के साथ <span className="gradient-text font-medium">यात्रा और सह-मेजबानी</span> करें।</> : <>Travel & co-host <span className="gradient-text font-medium">with Akhil</span>.</>}
            </h1>
            <p className="text-soloz-textSecondary mt-8 max-w-md leading-relaxed font-body">
              {locale === "te" ? "మీకు ప్రయాణం, సమూహ అనుభవాలు మరియు తెలియని ప్రదేశాలను అన్వేషించడం పట్ల ఆసక్తి ఉందా? భారతదేశం అంతటా WeAreSoloZ గ్రూప్ పర్యటనలను నిర్వహించడానికి మరియు అతనితో కో-హోస్ట్ చేయడానికి అఖిల్ ప్రయాణ ప్రియుల కోసం చూస్తున్నారు." : locale === "hi" ? "क्या आप यात्रा, समूह के अनुभवों और अज्ञात की खोज के बारे में भावुक हैं? अखिल भारत भर में WeAreSoloZ समूह दौरों की सह-मेजबानी करने के लिए समान विचारधारा वाले यात्रा उत्साही लोगों की तलाश कर रहे हैं।" : "Are you passionate about travel, group experiences, and exploring the unknown? Akhil is seeking like-minded travel enthusiasts to join him and co-host WeAreSoloZ group tours across India."}
            </p>
            
            <div className="space-y-4 mt-10 max-w-md">
              <div className="flex items-start gap-4 glass rounded-xl p-4 border border-stone-200">
                <div className="w-10 h-10 rounded-full bg-soloz-primary/15 flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4 text-soloz-primary" />
                </div>
                <div>
                  <div className="text-xs uppercase font-bold tracking-wider text-stone-900">{locale === "te" ? "కో-హోస్ట్ పాత్ర" : locale === "hi" ? "सह-मेजबान भूमिका" : "Co-Host Role"}</div>
                  <p className="text-xs text-stone-500 mt-1">{locale === "te" ? "లాజిస్టిక్స్ నిర్వహించండి, ప్రయాణ కంటెంట్ సృష్టించండి, జ్ఞాపకాలను చిత్రీకరించండి మరియు రహదారిపై సోలో ప్రయాణీకులకు ఆతిథ్యం ఇవ్వండి." : locale === "hi" ? "लॉजिस्टिक्स प्रबंधित करें, यात्रा सामग्री बनाएं, यादें कैप्चर करें, और यात्रा में सोलो यात्रियों की मेजबानी करें।" : "Manage logistics, create travel content, capture memories, and host solo travel buddies on the road."}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 glass rounded-xl p-4 border border-stone-200">
                <div className="w-10 h-10 rounded-full bg-soloz-primary/15 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-soloz-primary" />
                </div>
                <div>
                  <div className="text-xs uppercase font-bold tracking-wider text-stone-900">{locale === "te" ? "ఎవరు దరఖాస్తు చేసుకోవచ్చు?" : locale === "hi" ? "कौन आवेदन कर सकता है?" : "Who Can Apply?"}</div>
                  <p className="text-xs text-stone-500 mt-1">{locale === "te" ? "బహిరంగ సాహసాలు, సామాజిక సమావేశాలు, రోడ్ ట్రిప్స్ మరియు అత్యంత సన్నిహిత ప్రయాణ కుటుంబాలను నిర్మించడాన్ని ఇష్టపడే పురుషులు మరియు మహిళలు (18+)." : locale === "hi" ? "पुरुष और महिलाएं (18+) जो आउटडोर रोमांच, सामाजिक बैठकों, सड़क यात्राओं और यात्रा परिवारों के निर्माण से प्यार करते हैं।" : "Men and women (18+) who love outdoor adventures, social meetups, road trips, and building close-knit travel families."}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mt-10">
              <a
                href={`tel:${formattedPhone}`}
                className="inline-flex items-center gap-4 glass rounded-xl px-5 py-3 hover:bg-stone-50 border border-stone-200/50 transition-colors text-sm font-medium text-stone-700"
              >
                <Phone className="w-4 h-4 text-soloz-primary" /> {locale === "te" ? "అడ్మిన్‌ను పిలవండి" : locale === "hi" ? "एडमिन को कॉल करें" : "Call Admin"}: {phone}
              </a>
              <br />
              <a
                href={instagramLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-4 glass rounded-xl px-5 py-3 hover:bg-stone-50 border border-stone-200/50 transition-colors text-sm font-medium text-stone-700"
              >
                <Instagram className="w-4 h-4 text-soloz-primary" /> @wearesolozindia
              </a>
            </div>
          </Reveal>

          {/* Right Panel: Form */}
          <Reveal className="self-start">
            <form onSubmit={submit} data-testid="careers-form" className="glass rounded-3xl p-8 bg-stone-50 border border-stone-200 space-y-4 shadow-sm">
              <div className="text-xs uppercase tracking-widest text-[#ea580c] font-semibold mb-2">{locale === "te" ? "కెరీర్స్ దరఖాస్తు ఫారమ్" : locale === "hi" ? "करियर आवेदन फॉर्म" : "Careers Application Form"}</div>
              
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  {t("full_name")}
                </label>
                <Input
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder={locale === "te" ? "మీ పూర్తి పేరు నమోదు చేయండి" : locale === "hi" ? "अपना पूरा नाम दर्ज करें" : "Enter your full name"}
                  className="glass border-stone-200 bg-white/90 h-12 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Gender */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    {t("gender")}
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      className="w-full glass border border-stone-200 bg-white/90 h-12 text-stone-900 focus-visible:ring-soloz-primary text-sm px-3 pr-10 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ea580c]/20 focus:border-[#ea580c] appearance-none cursor-pointer"
                    >
                      <option value="" disabled className="text-stone-400">{t("select_gender")}</option>
                      <option value="Male" className="text-stone-950">{t("male")}</option>
                      <option value="Female" className="text-stone-950">{t("female")}</option>
                      <option value="Other" className="text-stone-950">{t("other")}</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Age */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    {locale === "te" ? "వయస్సు" : locale === "hi" ? "उम्र" : "Age"}
                  </label>
                  <Input
                    required
                    type="number"
                    min="18"
                    max="100"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    placeholder={locale === "te" ? "వయస్సు" : locale === "hi" ? "उम्र" : "Age"}
                    className="glass border-stone-200 bg-white/90 h-12 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c]"
                  />
                </div>

                {/* Blood Group */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    {locale === "te" ? "రక్త గ్రూపు" : locale === "hi" ? "रक्त समूह" : "Blood Group"}
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={form.bloodGroup}
                      onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                      className="w-full glass border border-stone-200 bg-white/90 h-12 text-stone-900 focus-visible:ring-soloz-primary text-sm px-3 pr-10 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ea580c]/20 focus:border-[#ea580c] appearance-none cursor-pointer"
                    >
                      <option value="" disabled className="text-stone-400">{locale === "te" ? "రక్తం" : locale === "hi" ? "रक्त" : "Blood"}</option>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Number */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  {locale === "te" ? "మొబైల్ నంబర్ (వాట్సాప్)" : locale === "hi" ? "मोबाइल नंबर (व्हाट्सएप)" : "Mobile Number (WhatsApp)"}
                </label>
                <Input
                  required
                  type="tel"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  placeholder={locale === "te" ? "10 అంకెల మొబైల్ నంబర్" : locale === "hi" ? "10-अंकीय मोबाइल नंबर" : "Enter 10-digit mobile number"}
                  className="glass border-stone-200 bg-white/90 h-12 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c]"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  {t("email_address")}
                </label>
                <Input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@example.com"
                  className="glass border-stone-200 bg-white/90 h-12 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c]"
                />
              </div>

              {/* Instagram Handle */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  {locale === "te" ? "ఇన్‌స్టాగ్రామ్ హ్యాండిల్ (ఐచ్ఛికం)" : locale === "hi" ? "इंस्टाग्राम हैंडल (वैकल्पिक)" : "Instagram Handle (Optional)"}
                </label>
                <Input
                  value={form.instagram}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                  placeholder="e.g. @yourprofile"
                  className="glass border-stone-200 bg-white/90 h-12 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c]"
                />
              </div>

              {/* Travel Experience */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  {locale === "te" ? "మీ ప్రయాణ అనుభవాన్ని వివరించండి" : locale === "hi" ? "अपने यात्रा अनुभव का वर्णन करें" : "Describe Your Travel Experience"}
                </label>
                <Textarea
                  required
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  placeholder={locale === "te" ? "మీరు అన్వేషించిన గమ్యస్థానాలు, మీ ప్రయాణ శైలి లేదా బహిరంగ అభిరుచుల గురించి మాకు తెలియజేయండి..." : locale === "hi" ? "उन गंतव्यों के बारे में बताएं जिन्हें आपने एक्सप्लोर किया है, आपकी यात्रा शैली, या बाहरी शौक..." : "Tell us about the destinations you've explored, your travel style, or outdoor hobbies..."}
                  rows={3}
                  className="glass border-stone-200 bg-white/90 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c]"
                />
              </div>

              {/* Why Join */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  {locale === "te" ? "మీరు అఖిల్‌తో ఎందుకు ప్రయాణించాలనుకుంటున్నారు మరియు కో-హోస్ట్ చేయాలనుకుంటున్నారు?" : locale === "hi" ? "आप अखिल के साथ यात्रा और सह-मेजबानी क्यों करना चाहते हैं?" : "Why do you want to travel and co-host with Akhil?"}
                </label>
                <Textarea
                  required
                  value={form.whyJoin}
                  onChange={(e) => setForm({ ...form, whyJoin: e.target.value })}
                  placeholder={locale === "te" ? "మీరు ఎందుకు ప్రయాణించాలనుకుంటున్నారో, గ్రూప్ హోస్టింగ్‌కు మీరు ఎలాంటి విలువను తీసుకువస్తారో మరియు మిమ్మల్ని ఎందుకు ఎంపిక చేయాలో మాకు చెప్పండి..." : locale === "hi" ? "हमें बताएं कि आप क्यों यात्रा करना चाहते हैं, समूह की मेजबानी में आप क्या मूल्य लाते हैं, और हमें आपको क्यों चुनना चाहिए..." : "Tell us why you want to travel, what value you bring to group hosting, and why we should select you..."}
                  rows={3}
                  className="glass border-stone-200 bg-white/90 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c]"
                />
              </div>

              {/* Disclaimer Card */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 leading-normal font-body">
                <strong>{locale === "te" ? "⚠️ కెరీర్స్ విధానం:" : locale === "hi" ? "⚠️ करियर नीति:" : "⚠️ Careers Policy:"}</strong> {locale === "te" ? "దరఖాస్తుదారులందరూ కనీసం 18 సంవత్సరాలు నిండి ఉండాలి. ఎంపిక చేసిన కో-హోస్ట్‌లు అఖిల్‌తో కలిసి WeAreSoloz గ్రూప్ టూర్లలో ప్రయాణిస్తారు." : locale === "hi" ? "सभी आवेदकों की आयु 18 वर्ष या उससे अधिक होनी चाहिए। चयनित सह-मेजबान अनुसूचित WeAreSoloz समूह यात्रा कार्यक्रमों पर अखिल के साथ यात्रा करेंगे।" : "All applicants must be 18 years or older. Selected co-hosts will travel with Akhil on scheduled WeAreSoloz group itineraries."}
              </div>

              <Button
                type="submit"
                disabled={busy}
                className="w-full gradient-orange text-white h-12 rounded-full font-medium"
              >
                {busy 
                  ? (locale === "te" ? "దరఖాస్తును సమర్పిస్తోంది..." : locale === "hi" ? "आवेदन जमा किया जा रहा है..." : "Submitting Application...") 
                  : (locale === "te" ? "దరఖాస్తును సమర్పించండి" : locale === "hi" ? "आवेदन जमा करें" : "Submit Application")
                } <ArrowRight className="w-4 h-4 ml-1 inline-block" />
              </Button>
            </form>
          </Reveal>

        </div>
      </section>

      <TermsModal
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
        onAccept={handleActualSubmit}
      />
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title={locale === "te" ? "దరఖాస్తు విజయవంతంగా సమర్పించబడింది!" : locale === "hi" ? "आवेदन सफलतापूर्वक जमा किया गया!" : "Application Submitted Successfully!"}
        message={locale === "te" ? "మీ దరఖాస్తుకు ధన్యవాదాలు! అఖిల్ త్వరలోనే మీ ప్రొఫైల్‌ను పరిశీలించి సంప్రదిస్తారు." : locale === "hi" ? "आपके आवेदन के लिए धन्यवाद! अखिल जल्द ही आपकी प्रोफाइल की समीक्षा करेंगे और आपसे संपर्क करेंगे।" : "Thank you for your application! Akhil will review your profile shortly and connect with you."}
        whatsappUrl={waUrl}
      />
    </div>
  );
}
