"use client";

import React from "react";
import { FileUser } from "lucide-react";
import { Input, Select, FormField } from "@/shared/ui";

interface ContactSectionProps {
  data: {
    phone?: string;
    whatsapp_number?: string;
    email?: string;
    location?: string;
    city?: string;
    country?: string;
  };
  onChange: (field: string, value: string) => void;
}

export default function ContactSection({ data, onChange }: ContactSectionProps) {
  return (
    <section className="border-border rounded-2xl overflow-hidden transition-all shadow-sm duration-350 bg-card border p-6" id="contact">
      <div className="flex items-center gap-3.5 mb-6 border-b border-border/60 pb-4">
        <div className="justify-center h-10 w-10 text-primary shrink-0 items-center bg-primary/5 flex rounded-xl">
          <FileUser size={20} aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-text type-card-title leading-tight">Contact Information</h3>
          <p className="text-xs text-muted mt-0.5">Where recruiters can reach you</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Input
          label="Mobilephone"
          icon="call"
          type="text"
          value={data.phone || ""}
          onChange={(e) => onChange("phone", e.target.value)}
          placeholder="+50 123 456 78"
        />

        <Input
          label="Whatsapp"
          icon="chat"
          type="text"
          value={data.whatsapp_number || ""}
          onChange={(e) => onChange("whatsapp_number", e.target.value)}
          placeholder="+50 444 551 11"
        />

        <Input
          label="Email"
          icon="mail"
          type="email"
          value={data.email || ""}
          onChange={(e) => onChange("email", e.target.value)}
          placeholder="example@mail.com"
        />

        <div className="md:col-span-1">
          <Input
            label="Address"
            type="text"
            value={data.location || ""}
            onChange={(e) => onChange("location", e.target.value)}
            placeholder="Address summary"
          />
        </div>

        <FormField label="City">
          <Select
            value={data.city || ""}
            onChange={(e) => onChange("city", e.target.value)}
            options={[
              { value: "", label: "Select City" },
              { value: "London", label: "London" },
              { value: "New York", label: "New York" },
              { value: "Berlin", label: "Berlin" },
            ]}
          />
        </FormField>

        <FormField label="Country">
          <Select
            value={data.country || ""}
            onChange={(e) => onChange("country", e.target.value)}
            options={[
              { value: "", label: "Select Country" },
              { value: "England", label: "England" },
              { value: "USA", label: "USA" },
              { value: "Germany", label: "Germany" },
            ]}
          />
        </FormField>
      </div>
    </section>
  );
}

