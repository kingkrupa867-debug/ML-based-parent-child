import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/new-ui.css';
import './styles/inner-pages.css';

import Landing    from './components/Landing';
import About      from './components/About';
import Contact    from './components/Contact';
import Login      from './components/Login';
import Register   from './components/Register';
import Dashboard  from './components/Dashboard';
import FamilySession from './components/FamilySession';
import ChildEntry    from './components/ChildEntry';
import Questionnaire from './components/Questionnaire';
import Results    from './components/Results';
import History    from './components/History';
import AppNavbar      from './components/AppNavbar';
import SplashScreen  from './components/SplashScreen';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
};

/* Shell: sticky navbar on top, page content below */
const PageShell = ({ children }) => (
  <div className="page-shell-v2">
    <AppNavbar />
    <main className="page-body">{children}</main>
  </div>
);

/* Inner pages get extra max-width padding */
const InnerShell = ({ children }) => (
  <div className="page-shell-v2">
    <AppNavbar />
    <main className="page-body">
      <div className="inner-wrap">{children}</div>
    </main>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Splash — standalone, no navbar */}
        <Route path="/splash" element={<SplashScreen />} />

        <Route path="/"        element={<PageShell><Landing /></PageShell>} />
        <Route path="/about"   element={<PageShell><About   /></PageShell>} />
        <Route path="/contact" element={<PageShell><Contact /></PageShell>} />

        <Route path="/login"    element={<PageShell><PublicRoute><Login    /></PublicRoute></PageShell>} />
        <Route path="/register" element={<PageShell><PublicRoute><Register /></PublicRoute></PageShell>} />

        <Route path="/dashboard"     element={<InnerShell><ProtectedRoute><Dashboard    /></ProtectedRoute></InnerShell>} />
        <Route path="/session"        element={<PageShell><ProtectedRoute><FamilySession /></ProtectedRoute></PageShell>} />
        <Route path="/child-entry"   element={<PageShell><ProtectedRoute><ChildEntry    /></ProtectedRoute></PageShell>} />
        <Route path="/questionnaire" element={<PageShell><ProtectedRoute><Questionnaire /></ProtectedRoute></PageShell>} />
        <Route path="/results/:resultId" element={<InnerShell><ProtectedRoute><Results  /></ProtectedRoute></InnerShell>} />
        <Route path="/history"       element={<InnerShell><ProtectedRoute><History      /></ProtectedRoute></InnerShell>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false}
        newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
    </Router>
  );
}

export default App;
