import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import SosTab from "../../components/PocketHealth/emergency/SosTab";
import ServicesTab from "../../components/PocketHealth/emergency/ServicesTab";
import ContactsTab from "../../components/PocketHealth/emergency/ContactsTab";
import HealthInfoTab from "../../components/PocketHealth/emergency/HealthInfoTab";

type TabKey = "sos" | "services" | "contacts" | "health";

const tabs: { key: TabKey; label: string }[] = [
  { key: "sos", label: "SOS" },
  { key: "services", label: "Emergency Services" },
  { key: "contacts", label: "Emergency Contacts" },
  { key: "health", label: "Health Info" },
];

export default function Emergency() {
  const [tab, setTab] = useState<TabKey>("sos");

  return (
    <>
      <PageMeta
        title="Emergency | PocketHealth"
        description="Send emergency alerts, find emergency services, and manage emergency contacts and health info."
      />
      <PageBreadcrumb pageTitle="Emergency" />

      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${
              tab === t.key
                ? "bg-brand-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "sos" && <SosTab />}
      {tab === "services" && <ServicesTab />}
      {tab === "contacts" && <ContactsTab />}
      {tab === "health" && <HealthInfoTab />}
    </>
  );
}
