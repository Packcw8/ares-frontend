import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import RatingsPage from "./pages/RatingsPage";
import EntityRatingPage from "./pages/EntityRatingPage";
import AddOfficialPage from "./pages/AddOfficialPage";
import EntityDetailPage from "./pages/EntityDetailPage";
import KnowYourRights from "./pages/KnowYourRights";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import ForumPost from "./pages/ForumPost";
import Forum from "./pages/Forum";
import NewForumPost from "./pages/NewForumPost";
import About from "./pages/About";
import PoliciesPage from "./pages/PoliciesPage";
import PolicyDetailPage from "./pages/PolicyDetailPage";
import CreatePolicyPage from "./pages/CreatePolicyPage";


import AdminDashboard from "./pages/admin/Dashboard";
import FlaggedRatingsPage from "./pages/admin/FlaggedRatingsPage";
import VerifyOfficialsPage from "./pages/admin/VerifyOfficialsPage";
import VerifyRatingsPage from "./pages/admin/VerifyRatingsPage";
import AdminEvidence from "./pages/admin/AdminEvidence";
import AdminPendingEntities from "./pages/admin/AdminPendingEntities";
import AdminPolicyQueue from "./pages/admin/AdminPolicyQueue";


import VaultUpload from "./vault/VaultUpload";
import VaultPublic from "./vault/VaultPublic";
import MyVault from "./vault/MyVault";


import CheckEmailPage from "./pages/CheckEmailPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import RulesPage from "./pages/RulesPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import AdminRoute from "./components/AdminRoute";

import { setAuthToken } from "./services/api";

// ✅ set auth header if token exists
const token = localStorage.getItem("token");
if (token) setAuthToken(token);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/about" element={<About />} />


          <Route path="/ratings" element={<RatingsPage />} />
          <Route path="/ratings/new" element={<AddOfficialPage />} />
          <Route path="/ratings/:id" element={<EntityDetailPage />} />
          <Route path="/ratings/:id/rate" element={<EntityRatingPage />} />

          <Route path="/forum" element={<Forum />} />
          <Route path="/forum/new" element={<NewForumPost />} />
          <Route path="/forum/:id" element={<ForumPost />} />

          <Route path="/vault/upload" element={<VaultUpload />} />
          <Route path="/vault/public" element={<VaultPublic />} />
          <Route path="/vault/mine" element={<MyVault />} />


          <Route path="/rights" element={<KnowYourRights />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfUse />} />
          <Route path="/rules" element={<RulesPage />} />

          <Route path="/check-email" element={<CheckEmailPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/policies" element={<PoliciesPage />} />
          <Route path="/policies/:id" element={<PolicyDetailPage />} />
          <Route path="/policies/new" element={<CreatePolicyPage />} />


          {/* 🔐 ADMIN (SECURED) */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/flagged"
            element={
              <AdminRoute>
                <FlaggedRatingsPage />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/verify-officials"
            element={
              <AdminRoute>
                <VerifyOfficialsPage />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/verify-ratings"
            element={
              <AdminRoute>
                <VerifyRatingsPage />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/evidence"
            element={
              <AdminRoute>
                <AdminEvidence />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/entities"
            element={
              <AdminRoute>
                <AdminPendingEntities />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/policies"
            element={
            <AdminRoute>
             <AdminPolicyQueue />
            </AdminRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
