import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function BottomNav() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
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

        {/* RATINGS / POLICIES PICKER */}
        <NavButton
          label="Ratings"
          icon="📜"
          onClick={() => setShowPicker(true)}
          active={isActive("/ratings") || isActive("/policies")}
        />

        {/* CENTER ACTION (UNCHANGED) */}
        <button
          onClick={() => navigate("/vault/upload")}
          aria-label="Add Record"
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

      {/* PICKER MODAL */}
      {showPicker && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/40">
          <div
            className="absolute inset-0"
            onClick={() => setShowPicker(false)}
          />

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
              What would you like to view?
            </h2>

            <button
              onClick={() => {
                setShowPicker(false);
                navigate("/ratings");
              }}
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
              <span className="text-3xl">🏛️</span>
              <div className="text-left">
                <div className="font-semibold text-slate-900">
                  Public Ratings
                </div>
                <div className="text-sm text-slate-600">
                  Courts, agencies, and public officials
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setShowPicker(false);
                navigate("/policies");
              }}
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
              <span className="text-3xl">📜</span>
              <div className="text-left">
                <div className="font-semibold text-slate-900">
                  Policies & Laws
                </div>
                <div className="text-sm text-slate-600">
                  Track public policy and legal status
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowPicker(false)}
              className="w-full text-sm text-slate-500 pt-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function NavButton({ icon, label, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center text-xs transition-all ${
        active ? "text-indigo-600 scale-110" : "text-slate-400 hover:text-slate-600"
      }`}
    >
      <span className="text-xl leading-none">{icon}</span>
      <span className="mt-1">{label}</span>
    </button>
  );
}
