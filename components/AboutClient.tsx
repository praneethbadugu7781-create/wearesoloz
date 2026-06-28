"use client";

import React from "react";
import Link from "next/link";
import { Youtube, Instagram, Phone, MessageCircle, ArrowRight, Leaf, Quote, Heart, Shield, Compass, Sparkles, Users } from "lucide-react";
import { motion } from "framer-motion";
import Reveal, { SectionLabel } from "@/components/Reveal";
import { worldMapData } from "./worldMapData";
import { useLanguage } from "@/lib/LanguageContext";

interface AboutClientProps {
  settings: any;
}

const differences = [
  {
    title: "Safe & Supportive Community",
    desc: "We prioritize safety and comfort, creating a positive space for all travellers.",
    emoji: "🛡️",
    color: "hover:border-orange-200 hover:bg-orange-50/20 hover:shadow-orange-100/30"
  },
  {
    title: "Solo Travellers Always Welcome",
    desc: "Never worry about not having company. You'll join a warm and welcoming family.",
    emoji: "🎒",
    color: "hover:border-blue-200 hover:bg-blue-50/20 hover:shadow-blue-100/30"
  },
  {
    title: "Lifelong Friendships",
    desc: "Connect with like-minded travellers who share your passions and build lasting bonds.",
    emoji: "🤝",
    color: "hover:border-emerald-200 hover:bg-emerald-50/20 hover:shadow-emerald-100/30"
  },
  {
    title: "Diverse Getaways",
    desc: "Curated adventure, spiritual, nature, healing, and weekend trips.",
    emoji: "⛰️",
    color: "hover:border-amber-200 hover:bg-amber-50/20 hover:shadow-amber-100/30"
  },
  {
    title: "Photography & Unforgettable Memories",
    desc: "Capture beautiful moments and keep stories you'll cherish for a lifetime.",
    emoji: "📸",
    color: "hover:border-purple-200 hover:bg-purple-50/20 hover:shadow-purple-100/30"
  }
];

const themedExperiences = [
  {
    title: "Travel With Your Mother",
    desc: "A journey of gratitude and connection, creating beautiful travel memories with the woman who gave you everything.",
    emoji: "❤️",
    color: "hover:border-pink-200 hover:bg-pink-50/20 hover:shadow-pink-100/30"
  },
  {
    title: "Travel With Your Father",
    desc: "Strengthen your bond and share road trips, outdoor campfires, and meaningful stories with your father.",
    emoji: "👨",
    color: "hover:border-blue-200 hover:bg-blue-50/20 hover:shadow-blue-100/30"
  },
  {
    title: "Travel With Grandparents",
    desc: "A comfortable, slower-paced journey focusing on respect, story-sharing, and multi-generational warmth.",
    emoji: "👵",
    color: "hover:border-amber-200 hover:bg-amber-50/20 hover:shadow-amber-100/30"
  },
  {
    title: "Siblings Special Trips",
    desc: "Reignite childhood bonds, sibling rivalries, and shared laughs on amazing trails and road trips.",
    emoji: "👨‍👩‍👧‍👦",
    color: "hover:border-emerald-200 hover:bg-emerald-50/20 hover:shadow-emerald-100/30"
  },
  {
    title: "Healing & Self-Discovery Journeys",
    desc: "Reconnect with yourself. Rejuvenate your mind, body, and spirit on sacred nature trails, yoga, and meditation retreats.",
    emoji: "🌿",
    color: "hover:border-purple-200 hover:bg-purple-50/20 hover:shadow-purple-100/30"
  }
];

const whyWeExistList = [
  { title: "Travel Heals", desc: "Step away from stress and return with a refreshed, peaceful heart.", emoji: "🩹", color: "from-orange-500/10 to-transparent", border: "group-hover:border-orange-300" },
  { title: "Travel Teaches", desc: "Discover new cultures and trails that shape your understanding of life.", emoji: "📖", color: "from-blue-500/10 to-transparent", border: "group-hover:border-blue-300" },
  { title: "Travel Connects", desc: "Turn strangers into family around campfires and along remote trails.", emoji: "🔗", color: "from-emerald-500/10 to-transparent", border: "group-hover:border-emerald-300" },
  { title: "Travel Transforms", desc: "Expand your comfort zone, find your calling, and transform your outlook.", emoji: "🦋", color: "from-purple-500/10 to-transparent", border: "group-hover:border-purple-300" }
];

