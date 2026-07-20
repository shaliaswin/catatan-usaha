import Link from "next/link";
import SignOutButton from "./sign-out-button";
import { BRAND_NAME } from "@/lib/branding";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/kanban", label: "Alur Kerja" },
  { href: "/proyek", label: "Proyek" },
  { href: "/transaksi", label: "Cash Flow" },
  { href: "/invoice", label: "Invoice" },
];

export default function Nav({ userName }: { userName: string }) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <span className="font-bold text-brand-700">{BRAND_NAME}</span>
            <nav className="hidden sm:flex gap-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:inline">
              {userName}
            </span>
            <SignOutButton />
          </div>
        </div>
        <nav className="flex sm:hidden gap-1 pb-2 overflow-x-auto">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg whitespace-nowrap"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
