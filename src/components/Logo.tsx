import React from 'react';

interface LogoProps {
  logoUrl: string;
  className?: string;
  classNameImg?: string;
}

export const Logo: React.FC<LogoProps> = ({ logoUrl, className = "", classNameImg = "max-h-full max-w-full rounded-full object-contain" }) => {
  if (!logoUrl) return null;

  // Check if it's a valid SVG or a generic image
  const trimmed = logoUrl.trim();
  const isSvg = trimmed.startsWith('<svg') || trimmed.includes('<svg') || trimmed.includes('xmlns="http://www.w3.org/2000/svg"');

  if (isSvg) {
    return (
      <div 
        className={`${className} flex items-center justify-center`}
        dangerouslySetInnerHTML={{ __html: logoUrl }} 
      />
    );
  }

  // Handle standard image URLs or Base64 strings
  let src = logoUrl;
  
  // If it's a raw base64 string (not starting with data:), add the data-uri header
  if (
    !trimmed.startsWith('data:') && 
    !trimmed.startsWith('http://') && 
    !trimmed.startsWith('https://') && 
    !trimmed.startsWith('/')
  ) {
    // Determine image type (default to png for base64)
    src = `data:image/png;base64,${trimmed}`;
  }

  return (
    <div className={`${className} flex items-center justify-center overflow-hidden`}>
      <img
        src={src}
        alt="Hospital Logo"
        className={classNameImg}
        referrerPolicy="no-referrer"
        onError={(e) => {
          // If custom image loading fails, log and fallback silently 
          console.error("Logo failed to load");
        }}
      />
    </div>
  );
};