export default function AboutClient({ settings = {} }: AboutClientProps) {
  const { t, locale } = useLanguage();
  const founderImage = settings.founder_image || settings.founderImage || "/images/akhil.jpg";
  const instagramLink = settings.instagram_link || "https://www.instagram.com/akhillrockstar";
  const whatsappCommunityLink = "https://chat.whatsapp.com/E7aoVfUi66S4VDEBsdXoMW";

  return (
    <div data-testid="about-page" className="bg-white min-h-screen text-[#1c1917] pt-20 relative overflow-hidden">
      
      {/* Background Watermark */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.25] z-0"
        style={{ 
          backgroundImage: "url('/images/india_about_bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed"
        }}
      />

      {/* Decorative Planes & Globes */}
      <div className="absolute top-48 left-10 opacity-[0.015] pointer-events-none hidden lg:block animate-bounce" style={{ animationDuration: '10s' }}>
        <svg className="w-56 h-56" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L14 19v-5.5L21 16z"/>
        </svg>
      </div>

      {/* SECTION 1: Philosophy Banner */}
      <section className="pt-36 pb-12 px-6 md:px-10 text-center relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />
        <Reveal className="max-w-4xl mx-auto">
          <Quote className="w-12 h-12 mx-auto text-orange-500/25 mb-6 rotate-180" />
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-light italic tracking-tight text-stone-850 leading-tight">
            {locale === "te" ? (
              <>&ldquo;మీరు ప్రయాణం ఖరీదైనదని అనుకుంటే, ఒక <span className="gradient-text font-semibold animate-pulse">వృధా అయిన జీవితం</span> యొక్క ధరను చూసే వరకు వేచి ఉండండి.&rdquo;</>
            ) : locale === "hi" ? (
              <>&ldquo;यदि आपको लगता है कि यात्रा महंगी है, तो तब तक प्रतीक्षा करें जब तक आप एक <span className="gradient-text font-semibold animate-pulse">बर्बाद जीवन</span> की कीमत न देख लें।&rdquo;</>
            ) : (
              <>&ldquo;If you think travel is expensive, wait until you see the price of a <span className="gradient-text font-semibold animate-pulse">wasted life</span>.&rdquo;</>
            )}
          </h2>
        </Reveal>
      </section>

      {/* SECTION 2: Hero Intro - Founder Story */}
      <section className="py-20 px-6 md:px-10 relative z-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          
          {/* Left Panel: Image */}
          <Reveal className="w-full">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-stone-400/20 bg-stone-100 group cursor-pointer">
              <img
                src={founderImage}
                alt="Akhil Pasupuleti - Founder of WeAreSoloz"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-75 pointer-events-none" />
            </div>

            {/* Signature Card */}
            <div className="mt-6 bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 group hover:border-orange-300 hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping absolute" />
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 relative" />
                </div>
                <div>
                  <h4 className="font-display text-lg font-bold text-stone-900 leading-tight">Akhil Pasupuleti</h4>
                  <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold mt-0.5">{locale === "te" ? "వ్యవస్థాపకుడు - WeAreSoloZ" : locale === "hi" ? "संस्थापक - WeAreSoloZ" : "Founder of WeAreSoloZ"}</p>
                </div>
              </div>
              <div className="text-stone-400 font-display italic text-sm group-hover:text-orange-500 transition-colors">
                &ldquo;{locale === "te" ? "ఒంటరిగా ప్రయాణించండి, మీరు ఒంటరిగా లేరు" : locale === "hi" ? "सोलो यात्रा करें, आप अकेले नहीं हैं" : "Travel Solo, You're Not Alone"}&rdquo;
              </div>
            </div>
          </Reveal>

          {/* Right Panel: Bio Text */}
          <Reveal>
            <SectionLabel>{locale === "te" ? "వ్యవస్థాపకుడి కథ" : locale === "hi" ? "संस्थापक की कहानी" : "Founder Story"}</SectionLabel>
            <h1 className="font-display text-4xl md:text-6xl font-light tracking-tighter mt-5 text-stone-900 leading-tight">
              {locale === "te" ? <>హాయ్, నేను <span className="gradient-text font-semibold">అఖిల్ పసుపులేటి</span>.</> : locale === "hi" ? <>नमस्ते, मैं <span className="gradient-text font-semibold">अखिल पसुपुलेटी</span> हूँ।</> : <>Hi, I'm <span className="gradient-text font-semibold">Akhil Pasupuleti</span>.</>}
            </h1>

            <div className="space-y-6 mt-8 text-stone-600 leading-relaxed font-body text-base md:text-lg">
              <p className="font-medium text-stone-850 text-lg md:text-xl leading-snug">
                {locale === "te" ? (
                  "భారతదేశం అంతటా లెక్కలేనన్ని ప్రదేశాలతో పాటు 12 దేశాలలో 7+ సంవత్సరాల ప్రయాణ అనుభవం ఉన్న ఉద్వేగభరితమైన ప్రయాణీకుడు అఖిల్ స్థాపించిన WeAreSoloZ, ఒక సాధారణ నమ్మకం నుండి పుట్టింది:"
                ) : locale === "hi" ? (
                  "भारत भर में अनगिनत गंतव्यों के साथ 12 देशों में 7+ वर्षों के अनुभव वाले एक उत्साही यात्री अखिल द्वारा स्थापित, WeAreSoloZ का जन्म एक सरल विश्वास से हुआ था:"
                ) : (
                  "Founded by Akhil, a passionate traveller with 7+ years of experience across 12 countries and countless destinations throughout India, WeAreSoloZ was born from a simple belief:"
                )}
              </p>
              
              <blockquote className="border-l-4 border-[#ea580c] pl-4 italic text-[#ea580c] font-medium my-4">
                {locale === "te" ? (
                  "భయం, ఒంటరితనం లేదా తోడు లేకపోవడం వల్ల ఎవరూ ప్రపంచ అందాలను కోల్పోకూడదు."
                ) : locale === "hi" ? (
                  "डर, अकेलेपन या साथ की कमी के कारण किसी को भी दुनिया की खूबसूरती को देखने से नहीं चूकना चाहिए।"
                ) : (
                  "No one should miss the beauty of the world because of fear, loneliness, or lack of company."
                )}
              </blockquote>

              <p>
                {locale === "te" ? (
                  "నా ఒంటరి ప్రయాణాలలో, చాలా మంది ప్రయాణించాలని కలలు కంటున్నప్పటికీ భద్రతా ఆందోళనలు, తోటి ప్రయాణీకులు లేకపోవడం లేదా ఎక్కడ ప్రారంభించాలో తెలియక వెనుకాడతారని నేను గ్రహించాను. అందుకే నేను WeAreSoloZ ను సృష్టించాను — అపరిచితులు స్నేహితులుగా, అనుభవాలు జ్ఞాపకాలుగా మరియు ప్రయాణాలు కథలుగా మారే కమ్యూనిటీ."
                ) : locale === "hi" ? (
                  "अपनी सोलो यात्राओं के दौरान, मुझे एहसास हुआ कि बहुत से लोग यात्रा करने का सपना देखते हैं लेकिन सुरक्षा चिंताओं, यात्रा भागीदारों की कमी या बस यह न जानने के कारण झिझकते हैं कि कहां से शुरू करें। इसीलिए मैंने WeAreSoloZ बनाया—एक ऐसा समुदाय जहाँ अजनबी दोस्त बनते हैं, अनुभव यादें बनते हैं, और यात्राएँ कहानियाँ बनती हैं।"
                ) : (
                  "During my solo journeys, I realized that many people dream of travelling but hesitate because of safety concerns, lack of travel partners, or simply not knowing where to start. That’s why I created WeAreSoloZ—a community where strangers become friends, experiences become memories, and journeys become stories."
                )}
              </p>
              <p>
                {locale === "te" ? (
                  "WeAreSoloZ లో, మేము కేవలం పర్యటనలను నిర్వహించము; మేము అర్థవంతమైన బంధాలను నిర్మిస్తాము. మీరు సాహస ప్రియులైనా, ప్రకృతి ప్రేమికులైనా, ఆధ్యాత్మిక ప్రయాణీకులైనా, కంటెంట్ క్రియేటర్ అయినా, లేదా మిమ్మల్ని మీరు నయం చేసుకుంటూ తిరిగి కనుగొనాలనుకునే వారైనా, మీకు ఇక్కడ ఎల్లప్పుడూ ఒక స్థానం ఉంటుంది."
                ) : locale === "hi" ? (
                  "WeAreSoloZ में, हम केवल यात्राएं आयोजित नहीं करते हैं; हम सार्थक संबंध बनाते हैं। चाहे आप रोमांच के चाहने वाले हों, प्रकृति प्रेमी हों, आध्यात्मिक यात्री हों, सामग्री निर्माता हों, या कोई ऐसा व्यक्ति जो खुद को ठीक करना और फिर से खोजना चाहता है, आपको यहाँ हमेशा एक जगह मिलेगी।"
                ) : (
                  "At WeAreSoloZ, we don’t just organize trips; we build meaningful connections. Whether you’re an adventure seeker, nature lover, spiritual traveller, content creator, or someone looking to heal and rediscover yourself, you’ll always find a place here."
                )}
              </p>
            </div>

            {/* Founder Contact Links */}
            <div className="flex flex-wrap gap-3 mt-10">
              <a
                data-testid="about-youtube"
                href="https://youtube.com/@akhillrockstartravelstories?si=_c7w-zLBaUwBgMSi"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-white rounded-full px-5 py-2.5 text-xs font-semibold border border-stone-200 hover:border-red-200 hover:bg-red-50 hover:text-[#ef4444] transition-all shadow-sm text-stone-700"
              >
                <Youtube className="w-4 h-4 text-red-600" /> {locale === "te" ? "యూట్యూబ్ ఛానల్" : locale === "hi" ? "यूट्यूब चैनल" : "YouTube Channel"}
              </a>
              <a
                data-testid="about-instagram"
                href={instagramLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-white rounded-full px-5 py-2.5 text-xs font-semibold border border-stone-200 hover:border-orange-200 hover:bg-orange-50 hover:text-[#ea580c] transition-all shadow-sm text-stone-700"
              >
                <Instagram className="w-4 h-4" /> Instagram
              </a>
              <a
                data-testid="about-phone"
                href="tel:+919966085310"
                className="inline-flex items-center gap-2 bg-white rounded-full px-5 py-2.5 text-xs font-semibold border border-stone-200 hover:border-orange-200 hover:bg-orange-50 hover:text-[#ea580c] transition-all shadow-sm text-stone-700"
              >
                <Phone className="w-4 h-4" /> +91 99660 85310
              </a>
              <a
                data-testid="about-phone2"
                href="tel:+919281017746"
                className="inline-flex items-center gap-2 bg-white rounded-full px-5 py-2.5 text-xs font-semibold border border-stone-200 hover:border-orange-200 hover:bg-orange-50 hover:text-[#ea580c] transition-all shadow-sm text-stone-700"
              >
                <Phone className="w-4 h-4" /> +91 92810 17746
              </a>
              <a
                data-testid="about-whatsapp"
                href={whatsappCommunityLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-white rounded-full px-5 py-2.5 text-xs font-semibold border border-stone-200 hover:border-orange-200 hover:bg-orange-50 hover:text-[#ea580c] transition-all shadow-sm text-stone-700"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" /> {t("join_whatsapp")}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SECTION 3: What Makes Us Different? */}
      <section className="py-24 px-6 md:px-10 border-t border-stone-200 bg-stone-50/40 relative z-10">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-16">
            <SectionLabel>{locale === "te" ? "వ్యత్యాసం" : locale === "hi" ? "अंतर" : "Difference"}</SectionLabel>
            <h2 className="font-display text-4xl md:text-5xl font-light tracking-tighter mt-5 text-stone-900">
              {locale === "te" ? <>🌟 మమ్మల్ని ఏది <span className="gradient-text font-medium">ప్రత్యేకంగా నిలుపుతుంది?</span></> : locale === "hi" ? <>🌟 हमें क्या <span className="gradient-text font-medium">अलग बनाता है?</span></> : <>🌟 What Makes Us <span className="gradient-text font-medium">Different?</span></>}
            </h2>
            <p className="text-stone-500 mt-4 leading-relaxed font-body text-base max-w-xl mx-auto">
              {locale === "te" ? "మేము కేవలం మరొక ట్రావెల్ బుకింగ్ ఏజెన్సీ మాత్రమే కాదు. మేము కలలు కనేవారి మరియు అన్వేషకుల కుటుంబాన్ని నిర్మిస్తాము." : locale === "hi" ? "हम केवल एक और यात्रा बुकिंग एजेंसी नहीं हैं। हम सपने देखने वालों और खोजकर्ताओं का एक परिवार बनाते हैं।" : "We aren't just another travel booking agency. We build a family of dreamers and explorers."}
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {differences.map((diff, idx) => {
              const localizedTitle = locale === "te" ? (
                idx === 0 ? "సురక్షితమైన & సహాయక కమ్యూనిటీ" :
                idx === 1 ? "సోలో ప్రయాణీకులకు ఎల్లప్పుడూ స్వాగతం" :
                idx === 2 ? "జీవితకాల స్నేహాలు" :
                idx === 3 ? "విభిన్న విహారయాత్రలు" :
                idx === 4 ? "ఫోటోగ్రఫీ & మరపురాని జ్ఞాపకాలు" : diff.title
              ) : locale === "hi" ? (
                idx === 0 ? "सुरक्षित और सहायक कम्युनिटी" :
                idx === 1 ? "सोलो यात्रियों का हमेशा स्वागत है" :
                idx === 2 ? "जीवन भर की दोस्ती" :
                idx === 3 ? "विविध यात्राएं" :
                idx === 4 ? "फोटोग्राफी और अविस्मरणीय यादें" : diff.title
              ) : diff.title;

              const localizedDesc = locale === "te" ? (
                idx === 0 ? "మేము భద్రత మరియు సౌకర్యానికి ప్రాధాన్యత ఇస్తాము, ప్రయాణీకులందరికీ సానుకూల వాతావరణాన్ని సృష్టిస్తాము." :
                idx === 1 ? "తోడు లేదని చింతించకండి. మీరు ఒక ఆత్మీయమైన మరియు ఆహ్వానించే కుటుంబంలో చేరుతారు." :
                idx === 2 ? "Connect with like-minded travellers who share your passions and build lasting bonds." :
                idx === 3 ? "సాహస యాత్రలు, ఆధ్యాత్మిక ప్రయాణాలు, ప్రకృతి, వైద్యం మరియు వారాంతపు పర్యటనలు." :
                idx === 4 ? "అందమైన క్షణాలను చిత్రీకరించండి మరియు జీవితాంతం గుర్తుండిపోయే కథలను దాచుకోండి." : diff.desc
              ) : locale === "hi" ? (
                idx === 0 ? "हम सुरक्षा और आराम को प्राथमिकता देते हैं, सभी यात्रियों के लिए एक सकारात्मक स्थान बनाते हैं।" :
                idx === 1 ? "कभी भी साथी न होने की चिंता न करें। आप एक गर्मजोशी से भरे और स्वागत करने वाले परिवार में शामिल होंगे।" :
                idx === 2 ? "समान विचारधारा वाले यात्रियों से जुड़ें जो आपके जुनून को साझा करते हैं और स्थायी संबंध बनाते हैं।" :
                idx === 3 ? "क्यूरेटेड साहसिक कार्य, आध्यात्मिक, प्रकृति, उपचार और सप्ताहांत यात्राएं।" :
                idx === 4 ? "सुंदर क्षणों को कैप्चर करें और उन कहानियों को रखें जिन्हें आप जीवन भर संजो कर रखेंगे।" : diff.desc
              ) : diff.desc;

              return (
                <Reveal key={idx} className="h-full">
                  <div className={`bg-white rounded-3xl p-8 border border-stone-200/60 h-full flex flex-col justify-between hover:shadow-2xl hover:shadow-stone-300/30 hover:-translate-y-1 transition-all duration-300 group cursor-pointer ${diff.color}`}>
                    <div className="space-y-4">
                      <div className="text-4xl">{diff.emoji}</div>
                      <h3 className="font-display text-lg font-bold text-stone-900 group-hover:text-[#ea580c] transition-colors">{localizedTitle}</h3>
                      <p className="text-stone-500 font-body text-xs leading-relaxed">{localizedDesc}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 4: Monthly Themed Experiences */}
      <section className="py-24 px-6 md:px-10 border-t border-stone-200 relative z-10">
        <div className="max-w-7xl mx-auto">
          
          <Reveal className="text-center mb-16">
            <SectionLabel>{locale === "te" ? "నేపథ్య యాత్రలు" : locale === "hi" ? "थीम आधारित यात्राएं" : "Themed Journeys"}</SectionLabel>
            <h2 className="font-display text-4xl md:text-6xl font-light tracking-tighter mt-5 text-stone-900">
              {locale === "te" ? <>నెలవారీ <span className="gradient-text">నేపథ్య అనుభవాలు</span></> : locale === "hi" ? <>मासिक <span className="gradient-text">थीम आधारित अनुभव</span></> : <>Monthly <span className="gradient-text">Themed Experiences</span></>}
            </h2>
            <p className="text-stone-500 mt-6 max-w-xl mx-auto leading-relaxed font-body text-base">
              {locale === "te" ? "ప్రతి నెలా, మేము కుటుంబాలు, తాతామ్మ నానమ్మలు, తోబుట్టువులు మరియు అన్వేషకులను మరింత దగ్గర చేయడానికి రూపొందించిన ప్రత్యేక అనుభవాలను పర్యవేక్షిస్తాము మరియు నిర్వహిస్తాము." : locale === "hi" ? "हर महीने, हम परिवारों, दादा-दादी, भाई-बहनों और साधकों को एक साथ लाने के लिए डिज़ाइन किए गए अद्वितीय अनुभवों को क्यूरेट और व्यवस्थित करते हैं।" : "Every month, we curate and organize unique experiences designed to bring families, grandparents, siblings, and seekers closer together."}
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {themedExperiences.map((item, idx) => {
              const localizedTitle = locale === "te" ? (
                idx === 0 ? "తల్లితో ప్రయాణం" :
                idx === 1 ? "తండ్రితో ప్రయాణం" :
                idx === 2 ? "తాతామ్మ నానమ్మలతో ప్రయాణం" :
                idx === 3 ? "తోబుట్టువుల ప్రత్యేక ట్రిప్స్" :
                idx === 4 ? "హీలింగ్ & స్వీయ-ఆవిష్కరణ యాత్రలు" : item.title
              ) : locale === "hi" ? (
                idx === 0 ? "मां के साथ यात्रा" :
                idx === 1 ? "पिता के साथ यात्रा" :
                idx === 2 ? "दादा-दादी के साथ यात्रा" :
                idx === 3 ? "भाई-बहनों की विशेष ट्रिप्स" :
                idx === 4 ? "हीलिंग और आत्म-खोज यात्राएं" : item.title
              ) : item.title;

              const localizedDesc = locale === "te" ? (
                idx === 0 ? "మీకు సర్వస్వం ఇచ్చిన తల్లితో అందమైన ప్రయాణ జ్ఞాపకాలను సృష్టిస్తూ సాగే ఒక కృతజ్ఞతా ప్రయాణం." :
                idx === 1 ? "మీ తండ్రితో బంధాన్ని బలోపేతం చేసుకోండి మరియు రోడ్ ట్రిప్స్, క్యాంప్‌ఫైర్లు మరియు అర్థవంతమైన కథలను పంచుకోండి." :
                idx === 2 ? "మర్యాద, కథలు పంచుకోవడం మరియు బహుళ-తరాల వెచ్చదనంపై దృష్టి సారించే ఒక సౌకర్యవంతమైన, నెమ్మదిగా సాగే ప్రయాణం." :
                idx === 3 ? "అద్భుతమైన మార్గాలు మరియు రోడ్ ట్రిప్స్‌లో బాల్యపు బంధాలను మరియు నవ్వులను పునరుజ్జీవింపజేయండి." :
                idx === 4 ? "పవిత్రమైన ప్రకృతి మార్గాలు, యోగా మరియు ధ్యాన తిరోగమనాలు మీ మనస్సు, శరీరం మరియు ఆత్మను పునరుజ్జీవింపజేస్తాయి." : item.desc
              ) : locale === "hi" ? (
                idx === 0 ? "कृतज्ञता और संबंध की एक यात्रा, उस महिला के साथ सुंदर यात्रा यादें बनाना जिसने आपको सब कुछ दिया।" :
                idx === 1 ? "अपने पिता के साथ अपने बंधन को मजबूत करें और सड़क यात्राएं, आउटडोर कैंपफायर और सार्थक कहानियां साझा करें।" :
                idx === 2 ? "सम्मान, कहानी-साझाकरण और बहु-पीढ़ी के गर्मजोशी पर ध्यान केंद्रित करने वाली एक आरामदायक, धीमी गति की यात्रा।" :
                idx === 3 ? "अद्भुत ट्रेल्स और सड़क यात्राओं पर बचपन के बंधनों और साझा हँसी को फिर से जगाएं।" :
                idx === 4 ? "अपने आप से फिर से जुड़ें। पवित्र प्रकृति ट्रेल्स, योग और ध्यान शिविरों में अपने मन, शरीर और आत्मा को तरोताजा करें।" : item.desc
              ) : item.desc;

              return (
                <Reveal key={idx} className="h-full">
                  <div className={`bg-white rounded-3xl p-6 border border-stone-200/60 shadow-sm hover:-translate-y-1 transition-all duration-300 h-full flex flex-col justify-between group ${item.color} hover:shadow-2xl hover:shadow-stone-300/35 cursor-pointer`}>
                    <div className="space-y-4">
                      <div className="text-4xl">{item.emoji}</div>
                      <h3 className="font-display text-base font-bold text-stone-900 group-hover:text-[#ea580c] transition-colors">
                        {localizedTitle}
                      </h3>
                      <p className="text-stone-500 text-xs font-body leading-relaxed">
                        {localizedDesc}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* SECTION 4.5: Farmer Initiative / Our Mission */}
          <Reveal className="mt-20">
            <div className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-emerald-50/30 p-8 md:p-12 shadow-xl shadow-emerald-100/20 max-w-5xl mx-auto group cursor-pointer hover:shadow-2xl transition-all duration-300">
              <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-colors" />
              <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Leaf className="w-8 h-8 text-emerald-600 animate-pulse" />
                </div>
                <div className="space-y-3 text-center md:text-left">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-600">{locale === "te" ? "🌾 మా లక్ష్యం" : locale === "hi" ? "🌾 हमारा मिशन" : "🌾 Our Mission"}</div>
                  <h3 className="font-display text-2xl md:text-3xl font-bold text-stone-900 tracking-tight leading-tight">
                    {locale === "te" ? "ప్రతి నెలా ఒక రైతుకు ఉచిత ప్రయాణాన్ని స్పాన్సర్ చేయడం" : locale === "hi" ? "हर महीने एक किसान यात्रा प्रायोजित करना" : "Sponsoring a Farmer Trip Every Month"}
                  </h3>
                  <p className="text-stone-600 leading-relaxed font-body text-base max-w-3xl">
                    {locale === "te" ? (
                      <>ప్రయాణం కేవలం ప్రయాణీకులకు మాత్రమే కాకుండా, సమాజానికి కూడా సంతోషాన్ని కలిగించాలని మేము నమ్ముతాము. మన దేశానికి ఆహారం అందించే ప్రజలకు నివాళిగా, WeAreSoloZ <strong className="font-bold text-stone-900">ప్రతి నెలా ఒక అర్హుడైన రైతుకు</strong> పూర్తిగా ఉచిత ట్రిప్‌ను స్పాన్సర్ చేస్తుంది, వారికి విశ్రాంతి తీసుకోవడానికి, అన్వేషించడానికి మరియు వారు నిజంగా అర్హులైన జ్ఞాపకాలను సృష్టించడానికి అవకాశం ఇస్తుంది.</>
                    ) : locale === "hi" ? (
                      <>हमारा मानना है कि यात्रा से न केवल यात्रियों के लिए, बल्कि समाज के लिए भी खुशियाँ पैदा होनी चाहिए। हमारे देश का पेट भरने वाले लोगों को श्रद्धांजलि के रूप में, WeAreSoloZ <strong className="font-bold text-stone-900">हर महीने एक योग्य किसान</strong> को पूरी तरह से मुफ्त यात्रा प्रायोजित करता है, जिससे उन्हें आराम करने, तलाशने और यादें बनाने का अवसर मिलता है जिसके वे वास्तव में हकदार हैं।</>
                    ) : (
                      <>We believe travel should create happiness not only for travellers, but for society too. As a tribute to the people who feed our nation, WeAreSoloZ sponsors <strong className="font-bold text-stone-900">one deserving farmer every month</strong> with a completely free trip, giving them an opportunity to relax, explore, and create memories they truly deserve.</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

        </div>
      </section>

      {/* SECTION 5: World Exploration Map */}
      <section className="py-24 px-6 md:px-10 border-t border-stone-200 bg-stone-50/30 overflow-hidden relative z-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-5 space-y-6">
            <Reveal>
              <SectionLabel>{locale === "te" ? "నా ప్రయాణ అడుగుజాడలు" : locale === "hi" ? "मेरे यात्रा पदचिह्न" : "My Travel Footprints"}</SectionLabel>
              <h2 className="font-display text-4xl md:text-5xl font-light tracking-tighter text-stone-900 leading-tight">
                {locale === "te" ? <>7 సంవత్సరాల <span className="gradient-text font-medium">ప్రపంచ అన్వేషణ</span>.</> : locale === "hi" ? <>7 वर्ष का <span className="gradient-text font-medium">वैश्विक अन्वेषण</span>।</> : <>7 Years of <span className="gradient-text font-medium">Global Exploration</span>.</>}
              </h2>
              <p className="text-stone-600 font-body text-base leading-relaxed mt-4">
                {locale === "te" ? "అఖిల్ పసుపులేటి గత ఏడు సంవత్సరాలుగా మన ప్రపంచంలోని వైవిధ్యమైన ప్రకృతి దృశ్యాలను అన్వేషిస్తూ గడిపారు, 12 దేశాలు మరియు భారతదేశం అంతటా లెక్కలేనన్ని ప్రదేశాలలో ప్రయాణించారు." : locale === "hi" ? "अखिल पसुपुलेटी ने पिछले सात साल हमारी दुनिया के विविध परिदृश्यों की खोज में बिताए हैं, जिसमें भारत भर में 12 देशों और अनगिनत गंतव्य शामिल हैं।" : "Akhil Pasupuleti has spent the last seven years exploring the diverse landscapes of our world, spanning across 12 countries and countless destinations throughout India."}
              </p>
              <p className="text-stone-600 font-body text-base leading-relaxed">
                {locale === "te" ? "ఈ ఇంటరాక్టివ్ కాన్స్టెలేషన్ మ్యాప్ అతని అంతర్జాతీయ ప్రయాణ మార్గాలను హైలైట్ చేస్తుంది. WeAreSoloZ ప్రపంచ అనుభవాలను సజీవంగా మార్చే కీలక హబ్‌లను చూడటానికి ఏదైనా యాక్టివ్ నోడ్‌పై క్లిక్ చేయండి." : locale === "hi" ? "यह नक्षत्र मानचित्र उनके अंतर्राष्ट्रीय यात्रा मार्गों को उजागर करता है। उन प्रमुख केंद्रों की कल्पना करने के लिए किसी भी सक्रिय नोड पर क्लिक करें जहां WeAreSoloZ वैश्विक अनुभवों को जीवन में लाता है।" : "This constellation map highlights his international travel tracks. Click on any of the active nodes to visualize the key hubs where WeAreSoloZ brings global experiences to life."}
              </p>
            </Reveal>

            {/* Visited Regions */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              {[
                { name: locale === "te" ? "మధ్యప్రాచ్యం & దక్షిణ ఆసియా" : locale === "hi" ? "मध्य पूर्व और दक्षिण एशिया" : "Middle East & South Asia", region: "India, UAE, Sri Lanka" },
                { name: locale === "te" ? "ఇండోచైనా ద్వీపకల్పం" : locale === "hi" ? "इंडोचाइना प्रायद्वीप" : "Indochina Peninsula", region: "Thailand, Vietnam" },
                { name: locale === "te" ? "మలయ్ ద్వీపకల్పం" : locale === "hi" ? "मलय प्रायद्वीप" : "Malay Peninsula", region: "Malaysia, Singapore" },
                { name: locale === "te" ? "తూర్పు ఆసియా & దీవులు" : locale === "hi" ? "पूर्वी एशिया और द्वीप समूह" : "East Asia & Islands", region: "China, Indonesia" },
              ].map((hub, idx) => (
                <div key={idx} className="glass rounded-xl p-3 border border-stone-200/60 bg-white/50">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ea580c] animate-pulse" />
                    <span className="text-xs font-bold text-stone-950 font-display">{hub.name}</span>
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1 font-body">{hub.region}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive World Map zoomed on Asia/Middle East */}
          <div className="md:col-span-7 flex justify-center items-center relative min-h-[480px]">
            <div className="w-full max-w-[750px] aspect-[1.71/1] relative">
              <svg
                viewBox="30.767 241.591 784.077 458.627"
                className="w-full h-full drop-shadow-[0_10px_30px_rgba(234,88,12,0.04)]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* World Map Paths */}
                {worldMapData.map((loc, idx) => (
                  <motion.path
                    key={idx}
                    d={loc.d}
                    stroke="#ea580c"
                    strokeWidth="0.8"
                    strokeOpacity="0.25"
                    fill="rgba(234,88,12,0.01)"
                    className="transition-colors hover:fill-orange-500/10 hover:stroke-orange-500/40 cursor-default"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                  />
                ))}

                {/* Connecting travel route lines (constellation lines) */}
                {[
                  // India to UAE
                  { x1: 600.1, y1: 465.7, x2: 533.8, y2: 467.3 },
                  // India to Sri Lanka
                  { x1: 600.1, y1: 465.7, x2: 604.4, y2: 508.5 },
                  // India to China
                  { x1: 600.1, y1: 465.7, x2: 651.2, y2: 421.2 },
                  // India to Thailand
                  { x1: 600.1, y1: 465.7, x2: 649.9, y2: 492.3 },
                  // Thailand to Vietnam
                  { x1: 649.9, y1: 492.3, x2: 661.2, y2: 486.7 },
                  // Vietnam to Malaysia
                  { x1: 661.2, y1: 486.7, x2: 669.9, y2: 519.6 },
                  // Malaysia to Singapore
                  { x1: 669.9, y1: 519.6, x2: 659.2, y2: 527.6 },
                  // Singapore to Indonesia
                  { x1: 659.2, y1: 527.6, x2: 701.9, y2: 542.2 }
                ].map((route, idx) => (
                  <motion.line
                    key={idx}
                    x1={route.x1}
                    y1={route.y1}
                    x2={route.x2}
                    y2={route.y2}
                    stroke="url(#routeGradient)"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.5 + idx * 0.1, ease: "easeOut" }}
                  />
                ))}

                {/* Definitions for Gradients */}
                <defs>
                  <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ea580c" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#ea580c" stopOpacity="0.85" />
                  </linearGradient>
                  <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ea580c" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Glowing underlays for visited countries */}
                {[
                  { x: 600.1, y: 465.7, r: 24 }, // India
                  { x: 533.8, y: 467.3, r: 16 },  // UAE
                  { x: 604.4, y: 508.5, r: 16 },  // Sri Lanka
                  { x: 649.9, y: 492.3, r: 18 },  // Thailand
                  { x: 661.2, y: 486.7, r: 16 },  // Vietnam
                  { x: 669.9, y: 519.6, r: 16 },  // Malaysia
                  { x: 659.2, y: 527.6, r: 12 },  // Singapore
                  { x: 701.9, y: 542.2, r: 20 }, // Indonesia
                  { x: 651.2, y: 421.2, r: 24 }  // China
                ].map((glow, idx) => (
                  <circle
                    key={idx}
                    cx={glow.x}
                    cy={glow.y}
                    r={glow.r}
                    fill="url(#glowGradient)"
                  />
                ))}

                {/* Pulse lines */}
                {[
                  { x: 600.1, y: 465.7 }, // India
                  { x: 533.8, y: 467.3 }, // UAE
                  { x: 604.4, y: 508.5 }, // Sri Lanka
                  { x: 649.9, y: 492.3 }, // Thailand
                  { x: 661.2, y: 486.7 }, // Vietnam
                  { x: 669.9, y: 519.6 }, // Malaysia
                  { x: 659.2, y: 527.6 }, // Singapore
                  { x: 701.9, y: 542.2 }, // Indonesia
                  { x: 651.2, y: 421.2 }  // China
                ].map((pulse, idx) => (
                  <circle
                    key={`pulse-${idx}`}
                    cx={pulse.x}
                    cy={pulse.y}
                    r="5"
                    stroke="#ea580c"
                    strokeWidth="1.2"
                    className="origin-center scale-[2] opacity-0 animate-ping"
                    style={{ animationDuration: '3s', animationDelay: `${idx * 0.5}s` }}
                  />
                ))}

                {/* Map Nodes (Countries) */}
                {[
                  { x: 600.1, y: 465.7, label: "India", align: "middle" as const, dy: -10 },
                  { x: 533.8, y: 467.3, label: "UAE", align: "end" as const, dx: -8, dy: 4 },
                  { x: 604.4, y: 508.5, label: "Sri Lanka", align: "middle" as const, dy: 14 },
                  { x: 649.9, y: 492.3, label: "Thailand", align: "end" as const, dx: -8, dy: 4 },
                  { x: 661.2, y: 486.7, label: "Vietnam", align: "start" as const, dx: 8, dy: 4 },
                  { x: 669.9, y: 519.6, label: "Malaysia", align: "start" as const, dx: 8, dy: 4 },
                  { x: 659.2, y: 527.6, label: "Singapore", align: "end" as const, dx: -6, dy: 8 },
                  { x: 701.9, y: 542.2, label: "Indonesia", align: "middle" as const, dy: 14 },
                  { x: 651.2, y: 421.2, label: "China", align: "middle" as const, dy: -10 }
                ].map((node, idx) => (
                  <g key={idx} className="cursor-pointer group">
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="4"
                      className="fill-[#ea580c] stroke-white stroke-[2px] transition-all group-hover:r-5 group-hover:fill-stone-900 group-hover:stroke-[#ea580c]"
                      style={{ filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.2))" }}
                    />
                    <text
                      x={node.x + (node.dx || 0)}
                      y={node.y + (node.dy || 0)}
                      textAnchor={node.align}
                      className="fill-stone-950 font-display text-[9px] font-black tracking-wider opacity-90 group-hover:opacity-100 group-hover:fill-[#ea580c] transition-opacity select-none"
                      style={{ filter: "drop-shadow(0px 1px 1px white) drop-shadow(0px 1px 0.5px white)" }}
                    >
                      {node.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 6: Why We Exist */}
      <section className="py-24 px-6 md:px-10 border-t border-stone-200 bg-stone-50/40 relative z-10">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-16">
            <SectionLabel>{locale === "te" ? "మా హృదయం" : locale === "hi" ? "हमारा दिल" : "Our Heart"}</SectionLabel>
            <h2 className="font-display text-4xl md:text-5xl font-light tracking-tight text-stone-900 leading-tight">
              {locale === "te" ? <>❤️ మేము ఎందుకు <span className="gradient-text font-medium">ఉన్నాము</span></> : locale === "hi" ? <>❤️ हमारा <span className="gradient-text font-medium">अस्तित्व क्यों है</span></> : <>❤️ Why We <span className="gradient-text font-medium">Exist</span></>}
            </h2>
            <p className="text-stone-600 mt-4 leading-relaxed font-body text-lg max-w-3xl mx-auto">
              {locale === "te" ? "ఎందుకంటే ప్రయాణం అనేది కేవలం గమ్యస్థానాల జాబితాను దాటడం కంటే చాలా ఎక్కువ." : locale === "hi" ? "क्योंकि यात्रा केवल सूची से गंतव्यों को टिक करने से कहीं अधिक है।" : "Because travel is more than ticking destinations off a list."}
            </p>
          </Reveal>

          {/* Why We Exist Pillars */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {whyWeExistList.map((pillar, idx) => {
              const localizedTitle = locale === "te" ? (
                idx === 0 ? "ప్రయాణం నయం చేస్తుంది" :
                idx === 1 ? "ప్రయాణం నేర్పుతుంది" :
                idx === 2 ? "ప్రయాణం కలుపుతుంది" :
                idx === 3 ? "ప్రయాణం మారుస్తుంది" : pillar.title
              ) : locale === "hi" ? (
                idx === 0 ? "यात्रा ठीक करती है" :
                idx === 1 ? "यात्रा सिखाती है" :
                idx === 2 ? "यात्रा जोड़ती है" :
                idx === 3 ? "यात्रा बदलती है" : pillar.title
              ) : pillar.title;

              const localizedDesc = locale === "te" ? (
                idx === 0 ? "ఒత్తిడి నుండి దూరంగా అడుగు పెట్టండి మరియు ప్రశాంతమైన హృదయంతో తిరిగి రండి." :
                idx === 1 ? "జీవితంపై మీ అవగాహనను పెంచే కొత్త సంస్కృతులను మరియు మార్గాలను కనుగొనండి." :
                idx === 2 ? "క్యాంప్‌ఫైర్లు మరియు రిమోట్ మార్గాల చుట్టూ అపరిచితులను కుటుంబంగా మార్చుకోండి." :
                idx === 3 ? "మీ సౌకర్య పరిమితులను విస్తరించండి, మీ పిలుపును కనుగొనండి మరియు మీ కోణాన్ని మార్చుకోండి." : pillar.desc
              ) : locale === "hi" ? (
                idx === 0 ? "तनाव से दूर कदम रखें और एक तरोताजा, शांतिपूर्ण दिल के साथ वापस लौटें।" :
                idx === 1 ? "नई संस्कृतियों और रास्तों की खोज करें जो जीवन की आपकी समझ को आकार देते हैं।" :
                idx === 2 ? "कैंपफायर के आसपास और दूरदराज के रास्तों पर अजनबियों को परिवार में बदलें।" :
                idx === 3 ? "अपने आराम क्षेत्र का विस्तार करें, अपनी पुकार खोजें, और अपने दृष्टिकोण को बदलें।" : pillar.desc
              ) : pillar.desc;

              return (
                <Reveal key={pillar.title} className="h-full">
                  <div className={`bg-white rounded-3xl p-8 border border-stone-200/60 h-full relative overflow-hidden flex flex-col justify-between hover:shadow-2xl hover:shadow-stone-300/30 hover:-translate-y-1 transition-all duration-300 group cursor-pointer ${pillar.border}`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${pillar.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    <div className="relative z-10 space-y-4">
                      <div className="text-4xl">{pillar.emoji}</div>
                      <h3 className="font-display text-xl font-bold text-stone-900 group-hover:text-[#ea580c] transition-colors">{localizedTitle}</h3>
                      <p className="text-stone-500 font-body text-xs leading-relaxed">{localizedDesc}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <Reveal className="max-w-4xl mx-auto text-center mt-16 bg-white border border-stone-100 p-8 rounded-3xl shadow-sm">
            <p className="text-stone-600 leading-relaxed font-body text-lg max-w-3xl mx-auto">
              {locale === "te" ? (
                "సాంకేతికత మనకు ప్రయాణాలను ప్లాన్ చేయడంలో సహాయపడుతుంది, కానీ పర్వతం నుండి సూర్యోదయాన్ని చూడటం, సముద్రపు అలల శబ్దాన్ని వినడం లేదా అపరిచితులతో క్యాంప్‌ఫైర్ చుట్టూ కథలను పంచుకుంటూ వారిని కుటుంబంగా మార్చుకోవడంలో ఆనందాన్ని మానవులు మాత్రమే పొందగలరు."
              ) : locale === "hi" ? (
                "तकनीक हमें यात्राओं की योजना बनाने में मदद कर सकती है, लेकिन पहाड़ से सूर्योदय देखने, समुद्र की लहरों को सुनने, या कैंपफायर के आसपास अजनबियों के साथ कहानियां साझा करने की खुशी केवल इंसान ही महसूस कर सकते हैं जो बाद में परिवार बन जाते हैं।"
              ) : (
                "Technology can help us plan journeys, but only humans can feel the joy of watching a sunrise from a mountain, listening to ocean waves, or sharing stories around a campfire with strangers who become family."
              )}
            </p>
          </Reveal>
        </div>
      </section>

      {/* SECTION 7: Our Vision */}
      <section className="py-24 px-6 md:px-10 border-t border-stone-200 bg-stone-50/20 relative z-10 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <Reveal>
            <SectionLabel>{locale === "te" ? "మా విజన్" : locale === "hi" ? "हमारा दृष्टिकोण" : "Our Vision"}</SectionLabel>
            <h2 className="font-display text-3xl md:text-5xl font-light tracking-tight text-stone-900 leading-tight mt-4">
              {locale === "te" ? <>భారతదేశంలో అత్యంత విశ్వసనీయమైన <span className="gradient-text font-semibold">సోలో ట్రావెల్ కమ్యూనిటీని</span> నిర్మించడం</> : locale === "hi" ? <>भारत का सबसे भरोसेमंद <span className="gradient-text font-semibold">सोलो ट्रैवल कम्युनिटी</span> बनाना</> : <>To build India&apos;s most trusted <span className="gradient-text font-semibold">solo travel community</span></>}
            </h2>
            <p className="text-stone-600 leading-relaxed font-body text-lg mt-6">
              {locale === "te" ? "ప్రజలు సురక్షితంగా ప్రయాణించగలిగేలా, లోతుగా కనెక్ట్ అవ్వగలిగేలా, మానసికంగా కోలుకునేలా మరియు జీవితాంతం గుర్తుండిపోయే జ్ఞాపకాలను సృష్టించేలా." : locale === "hi" ? "जहां लोग सुरक्षित रूप से यात्रा कर सकें, गहराई से जुड़ सकें, भावनात्मक रूप से ठीक हो सकें और जीवन भर चलने वाली यादें बना सकें।" : "Where people can travel safely, connect deeply, heal emotionally, and create memories that last a lifetime."}
            </p>
          </Reveal>
        </div>
      </section>

      {/* SECTION 8: CTA with final slogan quote */}
      <section className="relative py-32 px-6 md:px-10 border-t border-stone-200 bg-[#0c0a09] text-white overflow-hidden text-center z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto space-y-12">
          
          <Reveal>
            <img
              src="/logo.png"
              alt="WeAreSoloz"
              className="w-20 h-20 rounded-full object-cover mx-auto ring-4 ring-orange-500/20 mb-8 animate-spin"
              style={{ animationDuration: '30s' }}
            />
            <h2 className="font-display text-4xl md:text-6xl font-light italic tracking-tight text-stone-200 leading-tight">
              ✨ WeAreSoloZ
            </h2>
            <p className="text-xl text-orange-500 mt-2 font-display italic">
              {locale === "te" ? "ఒంటరిగా ప్రయాణించండి · మీరు ఒంటరిగా లేరు" : locale === "hi" ? "अकेले यात्रा करें · आप अकेले नहीं हैं" : "Travel Solo. You're Not Alone."}
            </p>
            <p className="text-base text-stone-400 mt-4 font-body font-medium uppercase tracking-wider">
              {locale === "te" ? "అపరిచితులు స్నేహితులుగా మారే చోటు, జ్ఞాపకాలు ఎప్పటికీ నిలిచిపోయే చోటు. 🌍❤️✈️" : locale === "hi" ? "जहाँ अजनबी दोस्त बनते हैं, और यादें हमेशा बनी रहती हैं। 🌍❤️✈️" : "Where Strangers Become Friends, and Memories Last Forever. 🌍❤️✈️"}
            </p>
            <p className="text-xs text-stone-500 mt-2 font-mono">
              {locale === "te" ? "వ్యవస్థాపకుడు" : locale === "hi" ? "संस्थापक" : "Founder"} — Akhil Pasupuleti
            </p>
          </Reveal>

          <Reveal className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/upcoming-trips"
                className="inline-flex items-center justify-center gap-2 bg-[#ea580c] text-white px-8 py-4 rounded-full font-bold hover:bg-orange-600 hover:scale-[1.02] transition-all hover:shadow-xl hover:shadow-orange-500/20"
              >
                {locale === "te" ? "ట్రిప్స్ అన్వేషించండి" : locale === "hi" ? "यात्राएं एक्सप्लोर करें" : "Explore Trips"} <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={whatsappCommunityLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white/10 text-white hover:bg-white/20 border border-white/10 px-8 py-4 rounded-full font-bold hover:scale-[1.02] transition-all"
              >
                {locale === "te" ? "కమ్యూనిటీలో చేరండి" : locale === "hi" ? "कम्युनिटी में शामिल हों" : "Join The Community"}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}
