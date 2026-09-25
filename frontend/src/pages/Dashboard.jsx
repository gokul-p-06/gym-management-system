import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [mobileMenu, setMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [stats, setStats] = useState({
    members: 0,
    workouts: 0,
    attendance: 0,
  });

  const [feeReminders, setFeeReminders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [reminderLoading, setReminderLoading] = useState(true);

  const [error, setError] = useState("");
  const [reminderError, setReminderError] = useState("");

  // =========================
  // LOAD DASHBOARD
  // =========================

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const results = await Promise.allSettled([
          api.get("/members"),
          api.get("/workouts"),
          api.get("/attendance"),
        ]);

        const [
          membersResult,
          workoutsResult,
          attendanceResult,
        ] = results;

        const members =
          membersResult.status === "fulfilled"
            ? membersResult.value.data || []
            : [];

        const workouts =
          workoutsResult.status === "fulfilled"
            ? workoutsResult.value.data || []
            : [];

        const attendance =
          attendanceResult.status === "fulfilled"
            ? attendanceResult.value.data || []
            : [];

        // =========================
        // API ERRORS
        // =========================

        if (membersResult.status === "rejected") {
          console.error(
            "MEMBERS API FAILED:",
            membersResult.reason
          );
        }

        if (workoutsResult.status === "rejected") {
          console.error(
            "WORKOUTS API FAILED:",
            workoutsResult.reason
          );
        }

        if (attendanceResult.status === "rejected") {
          console.error(
            "ATTENDANCE API FAILED:",
            attendanceResult.reason
          );
        }

        // =========================
        // TODAY ATTENDANCE
        // =========================

        const today = new Date()
          .toISOString()
          .split("T")[0];

        const todayAttendance =
          attendance.filter(
            (item) =>
              item.attendanceDate === today
          );

        const presentToday =
          todayAttendance.filter(
            (item) =>
              String(item.status).toLowerCase() ===
              "present"
          ).length;

        const attendancePercentage =
          todayAttendance.length > 0
            ? Math.round(
                (presentToday /
                  todayAttendance.length) *
                  100
              )
            : 0;

        // =========================
        // SET DASHBOARD STATS
        // =========================

        setStats({
          members: members.length,
          workouts: workouts.length,
          attendance: attendancePercentage,
        });

        // =========================
        // FAILED API MESSAGE
        // =========================

        const failedApis = [];

        if (membersResult.status === "rejected") {
          failedApis.push("Members");
        }

        if (workoutsResult.status === "rejected") {
          failedApis.push("Workouts");
        }

        if (attendanceResult.status === "rejected") {
          failedApis.push("Attendance");
        }

        if (failedApis.length > 0) {
          setError(
            `Unable to load: ${failedApis.join(", ")}`
          );
        }
      } catch (err) {
        console.error(
          "Dashboard error:",
          err
        );

        setError(
          "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // =========================
  // LOAD FEE REMINDERS
  // =========================

  useEffect(() => {
    const loadFeeReminders = async () => {
      try {
        setReminderLoading(true);
        setReminderError("");

        const response =
          await api.get("/fee-reminders");

        const reminders =
          Array.isArray(response.data)
            ? response.data
            : [];

        // Nearest fee date first
        const sortedReminders =
          [...reminders].sort(
            (a, b) =>
              Number(
                a.daysRemaining || 0
              ) -
              Number(
                b.daysRemaining || 0
              )
          );

        setFeeReminders(
          sortedReminders
        );
      } catch (err) {
        console.error(
          "Fee reminders loading error:",
          err
        );

        if (
          err.response?.status === 403
        ) {
          setReminderError(
            "You don't have permission to view fee reminders."
          );
        } else {
          setReminderError(
            "Unable to load fee reminders."
          );
        }
      } finally {
        setReminderLoading(false);
      }
    };

    loadFeeReminders();
  }, []);

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");

    navigate("/login", {
      replace: true,
    });
  };

  // =========================
  // FORMAT DATE
  // =========================

  const formatFeeDate = (date) => {
    if (!date) return "—";

    try {
      const parsedDate = new Date(
        `${date}T00:00:00`
      );

      return parsedDate.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return date;
    }
  };

  // =========================
  // GET MEMBER NAME
  // =========================

  const getMemberName = (reminder) => {
    return (
      reminder.memberName ||
      reminder.name ||
      reminder.member?.name ||
      "Unknown Member"
    );
  };

  // =========================
  // GET PLAN NAME
  // =========================

  const getPlanName = (reminder) => {
    return (
      reminder.planName ||
      reminder.membershipPlan?.name ||
      reminder.member?.membershipPlan?.name ||
      "Membership"
    );
  };

  // =========================
  // NOTIFICATION COUNT
  // =========================

  const notificationCount =
    feeReminders.filter(
      (reminder) =>
        Number(
          reminder.daysRemaining
        ) <= 2
    ).length;

  // =========================
  // NOTIFICATION TOGGLE
  // =========================

  const toggleNotifications = () => {
    setShowNotifications(
      (previous) => !previous
    );
  };

  return (
    <div className="dashboard-layout">

      {/* =========================
          MOBILE OVERLAY
      ========================= */}

      {mobileMenu && (
        <div
          className="sidebar-overlay"
          onClick={() =>
            setMobileMenu(false)
          }
        ></div>
      )}

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside
        className={`sidebar ${
          mobileMenu
            ? "sidebar-open"
            : ""
        }`}
      >

        <div className="sidebar-brand">

          <div className="sidebar-logo">
            GYM
          </div>

          <div>
            <h2>
              Team Muscle Formula
            </h2>

            <span>
              ADMIN PANEL
            </span>
          </div>

        </div>

        <nav className="sidebar-nav">

          <p className="nav-label">
            MAIN MENU
          </p>

          <button
            className="nav-item active"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <span>▦</span>
            Dashboard
          </button>

          <button
            className="nav-item"
            onClick={() =>
              navigate("/members")
            }
          >
            <span>♙</span>
            Members
          </button>

          <button
            className="nav-item"
            onClick={() =>
              navigate(
                "/membership-plans"
              )
            }
          >
            <span>◈</span>
            Membership Plans
          </button>

          <p className="nav-label">
            MANAGEMENT
          </p>

          <button
            className="nav-item"
            onClick={() =>
              navigate("/workouts")
            }
          >
            <span>◆</span>
            Workouts
          </button>

          <button
            className="nav-item"
            onClick={() =>
              navigate("/attendance")
            }
          >
            <span>✓</span>
            Attendance
          </button>

          <button
            className="nav-item"
            onClick={() =>
              navigate("/payments")
            }
          >
            <span>₹</span>
            Payments
          </button>

          <button
            className="nav-item"
            onClick={() =>
              navigate("/equipment")
            }
          >
            <span>▣</span>
            Equipment
          </button>

          <button
            className="nav-item"
            onClick={() =>
              navigate("/trainers")
            }
          >
            <span>♟</span>
            Trainers
          </button>

          <p className="nav-label">
            PROFILE
          </p>

          <button
            className="nav-item"
            onClick={() =>
              navigate("/portfolio")
            }
          >
            <span>✦</span>
            Admin Portfolio
          </button>

        </nav>

        {/* SIDEBAR USER */}

        <div className="sidebar-bottom">

          <div className="user-mini">

            <div className="user-avatar">
              G
            </div>

            <div>
              <strong>
                Gokul
              </strong>

              <span>
                Administrator
              </span>
            </div>

          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>

      {/* =========================
          MAIN CONTENT
      ========================= */}

      <main className="dashboard-main">

        {/* =========================
            TOPBAR
        ========================= */}

        <header className="dashboard-topbar">

          <button
            className="mobile-menu-button"
            onClick={() =>
              setMobileMenu(true)
            }
          >
            ☰
          </button>

          <div>

            <p className="topbar-label">
              OVERVIEW
            </p>

            <h1>
              Dashboard
            </h1>

          </div>

          <div className="topbar-right">

            {/* =========================
                NOTIFICATION BELL
            ========================= */}

            <div
              className="notification-wrapper"
              style={{
                position: "relative",
              }}
            >

              <button
                className="notification"
                onClick={
                  toggleNotifications
                }
                title="Fee reminders"
                style={{
                  border: "none",
                  background:
                    "transparent",
                  cursor: "pointer",
                  position:
                    "relative",
                }}
              >

                🔔

                {notificationCount > 0 && (
                  <span
                    style={{
                      position:
                        "absolute",
                      top: "-4px",
                      right: "-4px",
                      minWidth: "18px",
                      height: "18px",
                      borderRadius:
                        "50%",
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      fontSize: "10px",
                      fontWeight: "700",
                      background:
                        "#ef4444",
                      color:
                        "#ffffff",
                      padding:
                        "0 4px",
                    }}
                  >
                    {notificationCount > 99
                      ? "99+"
                      : notificationCount}
                  </span>
                )}

              </button>

              {/* =========================
                  NOTIFICATION DROPDOWN
              ========================= */}

              {showNotifications && (
                <div
                  style={{
                    position:
                      "absolute",
                    top: "48px",
                    right: "0",
                    width: "360px",
                    maxWidth:
                      "calc(100vw - 30px)",
                    background:
                      "#ffffff",
                    borderRadius:
                      "14px",
                    boxShadow:
                      "0 12px 35px rgba(0,0,0,0.15)",
                    border:
                      "1px solid #e5e7eb",
                    zIndex: 1000,
                    overflow:
                      "hidden",
                  }}
                >

                  {/* HEADER */}

                  <div
                    style={{
                      padding:
                        "16px 18px",
                      borderBottom:
                        "1px solid #e5e7eb",
                    }}
                  >

                    <strong
                      style={{
                        fontSize:
                          "16px",
                        color:
                          "#111827",
                      }}
                    >
                      Fee Reminders
                    </strong>

                    <div
                      style={{
                        fontSize:
                          "12px",
                        marginTop:
                          "4px",
                        color:
                          "#6b7280",
                      }}
                    >
                      Upcoming membership fees
                    </div>

                  </div>

                  {/* LOADING */}

                  {reminderLoading ? (

                    <div
                      style={{
                        padding:
                          "24px",
                        textAlign:
                          "center",
                        color:
                          "#6b7280",
                      }}
                    >
                      Loading reminders...
                    </div>

                  ) : reminderError ? (

                    <div
                      style={{
                        padding:
                          "20px",
                        color:
                          "#dc2626",
                        fontSize:
                          "13px",
                      }}
                    >
                      ⚠️{" "}
                      {reminderError}
                    </div>

                  ) : feeReminders.length === 0 ? (

                    <div
                      style={{
                        padding:
                          "24px",
                        textAlign:
                          "center",
                      }}
                    >

                      <div
                        style={{
                          fontSize:
                            "28px",
                          marginBottom:
                            "8px",
                        }}
                      >
                        ✓
                      </div>

                      <strong>
                        No upcoming fees
                      </strong>

                      <p
                        style={{
                          margin:
                            "6px 0 0",
                          fontSize:
                            "12px",
                          color:
                            "#6b7280",
                        }}
                      >
                        All memberships
                        are up to date.
                      </p>

                    </div>

                  ) : (

                    <div
                      style={{
                        maxHeight:
                          "360px",
                        overflowY:
                          "auto",
                      }}
                    >

                      {feeReminders.map(
                        (reminder) => {

                          const days =
                            Number(
                              reminder.daysRemaining
                            );

                          const isToday =
                            days === 0;

                          const isSoon =
                            days > 0 &&
                            days <= 2;

                          const memberName =
                            getMemberName(
                              reminder
                            );

                          const planName =
                            getPlanName(
                              reminder
                            );

                          return (
                            <div
                              key={
                                reminder.memberId ||
                                reminder.id ||
                                `${memberName}-${reminder.feeDate}`
                              }
                              style={{
                                padding:
                                  "14px 18px",
                                borderBottom:
                                  "1px solid #f1f5f9",
                              }}
                            >

                              <div
                                style={{
                                  display:
                                    "flex",
                                  alignItems:
                                    "flex-start",
                                  gap:
                                    "12px",
                                }}
                              >

                                {/* ICON */}

                                <div
                                  style={{
                                    width:
                                      "36px",
                                    height:
                                      "36px",
                                    borderRadius:
                                      "10px",
                                    display:
                                      "flex",
                                    alignItems:
                                      "center",
                                    justifyContent:
                                      "center",
                                    flexShrink:
                                      0,
                                    background:
                                      isToday
                                        ? "#fee2e2"
                                        : isSoon
                                        ? "#fef3c7"
                                        : "#f1f5f9",
                                  }}
                                >
                                  {isToday
                                    ? "🔴"
                                    : isSoon
                                    ? "🟡"
                                    : "📅"}
                                </div>

                                {/* DETAILS */}

                                <div
                                  style={{
                                    flex: 1,
                                    minWidth:
                                      0,
                                  }}
                                >

                                  {/* MEMBER NAME */}

                                  <strong
                                    style={{
                                      display:
                                        "block",
                                      fontSize:
                                        "14px",
                                      color:
                                        "#111827",
                                      fontWeight:
                                        "700",
                                    }}
                                  >
                                    {memberName}
                                  </strong>

                                  {/* PLAN */}

                                  <div
                                    style={{
                                      fontSize:
                                        "12px",
                                      marginTop:
                                        "3px",
                                      color:
                                        "#6b7280",
                                    }}
                                  >
                                    {planName}
                                  </div>

                                  {/* DUE MESSAGE */}

                                  <div
                                    style={{
                                      fontSize:
                                        "12px",
                                      marginTop:
                                        "5px",
                                      fontWeight:
                                        "600",
                                      color:
                                        isToday
                                          ? "#dc2626"
                                          : isSoon
                                          ? "#d97706"
                                          : "#374151",
                                    }}
                                  >
                                    {isToday
                                      ? "Fees due today"
                                      : days === 1
                                      ? "Fees due in 1 day"
                                      : `Fees due in ${days} days`}
                                  </div>

                                  {/* DATE */}

                                  <div
                                    style={{
                                      fontSize:
                                        "11px",
                                      marginTop:
                                        "3px",
                                      color:
                                        "#9ca3af",
                                    }}
                                  >
                                    📅{" "}
                                    {formatFeeDate(
                                      reminder.feeDate
                                    )}
                                  </div>

                                </div>

                              </div>

                            </div>
                          );
                        }
                      )}

                    </div>
                  )}

                  {/* FOOTER */}

                  <div
                    style={{
                      padding:
                        "10px 18px",
                      borderTop:
                        "1px solid #e5e7eb",
                    }}
                  >

                    <button
                      onClick={() => {
                        setShowNotifications(
                          false
                        );

                        navigate(
                          "/fee-activity"
                        );
                      }}
                      style={{
                        width:
                          "100%",
                        border:
                          "none",
                        background:
                          "transparent",
                        cursor:
                          "pointer",
                        fontWeight:
                          "600",
                        fontSize:
                          "13px",
                        padding:
                          "6px",
                      }}
                    >
                      View Fees Activity →
                    </button>

                  </div>

                </div>
              )}

            </div>

            {/* =========================
                USER
            ========================= */}

            <div className="topbar-user">

              <div className="user-avatar">
                G
              </div>

              <div>
                <strong>
                  Gokul
                </strong>

                <span>
                  Admin
                </span>
              </div>

            </div>

          </div>

        </header>

        {/* =========================
            WELCOME
        ========================= */}

        <section className="welcome-banner">

          <div>

            <p>
              WELCOME BACK 👋
            </p>

            <h2>
              Ready to manage your gym?
            </h2>

            <span>
              Here's what's happening with
              your gym today.
            </span>

          </div>

          <div className="welcome-icon">
            💪
          </div>

        </section>

        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div className="dashboard-error">
            ⚠️ {error}
          </div>
        )}

        {/* =========================
            STATISTICS
            NO PAYMENT AMOUNT HERE
        ========================= */}

        <section className="stats-grid">

          {/* MEMBERS */}

          <div className="stat-card">

            <div className="stat-icon members-icon">
              ♙
            </div>

            <div>

              <span>
                Total Members
              </span>

              <strong>
                {loading
                  ? "—"
                  : stats.members}
              </strong>

              <small>
                Live database data
              </small>

            </div>

          </div>

          {/* WORKOUTS */}

          <div className="stat-card">

            <div className="stat-icon workout-icon">
              ◆
            </div>

            <div>

              <span>
                Active Workouts
              </span>

              <strong>
                {loading
                  ? "—"
                  : stats.workouts}
              </strong>

              <small>
                Recorded workout sessions
              </small>

            </div>

          </div>

          {/* ATTENDANCE */}

          <div className="stat-card">

            <div className="stat-icon attendance-icon">
              ✓
            </div>

            <div>

              <span>
                Attendance
              </span>

              <strong>
                {loading
                  ? "—"
                  : `${stats.attendance}%`}
              </strong>

              <small>
                Today's attendance
              </small>

            </div>

          </div>

        </section>

        {/* =========================
            FEE REMINDER SUMMARY
        ========================= */}

        <section
          className="dashboard-card"
          style={{
            marginBottom:
              "24px",
          }}
        >

          <div className="card-header">

            <div>

              <span className="card-label">
                FEES
              </span>

              <h3>
                Upcoming Fee Reminders
              </h3>

            </div>

            <button
              onClick={() => {
                setShowNotifications(
                  false
                );

                navigate(
                  "/fee-activity"
                );
              }}
            >
              View reminders →
            </button>

          </div>

          {/* LOADING */}

          {reminderLoading ? (

            <div className="empty-state">

              <div>
                ⏳
              </div>

              <h4>
                Loading fee reminders
              </h4>

              <p>
                Checking upcoming membership fees.
              </p>

            </div>

          ) : reminderError ? (

            <div className="empty-state">

              <div>
                ⚠️
              </div>

              <h4>
                Unable to load reminders
              </h4>

              <p>
                {reminderError}
              </p>

            </div>

          ) : feeReminders.length === 0 ? (

            <div className="empty-state">

              <div>
                ✓
              </div>

              <h4>
                No upcoming fee reminders
              </h4>

              <p>
                There are no membership fees
                to show right now.
              </p>

            </div>

          ) : (

            <div className="activity-list">

              {feeReminders
                .slice(0, 5)
                .map((reminder) => {

                  const days =
                    Number(
                      reminder.daysRemaining
                    );

                  const memberName =
                    getMemberName(
                      reminder
                    );

                  return (
                    <div
                      className="activity-item"
                      key={
                        reminder.memberId ||
                        reminder.id ||
                        `${memberName}-${reminder.feeDate}`
                      }
                    >

                      <div>
                        {days === 0
                          ? "🔴"
                          : days <= 2
                          ? "🟡"
                          : "📅"}
                      </div>

                      <span>

                        <strong>
                          {memberName}
                        </strong>

                        <small>
                          {days === 0
                            ? `Fees due today — ${formatFeeDate(
                                reminder.feeDate
                              )}`
                            : `Fees due in ${days} days — ${formatFeeDate(
                                reminder.feeDate
                              )}`}
                        </small>

                      </span>

                    </div>
                  );
                })}

            </div>
          )}

        </section>

        {/* =========================
            LOWER DASHBOARD
        ========================= */}

        <section className="dashboard-grid">

          {/* MEMBERS */}

          <div className="dashboard-card">

            <div className="card-header">

              <div>

                <span className="card-label">
                  MEMBERS
                </span>

                <h3>
                  Recent Members
                </h3>

              </div>

              <button
                onClick={() =>
                  navigate("/members")
                }
              >
                View all →
              </button>

            </div>

            <div className="empty-state">

              <div>
                ♙
              </div>

              <h4>
                Member activity
              </h4>

              <p>
                Recent member activity
                will appear here.
              </p>

            </div>

          </div>

          {/* QUICK OVERVIEW */}

          <div className="dashboard-card">

            <div className="card-header">

              <div>

                <span className="card-label">
                  ACTIVITY
                </span>

                <h3>
                  Quick Overview
                </h3>

              </div>

            </div>

            <div className="activity-list">

              <div className="activity-item">

                <div>
                  👤
                </div>

                <span>

                  <strong>
                    Members
                  </strong>

                  <small>
                    Manage gym members
                  </small>

                </span>

              </div>

              <div className="activity-item">

                <div>
                  💳
                </div>

                <span>

                  <strong>
                    Payments
                  </strong>

                  <small>
                    View payment history
                  </small>

                </span>

              </div>

              <div className="activity-item">

                <div>
                  📅
                </div>

                <span>

                  <strong>
                    Attendance
                  </strong>

                  <small>
                    Monitor daily attendance
                  </small>

                </span>

              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;