import React from 'react';
interface FooterProps {
  color?: string;
}
const Footer = ({
  color = '#3b82f6'
}: FooterProps) => {
  return <div className="py-4 text-center">
      <p style={{
      color
    }} className="opacity-70 text-base text-cyan-300">
        © 2025 Prism Search. All rights reserved.
      </p>
    </div>;
};
export default Footer;