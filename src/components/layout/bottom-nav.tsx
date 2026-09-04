"use client";

import { Home, Search, PlusSquare, Bookmark, User } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const ITEMS = [
  { href: "/", icon: Home, key: "home" as const },
  { href: "/search", icon: Search, key: "search" as const },
  { href: "/write", icon: PlusSquare, key: "write" as const },
  { href: "/me/bookmarks", icon: Bookmark, key: "bookmarks" as const },
  { href: "/me", icon: User, key: "me" as const },
];

export function BottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="mx-auto flex max-w-5xl">
        {ITEMS.map(({ href, icon: Icon, key }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                isActive ? "text-teal-700" : "text-slate-500"
              }`}
            >
              <Icon className="size-5" strokeWidth={isActive ? 2.5 : 2} />
              {t(key)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
