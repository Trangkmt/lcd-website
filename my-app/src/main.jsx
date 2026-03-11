import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components';
import { Homepage } from './screens/Homepage';
import { Activity, EventByYear, EventDetail, PostDetail } from './screens/Activity';
import OrganizationalStructure from './screens/OrganizationalStructure';
import { News } from './screens/News';
import { Achievement } from './screens/Achievement';
import {
  AdminLayout,
  Dashboard,
  PostsManagement,
  CategoriesManagement,
  AchievementsManagement,
  MembersManagement,
  ContactsManagement
} from './screens/Admin';
import './global.css';  /* Global design system variables */
import './styles.css';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout><Homepage /></Layout>} />
        <Route path="/organization" element={<Layout><OrganizationalStructure /></Layout>} />
        <Route path="/activity" element={<Layout><Activity /></Layout>} />
        <Route path="/activity/:eventName" element={<Layout><EventByYear /></Layout>} />
        <Route path="/activity/:eventName/:year" element={<Layout><EventDetail /></Layout>} />
        <Route path="/activity/:eventName/:year/post/:postId" element={<Layout><PostDetail /></Layout>} />
        <Route path="/news" element={<Layout><News /></Layout>} />
        <Route path="/achievement" element={<Layout><Achievement /></Layout>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="posts" element={<PostsManagement />} />
          <Route path="categories" element={<CategoriesManagement />} />
          <Route path="achievements" element={<AchievementsManagement />} />
          <Route path="members" element={<MembersManagement />} />
          <Route path="contacts" element={<ContactsManagement />} />
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
