import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import { NavigationHistoryProvider } from "./hooks/NavigationHistory";
import { HashScrollRestoration } from "./components/HashScrollRestoration";
import { AuthProvider } from "./context/AuthContext";
import { PublicDemoEditorProvider } from "./context/PublicDemoEditorContext";
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
import PublicDemoEditorPage from "./components/PublicDemoEditorPage";
import PublicDemoMemoryFormPage from "./components/PublicDemoMemoryFormPage";
import PublicDemoPreviewPage from "./components/PublicDemoPreviewPage";

function PublicDemoRouteShell() {
  return (
    <PublicDemoEditorProvider>
      <Outlet />
    </PublicDemoEditorProvider>
  );
}

function RouteElements() {
  return (
    <NavigationHistoryProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/login" element={<AuthLoginPage />} />
        <Route path="/tree/community-demo" element={<TreeDetailPage />} />
        <Route path="/memory/detail-demo" element={<MemoryDetailPage />} />

        <Route element={<PublicDemoRouteShell />}>
          <Route path="/tree/new-demo" element={<EmptyTreeEditorPage sharedProvider />} />
          <Route path="/tree/new-demo/edit" element={<PublicDemoEditorPage />} />
          <Route path="/tree/new-demo/memory/new" element={<PublicDemoMemoryFormPage />} />
          <Route path="/tree/new-demo/memory/:nodeId/edit" element={<PublicDemoMemoryFormPage />} />
          <Route path="/tree/new-demo/preview" element={<PublicDemoPreviewPage />} />
        </Route>

        <Route path="/memory/connect-demo" element={<RequireAuth><MemoryConnectPage /></RequireAuth>} />
        <Route path="/my-trees" element={<RequireAuth><MyTreesPage /></RequireAuth>} />
        <Route path="/tree/edit-demo" element={<RequireAuth><TreeEditorPage /></RequireAuth>} />
        <Route path="/media/search-demo" element={<RequireAuth><MediaSearchPage /></RequireAuth>} />
        <Route path="/settings/visibility-demo" element={<RequireAuth><VisibilitySettingsPage /></RequireAuth>} />
        <Route path="/my-trees/empty-demo" element={<RequireAuth><MyTreesEmptyPage /></RequireAuth>} />

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
