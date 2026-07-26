import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { NavigationHistoryProvider } from "./hooks/NavigationHistory";
import { HashScrollRestoration } from "./components/HashScrollRestoration";
import { AuthProvider } from "./context/AuthContext";
import AuthSessionController from "./components/AuthSessionController";
import RequireAuth from "./components/RequireAuth";
import HomePage from "./components/HomePage";
import CommunityPage from "./components/CommunityPage";
import AuthLoginPage from "./components/AuthLoginPage";
import TreeDetailPage from "./components/TreeDetailPage";
import MemoryConnectPage from "./components/MemoryConnectPage";
import MyTreesPage from "./components/MyTreesPage";
import TreeEditorPage from "./components/TreeEditorPage";
import MemoryDetailPage from "./components/MemoryDetailPage";
import MediaSearchPage from "./components/MediaSearchPage";
import VisibilitySettingsPage from "./components/VisibilitySettingsPage";
import MyTreesEmptyPage from "./components/MyTreesEmptyPage";
import EmptyTreeEditorPage from "./components/EmptyTreeEditorPage";

function RouteElements() {
  return (
    <NavigationHistoryProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/login" element={<AuthLoginPage />} />
        <Route path="/tree/community-demo" element={<TreeDetailPage />} />
        <Route path="/memory/detail-demo" element={<MemoryDetailPage />} />

        <Route
          path="/memory/connect-demo"
          element={
            <RequireAuth>
              <MemoryConnectPage />
            </RequireAuth>
          }
        />
        <Route
          path="/my-trees"
          element={
            <RequireAuth>
              <MyTreesPage />
            </RequireAuth>
          }
        />
        <Route
          path="/tree/edit-demo"
          element={
            <RequireAuth>
              <TreeEditorPage />
            </RequireAuth>
          }
        />
        <Route
          path="/tree/new-demo"
          element={
            <RequireAuth>
              <EmptyTreeEditorPage />
            </RequireAuth>
          }
        />
        <Route
          path="/media/search-demo"
          element={
            <RequireAuth>
              <MediaSearchPage />
            </RequireAuth>
          }
        />
        <Route
          path="/settings/visibility-demo"
          element={
            <RequireAuth>
              <VisibilitySettingsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/my-trees/empty-demo"
          element={
            <RequireAuth>
              <MyTreesEmptyPage />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </NavigationHistoryProvider>
  );
}

export function AppRoutes() {
  return (
    <AuthProvider>
      <AuthSessionController />
      <RouteElements />
    </AuthProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <HashScrollRestoration />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
