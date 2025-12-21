"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page where all jobs are listed
    router.replace("/");
  }, [router]);

  return null;
};

export default Page;
