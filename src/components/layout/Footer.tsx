import { Link } from "react-router-dom";
import { useUIStore } from "@/stores/ui-store";
import { SITE_SOCIAL_LINKS } from "@/lib/site-config";

function GoldenTicketLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 120"
      className={className}
      aria-label="Cine Hall"
      role="img"
    >
      <defs>
        <linearGradient id="ticket-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="40%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <path
        d="M10 20 A10 10 0 0 1 20 10 H180 A10 10 0 0 1 190 20 V45 A8 8 0 0 0 190 61 A8 8 0 0 0 190 77 V100 A10 10 0 0 1 180 110 H20 A10 10 0 0 1 10 100 V77 A8 8 0 0 0 10 61 A8 8 0 0 0 10 45 Z"
        fill="url(#ticket-gold)"
        stroke="#b45309"
        strokeWidth="2"
      />
      <text
        x="100"
        y="58"
        textAnchor="middle"
        fontFamily="'Playfair Display', Georgia, serif"
        fontWeight="900"
        fontSize="22"
        fill="#1c1917"
        letterSpacing="2"
      >
        CINE
      </text>
      <text
        x="100"
        y="82"
        textAnchor="middle"
        fontFamily="'Playfair Display', Georgia, serif"
        fontWeight="900"
        fontSize="22"
        fill="#1c1917"
        letterSpacing="2"
      >
        HALL
      </text>
    </svg>
  );
}

function SmallTicketIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-amber-400" fill="currentColor" aria-hidden>
      <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h13A2.5 2.5 0 0 1 21 8.5v2.1a2 2 0 0 0 0 3.8v2.1A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-2.1a2 2 0 0 0 0-3.8V8.5zm2.5-.5a.5.5 0 0 0-.5.5v1.2a4 4 0 0 1 0 5.6V16.5a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-1.2a4 4 0 0 1 0-5.6V8.5a.5.5 0 0 0-.5-.5h-13z" />
      <circle cx="12" cy="12" r="1.5" fill="#0c0a09" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { label: "Facebook", href: SITE_SOCIAL_LINKS.facebook, icon: FacebookIcon },
  { label: "Instagram", href: SITE_SOCIAL_LINKS.instagram, icon: InstagramIcon },
  { label: "Twitter", href: SITE_SOCIAL_LINKS.twitter, icon: TwitterIcon },
  { label: "LinkedIn", href: SITE_SOCIAL_LINKS.linkedin, icon: LinkedInIcon },
  { label: "YouTube", href: SITE_SOCIAL_LINKS.youtube, icon: YouTubeIcon },
] as const;

const FOOTER_COLUMNS = [
  {
    title: "Đặt vé phim",
    links: [
      { label: "Đang chiếu", to: "/movies?tab=now_showing" },
      { label: "Sắp chiếu", to: "/movies?tab=coming_soon" },
      { label: "Đặt vé", to: "/booking" },
      { label: "Ưu đãi & Khuyến mãi", to: "/promotions" },
    ],
  },
  {
    title: "Tài khoản",
    links: [
      { label: "Lịch sử đặt vé", to: "/tickets" },
      { label: "Đăng nhập", action: "login" as const },
      { label: "Đăng ký", action: "register" as const },
      { label: "Yêu thích", to: "/account?tab=favorites" },
    ],
  },
  {
    title: "Chính sách",
    links: [
      { label: "Điều khoản & Điều kiện", to: "/policy/terms" },
      { label: "Chính sách bảo mật", to: "/policy/privacy" },
      { label: "An toàn dữ liệu", to: "/policy/data-safety" },
    ],
  },
] as const;

export function Footer() {
  const openAuthModal = useUIStore((state) => state.openAuthModal);

  return (
    <footer className="mt-auto">
      {/* Popcorn promotional banner */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/theater-seats.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-red-950/75 backdrop-blur-[2px]" />

        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-12 md:flex-row md:gap-12 md:px-6 md:py-16">
          <div className="flex shrink-0 items-end gap-3 md:gap-4">
            <img
              src="/images/clapper.jpg"
              alt="Bảng clapper phim"
              className="h-28 w-auto rounded-md object-cover shadow-2xl md:h-36"
            />
            <img
              src="/images/popcorn.jpg"
              alt="Xô bắp rang"
              className="h-36 w-auto object-contain drop-shadow-2xl md:h-44"
            />
          </div>

          <p className="font-cinema max-w-xl text-center text-xl leading-relaxed text-amber-300 md:text-left md:text-2xl lg:text-3xl">
            Một số cảnh phim ở lại trong bạn. Bắp rang của chúng tôi cũng vậy.
            Nổ lên, Yêu nó và Lặp lại... vì mỗi cảnh phim đều cần tiếng giòn
            tan!
          </p>
        </div>
      </section>

      {/* Main footer area */}
      <section className="bg-red-950 px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 md:flex-row md:items-start md:justify-between">
          <p className="font-cinema max-w-lg text-center text-lg leading-relaxed text-amber-300 md:text-left md:text-xl lg:text-2xl">
            Phim HAY không chờ đợi. Bạn cũng vậy! Chạm. Đặt vé. Xem. Để màn ảnh
            bạc viết nên buổi tối của bạn. Vì những khoảnh khắc trên màn hình
            trở thành kỷ niệm ngoài đời.
          </p>

          <div className="flex flex-col items-center text-center md:items-end md:text-right">
            <GoldenTicketLogo className="h-24 w-auto md:h-28" />
            <p className="mt-4 max-w-xs text-xs leading-relaxed text-stone-300 md:text-sm">
              Công ty Cine Hall Studios Ltd.
              <br />
              Go-168, Kaibur Gaffar, Mohakhali School Road, Dhaka-1206.
              <br />
              info@cinehall.com
            </p>
          </div>
        </div>
      </section>

      {/* Bottom black strip */}
      <section className="bg-stone-950">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_auto_2fr]">
            <div className="flex items-center justify-center gap-3 lg:justify-start">
              <SmallTicketIcon />
              <div className="flex items-center gap-3">
                {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-500 transition hover:text-amber-300"
                    aria-label={label}
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            </div>

            <p className="text-center text-xs text-stone-500 lg:self-center">
              © 2023 CINE HALL. Bảo lưu mọi quyền.
            </p>

            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-8 lg:justify-end">
              {FOOTER_COLUMNS.map((column) => (
                <div key={column.title}>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-amber-400">
                    {column.title}
                  </h3>
                  <ul className="space-y-2">
                    {column.links.map((link) => (
                      <li key={link.label}>
                        {"action" in link ? (
                          <button
                            type="button"
                            onClick={() => openAuthModal(link.action)}
                            className="text-left text-xs text-stone-400 transition hover:text-amber-300"
                          >
                            {link.label}
                          </button>
                        ) : (
                          <Link
                            to={link.to}
                            className="text-xs text-stone-400 transition hover:text-amber-300"
                          >
                            {link.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="film-strip-bottom" />
      </section>
    </footer>
  );
}
