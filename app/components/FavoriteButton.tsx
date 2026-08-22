"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

type FavoriteButtonProps = {
  propertyId: number;
};

export default function FavoriteButton({
  propertyId,
}: FavoriteButtonProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

 async function handleFavorite(
  event: React.MouseEvent<HTMLButtonElement>
) {
  event.preventDefault();
  event.stopPropagation();

  if (saving) return;

    setSaving(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setSaving(false);
      router.push("/login");
      return;
    }

    if (isFavorite) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("property_id", propertyId);

      if (!error) {
        setIsFavorite(false);
      }
    } else {
      const { error } = await supabase
        .from("favorites")
        .insert({
          user_id: user.id,
          property_id: propertyId,
        });

      if (!error) {
        setIsFavorite(true);
      }
    }

    setSaving(false);
  }

  return (
    <button
      type="button"
      onClick={handleFavorite}
      disabled={saving}
      aria-label={
        isFavorite
          ? "Remove from saved properties"
          : "Save property"
      }
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl shadow hover:bg-gray-100 disabled:opacity-50"
    >
      {isFavorite ? "♥" : "♡"}
    </button>
  );
}