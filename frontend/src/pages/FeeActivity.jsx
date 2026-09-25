import { useEffect, useState } from "react";
import api from "../services/api";
import "./FeeActivity.css";

function FeeActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // =========================
  // ACTIVE FILTER
  // =========================

  const [activeFilter, setActiveFilter] =
    useState("ALL");

  // =========================
  // LOAD FEE ACTIVITY
  // =========================

  const loadFeeActivity = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/fee-activity");

      setActivities(response.data || []);

    } catch (err) {
      console.error(
        "Fee activity loading error:",
        err
      );

      if (err.response?.status === 403) {
        setError(
          "You don't have permission to view fee activity."
        );
      } else {
        setError(
          "Unable to load fee activity."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeeActivity();
  }, []);

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (date) => {
    if (!date) return "—";

    try {
      return new Date(
        `${date}T00:00:00`
      ).toLocaleDateString(
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
  // DURATION LABEL
  // =========================

  const getDurationLabel = (months) => {
    const value = Number(months);

    if (value === 1) {
      return "Monthly";
    }

    if (value === 3) {
      return "3 Months";
    }

    if (value === 6) {
      return "6 Months";
    }

    if (value === 12) {
      return "Yearly";
    }

    return `${value} Months`;
  };

  // =========================
  // STATUS
  // =========================

  const getStatus = (activity) => {
    return String(
      activity.status || ""
    ).toUpperCase();
  };

  // =========================
  // COUNTS
  // =========================

  const paidCount =
    activities.filter(
      (activity) =>
        getStatus(activity) === "PAID"
    ).length;

  const pendingCount =
    activities.filter(
      (activity) =>
        getStatus(activity) === "PENDING"
    ).length;

  const upcomingCount =
    activities.filter(
      (activity) =>
        getStatus(activity) === "UPCOMING"
    ).length;

  const dueTodayCount =
    activities.filter(
      (activity) =>
        getStatus(activity) === "DUE TODAY"
    ).length;

  // =========================
  // FILTER
  // =========================

  const filteredActivities =
    activities.filter((activity) => {

      const status =
        getStatus(activity);

      // STATUS FILTER
      if (
        activeFilter !== "ALL" &&
        status !== activeFilter
      ) {
        return false;
      }

      // SEARCH FILTER
      const searchText =
        search
          .toLowerCase()
          .trim();

      if (!searchText) {
        return true;
      }

      return (
        String(
          activity.memberName || ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          activity.phone || ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          activity.planName || ""
        )
          .toLowerCase()
          .includes(searchText) ||

        status
          .toLowerCase()
          .includes(searchText)
      );
    });

  // =========================
  // FILTER CLICK
  // =========================

  const handleFilterClick = (
    filter
  ) => {

    /*
     * Same card click pannina
     * filter remove aagum.
     */
    if (activeFilter === filter) {
      setActiveFilter("ALL");
      return;
    }

    setActiveFilter(filter);
  };

  // =========================
  // STATUS CLASS
  // =========================

  const getStatusClass = (status) => {

    if (status === "PAID") {
      return "fee-status paid";
    }

    if (status === "PENDING") {
      return "fee-status pending";
    }

    if (status === "DUE TODAY") {
      return "fee-status due-today";
    }

    if (status === "UPCOMING") {
      return "fee-status upcoming";
    }

    return "fee-status";
  };

  // =========================
  // STATUS ICON
  // =========================

  const getStatusIcon = (status) => {

    if (status === "PAID") {
      return "✓";
    }

    if (status === "PENDING") {
      return "!";
    }

    if (status === "DUE TODAY") {
      return "●";
    }

    if (status === "UPCOMING") {
      return "○";
    }

    return "•";
  };

  return (
    <div className="fee-activity-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="fee-activity-header">

        <div>

          <p className="page-label">
            PAYMENTS
          </p>

          <h1>
            Fees Activity
          </h1>

          <p className="page-description">
            View membership fee dates,
            payments and pending fees.
          </p>

        </div>

      </div>

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div className="fee-activity-alert">
          ⚠️ {error}
        </div>
      )}

      {/* =========================
          SUMMARY
      ========================= */}

      <div className="fee-summary-grid">

        {/* TOTAL */}

        <button
          type="button"
          className={`fee-summary-card ${
            activeFilter === "ALL"
              ? "active"
              : ""
          }`}
          onClick={() =>
            handleFilterClick("ALL")
          }
        >

          <div className="fee-summary-icon">
            👥
          </div>

          <div>

            <span>
              Total Members
            </span>

            <strong>
              {activities.length}
            </strong>

          </div>

        </button>

        {/* PAID */}

        <button
          type="button"
          className={`fee-summary-card ${
            activeFilter === "PAID"
              ? "active"
              : ""
          }`}
          onClick={() =>
            handleFilterClick("PAID")
          }
        >

          <div className="fee-summary-icon paid">
            ✓
          </div>

          <div>

            <span>
              Paid
            </span>

            <strong>
              {paidCount}
            </strong>

          </div>

        </button>

        {/* PENDING */}

        <button
          type="button"
          className={`fee-summary-card ${
            activeFilter === "PENDING"
              ? "active"
              : ""
          }`}
          onClick={() =>
            handleFilterClick("PENDING")
          }
        >

          <div className="fee-summary-icon pending">
            !
          </div>

          <div>

            <span>
              Pending
            </span>

            <strong>
              {pendingCount}
            </strong>

          </div>

        </button>

        {/* UPCOMING */}

        <button
          type="button"
          className={`fee-summary-card ${
            activeFilter === "UPCOMING"
              ? "active"
              : ""
          }`}
          onClick={() =>
            handleFilterClick("UPCOMING")
          }
        >

          <div className="fee-summary-icon upcoming">
            ○
          </div>

          <div>

            <span>
              Upcoming
            </span>

            <strong>
              {upcomingCount}
            </strong>

          </div>

        </button>

        {/* DUE TODAY */}

        <button
          type="button"
          className={`fee-summary-card ${
            activeFilter === "DUE TODAY"
              ? "active"
              : ""
          }`}
          onClick={() =>
            handleFilterClick("DUE TODAY")
          }
        >

          <div className="fee-summary-icon due-today">
            ●
          </div>

          <div>

            <span>
              Due Today
            </span>

            <strong>
              {dueTodayCount}
            </strong>

          </div>

        </button>

      </div>

      {/* =========================
          MAIN CARD
      ========================= */}

      <section className="fee-activity-card">

        <div className="fee-activity-toolbar">

          <div>

            <h2>
              Fee Activity
            </h2>

            <span>

              {filteredActivities.length}{" "}

              {filteredActivities.length === 1
                ? "member"
                : "members"}

              {activeFilter !== "ALL" &&
                ` • ${activeFilter}`}

            </span>

          </div>

          {/* SEARCH */}

          <div className="fee-search">

            <span>
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search member..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>

        </div>

        {/* =========================
            ACTIVE FILTER
        ========================= */}

        {activeFilter !== "ALL" && (

          <div
            style={{
              padding:
                "12px 24px",
              background:
                "#f8fafc",
              borderBottom:
                "1px solid #e5e7eb",
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "space-between",
              gap: "10px",
            }}
          >

            <span
              style={{
                fontSize:
                  "13px",
                color:
                  "#4b5563",
              }}
            >
              Showing{" "}
              <strong>
                {activeFilter}
              </strong>{" "}
              members only
            </span>

            <button
              type="button"
              onClick={() =>
                setActiveFilter("ALL")
              }
              style={{
                border:
                  "none",
                background:
                  "transparent",
                color:
                  "#374151",
                cursor:
                  "pointer",
                fontSize:
                  "12px",
                fontWeight:
                  "700",
              }}
            >
              Clear Filter ×
            </button>

          </div>

        )}

        {/* =========================
            LOADING
        ========================= */}

        {loading ? (

          <div className="fee-activity-loading">

            <div className="loading-spinner"></div>

            <p>
              Loading fee activity...
            </p>

          </div>

        ) : filteredActivities.length === 0 ? (

          <div className="fee-activity-empty">

            <div className="empty-icon">
              💳
            </div>

            <h3>
              {activeFilter !== "ALL"
                ? `No ${activeFilter.toLowerCase()} members`
                : search
                ? "No members found"
                : "No fee activity"}
            </h3>

            <p>

              {activeFilter !== "ALL"
                ? "There are no members in this category."
                : search
                ? "Try a different search."
                : "Fee activity will appear here."}

            </p>

          </div>

        ) : (

          <div className="fee-table-wrapper">

            <table className="fee-activity-table">

              <thead>

                <tr>

                  <th>
                    Member
                  </th>

                  <th>
                    Plan
                  </th>

                  <th>
                    Join Date
                  </th>

                  <th>
                    Fee Date
                  </th>

                  <th>
                    Amount
                  </th>

                  <th>
                    Payment Date
                  </th>

                  <th>
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredActivities.map(
                  (activity) => {

                    const status =
                      getStatus(activity);

                    return (
                      <tr
                        key={
                          activity.memberId
                        }
                      >

                        {/* MEMBER */}

                        <td>

                          <div className="fee-member-info">

                            <div className="fee-member-avatar">

                              {String(
                                activity.memberName ||
                                  "M"
                              )
                                .charAt(0)
                                .toUpperCase()}

                            </div>

                            <div>

                              <strong>
                                {
                                  activity.memberName
                                }
                              </strong>

                              <small>
                                {activity.phone ||
                                  "No phone"}
                              </small>

                            </div>

                          </div>

                        </td>

                        {/* PLAN */}

                        <td>

                          <div className="fee-plan-info">

                            <strong>
                              {
                                activity.planName
                              }
                            </strong>

                            <small>
                              {getDurationLabel(
                                activity.durationMonths
                              )}
                            </small>

                          </div>

                        </td>

                        {/* JOIN DATE */}

                        <td>

                          <span className="fee-date">
                            {formatDate(
                              activity.joinDate
                            )}
                          </span>

                        </td>

                        {/* FEE DATE */}

                        <td>

                          <span className="fee-date">
                            {formatDate(
                              activity.feeDate
                            )}
                          </span>

                        </td>

                        {/* AMOUNT */}

                        <td>

                          <strong className="fee-amount">

                            ₹
                            {Number(
                              activity.amount ||
                                0
                            ).toLocaleString(
                              "en-IN"
                            )}

                          </strong>

                        </td>

                        {/* PAYMENT DATE */}

                        <td>

                          <span className="fee-date">

                            {activity.paymentDate
                              ? formatDate(
                                  activity.paymentDate
                                )
                              : "—"}

                          </span>

                        </td>

                        {/* STATUS */}

                        <td>

                          <span
                            className={getStatusClass(
                              status
                            )}
                          >

                            <span>
                              {getStatusIcon(
                                status
                              )}
                            </span>

                            {status}

                          </span>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </div>
  );
}

export default FeeActivity;