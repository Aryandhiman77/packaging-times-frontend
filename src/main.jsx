import React from "react";
import { createRoot } from "react-dom/client";
import AdminContentPages from "./pages/AdminContentPages.jsx";
import AdminPackagingBrief from "./pages/AdminPackagingBrief.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import PublicLayout from "./components/PublicLayout.jsx";

import {
  AdminLogin,
  AdminLayout,
  AdminOverview,
  AdminBanners,
  AdminNews,
  AdminSettings,
  AdminSubscribers,
} from "./pages/Admin.jsx";

import AdminEnquiries from "./pages/AdminEnquiries.jsx";

import "./styles.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />

          <Route path="banners" element={<AdminBanners />} />

          <Route path="news" element={<AdminNews />} />
          <Route path="content-pages" element={<AdminContentPages />} />
          <Route path="packaging-brief" element={<AdminPackagingBrief />} />

          <Route path="settings" element={<AdminSettings />} />

          <Route path="subscribers" element={<AdminSubscribers />} />

          <Route path="messages" element={<AdminEnquiries type="messages" />} />

          <Route
            path="advertising-inquiries"
            element={<AdminEnquiries type="advertising-inquiries" />}
          />
        </Route>

        <Route path="/*" element={<PublicLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
