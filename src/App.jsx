import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthPage } from "./pages/AuthPage";
import { SearchPage } from "./pages/SearchPage";
import { ChatPage } from "./pages/ChatPage";
import { FriendsPage } from "./pages/FriendsPage";
import { InvitesPage } from "./pages/InvitesPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { ProfileSettingsPage } from "./pages/ProfileSettingsPage";
import { UserProfilePage } from "./pages/UserProfilePage";

import { AdminStatisticsPage } from "./pages/AdminStatisticsPage";
import { AdminUsersPage } from "./pages/AdminUsersPage";
import { AdminModerationPage } from "./pages/AdminModerationPage";

import { isAdmin, isAuthenticated, isUser } from "./utils/jwt";

function UserRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/auth" replace />;
  }

  if (!isUser()) {
    return <Navigate to="/admin/statistics" replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/search" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="/auth" element={<AuthPage />} />

        <Route
          path="/search"
          element={
            <UserRoute>
              <SearchPage />
            </UserRoute>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <UserRoute>
              <UserProfilePage />
            </UserRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <UserRoute>
              <ChatPage />
            </UserRoute>
          }
        />
        <Route
          path="/friends"
          element={
            <UserRoute>
              <FriendsPage />
            </UserRoute>
          }
        />
        <Route
          path="/invites"
          element={
            <UserRoute>
              <InvitesPage />
            </UserRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <UserRoute>
              <NotificationsPage />
            </UserRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <UserRoute>
              <ProfileSettingsPage />
            </UserRoute>
          }
        />

        <Route path="/admin" element={<Navigate to="/admin/statistics" replace />} />
        <Route
          path="/admin/statistics"
          element={
            <AdminRoute>
              <AdminStatisticsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsersPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/moderation"
          element={
            <AdminRoute>
              <AdminModerationPage />
            </AdminRoute>
          }
        />

        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </Router>
  );
}