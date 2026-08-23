import React, { useState } from "react";
import { User, Bell, Lock, Palette, Circle } from "lucide-react";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Lock },
  { id: "appearance", label: "Appearance", icon: Palette },
];

const SaveButton = () => (
  <button
    disabled
    title="Coming soon — will connect once backend is ready"
    className="bg-[#f4faf9]/[0.06] text-[#54777c] border border-[#17444a] text-sm font-medium px-5 py-2.5 rounded-xl cursor-not-allowed"
  >
    Save Changes
  </button>
);

const FieldRow = ({ label, children, hint }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-6 py-5 border-b border-[#123a40] last:border-0">
    <div>
      <p className="text-sm font-medium text-[#d8e8e9]">{label}</p>
      {hint && <p className="text-xs text-[#668b90] mt-0.5">{hint}</p>}
    </div>
    <div className="sm:col-span-2">{children}</div>
  </div>
);

const inputClasses =
  "w-full text-sm border border-[#17444a] rounded-xl px-4 py-2.5 outline-none bg-[#04181c] text-[#d8e8e9] placeholder:text-[#54777c] focus:border-[#f9b223]/60 transition-colors";

const Toggle = ({ defaultChecked }) => {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <button
      onClick={() => setChecked((c) => !c)}
      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
        checked ? "bg-[#f9b223]" : "bg-[#17444a]"
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 bg-[#04161a] rounded-full shadow-sm transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
};

/* ============================================================
   PANEL WRAPPER — shared card shell for each tab
============================================================ */

const SettingsPanel = ({ eyebrow, children }) => (
  <div className="relative border border-[#15434a] bg-[#061d21]/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl">
    <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-[#013f46]/10 via-transparent to-[#f9b223]/[0.015]" />

    {eyebrow && (
      <div className="relative px-6 lg:px-7 py-4 border-b border-[#123a40] flex items-center gap-2">
        <span className="font-mono text-[9px] tracking-[0.16em] text-[#a8c4c8]">
          {eyebrow}
        </span>
      </div>
    )}

    <div className="relative p-6 lg:p-7">{children}</div>
  </div>
);

const ProfileTab = () => (
  <SettingsPanel eyebrow="PROFILE SETTINGS">
    <div className="flex items-center gap-4 pb-6 border-b border-[#123a40]">
      <div className="w-16 h-16 rounded-full bg-[#013f46] border border-[#1d525a] text-[#f9b223] flex items-center justify-center text-xl font-medium">
        V
      </div>
      <div>
        <p className="text-sm font-medium text-[#d8e8e9]">Profile photo</p>
        <button
          disabled
          title="Coming soon — will connect once backend is ready"
          className="text-xs font-medium text-[#54777c] cursor-not-allowed mt-1"
        >
          Upload new photo
        </button>
      </div>
    </div>

    <FieldRow label="Full name">
      <input type="text" defaultValue="Vishnupriya" className={inputClasses} />
    </FieldRow>
    <FieldRow label="Email" hint="Used for login and notifications">
      <input type="email" defaultValue="vishnupriya@stockflow.com" className={inputClasses} />
    </FieldRow>
    <FieldRow label="Role">
      <input
        type="text"
        defaultValue="Admin"
        disabled
        className={`${inputClasses} bg-[#04161a] text-[#54777c] cursor-not-allowed`}
      />
    </FieldRow>

    <div className="flex justify-end pt-6">
      <SaveButton />
    </div>
  </SettingsPanel>
);

const NotificationsTab = () => (
  <SettingsPanel eyebrow="NOTIFICATION PREFERENCES">
    <FieldRow label="Low stock alerts" hint="Get notified when items fall below reorder point">
      <Toggle defaultChecked={true} />
    </FieldRow>
    <FieldRow label="Order updates" hint="Notify on new orders, shipping, and delays">
      <Toggle defaultChecked={true} />
    </FieldRow>
    <FieldRow label="Weekly summary email" hint="A digest of inventory and sales activity">
      <Toggle defaultChecked={false} />
    </FieldRow>
    <FieldRow label="Overstock warnings" hint="Alert when items exceed healthy stock levels">
      <Toggle defaultChecked={true} />
    </FieldRow>

    <div className="flex justify-end pt-6">
      <SaveButton />
    </div>
  </SettingsPanel>
);

const SecurityTab = () => (
  <SettingsPanel eyebrow="SECURITY & ACCESS">
    <FieldRow label="Current password">
      <input type="password" placeholder="••••••••" className={inputClasses} />
    </FieldRow>
    <FieldRow label="New password">
      <input type="password" placeholder="••••••••" className={inputClasses} />
    </FieldRow>
    <FieldRow label="Confirm new password">
      <input type="password" placeholder="••••••••" className={inputClasses} />
    </FieldRow>
    <FieldRow label="Two-factor authentication" hint="Add an extra layer of security to your account">
      <Toggle defaultChecked={false} />
    </FieldRow>

    <div className="flex justify-end pt-6">
      <SaveButton />
    </div>
  </SettingsPanel>
);

const AppearanceTab = () => {
  const [theme, setTheme] = useState("dark");
  return (
    <SettingsPanel eyebrow="APPEARANCE">
      <FieldRow label="Theme" hint="Choose how StockFlow looks for you">
        <div className="flex gap-3">
          {["light", "dark"].map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-medium border transition-colors capitalize ${
                theme === t
                  ? "bg-[#f9b223] text-[#013f46] border-[#f9b223]"
                  : "bg-[#04181c] text-[#a8c4c8] border-[#17444a] hover:border-[#1d525a]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </FieldRow>
      <FieldRow label="Compact sidebar" hint="Start with the sidebar collapsed by default">
        <Toggle defaultChecked={false} />
      </FieldRow>

      <div className="flex justify-end pt-6">
        <SaveButton />
      </div>
    </SettingsPanel>
  );
};

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");

  const tabContent = {
    profile: <ProfileTab />,
    notifications: <NotificationsTab />,
    security: <SecurityTab />,
    appearance: <AppearanceTab />,
  };

  return (
    <div className="space-y-8">
      <div>
        {/* Status badge, matches Inventory/Alerts header pattern */}
        <div className="inline-flex items-center gap-2 border border-[#17444a] bg-[#061e22]/75 backdrop-blur-sm rounded-full px-3 py-1.5 mb-4">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#f9b223] animate-pulse" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#f9b223]" />
          </span>

          <span className="font-mono text-[9px] tracking-[0.16em] text-[#a8c4c8]">
            ACCOUNT CONTROL
          </span>
        </div>

        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#f4faf9]">
          Settings
        </h1>
        <p className="text-sm text-[#8eafb3] mt-1">
          Manage your account and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tab nav */}
        <div className="lg:col-span-1">
          <div className="relative border border-[#15434a] bg-[#061d21]/95 backdrop-blur-xl rounded-2xl p-2 shadow-2xl space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === id
                    ? "bg-[#f9b223]/10 text-[#f9b223]"
                    : "text-[#8eafb3] hover:bg-[#f4faf9]/[0.04] hover:text-[#d8e8e9]"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="lg:col-span-3">{tabContent[activeTab]}</div>
      </div>
    </div>
  );
};

export default Settings;