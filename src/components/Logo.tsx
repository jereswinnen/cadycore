import Image from "next/image";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export default function Logo({
  width = 200,
  height = 67,
  className = "h-20 w-auto",
  priority = false,
}: LogoProps) {
  return (
    <div className="relative">
      {/* Light mode logo */}
      <Image
        src="/logoNewOnWhite.png"
        alt="Logo"
        width={width}
        height={height}
        className={`${className} dark:hidden`}
        priority={priority}
      />
      {/* Dark mode logo */}
      <Image
        src="/logoNewOnBlack.png"
        alt="Logo"
        width={width}
        height={height}
        className={`${className} hidden dark:block`}
        priority={priority}
      />
    </div>
  );
}
