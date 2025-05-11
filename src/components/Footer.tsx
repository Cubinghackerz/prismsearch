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
    }} className="text-sm opacity-70 text-teal-200">
        © 2025 Prism Search. All rights reserved.
      </p>
    </div>;
};
export default Footer;