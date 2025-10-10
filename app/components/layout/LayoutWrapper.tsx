"use client";

import React, { useState } from "react";

import Navbar from "./Navbar";
import Footer from "./Footer";
import { useView } from "./ViewContext";
import { useSession, useJob } from "../../lib/hooks";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

const LayoutWrapper = ({ children }: LayoutWrapperProps) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { activeView, setActiveView } = useView();
  const { currentSession } = useSession();
  const { jobContext } = useJob();

  const handleViewChange = (view: "chat" | "profile" | "job") => {
    setActiveView(view);
    setShowMobileMenu(false);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        activeView={activeView}
        onViewChange={handleViewChange}
        showMobileMenu={showMobileMenu}
        onToggleMobileMenu={toggleMobileMenu}
        jobContext={jobContext}
        currentSession={currentSession}
      />
      {children}
      <Footer />
    </div>
  );
};

export default LayoutWrapper;
