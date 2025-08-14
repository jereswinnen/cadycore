'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

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
  priority = false 
}: LogoProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check if we're in dark mode by checking the CSS variables
    const checkTheme = () => {
      const computedStyle = getComputedStyle(document.documentElement);
      const bgColor = computedStyle.getPropertyValue('--background').trim();
      // If background is dark (e.g., #000000 or dark values), use light logo
      setIsDark(bgColor === '#000000' || bgColor.startsWith('rgb(0') || bgColor.startsWith('hsl(0'));
    };

    // Initial check
    checkTheme();

    // Listen for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    return () => observer.disconnect();
  }, []);

  const logoSrc = isDark ? '/logoNewOnBlack.png' : '/logoNewOnWhite.png';

  return (
    <Image
      src={logoSrc}
      alt="Logo"
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
}
