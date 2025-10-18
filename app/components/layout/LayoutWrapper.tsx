"use client";

import React from "react";

import Navbar from "./Navbar";
import Footer from "./Footer";
import { useSession, useJob } from "../../lib/hooks";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

const LayoutWrapper = ({ children }: LayoutWrapperProps) => {
  const { currentSession } = useSession();
  const { jobContext } = useJob();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar jobContext={jobContext} currentSession={currentSession} />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
};

export default LayoutWrapper;
