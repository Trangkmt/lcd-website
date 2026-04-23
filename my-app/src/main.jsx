import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components';
import { Homepage } from './screens/User/Homepage';
import { Activity, AnnualActivity, AnnualActivityDetail, NonAnnualActivity, NonAnnualActivityDetail, PostDetail } from './screens/User/Activity';
import OrganizationalStructure from './screens/User/OrganizationalStructure';
import Contact from './screens/User/Contact';
import { News, NewsDetail } from './screens/User/News';
import { Achievement, AchievementDetail } from './screens/User/Achievement';
import {
  AdminLayout,
  AdminLogin,
  Dashboard,
  PostsManagement,
  CategoriesManagement,
  MembersManagement,
  ContactsManagement,
  OtherUtilities,
  TimelineManagement,
  AccountInfo
} from './screens/Admin';
import { canAccessAdminPath, getDefaultAdminPath, getStoredAdminUser } from './utils/adminPermissions';
import './global.css';  /* Global design system variables */

function RequireAdminAuth({ children }) {
  const location = useLocation();
  const user = getStoredAdminUser();

  if (!user?.id) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  if (!canAccessAdminPath(user, location.pathname)) {
    return <Navigate to={getDefaultAdminPath(user)} replace />;
  }

  return children;
}

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout><Homepage /></Layout>} />
        <Route path="/organization" element={<Layout><OrganizationalStructure /></Layout>} />
        <Route path="/activity" element={<Layout><Activity /></Layout>} />
        <Route path="/activity/annual" element={<Layout><AnnualActivity /></Layout>} />
        <Route path="/activity/non-annual" element={<Layout><NonAnnualActivity /></Layout>} />
        <Route path="/activity/non-annual/:id" element={<Layout><NonAnnualActivityDetail /></Layout>} />
        <Route path="/activity/:eventName" element={<Layout><AnnualActivityDetail /></Layout>} />
        <Route path="/activity/:eventName/post/:postId" element={<Layout><PostDetail /></Layout>} />
        <Route path="/news" element={<Layout><News /></Layout>} />
        <Route path="/news/:id" element={<Layout><NewsDetail /></Layout>} />
        <Route path="/achievement" element={<Layout><Achievement /></Layout>} />
        <Route path="/achievement/:id" element={<Layout><AchievementDetail /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<RequireAdminAuth><AdminLayout /></RequireAdminAuth>}>
          <Route index element={<Dashboard />} />
          <Route path="posts" element={<PostsManagement />} />
          <Route path="categories" element={<CategoriesManagement />} />
          <Route path="achievements" element={<Navigate to="/admin/posts?page_type=achievement" replace />} />
          <Route path="members" element={<MembersManagement />} />
          <Route path="contacts" element={<ContactsManagement />} />
          <Route path="timeline" element={<TimelineManagement />} />
          <Route path="utilities" element={<OtherUtilities />} />
          <Route path="account" element={<AccountInfo />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

// Mount the app to the DOM
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
