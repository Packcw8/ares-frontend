import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function BottomNav() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showViewPicker, setShowViewPicker] = useState(false);
  const [showCreatePicker, setShowCreatePicker] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("token"));
  }, []);

  if (!isAuthenticated) return null;

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-t border-slate-200 h-20 px-6 flex items-center justify-between">

        <NavButton
          label="Public"
          icon="📂"
          onClick={() => navigate("/vault/public")}
          active={isActive("/vault/public")}
        />

        {/* VIEW PICKER (Ratings / Policies) */}
        <NavButton
          label="Browse"
          icon="📜"
          onClick={() => setShowViewPicker(true)}
          active={isActive("/ratings") || isActive("/policies")}
        />

        {/* CENTER CREATE BUTTON */}
        <button
          onClick={() => setShowCreatePicker(true)}
          aria-label="Create"
          className="-mt-8 h-16 w-16 rounded-full bg-indigo-600 text-white text-3xl flex items-center justify-center shadow-xl active:scale-95"
        >
          +
        </button>

        <NavButton
          label="Forum"
          icon="💬"
          onClick={() => navigate("/forum")}
          active={isActive("/forum")}
        />

        <NavButton
          label="My Vault"
          icon="🔒"
          onClick={() => navigate("/vault/mine")}
          active={isActive("/vault/mine")}
        />
      </nav>

      {/* ================= VIEW PICKER ================= */}
      {showViewPicker && (
        <PickerModal
          title="What would you like to view?"
          onClose={() => setShowViewPicker(false)}
        >
          <PickerButton
            icon="🏛️"
            title="Public Ratings"
            subtitle="Officials, agencies, institutions"
            onClick={() => {
              setShowViewPicker(false);
              navigate("/ratings");
            }}
          />

          <PickerButton
            icon="📜"
            title="Policies & Laws"
            subtitle="Track public policy and legal status"
            onClick={() => {
              setShowViewPicker(false);
              navigate("/policies");
            }}
          />
        </PickerModal>
      )}

      {/* ================= CREATE PICKER ================= */}
      {showCreatePicker && (
        <PickerModal
          title="What would you like to add?"
          onClose={() => setShowCreatePicker(false)}
        >
          <PickerButton
            icon="📜"
            title="Policy"
            subtitle="Submit a policy or law for review"
            onClick={() => {
              setShowCreatePicker(false);
              navigate("/policies/new");
            }}
          />

          <PickerButton
            icon="🏛️"
            title="Public Entity"
            subtitle="Agency, court, official, or institution"
            onClick={() => {
              setShowCreatePicker(false);
              navigate("/ratings/new");
            }}
          />

          <PickerButton
            icon="🧾"
            title="Record / Testimony"
            subtitle="Create a personal or public record"
            onClick={() => {
              setShowCreatePicker(false);
              navigate("/vault/upload");
            }}
          />
        </PickerModal>
      )}
    </>
  );
}

/* ===================== COMPONENTS ===================== */

function NavButton({ icon, label, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center text-xs transition-all ${
        active
          ? "text-indigo-600 scale-110"
          : "text-slate-400 hover:text-slate-600"
      }`}
    >
      <span className="text-xl leading-none">{icon}</span>
      <span className="mt-1">{label}</span>
    </button>
  );
}

function PickerModal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/40">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="
        relative
        w-full
        sm:max-w-md
        bg-white
        rounded-t-3xl
        sm:rounded-3xl
        p-6
        space-y-4
        shadow-2xl
      ">
        <h2 className="text-lg font-bold text-slate-800 text-center">
          {title}
        </h2>

        {children}

        <button
          onClick={onClose}
          className="w-full text-sm text-slate-500 pt-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function PickerButton({ icon, title, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      className="
        w-full
        flex
        items-center
        gap-4
        p-4
        rounded-2xl
        border
        border-slate-200
        hover:border-indigo-500
        hover:bg-indigo-50
        transition
      "
    >
      <span className="text-3xl">{icon}</span>
      <div className="text-left">
        <div className="font-semibold text-slate-900">
          {title}
        </div>
        <div className="text-sm text-slate-600">
          {subtitle}
        </div>
      </div>
    </button>
  );
}
