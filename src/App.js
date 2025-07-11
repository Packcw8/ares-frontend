import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import RatingsPage from "./pages/RatingsPage";
import EntityRatingPage from "./pages/EntityRatingPage";
import AddOfficialPage from './pages/AddOfficialPage';
import EntityDetailPage from "./pages/EntityDetailPage";
import KnowYourRights from "./pages/KnowYourRights";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import ForumPost from "./pages/ForumPost";
import Forum from "./pages/Forum";
import NewForumPost from "./pages/NewForumPost";
import AdminDashboard from "./pages/admin/Dashboard";
import FlaggedRatingsPage from "./pages/admin/FlaggedRatingsPage";
import VerifyOfficialsPage from "./pages/admin/VerifyOfficialsPage";
import VerifyRatingsPage from "./pages/admin/VerifyRatingsPage";
import VaultUpload from "./vault/VaultUpload";
import VaultPublic from "./vault/VaultPublic";



import { setAuthToken } from './services/api'; // ✅ import
const token = localStorage.getItem('token');   // ✅ read token
if (token) setAuthToken(token);                // ✅ set global auth header

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/home" element={<Home />} />
          <Route path="/ratings" element={<RatingsPage />} />
          <Route path="/ratings/:id/rate" element={<EntityRatingPage />} />
          <Route path="/ratings/new" element={<AddOfficialPage />} />
          <Route path="/ratings/:id" element={<EntityDetailPage />} />
          <Route path="/rights" element={<KnowYourRights />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfUse />} />
          <Route path="/forum/:id" element={<ForumPost />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/forum/new" element={<NewForumPost />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/flagged" element={<FlaggedRatingsPage />} />
        <Route path="/admin/verify-officials" element={<VerifyOfficialsPage />} />
        <Route path="/admin/verify-ratings" element={<VerifyRatingsPage />} />
        <Route path="/vault/upload" element={<VaultUpload />} />
        <Route path="/vault/public" element={<VaultPublic />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
