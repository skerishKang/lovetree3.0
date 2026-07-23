import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/community" element={<CommunityPage />} />
      <Route path="/login" element={<AuthLoginPage />} />
      <Route path="/tree/community-demo" element={<TreeDetailPage />} />
      <Route path="/memory/connect-demo" element={<MemoryConnectPage />} />
      <Route path="/my-trees" element={<MyTreesPage />} />
      <Route path="/tree/edit-demo" element={<TreeEditorPage />} />
      <Route path="/tree/new-demo" element={<EmptyTreeEditorPage />} />
      <Route path="/memory/detail-demo" element={<MemoryDetailPage />} />
      <Route path="/media/search-demo" element={<MediaSearchPage />} />
      <Route path="/settings/visibility-demo" element={<VisibilitySettingsPage />} />
      <Route path="/my-trees/empty-demo" element={<MyTreesEmptyPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
