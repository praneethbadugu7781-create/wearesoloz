"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Phone, Instagram, ShieldCheck, Sprout, ArrowRight, UploadCloud, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Reveal, { SectionLabel } from "@/components/Reveal";
import { getApiUrl } from "@/lib/api";
import TermsModal from "./TermsModal";
import SuccessModal from "./SuccessModal";
import { useLanguage } from "@/lib/LanguageContext";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Telangana",
  "Karnataka",
  "Kerala",
  "Tamil Nadu",
  "Maharashtra",
  "Goa",
  "Gujarat",
  "Rajasthan",
  "Madhya Pradesh",
  "Uttar Pradesh",
  "Delhi",
  "Punjab",
  "Haryana",
  "Bihar",
  "West Bengal",
  "Odisha",
  "Assam",
  "Himachal Pradesh",
  "Uttarakhand",
  "Jammu & Kashmir",
  "Jharkhand",
  "Chhattisgarh",
  "Tripura",
  "Manipur",
  "Meghalaya",
  "Nagaland",
  "Mizoram",
  "Arunachal Pradesh",
  "Sikkim",
  "Puducherry"
];

export default function FarmerRegistrationClient() {
  const { t, locale } = useLanguage();
  const [form, setForm] = useState({
    fullName: "",
    gender: "",
    bloodGroup: "",
    age: "",
    email: "",
    mobile: "",
    state: "",
    district: "",
    farmingType: "",
    cropType: "",
    landSize: "",
    whyJoin: "",
    farmingImages: [] as string[],
  });
  const [busy, setBusy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [waUrl, setWaUrl] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    setUploadProgress(0);

    try {
      const API_URL = getApiUrl();
      const sigRes = await fetch(`${API_URL}/upload/signature-public`, {
        method: "POST"
      });
      if (!sigRes.ok) {
        throw new Error("Failed to get upload authorization.");
      }
      const { signature, timestamp, apiKey, cloudName, folder } = await sigRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signature);
      formData.append("timestamp", timestamp.toString());
      formData.append("api_key", apiKey);
      formData.append("folder", folder);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };

      const uploadPromise = new Promise<string>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            resolve(response.secure_url);
          } else {
            reject(new Error("Cloudinary upload failed"));
          }
        };
        xhr.onerror = () => reject(new Error("Network error during upload"));
      });

      xhr.send(formData);

      const uploadedUrl = await uploadPromise;
      setForm((prev) => ({
        ...prev,
        farmingImages: [...prev.farmingImages, uploadedUrl]
      }));
      toast.success("Image uploaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image.");
    } finally {
      setImageUploading(false);
      setUploadProgress(0);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setForm((prev) => ({
      ...prev,
      farmingImages: prev.farmingImages.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const farmingTypes = ["Crop Farming", "Organic Farming", "Dairy Farming", "Horticulture", "Poultry Farming", "Mixed Farming", "Other"];
  const landSizes = ["Less than 2 acres", "2 to 5 acres", "More than 5 acres"];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isGibberish = (str: string) => {
      // Check if any character repeats 4 or more times consecutively
      if (/(.)\1{3,}/.test(str.toLowerCase())) return true;
      // Check if unique characters are too low
      if (str.length >= 10) {
        const uniqueChars = new Set(str.toLowerCase().replace(/[^a-z]/g, "")).size;
        if (uniqueChars < 3) return true;
      }
      return false;
    };

    const cleanName = form.fullName.trim();
    if (!cleanName || cleanName.length < 3) {
      toast.error(locale === "te" ? "పూర్తి పేరు కనీసం 3 అక్షరాలు ఉండాలి" : locale === "hi" ? "पूरा नाम कम से कम 3 अक्षर होना चाहिए" : "Full name must be at least 3 characters");
      return;
    }
    if (!/^[a-zA-Z\s\u0c00-\u0c7f\u0900-\u097f]+$/.test(cleanName)) {
      toast.error(locale === "te" ? "పూర్తి పేరు కేవలం అక్షరాలను మాత్రమే కలిగి ఉండాలి" : locale === "hi" ? "पूरे नाम में केवल अक्षर और स्थान होने चाहिए" : "Full name must contain only letters and spaces");
      return;
    }
    if (!cleanName.includes(" ")) {
      toast.error(locale === "te" ? "దయచేసి మీ ఇంటి పేరు మరియు పేరు రెండింటినీ నమోదు చేయండి" : locale === "hi" ? "कृपया अपना पहला और अंतिम नाम दोनों दर्ज करें" : "Please enter both your first name and last name");
      return;
    }
    if (isGibberish(cleanName)) {
      toast.error(locale === "te" ? "దయచేసి సరైన పేరును నమోదు చేయండి" : locale === "hi" ? "कृपया एक मान्य नाम दर्ज करें" : "Please enter a valid name (repeated letters or random symbols are not allowed)");
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
    if (!form.state || !INDIAN_STATES.includes(form.state)) {
      toast.error(locale === "te" ? "దయచేసి జాబితా నుండి సరైన రాష్ట్రాన్ని ఎంచుకోండి" : locale === "hi" ? "कृपया सूची से एक मान्य राज्य चुनें" : "Please select a valid state from the options");
      return;
    }
    
    const cleanDistrict = form.district.trim();
    if (!cleanDistrict || cleanDistrict.length < 3) {
      toast.error(locale === "te" ? "జిల్లా పేరు కనీసం 3 అక్షరాలు ఉండాలి" : locale === "hi" ? "जिले का नाम कम से कम 3 अक्षर का होना चाहिए" : "District name must be at least 3 characters");
      return;
    }
    if (!/^[a-zA-Z\s\u0c00-\u0c7f\u0900-\u097f]+$/.test(cleanDistrict)) {
      toast.error(locale === "te" ? "జిల్లా పేరు కేవలం అక్షరాలను మాత్రమే కలిగి ఉండాలి" : locale === "hi" ? "जिले के नाम में केवल अक्षर और स्थान होने चाहिए" : "District name must contain only letters and spaces");
      return;
    }
    if (isGibberish(cleanDistrict)) {
      toast.error(locale === "te" ? "దయచేసి సరైన జిల్లా పేరును నమోదు చేయండి" : locale === "hi" ? "कृपया एक मान्य जिले का नाम दर्ज करें" : "Please enter a valid district name");
      return;
    }

    if (!form.farmingType) {
      toast.error(locale === "te" ? "దయచేసి వ్యవసాయ విభాగాన్ని ఎంచుకోండి" : locale === "hi" ? "कृपया खेती का प्रकार चुनें" : "Please select a farming type");
      return;
    }

    const cleanCropType = form.cropType.trim();
    if (!cleanCropType || cleanCropType.length < 3) {
      toast.error(locale === "te" ? "పండించే పంటలు కనీసం 3 అక్షరాలు ఉండాలి" : locale === "hi" ? "उगाई जाने वाली फसलें कम से कम 3 अक्षर होनी चाहिए" : "Crops grown must be at least 3 characters");
      return;
    }
    if (!/^[a-zA-Z0-9\s,\u0c00-\u0c7f\u0900-\u097f]+$/.test(cleanCropType)) {
      toast.error(locale === "te" ? "పంటల ఫీల్డ్‌లో అక్షరాలు, సంఖ్యలు, ఖాళీలు మరియు కామాలు మాత్రమే ఉండాలి" : locale === "hi" ? "फसल क्षेत्र में केवल अक्षर, संख्याएं, स्थान और अल्पविराम होने चाहिए" : "Crops field must contain only letters, numbers, spaces, and commas");
      return;
    }
    if (isGibberish(cleanCropType)) {
      toast.error(locale === "te" ? "దయచేసి సరైన పంటల పేర్లను నమోదు చేయండి" : locale === "hi" ? "कृपया मान्य फसलों के नाम दर्ज करें" : "Please enter valid crops names");
      return;
    }

    if (!form.landSize) {
      toast.error(locale === "te" ? "దయచేసి మీ భూమి పరిమాణాన్ని ఎంచుకోండి" : locale === "hi" ? "कृपया अपने भूमि का आकार चुनें" : "Please select your land size");
      return;
    }

    const cleanWhyJoin = form.whyJoin.trim();
    if (!cleanWhyJoin || cleanWhyJoin.length < 20) {
      toast.error(locale === "te" ? "కారణం వివరణ కనీసం 20 అక్షరాలు ఉండాలి" : locale === "hi" ? "स्पष्टीकरण कम से कम 20 अक्षर होना चाहिए" : "Motivation explanation must be at least 20 characters");
      return;
    }
    if (isGibberish(cleanWhyJoin)) {
      toast.error(locale === "te" ? "దయచేసి సరైన వివరణను నమోదు చేయండి" : locale === "hi" ? "कृपया एक मान्य स्पष्टीकरण दर्ज करें" : "Please enter a valid explanation (no repeated text/gibberish)");
      return;
    }

    if (form.farmingImages.length === 0) {
      toast.error(locale === "te" ? "దయచేసి మీ వ్యవసాయ ఫోటోలలో కనీసం ఒకదానిని అప్‌లోడ్ చేయండి" : locale === "hi" ? "कृपया अपने खेत या खेती की कम से कम एक तस्वीर अपलोड करें" : "Please upload at least one image of your farm or farming activity");
      return;
    }

    setShowTerms(true);
  };

  const handleActualSubmit = async () => {
    setBusy(true);
    try {
      const API_URL = getApiUrl();
      const res = await fetch(`${API_URL}/farmers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Failed to submit");
      }

      // Open WhatsApp chat prefilled with form data
      const waText = encodeURIComponent(
        `Hi Akhil, my name is ${form.fullName}. I just applied for the Free Farmer Trip initiative on WeAreSoloz.\nFarming: ${form.farmingType} (${form.cropType})\nLocation: ${form.district}, ${form.state}\nBlood Group: ${form.bloodGroup}\nThank you for this beautiful initiative!`
      );
      const generatedWaUrl = `https://wa.me/919966085310?text=${waText}`;
      setWaUrl(generatedWaUrl);
      window.open(generatedWaUrl, "_blank");

      // Reset Form
      setForm({
        fullName: "",
        gender: "",
        bloodGroup: "",
        age: "",
        email: "",
        mobile: "",
        state: "",
        district: "",
        farmingType: "",
        cropType: "",
        landSize: "",
        whyJoin: "",
        farmingImages: [],
      });
      setShowSuccess(true);
    } catch {
      toast.error("Couldn't submit application. Please try again.");
    }
    setBusy(false);
  };

  return (
    <div data-testid="farmer-registration-page" className="relative min-h-screen text-[#1c1917] pt-20 overflow-hidden bg-stone-50">
      {/* Premium Farming Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-75"
        style={{ 
          backgroundImage: `url('/images/farmer_bg.png')`,
        }}
      />
      {/* Soft overlay to blend image and ensure text is perfectly legible */}
      <div className="absolute inset-0 z-0 bg-white/60 backdrop-blur-[1px]" />

      <section className="relative z-10 pt-40 pb-24 px-6 md:px-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
          
          {/* Left Panel: Description */}
          <Reveal>
            <SectionLabel>{locale === "te" ? "🌾 శ్రమకు గౌరవం" : locale === "hi" ? "🌾 श्रम का सम्मान" : "🌾 Cultivating Gratitude"}</SectionLabel>
            <h1 className="font-display text-4xl md:text-5xl font-light tracking-tighter mt-5 text-stone-900 leading-tight">
              {locale === "te" ? "మా రైతు చొరవ" : locale === "hi" ? "हमारी किसान पहल" : <>Our Farmer <span className="gradient-text font-medium">Initiative</span></>}
            </h1>
            
            <div className="text-stone-700 mt-6 space-y-6 leading-relaxed font-body text-sm sm:text-base">
              <p>
                {locale === "te" ? (
                  "WeAreSoloZ వద్ద, ప్రయాణానికి జీవితాలను మార్చే శక్తి ఉందని మేము నమ్ముతాము. కానీ నిజమైన సాహసం అంటే కేవలం దిగంతాలను దాటి వెళ్లడం మాత్రమే కాదు — మన స్వదేశంలో మనల్ని పోషిస్తున్న చేతులను గౌరవించడం."
                ) : locale === "hi" ? (
                  "WeAreSoloZ में, हमारा मानना है कि यात्रा में जीवन को बदलने की शक्ति है। लेकिन सच्चा रोमांच केवल क्षितिजों का पीछा करने के बारे में नहीं है — यह उन हाथों का सम्मान करने के बारे में है जो हमें हमारे घर पर पालते हैं।"
                ) : (
                  "At WeAreSoloZ, we believe travel has the power to transform lives. But true adventure isn't just about the horizons we chase—it’s about honoring the hands that sustain us right here at home."
                )}
              </p>
              <p>
                {locale === "te" ? (
                  "రైతులు మన దేశానికి నిశ్శబ్ద గుండె చప్పుడు. ప్రతి రోజూ, అలసట లేని అంకితభావంతో మరియు నిశ్శబ్దమైన పట్టుదలతో, వారు లక్షలాది కుటుంబాలకు ఆహారం అందించడానికి భూమిని పోషిస్తారు. అయినప్పటికీ, భూమి యొక్క శ్రమతో కూడిన జీవన విధానం వారికి పొలాల నుండి దూరంగా వెళ్లి, విశ్రాంతి తీసుకోవడానికి మరియు వారు నిలబెట్టడానికి ఎంతో కష్టపడుతున్న ఈ ప్రపంచంలోని విస్తారమైన అందాన్ని అనుభవించడానికి చాలా అరుదుగా అవకాశం ఇస్తుంది."
                ) : locale === "hi" ? (
                  "किसान हमारे देश की मूक धड़कन हैं। हर एक दिन, अथक समर्पण और मूक लचीलेपन के साथ, वे लाखों परिवारों को खिलाने के लिए भूमि का पोषण करते हैं। फिर भी, पृथ्वी की मांगलिक लय शायद ही कभी उन्हें खेतों से दूर कदम रखने, आराम करने और उस दुनिया की विशाल सुंदरता का अनुभव करने का मौका देती है जिसे बनाए रखने के लिए वे इतनी मेहनत करते हैं।"
                ) : (
                  "Farmers are the quiet heartbeat of our nation. Every single day, with tireless dedication and quiet resilience, they nurture the land to feed millions of families. Yet, the demanding rhythm of the earth rarely grants them the chance to step away, rest, and experience the vast beauty of the world they work so hard to sustain."
                )}
              </p>
              
              <div className="my-8 p-6 rounded-2xl bg-amber-500/10 border border-orange-500/15 text-stone-850">
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-amber-700 mb-1.5">{locale === "te" ? "ప్రయాణ ఆనందాన్ని పంచుకోవడం" : locale === "hi" ? "यात्रा की खुशी साझा करना" : "Sharing the Joy of the Journey"}</h4>
                <p className="text-sm font-semibold leading-relaxed">
                  {locale === "te" ? (
                    <>మా హృదయపూర్వక కృతజ్ఞతను తెలియజేయడానికి, ప్రతి నెలా ఒక అర్హుడైన రైతు కోసం <span className="text-[#ea580c]">\"పూర్తిగా ఉచిత ప్రయాణాన్ని\"</span> స్పాన్సర్ చేయడానికి WeAreSoloZ ఎంతో గర్విస్తోంది.</>
                  ) : locale === "hi" ? (
                    <>हमारी गहरी कृतज्ञता व्यक्त करने के लिए, WeAreSoloZ को हर महीने एक योग्य किसान के लिए <span className="text-[#ea580c]">\"पूरी तरह से प्रायोजित यात्रा\"</span> प्रायोजित करने में गहरा सम्मान महसूस होता है।</>
                  ) : (
                    <>To express our deepest gratitude, WeAreSoloZ is deeply honored to sponsor <span className="text-[#ea580c]">"one fully gifted journey every month for a deserving farmer"</span>.</>
                  )}
                </p>
              </div>

              <p>
                {locale === "te" ? (
                  "ఈ చొరవ తిరిగి ఇవ్వడానికి మా వినమ్రమైన మార్గం. ఈ అద్భుతమైన వ్యక్తులు పొలాల నుండి బయటకు వచ్చి, అర్హత కలిగిన విశ్రాంతి, ప్రేరణ మరియు అందమైన కొత్త జ్ఞాపకాల ప్రపంచంలోకి అడుగు పెట్టడానికి ఇదొక ఆహ్వానం."
                ) : locale === "hi" ? (
                  "यह पहल वापस देने का हमारा विनम्र तरीका है। यह इन अविश्वसनीय व्यक्तियों के लिए खेतों से बाहर कदम रखने और अच्छी तरह से योग्य आराम, प्रेरणा और सुंदर नई यादों की दुनिया में कदम रखने का निमंत्रण है।"
                ) : (
                  "This initiative is our humble way of giving back. It is an invitation for these incredible individuals to step out of the fields and into a world of well-deserved rest, inspiration, and beautiful new memories."
                )}
              </p>
              <p>
                {locale === "te" ? (
                  "ఇది ఒక కార్యక్రమం కంటే ఎక్కువ; ఇది మా గుండె చప్పుడు. మనకు ఆహారం అందించే చేతులను చూసి, హృదయపూర్వక గౌరవంతో చెప్పే మా మార్గం:"
                ) : locale === "hi" ? (
                  "यह एक कार्यक्रम से कहीं अधिक है; यह हमारी धड़कन है। यह हमारा उन हाथों को देखने और गहरे सम्मान के साथ कहने का तरीका है जो हमें खिलाते हैं:"
                ) : (
                  "This is more than a program; it is our heartbeat. It’s our way of looking at the hands that feed us and saying, with profound respect:"
                )}
              </p>
              
              <p className="text-base sm:text-lg font-bold text-[#ea580c] italic border-l-4 border-[#ea580c] pl-4 py-2 bg-orange-500/5 rounded-r-xl leading-relaxed">
                {locale === "te" ? (
                  "“మా జీవితాలను నిలబెట్టినందుకు ధన్యవాదాలు. ఇప్పుడు, ప్రపంచాన్ని మీకు చూపిస్తాము.” 🌾❤️"
                ) : locale === "hi" ? (
                  "“हमारे जीवन को बनाए रखने के लिए धन्यवाद। अब, हम आपको दुनिया दिखाते हैं।” 🌾❤️"
                ) : (
                  "“Thank you for sustaining our lives. Now, let us show you the world.” 🌾❤️"
                )}
              </p>
            </div>

            <div className="space-y-3 mt-10 flex flex-col items-start">
              <a
                href="tel:+919966085310"
                className="inline-flex items-center gap-4 glass rounded-xl px-5 py-3 hover:bg-stone-50 border border-stone-200/50 transition-colors text-sm font-medium text-stone-700"
              >
                <Phone className="w-4 h-4 text-soloz-primary" /> {locale === "te" ? "అఖిల్ పసుపులేటిని సంప్రదించండి" : locale === "hi" ? "अखिल पसुपुलेटी से संपर्क करें" : "Contact Akhil Pasupuleti"}: +91 9966085310
              </a>
              <a
                href="tel:+919281017746"
                className="inline-flex items-center gap-4 glass rounded-xl px-5 py-3 hover:bg-stone-50 border border-stone-200/50 transition-colors text-sm font-medium text-stone-700"
              >
                <Phone className="w-4 h-4 text-soloz-primary" /> {locale === "te" ? "అఖిల్ పసుపులేటిని సంప్రదించండి" : locale === "hi" ? "अखिल पसुपुलेटी से संपर्क करें" : "Contact Akhil Pasupuleti"}: +91 9281017746
              </a>
              <a
                href="https://www.instagram.com/wearesolozindia"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-4 glass rounded-xl px-5 py-3 hover:bg-stone-50 border border-stone-200/50 transition-colors text-sm font-medium text-stone-700"
              >
                <Instagram className="w-4 h-4 text-soloz-primary" /> Instagram: @wearesolozindia
              </a>
            </div>
          </Reveal>

          {/* Right Panel: Form */}
          <Reveal className="self-start">
            <form onSubmit={submit} className="glass rounded-3xl p-8 bg-stone-50 border border-stone-200 space-y-4 shadow-sm">
              <div className="text-xs uppercase tracking-widest text-[#ea580c] font-semibold mb-2">{t("farmer_form_title")}</div>
              
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {/* Gender */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    {t("gender")}
                  </label>
                  <select
                    required
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full rounded-md border border-stone-250 bg-white/90 px-2 md:px-3 py-2 h-12 text-xs md:text-sm text-stone-900 focus-visible:outline-none focus:border-[#ea580c]"
                  >
                    <option value="">{t("gender")}</option>
                    <option value="Male">{t("male")}</option>
                    <option value="Female">{t("female")}</option>
                    <option value="Other">{t("other")}</option>
                  </select>
                </div>

                {/* Age */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    {locale === "te" ? "వయస్సు" : locale === "hi" ? "उम्र" : "Age"}
                  </label>
                  <Input
                    required
                    type="number"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    placeholder={locale === "te" ? "వయస్సు" : locale === "hi" ? "उम्र" : "Age"}
                    className="glass border-stone-200 bg-white/90 h-12 px-2 md:px-3 text-xs md:text-sm text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c]"
                  />
                </div>

                {/* Blood Group */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    {locale === "te" ? "రక్త గ్రూపు" : locale === "hi" ? "रक्त समूह" : "Blood Group"}
                  </label>
                  <select
                    required
                    value={form.bloodGroup}
                    onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                    className="w-full rounded-md border border-stone-250 bg-white/90 px-2 md:px-3 py-2 h-12 text-xs md:text-sm text-stone-900 focus-visible:outline-none focus:border-[#ea580c]"
                  >
                    <option value="">{locale === "te" ? "రక్తం" : locale === "hi" ? "रक्त" : "Blood"}</option>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
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
                  placeholder={locale === "te" ? "మీ ఈమెయిల్ చిరునామా నమోదు చేయండి" : locale === "hi" ? "अपना ईमेल पता दर्ज करें" : "Enter your email address"}
                  className="glass border-stone-200 bg-white/90 h-12 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c]"
                />
              </div>

              {/* Mobile WhatsApp */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  {locale === "te" ? "మొబైల్ (వాట్సాప్ ప్రాధాన్యత)" : locale === "hi" ? "मोबाइल (व्हाट्सएप पसंदीदा)" : "Mobile (WhatsApp Preferred)"}
                </label>
                <Input
                  required
                  type="tel"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  placeholder={locale === "te" ? "10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి" : locale === "hi" ? "10-अंकीय मोबाइल नंबर दर्ज करें" : "Enter 10-digit mobile number"}
                  className="glass border-stone-200 bg-white/90 h-12 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* State */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    {locale === "te" ? "రాష్ట్రం" : locale === "hi" ? "राज्य" : "State"}
                  </label>
                  <select
                    required
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full rounded-md border border-stone-200 bg-white/90 px-3 py-2 h-12 text-sm text-stone-900 focus-visible:outline-none focus:border-[#ea580c]"
                  >
                    <option value="">{locale === "te" ? "రాష్ట్రాన్ని ఎంచుకోండి" : locale === "hi" ? "राज्य चुनें" : "Select State"}</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    {locale === "te" ? "జిల్లా" : locale === "hi" ? "जिला" : "District"}
                  </label>
                  <Input
                    required
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    placeholder={locale === "te" ? "ఉదా: మహబూబ్‌నగర్" : locale === "hi" ? "उदा: महबूबनगर" : "e.g. Mahabubnagar"}
                    className="glass border-stone-200 bg-white/90 h-12 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Farming Type */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    {locale === "te" ? "వ్యవసాయ విభాగం" : locale === "hi" ? "कृषि श्रेणी" : "Farming Category"}
                  </label>
                  <select
                    required
                    value={form.farmingType}
                    onChange={(e) => setForm({ ...form, farmingType: e.target.value })}
                    className="w-full rounded-md border border-stone-250 bg-white/90 px-3 py-2 h-12 text-sm text-stone-900 focus-visible:outline-none focus:border-[#ea580c]"
                  >
                    <option value="">{locale === "te" ? "విభాగాన్ని ఎంచుకోండి" : locale === "hi" ? "श्रेणी चुनें" : "Select Category"}</option>
                    {farmingTypes.map((t) => (
                      <option key={t} value={t}>
                        {locale === "te" ? (
                          t === "Crop Farming" ? "పంట వ్యవసాయం" :
                          t === "Organic Farming" ? "సేంద్రీయ వ్యవసాయం" :
                          t === "Dairy Farming" ? "పాడి పరిశ్రమ వ్యవసాయం" :
                          t === "Horticulture" ? "తోటల పెంపకం" :
                          t === "Poultry Farming" ? "కోళ్ల పెంపకం" :
                          t === "Mixed Farming" ? "మిశ్రమ వ్యవసాయం" :
                          t === "Other" ? "ఇతర విభాగం" : t
                        ) : locale === "hi" ? (
                          t === "Crop Farming" ? "फसल खेती" :
                          t === "Organic Farming" ? "जैविक खेती" :
                          t === "Dairy Farming" ? "डेयरी फार्मिंग" :
                          t === "Horticulture" ? "बागवानी" :
                          t === "Poultry Farming" ? "मुर्गी पालन" :
                          t === "Mixed Farming" ? "मिश्रित खेती" :
                          t === "Other" ? "अन्य" : t
                        ) : t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Land Size */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    {locale === "te" ? "భూమి పరిమాణం" : locale === "hi" ? "भूमि का आकार" : "Land Holding Size"}
                  </label>
                  <select
                    required
                    value={form.landSize}
                    onChange={(e) => setForm({ ...form, landSize: e.target.value })}
                    className="w-full rounded-md border border-stone-250 bg-white/90 px-3 py-2 h-12 text-sm text-stone-900 focus-visible:outline-none focus:border-[#ea580c]"
                  >
                    <option value="">{locale === "te" ? "పరిమాణాన్ని ఎంచుకోండి" : locale === "hi" ? "आकार चुनें" : "Select Size"}</option>
                    {landSizes.map((s) => (
                      <option key={s} value={s}>
                        {locale === "te" ? (
                          s === "Less than 2 acres" ? "2 ఎకరాల కంటే తక్కువ" :
                          s === "2 to 5 acres" ? "2 నుండి 5 ఎకరాలు" :
                          s === "More than 5 acres" ? "5 ఎకరాల కంటే ఎక్కువ" : s
                        ) : locale === "hi" ? (
                          s === "Less than 2 acres" ? "2 एकड़ से कम" :
                          s === "2 to 5 acres" ? "2 से 5 एकड़" :
                          s === "More than 5 acres" ? "5 एकड़ से अधिक" : s
                        ) : s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Crop Types */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  {locale === "te" ? "పండించే పంటలు" : locale === "hi" ? "उगाई जाने वाली फसलें" : "Crops Grown / Products Grown"}
                </label>
                <Input
                  required
                  value={form.cropType}
                  onChange={(e) => setForm({ ...form, cropType: e.target.value })}
                  placeholder={locale === "te" ? "ఉదా: వరి, పత్తి, మిరపకాయలు" : locale === "hi" ? "उदा: धान, कपास, मिर्च" : "e.g. Rice, Cotton, Chillies"}
                  className="glass border-stone-200 bg-white/90 h-12 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c]"
                />
              </div>

              {/* Farming Images Upload */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  {locale === "te" ? "వ్యవసాయ ఫోటోలు అప్‌లోడ్ చేయండి (కనీసం 1 అవసరం)" : locale === "hi" ? "कृषि चित्र अपलोड करें (कम से कम 1 आवश्यक)" : "Upload Farm / Farming Images (At least 1 required)"}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {form.farmingImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-stone-200 bg-stone-100 group shadow-sm">
                      <img src={img} alt="Farm Upload" className="object-cover w-full h-full" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-red-650 text-white rounded-full p-1 transition-colors"
                        aria-label="Remove image"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}

                  {form.farmingImages.length < 5 && (
                    <label className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-stone-300 bg-white hover:border-[#ea580c] hover:bg-stone-50 transition cursor-pointer p-4 text-center">
                      {imageUploading ? (
                        <div className="flex flex-col items-center gap-1.5">
                          <Loader2 className="animate-spin text-[#ea580c]" size={20} />
                          <span className="text-[9px] font-semibold text-stone-500">{uploadProgress}%</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <UploadCloud size={20} className="text-stone-400 group-hover:text-[#ea580c]" />
                          <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider">
                            {locale === "te" ? "ఫోటోను జోడించండి" : locale === "hi" ? "चित्र जोड़ें" : "Add Image"}
                          </span>
                          <span className="text-[8px] text-stone-400">{locale === "te" ? "గరిష్టంగా 5 ఫోటోలు" : locale === "hi" ? "अधिकतम 5 चित्र" : "Max 5 images"}</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={imageUploading}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Why Join */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  {locale === "te" ? "మీరు ఈ ఉచిత ప్రయాణంలో ఎందుకు చేరాలనుకుంటున్నారు?" : locale === "hi" ? "आप इस मुफ्त यात्रा में क्यों शामिल होना चाहते हैं?" : "Why do you want to join WeAreSoloz free travel?"}
                </label>
                <Textarea
                  required
                  rows={4}
                  value={form.whyJoin}
                  onChange={(e) => setForm({ ...form, whyJoin: e.target.value })}
                  placeholder={locale === "te" ? "మీ గురించి, మీ వ్యవసాయ పనుల గురించి మరియు మీరు ఎందుకు ప్రయాణించాలనుకుంటున్నారో క్లుప్తంగా చెప్పండి..." : locale === "hi" ? "हमें अपने बारे में, अपने कृषि कार्य के बारे में और आप क्यों यात्रा करना चाहते हैं, थोड़ा बताएं..." : "Tell us a little bit about yourself, your agricultural work, and why you would love to travel with our community..."}
                  className="glass border-stone-200 bg-white/90 text-stone-900 placeholder:text-stone-400 focus-visible:ring-soloz-primary focus:border-[#ea580c]"
                />
              </div>

              {/* Disclaimer */}
              <p className="text-[10.5px] text-stone-400 leading-normal font-medium">
                {locale === "te" ? (
                  "* దరఖాస్తు చేయడం ద్వారా, మీరు వ్యవసాయంలో చురుకుగా ఉన్నారని ధృవీకరిస్తున్నారు. ట్రిప్ బయలుదేరే ముందు మీ రైతు గుర్తింపు కార్డును సమర్పించడానికి మీరు అంగీకరిస్తున్నారు."
                ) : locale === "hi" ? (
                  "* सबमिट करके, आप पुष्टि करते हैं कि आप सक्रिय रूप से खेती में लगे हुए हैं। आप यात्रा प्रस्थान से पहले अपना किसान सत्यापन कार्ड/आईडी जमा करने के लिए सहमत हैं।"
                ) : (
                  "* By submitting, you confirm you are actively engaged in farming. You agree to submit your farmer verification book/ID before trip departure."
                )}
              </p>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={busy}
                className="w-full gradient-orange text-white hover:opacity-95 h-12 rounded-full font-bold uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center gap-2"
              >
                {busy 
                  ? (locale === "te" ? "దరఖాస్తును సమర్పిస్తోంది..." : locale === "hi" ? "आवेदन जमा किया जा रहा है..." : "Submitting Application...") 
                  : (locale === "te" ? "దరఖాస్తును సమర్పించండి" : locale === "hi" ? "आवेदन जमा करें" : "Submit Application")
                }
                {!busy && <ArrowRight size={15} />}
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
        message={locale === "te" ? "ధన్యవాదాలు! మీ వివరాలను ధృవీకరించడానికి అఖిల్ త్వరలో మిమ్మల్ని సంప్రదిస్తారు." : locale === "hi" ? "धन्यवाद! आपके विवरण को सत्यापित करने के लिए अखिल जल्द ही आपसे संपर्क करेंगे।" : "Thank you for your interest! Akhil will contact you shortly to verify your details."}
        whatsappUrl={waUrl}
      />
    </div>
  );
}
