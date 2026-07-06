"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getApiUrl } from "@/lib/api";
import { useLanguage } from "@/lib/LanguageContext";
import { getOptimizedImageUrl } from "@/lib/utils";
import { CloudinaryUpload } from "@/components/cloudinary-upload";
import { Button } from "@/components/ui/button";
import {
  Users,
  Camera,
  BookOpen,
  MapPin,
  Calendar,
  Heart,
  MessageSquare,
  Plus,
  Send,
  Loader2,
  Lock,
  ArrowLeft,
  X,
  Compass
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Comment {
  _id?: string;
  authorName: string;
  authorPhone: string;
  text: string;
  createdAt: string;
}

interface MemoryPost {
  _id: string;
  tripId: string;
  title?: string;
  text: string;
  photos: string[];
  authorName: string;
  authorPhone: string;
  likes: string[];
  comments: Comment[];
  createdAt: string;
}

interface Participant {
  name: string;
  phone: string;
}

interface CompletedTrip {
  _id: string;
  destination: string;
  state: string;
  category: string;
  slug: string;
  date: string;
  duration: string;
  price: string;
  seats: number;
  image: string;
  images: string[];
  participants: Participant[];
  likes: string[];
  comments: Comment[];
  recap?: string;
}

export default function TripMemoryDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const { locale, t } = useLanguage();

  const [trip, setTrip] = useState<CompletedTrip | null>(null);
  const [posts, setPosts] = useState<MemoryPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Verification state
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [otpStep, setOtpStep] = useState(1); // 1 = Phone, 2 = OTP
  const [phoneInput, setPhoneInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  // Persisted token states
  const [verifiedToken, setVerifiedToken] = useState<string | null>(null);
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const [verifiedName, setVerifiedName] = useState<string | null>(null);

  // New post creation
  const [showPostModal, setShowPostModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newText, setNewText] = useState("");
  const [newPhotos, setNewPhotos] = useState<string[]>([]);
  const [savingPost, setSavingPost] = useState(false);

  // Comments inputs
  const [tripComment, setTripComment] = useState("");
  const [postComments, setPostComments] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchTripDetails();
  }, [slug]);

  const fetchTripDetails = async () => {
    setLoading(true);
    try {
      const API_URL = getApiUrl();
      // Fetch trip settings
      const tripRes = await fetch(`${API_URL}/trips/${slug}`);
      if (!tripRes.ok) throw new Error("Trip not found");
      const tripData = await tripRes.json();
      setTrip(tripData);

      // Load verified state from local storage if exists
      const savedSession = localStorage.getItem(`soloz_verified_trip_${tripData._id}`);
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        setVerifiedToken(parsed.token);
        setVerifiedPhone(parsed.phone);
        setVerifiedName(parsed.name);
      }

      // Fetch memory posts
      const postsRes = await fetch(`${API_URL}/memories/trips/${tripData._id}/posts`);
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput || !trip) return;

    setVerifying(true);
    setVerifyError("");
    setDevOtp(null);

    try {
      const API_URL = getApiUrl();
      const res = await fetch(`${API_URL}/memories/otp/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId: trip._id, phone: phoneInput })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send OTP. Phone number may not be registered.");
      }

      setOtpStep(2);
      if (data.devOtp) {
        setDevOtp(data.devOtp);
      }
    } catch (err: any) {
      setVerifyError(err.message || "An error occurred. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput || !trip) return;

    setVerifying(true);
    setVerifyError("");

    try {
      const API_URL = getApiUrl();
      const res = await fetch(`${API_URL}/memories/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId: trip._id, phone: phoneInput, otp: otpInput })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid OTP code. Please check and try again.");
      }

      // Success! Persist to localStorage
      const session = { token: data.token, phone: data.phone, name: data.name };
      localStorage.setItem(`soloz_verified_trip_${trip._id}`, JSON.stringify(session));

      setVerifiedToken(data.token);
      setVerifiedPhone(data.phone);
      setVerifiedName(data.name);

      setShowVerifyModal(false);
      setOtpStep(1);
      setPhoneInput("");
      setOtpInput("");
      setDevOtp(null);
    } catch (err: any) {
      setVerifyError(err.message || "OTP verification failed.");
    } finally {
      setVerifying(false);
    }
  };

  const handleActionPrecheck = () => {
    if (!verifiedToken) {
      setShowVerifyModal(true);
      return false;
    }
    return true;
  };

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim() || !trip || !verifiedToken) return;

    setSavingPost(true);
    try {
      const API_URL = getApiUrl();
      const res = await fetch(`${API_URL}/memories/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${verifiedToken}`
        },
        body: JSON.stringify({
          tripId: trip._id,
          title: newTitle,
          text: newText,
          photos: newPhotos
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create scrapbook post");

      setPosts([data, ...posts]);
      setNewTitle("");
      setNewText("");
      setNewPhotos([]);
      setShowPostModal(false);
    } catch (err: any) {
      alert(err.message || "Error saving post");
    } finally {
      setSavingPost(false);
    }
  };

  const handleLikeTrip = async () => {
    if (!handleActionPrecheck() || !trip || !verifiedToken) return;

    try {
      const API_URL = getApiUrl();
      const res = await fetch(`${API_URL}/memories/trips/${trip._id}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${verifiedToken}` }
      });
      const data = await res.json();
      if (res.ok) {
        setTrip({ ...trip, likes: data.likes });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripComment.trim() || !trip || !verifiedToken) return;

    try {
      const API_URL = getApiUrl();
      const res = await fetch(`${API_URL}/memories/trips/${trip._id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${verifiedToken}`
        },
        body: JSON.stringify({ text: tripComment })
      });
      const data = await res.json();
      if (res.ok) {
        setTrip({ ...trip, comments: [...trip.comments, data] });
        setTripComment("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!handleActionPrecheck() || !trip || !verifiedToken) return;

    try {
      const API_URL = getApiUrl();
      const res = await fetch(`${API_URL}/memories/posts/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${verifiedToken}`
        },
        body: JSON.stringify({ tripId: trip._id })
      });
      const data = await res.json();
      if (res.ok) {
        setPosts(posts.map(p => (p._id === postId ? { ...p, likes: data.likes } : p)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentPost = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    const commentText = postComments[postId];
    if (!commentText || !commentText.trim() || !trip || !verifiedToken) return;

    try {
      const API_URL = getApiUrl();
      const res = await fetch(`${API_URL}/memories/posts/${postId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${verifiedToken}`
        },
        body: JSON.stringify({ tripId: trip._id, text: commentText })
      });
      const data = await res.json();
      if (res.ok) {
        setPosts(posts.map(p => (p._id === postId ? { ...p, comments: [...p.comments, data] } : p)));
        setPostComments({ ...postComments, [postId]: "" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(locale === "te" ? "te-IN" : locale === "hi" ? "hi-IN" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const handleSignOut = () => {
    if (trip) {
      localStorage.removeItem(`soloz_verified_trip_${trip._id}`);
      setVerifiedToken(null);
      setVerifiedPhone(null);
      setVerifiedName(null);
    }
  };

  // Compile all photos uploaded by travelers for the public gallery
  const allPostPhotos = posts.reduce<string[]>((acc, post) => {
    if (post.photos && post.photos.length > 0) {
      return [...acc, ...post.photos];
    }
    return acc;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-3 text-stone-400">
        <Loader2 className="w-8 h-8 animate-spin text-[#ea580c]" />
        <p className="text-xs uppercase tracking-widest font-semibold">Loading Scrapbook...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="font-display text-2xl font-light text-stone-900">Trip Memories Not Found</h2>
        <Button onClick={() => router.push("/trip-memories")}>Back to Memories</Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50/50 pb-20">
      
      {/* Cinematic Banner */}
      <section className="relative h-[40vh] md:h-[50vh] w-full bg-stone-950 overflow-hidden">
        <img
          src={getOptimizedImageUrl(trip.image, 1200)}
          alt={trip.destination}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/35 to-black/20" />
        
        <div className="absolute bottom-6 left-4 md:bottom-12 md:left-12 text-white space-y-2">
          <Link 
            href="/trip-memories"
            className="inline-flex items-center gap-1.5 text-xs text-white/80 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Memories
          </Link>
          <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-orange-300">
            <MapPin className="w-3.5 h-3.5" /> {trip.state} · {trip.category}
          </div>
          <h1 className="font-display text-2xl md:text-5xl font-extrabold uppercase tracking-tight">
            {trip.destination}
          </h1>
          <div className="flex flex-wrap gap-4 text-xs text-white/95 mt-1 font-semibold">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#ea580c]" /> {formatDate(trip.date)}</span>
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-[#ea580c]" /> {trip.participants?.length || 0} Travelers</span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-10 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Memories feed & recap */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Trip Recap Written by Admin */}
          {trip.recap && (
            <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm space-y-3">
              <h3 className="font-display text-lg font-bold text-stone-850 flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#ea580c]" /> Trip Recap
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed font-body">
                {trip.recap}
              </p>
            </div>
          )}

          {/* Verification Status Banner */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-stone-900">
                {verifiedToken ? `Verified Attendee: ${verifiedName}` : "Attended this Trip?"}
              </h4>
              <p className="text-xs text-stone-500">
                {verifiedToken 
                  ? "You have full access to add memory posts, upload photos, react, and comment." 
                  : "Verify your phone number to upload photos, share memory cards, comment, and like."}
              </p>
            </div>
            {verifiedToken ? (
              <button 
                onClick={handleSignOut}
                className="text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-600 transition-colors shrink-0"
              >
                Disconnect Session
              </button>
            ) : (
              <button 
                onClick={() => setShowVerifyModal(true)}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-850 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-colors shrink-0 flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" /> Verify Participation
              </button>
            )}
          </div>

          {/* Traveler Memory Posts */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-medium text-stone-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#ea580c]" /> Traveler Memory Cards
              </h3>
              <button 
                onClick={() => {
                  if (handleActionPrecheck()) {
                    setShowPostModal(true);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ea580c] hover:bg-orange-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Memory
              </button>
            </div>

            {posts.length === 0 ? (
              <div className="text-center py-16 bg-white border border-stone-200/80 rounded-2xl shadow-sm p-6 text-stone-400 italic text-xs">
                No memories posted yet. Be the first registered traveler to share your scrapbook moments!
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => {
                  const hasLiked = verifiedPhone && post.likes.includes(verifiedPhone);
                  return (
                    <div 
                      key={post._id}
                      className="bg-white border border-stone-200/80 rounded-2xl p-5 md:p-6 shadow-sm space-y-4"
                    >
                      {/* Post Header */}
                      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                        <div>
                          <div className="text-sm font-bold text-stone-900">{post.authorName}</div>
                          <div className="text-[10px] text-stone-500 uppercase font-semibold">{formatDateTime(post.createdAt)}</div>
                        </div>
                        <div className="px-2 py-0.5 rounded bg-orange-50 text-[#ea580c] text-[9px] uppercase tracking-wider font-extrabold">
                          Verified Attendant
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="space-y-3">
                        {post.title && (
                          <h4 className="font-display text-base md:text-lg font-bold text-stone-850">
                            {post.title}
                          </h4>
                        )}
                        <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line font-body">
                          {post.text}
                        </p>

                        {/* Post Photos Grid */}
                        {post.photos && post.photos.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                            {post.photos.map((ph, idx) => (
                              <div key={idx} className="relative aspect-video rounded-xl overflow-hidden bg-stone-100 border border-stone-100">
                                <a href={ph} target="_blank" rel="noopener noreferrer">
                                  <img 
                                    src={getOptimizedImageUrl(ph, 400)}
                                    alt="Travel scrap" 
                                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                                  />
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Post Action Buttons */}
                      <div className="flex items-center gap-6 border-y border-stone-100 py-3 text-stone-500 text-xs font-semibold">
                        <button
                          onClick={() => handleLikePost(post._id)}
                          className={`flex items-center gap-1.5 transition-colors ${hasLiked ? "text-rose-500" : "hover:text-rose-500"}`}
                        >
                          <Heart className={`w-4 h-4 ${hasLiked ? "fill-rose-500" : ""}`} /> {post.likes.length} Likes
                        </button>
                        <span className="flex items-center gap-1.5">
                          <MessageSquare className="w-4 h-4" /> {post.comments.length} Comments
                        </span>
                      </div>

                      {/* Post Comments Feed */}
                      {post.comments && post.comments.length > 0 && (
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2 bg-stone-50/50 rounded-xl p-3 border border-stone-100">
                          {post.comments.map((comm, cIdx) => (
                            <div key={cIdx} className="text-xs space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-stone-900">{comm.authorName}</span>
                                <span className="text-[9px] text-stone-400 font-medium">{formatDateTime(comm.createdAt)}</span>
                              </div>
                              <p className="text-stone-600 font-body">{comm.text}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Comment Input Form */}
                      <form onSubmit={(e) => handleCommentPost(e, post._id)} className="flex gap-2">
                        <input
                          type="text"
                          placeholder={verifiedToken ? "Write a comment..." : "Verify to comment..."}
                          disabled={!verifiedToken}
                          value={postComments[post._id] || ""}
                          onChange={(e) => setPostComments({ ...postComments, [post._id]: e.target.value })}
                          onClick={() => {
                            if (!verifiedToken) setShowVerifyModal(true);
                          }}
                          className="flex-1 h-9 rounded-lg border border-stone-200 bg-stone-50/50 px-3 text-xs text-stone-800 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-stone-400 transition"
                        />
                        <button
                          type="submit"
                          disabled={!verifiedToken || !postComments[post._id]?.trim()}
                          className="grid size-9 place-items-center bg-stone-900 text-white rounded-lg hover:bg-stone-850 active:scale-95 disabled:opacity-50 transition shrink-0"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Photo Scrapbook Gallery & overall trip comments */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Trip Gallery compilations */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-[#ea580c]" /> Scrapbook Gallery
            </h3>
            {allPostPhotos.length === 0 ? (
              <div className="text-xs text-stone-400 italic py-6 text-center">
                No photos uploaded by travelers yet.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {allPostPhotos.slice(0, 12).map((pic, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-stone-100 border border-stone-100">
                    <a href={pic} target="_blank" rel="noopener noreferrer">
                      <img 
                        src={getOptimizedImageUrl(pic, 250)}
                        alt="Scrapbook snapshot"
                        className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Overall Trip Likes & Comments */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-[#ea580c]" /> Trip Scrapbook Likes
              </h3>
              <button
                onClick={handleLikeTrip}
                className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wider transition-colors ${
                  verifiedPhone && trip.likes.includes(verifiedPhone) ? "text-rose-500" : "text-stone-500 hover:text-rose-500"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${verifiedPhone && trip.likes.includes(verifiedPhone) ? "fill-rose-500" : ""}`} /> 
                {trip.likes.length} Likes
              </button>
            </div>

            {/* Overall Trip Comments Timeline */}
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase tracking-wider text-stone-500 font-bold flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" /> Comments ({trip.comments.length})
              </h4>
              
              {trip.comments.length === 0 ? (
                <div className="text-xs text-stone-400 italic py-4 text-center">
                  No comments yet. Leave a note!
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {trip.comments.map((comm, idx) => (
                    <div key={idx} className="text-xs space-y-0.5 border-b border-stone-100 pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 justify-between">
                        <span className="font-bold text-stone-900">{comm.authorName}</span>
                        <span className="text-[8px] text-stone-400 font-medium">{formatDateTime(comm.createdAt)}</span>
                      </div>
                      <p className="text-stone-600 font-body">{comm.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment Input Form */}
              <form onSubmit={handleCommentTrip} className="flex gap-2 pt-2 border-t border-stone-100">
                <input
                  type="text"
                  placeholder={verifiedToken ? "Write a comment..." : "Verify to comment..."}
                  disabled={!verifiedToken}
                  value={tripComment}
                  onChange={(e) => setTripComment(e.target.value)}
                  onClick={() => {
                    if (!verifiedToken) setShowVerifyModal(true);
                  }}
                  className="flex-1 h-9 rounded-lg border border-stone-200 bg-stone-50/50 px-3 text-xs text-stone-800 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-stone-400 transition"
                />
                <button
                  type="submit"
                  disabled={!verifiedToken || !tripComment.trim()}
                  className="grid size-9 place-items-center bg-stone-900 text-white rounded-lg hover:bg-stone-850 active:scale-95 disabled:opacity-50 transition shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

        </div>

      </div>

      {/* OTP Verification Dialog Overlay */}
      <AnimatePresence>
        {showVerifyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl border border-stone-200/80 bg-white p-6 shadow-2xl relative space-y-4 text-stone-850"
            >
              <button
                onClick={() => {
                  setShowVerifyModal(false);
                  setPhoneInput("");
                  setOtpInput("");
                  setVerifyError("");
                  setDevOtp(null);
                  setOtpStep(1);
                }}
                className="absolute right-4 top-4 text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="space-y-1">
                <h3 className="font-display text-lg font-bold text-stone-900 flex items-center gap-1.5">
                  <Lock className="w-5 h-5 text-[#ea580c]" /> Verifying Participant
                </h3>
                <p className="text-xs text-stone-500">
                  {otpStep === 1 
                    ? "Enter the phone number registered for this trip to receive a mock verification code." 
                    : "Enter the 6-digit OTP code sent to your phone."}
                </p>
              </div>

              {verifyError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded-lg">
                  {verifyError}
                </div>
              )}

              {devOtp && (
                <div className="p-3 bg-orange-50 border border-orange-200 text-orange-700 text-xs rounded-lg flex flex-col gap-1">
                  <span className="font-semibold uppercase tracking-wider text-[9px] text-orange-500">Developer Testing Code:</span>
                  <span className="font-mono text-base font-bold tracking-widest">{devOtp}</span>
                </div>
              )}

              {otpStep === 1 ? (
                <form onSubmit={handleRequestOtp} className="space-y-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-stone-500 block font-bold">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm text-stone-900 focus:bg-white focus:outline-none focus:border-stone-400 transition"
                    />
                  </div>
                  <Button type="submit" disabled={verifying} className="w-full justify-center">
                    {verifying ? <Loader2 className="animate-spin text-white w-4 h-4" /> : "Request Verification Code"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-stone-500 block font-bold">
                      Verification Code (OTP)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm text-stone-900 tracking-widest text-center font-bold focus:bg-white focus:outline-none focus:border-stone-400 transition"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setOtpStep(1);
                        setOtpInput("");
                        setDevOtp(null);
                        setVerifyError("");
                      }}
                      className="h-10 flex-1 rounded-lg border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition"
                    >
                      Back
                    </button>
                    <Button type="submit" disabled={verifying} className="flex-1 justify-center">
                      {verifying ? <Loader2 className="animate-spin text-white w-4 h-4" /> : "Verify OTP"}
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Memory Creation Form Dialog */}
      <AnimatePresence>
        {showPostModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl border border-stone-200/80 bg-white p-6 shadow-2xl relative space-y-4 text-stone-850 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => {
                  setShowPostModal(false);
                  setNewTitle("");
                  setNewText("");
                  setNewPhotos([]);
                }}
                className="absolute right-4 top-4 text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="space-y-1">
                <h3 className="font-display text-lg font-bold text-stone-900 flex items-center gap-1.5">
                  <Camera className="w-5 h-5 text-[#ea580c]" /> Share Your memory
                </h3>
                <p className="text-xs text-stone-500">
                  Write about your adventure and upload photos from the trip to add to the scrap list.
                </p>
              </div>

              <form onSubmit={handleAddPost} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-stone-500 block font-bold">
                    Title (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hiking through the rain, Sunrise viewpoint"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm text-stone-900 focus:bg-white focus:outline-none focus:border-stone-400 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-stone-500 block font-bold">
                    Memory Story (Required)
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell your story. What was the best part of the day? Who did you meet?"
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    className="w-full rounded-lg border border-stone-200 bg-stone-50 p-3 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-stone-400 transition resize-none font-body"
                  />
                </div>

                {/* Upload Photos Section */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-wider text-stone-500 block font-bold">
                    Attach Photos ({newPhotos.length} Added)
                  </label>
                  {newPhotos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 pb-2">
                      {newPhotos.map((url, idx) => (
                        <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-stone-200 bg-stone-55">
                          <img src={url} alt="Thumbnail preview" className="object-cover w-full h-full" />
                          <button
                            type="button"
                            onClick={() => setNewPhotos(newPhotos.filter((_, i) => i !== idx))}
                            className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-red-500 text-white"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {newPhotos.length < 9 && (
                    <CloudinaryUpload
                      value=""
                      onChange={(url) => {
                        if (url) setNewPhotos([...newPhotos, url]);
                      }}
                      label="Upload Trip Image"
                    />
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPostModal(false);
                      setNewTitle("");
                      setNewText("");
                      setNewPhotos([]);
                    }}
                    className="h-10 px-5 rounded-lg border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition"
                  >
                    Cancel
                  </button>
                  <Button type="submit" disabled={savingPost}>
                    {savingPost ? <Loader2 className="animate-spin text-white w-4 h-4" /> : "Publish Scrap Story"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>
  );
}
