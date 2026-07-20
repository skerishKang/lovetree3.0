import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./components/HomePage";
import CommunityPage from "./components/CommunityPage";
import AuthLoginPage from "./components/AuthLoginPage";
import TreeDetailPage from "./components/TreeDetailPage";
import MemoryConnectPage from "./components/MemoryConnectPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/login" element={<AuthLoginPage />} />
        <Route path="/tree/community-demo" element={<TreeDetailPage />} />
        <Route path="/memory/connect-demo" element={<MemoryConnectPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
