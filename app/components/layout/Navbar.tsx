"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarProps {
  jobContext?: {
    title: string;
  } | null;
  currentSession?: {
    id: string;
  } | null;
}

const Navbar = ({ jobContext, currentSession }: NavbarProps) => {
  const pathname = usePathname();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const isActive = (path: string) => pathname === path;
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <Link
            href="/chat"
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">HR</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              Candidate Engagement
            </h1>
            {jobContext && (
              <span className="text-sm text-gray-500">
                • {jobContext.title}
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/chat"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/chat")
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              Chat
            </Link>
            <Link
              href="/profile"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/profile")
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              Profile
            </Link>
            <Link
              href="/job"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/job")
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              Job Info
            </Link>
          </nav>

          {/* Session Info */}
          <div className="hidden md:flex items-center space-x-4">
            {currentSession && (
              <div className="text-right">
                <p className="text-xs text-gray-500">Session</p>
                <p className="text-sm font-mono text-gray-700">
                  {currentSession.id.substring(0, 8)}...
                </p>
              </div>
            )}
            <div className="w-2 h-2 bg-green-400 rounded-full" />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-2">
              <Link
                href="/chat"
                onClick={toggleMobileMenu}
                className={`px-3 py-2 rounded-md text-sm font-medium text-left transition-colors ${
                  isActive("/chat")
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                Chat Interface
              </Link>
              <Link
                href="/profile"
                onClick={toggleMobileMenu}
                className={`px-3 py-2 rounded-md text-sm font-medium text-left transition-colors ${
                  isActive("/profile")
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                Candidate Profile
              </Link>
              <Link
                href="/job"
                onClick={toggleMobileMenu}
                className={`px-3 py-2 rounded-md text-sm font-medium text-left transition-colors ${
                  isActive("/job")
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                Job Information
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
