import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import MembershipPlans from "./pages/MembershipPlans";
import Attendance from "./pages/Attendance";
import Workout from "./pages/Workout";
import Payment from "./pages/Payment";
import Equipment from "./pages/Equipment";
import Trainer from "./pages/Trainer";
import Portfolio from "./pages/Portfolio";
import FeeActivity from "./pages/FeeActivity";

// =========================
// PROTECTED ROUTE
// =========================

function ProtectedRoute({ children }) {

  const token =
    localStorage.getItem("token");

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}

// =========================
// APP
// =========================

function App() {

  return (
    <BrowserRouter>

      <Routes>

        {/* =========================
            PUBLIC WEBSITE
        ========================= */}

        <Route
          path="/"
          element={
            <Navigate
              to="/portfolio"
              replace
            />
          }
        />

        <Route
          path="/portfolio"
          element={<Portfolio />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        {/* =========================
            ADMIN AREA
        ========================= */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/members"
          element={
            <ProtectedRoute>
              <Members />
            </ProtectedRoute>
          }
        />

        <Route
          path="/membership-plans"
          element={
            <ProtectedRoute>
              <MembershipPlans />
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <Attendance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/workouts"
          element={
            <ProtectedRoute>
              <Workout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />

        {/* =========================
            FEE ACTIVITY
        ========================= */}

        <Route
          path="/fee-activity"
          element={
            <ProtectedRoute>
              <FeeActivity />
            </ProtectedRoute>
          }
        />

        <Route
          path="/equipment"
          element={
            <ProtectedRoute>
              <Equipment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trainers"
          element={
            <ProtectedRoute>
              <Trainer />
            </ProtectedRoute>
          }
        />

        {/* =========================
            UNKNOWN ROUTES
        ========================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/portfolio"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;