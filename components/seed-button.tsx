"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Database, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SeedButton() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSeed = async () => {
    if (!confirm("Are you sure you want to seed the database? This will populate empty collections with mock data.")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/seed");
      if (!res.ok) {
        throw new Error("Failed to seed database.");
      }
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      alert(error.message || "Failed to trigger seeding.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSeed}
      disabled={loading}
      variant={success ? "secondary" : "default"}
      size="sm"
      className="h-10"
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin mr-2" size={15} /> Seeding...
        </>
      ) : success ? (
        <>
          <Check className="mr-2 text-emerald-400" size={15} /> Seeded!
        </>
      ) : (
        <>
          <Database className="mr-2" size={15} /> Seed Database
        </>
      )}
    </Button>
  );
}
