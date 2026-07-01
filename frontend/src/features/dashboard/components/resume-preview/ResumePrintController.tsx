"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/shared/ui";
import { ArrowLeft, Printer } from "lucide-react";

interface ResumePrintControllerProps {
  shouldPrint: boolean;
}

export default function ResumePrintController({ shouldPrint }: ResumePrintControllerProps) {
  useEffect(() => {
    if (shouldPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [shouldPrint]);

  return (
    <>
      {/* Screen Toolbar Controls */}
      <div className="mx-auto mb-8 gap-4 rounded-2xl no-print bg-white/80 items-center backdrop-blur-md flex-wrap shadow-sm max-w-4xl flex justify-between p-4 border-border/60 border text-left">
        <div className="flex gap-3 items-center text-left">
          <Button
            as={Link}
            href="/dashboard/profile"
            variant="outline"
            className="h-11 w-11 p-0 flex items-center justify-center text-muted"
            title="Back to profile Editor"
          >
            <ArrowLeft size={20} aria-hidden="true" />
          </Button>
          <div>
            <h1 className="tracking-tight text-text leading-none type-ui mb-1 font-semibold text-lg">Resume Preview</h1>
            <p className="text-muted text-xs uppercase tracking-wider">A4 Standard Print Layout</p>
          </div>
        </div>

        <Button
          onClick={() => window.print()}
          variant="primary"
          className="gap-2 cursor-pointer"
        >
          <Printer size={14} aria-hidden="true" />
          Print / Save PDF
        </Button>
      </div>
    </>
  );
}
