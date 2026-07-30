import Link from "next/link";
import { ReactNode } from "react";

type GradientColor = "orange" | "purple" | "blue" | "red" | "green" | "teal";

interface FeatureCardProps {
  title: string;
  description: string;
  href: string;
  badge: string;
  status: "live" | "demo" | "coming-soon";
  gradient?: GradientColor;
  variant?: "default" | "wide";
  icon?: string;
  creator?: string;
  members?: string;
  views?: string;
  thumbnail?: ReactNode;
  titleIcon?: ReactNode;
  cta?: string;
}

const COVER_GRADIENT: Record<GradientColor, string> = {
  orange: "from-[#FA4616]/30 via-[#FA4616]/10 to-[#1a1a1a]",
  purple: "from-[#8B5CF6]/30 via-[#8B5CF6]/10 to-[#1a1a1a]",
  blue: "from-[#3B82F6]/30 via-[#3B82F6]/10 to-[#1a1a1a]",
  red: "from-[#FA4616]/30 via-[#FA4616]/10 to-[#1a1a1a]",
  green: "from-[#0DA726]/30 via-[#0DA726]/10 to-[#1a1a1a]",
  teal: "from-[#0D9488]/30 via-[#0D9488]/10 to-[#1a1a1a]",
};

const ICON_COLOR: Record<GradientColor, string> = {
  orange: "bg-[#FA4616]",
  purple: "bg-[#8B5CF6]",
  blue: "bg-[#3B82F6]",
  red: "bg-[#FA4616]",
  green: "bg-[#0DA726]",
  teal: "bg-[#0D9488]",
};

const BADGE_TEXT: Record<GradientColor, string> = {
  orange: "text-[#FA4616]",
  purple: "text-[#8B5CF6]",
  blue: "text-[#3B82F6]",
  red: "text-[#FA4616]",
  green: "text-[#0DA726]",
  teal: "text-[#0D9488]",
};

export function FeatureCard({
  title,
  description,
  href,
  badge,
  status,
  gradient = "orange",
  icon,
  creator,
  members,
  views,
  thumbnail,
  titleIcon,
  cta,
}: FeatureCardProps) {
  return (
    <Link
      href={href}
      className="group relative block rounded-[16px] transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98]"
    >
      <div className="relative rounded-[16px] bg-[#141414] border border-white/[0.06] h-full overflow-hidden group-hover:border-white/[0.12] transition-colors duration-300">
        {/* Cover image area */}
        <div className={`relative h-[140px] bg-gradient-to-b ${COVER_GRADIENT[gradient]} overflow-hidden`}>
          {thumbnail ? (
            <div className="absolute inset-0 flex items-center justify-center">
              {thumbnail}
            </div>
          ) : (
            <div className="absolute inset-0 opacity-20">
              <svg className="w-full h-full" viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice">
                <circle cx="300" cy="80" r="120" fill="currentColor" className={BADGE_TEXT[gradient]} opacity="0.15" />
                <circle cx="100" cy="140" r="80" fill="currentColor" className={BADGE_TEXT[gradient]} opacity="0.1" />
                <circle cx="350" cy="20" r="40" fill="currentColor" className={BADGE_TEXT[gradient]} opacity="0.2" />
              </svg>
            </div>
          )}
          {/* Badge overlay */}
          <div className="absolute top-3 left-3">
            <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-sm ${BADGE_TEXT[gradient]}`}>
              {badge}
            </span>
          </div>
          {status === "live" && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-emerald-400 font-medium">Live</span>
            </div>
          )}
          {status === "coming-soon" && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-[10px] text-amber-400 font-medium">Coming Soon</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Icon + title + creator */}
          <div className="flex items-start gap-3 mb-3">
            {titleIcon ? (
              <div className="w-10 h-10 shrink-0">{titleIcon}</div>
            ) : (
              <div className={`w-10 h-10 rounded-xl ${ICON_COLOR[gradient]} flex items-center justify-center shrink-0`}>
                {icon ? (
                  <img src={icon} alt="" className="w-10 h-10 rounded-xl object-cover" />
                ) : (
                  <span className="text-white font-bold text-[14px]">{title[0]}</span>
                )}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-[15px] text-white truncate group-hover:text-white/90 transition-colors">
                  {title}
                </h3>
                {status === "live" && (
                  <svg className="w-4 h-4 text-blue-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )}
                <svg className="w-4 h-4 text-zinc-600 shrink-0 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
              {creator && (
                <p className="text-[12px] text-zinc-500 mt-0.5">by {creator}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-[12px] sm:text-[13px] text-zinc-500 leading-relaxed mb-3 line-clamp-2">
            {description}
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-3 text-[11px] text-zinc-600">
            {members && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                </svg>
                {members}
              </span>
            )}
            {views && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
                {views}
              </span>
            )}
          </div>

          {cta && (
            <div className="mt-3 pt-3 border-t border-white/[0.04]">
              <span className={`text-[12px] font-semibold ${BADGE_TEXT[gradient]}`}>
                {cta} →
              </span>
            </div>
          )}

        </div>
      </div>
    </Link>
  );
}
