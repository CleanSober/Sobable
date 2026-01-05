import { motion } from "framer-motion";

interface AppStoreBadgesProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const AppStoreBadges = ({ className = "", size = "md" }: AppStoreBadgesProps) => {
  const sizeClasses = {
    sm: "h-10",
    md: "h-12",
    lg: "h-14"
  };

  return (
    <div className={`flex flex-wrap items-center justify-center gap-4 ${className}`}>
      {/* Apple App Store Badge */}
      <motion.a
        href="#"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        className="inline-block"
        aria-label="Download on the App Store"
      >
        <svg
          className={`${sizeClasses[size]} w-auto`}
          viewBox="0 0 120 40"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="120" height="40" rx="6" fill="currentColor" className="text-foreground" />
          <g fill="hsl(var(--background))">
            {/* Apple Logo */}
            <path d="M24.769 20.3c-.016-1.792.796-3.135 2.442-4.087-.938-1.346-2.365-2.088-4.264-2.229-1.816-.138-3.792 1.063-4.514 1.063-.76 0-2.506-.993-3.865-.993-2.81.046-5.568 2.271-5.568 6.574 0 1.266.232 2.573.695 3.921.619 1.77 2.85 6.11 5.178 6.037 1.224-.031 2.088-.868 3.816-.868 1.674 0 2.469.868 3.864.868 2.355-.035 4.363-3.954 4.953-5.726-3.158-1.481-3.737-5.56-2.737-4.56zm-5.114-7.456c1.328-1.57 1.213-3 1.175-3.518-1.181.072-2.549.808-3.334 1.726-1.063 1.082-1.42 2.396-1.308 3.754 1.281.097 2.449-.663 3.467-1.962z" />
            {/* Text */}
            <text x="38" y="14" fontSize="7" fontFamily="system-ui, sans-serif" fontWeight="400">Download on the</text>
            <text x="38" y="28" fontSize="12" fontFamily="system-ui, sans-serif" fontWeight="600">App Store</text>
          </g>
        </svg>
      </motion.a>

      {/* Google Play Badge */}
      <motion.a
        href="#"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        className="inline-block"
        aria-label="Get it on Google Play"
      >
        <svg
          className={`${sizeClasses[size]} w-auto`}
          viewBox="0 0 135 40"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="135" height="40" rx="6" fill="currentColor" className="text-foreground" />
          <g>
            {/* Play Store Triangle */}
            <defs>
              <linearGradient id="playGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00C4FF" />
                <stop offset="100%" stopColor="#00E0FF" />
              </linearGradient>
              <linearGradient id="playGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00C4FF" />
                <stop offset="100%" stopColor="#00F076" />
              </linearGradient>
              <linearGradient id="playGradient3" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F04E3C" />
                <stop offset="100%" stopColor="#FFBA00" />
              </linearGradient>
              <linearGradient id="playGradient4" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00C4FF" />
                <stop offset="100%" stopColor="#DE4196" />
              </linearGradient>
            </defs>
            <path d="M11 8.5L23 20L11 31.5V8.5Z" fill="url(#playGradient4)" />
            <path d="M11 8.5L23 20L27 16.5L14 6L11 8.5Z" fill="url(#playGradient2)" />
            <path d="M11 31.5L23 20L27 23.5L14 34L11 31.5Z" fill="url(#playGradient3)" />
            <path d="M27 16.5L23 20L27 23.5L31 20L27 16.5Z" fill="#FFBA00" />
            {/* Text */}
            <text x="38" y="14" fontSize="6" fontFamily="system-ui, sans-serif" fontWeight="400" fill="hsl(var(--background))">GET IT ON</text>
            <text x="38" y="28" fontSize="11" fontFamily="system-ui, sans-serif" fontWeight="600" fill="hsl(var(--background))">Google Play</text>
          </g>
        </svg>
      </motion.a>
    </div>
  );
};

export default AppStoreBadges;
