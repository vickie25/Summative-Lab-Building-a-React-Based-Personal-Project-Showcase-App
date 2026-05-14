import React from 'react'
import { useState } from 'react';
const links = [
  { label: "Home",     href: "/" },
  { label: "About",    href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Contact",  href: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

      
        <a href="/" className="text-lg font-semibold tracking-tight text-gray-900">
          MyBrand
        </a>

      
        <ul className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="px-3 py-1.5 rounded-md text-sm text-gray-500
                           hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

      
        <div className="flex items-center gap-2">

          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            className="md:hidden border border-gray-200 rounded-md p-1.5
                       text-gray-500 hover:bg-gray-100 transition-colors"
          >
            {isOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      
      {isOpen && (
        <ul className="md:hidden border-t border-gray-200 px-4 py-2 flex flex-col gap-1">
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="block px-3 py-2 rounded-md text-sm text-gray-500
                           hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
