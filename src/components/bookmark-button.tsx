"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BookmarkButton({
  postId,
  initialBookmarked,
  isLoggedIn,
}: {
  postId: string;
  initialBookmarked: boolean;
  isLoggedIn: boolean;
}) {
  const t = useTranslations("common");
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      if (res.ok) {
        const json = await res.json();
        setBookmarked(json.bookmarked);
      }
    });
  }

  return (
    <Button
      variant="outline"
      size="lg"
      disabled={isPending}
      onClick={toggle}
      className="flex-1"
    >
      <Bookmark
        className={cn("size-4", bookmarked && "fill-teal-600 text-teal-600")}
      />
      {t("save")}
    </Button>
  );
}
