import { useEffect, useState } from "react";
import api from "../services/api";
import "./Attendance.css";

function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [members, setMembers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingAttendance, setEditingAttendance] =
    useState(null);

  const [form, setForm] = useState({
    memberId: "",
    attendanceDate: "",
    status: "Present",
  });

  // =========================
  // LOAD ATTENDANCE
  // =========================

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/attendance");

      setAttendance(response.data || []);
    } catch (err) {
      console.error(
        "Attendance loading error:",
        err
      );

      setError(
        "Unable to load attendance."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD MEMBERS
  // =========================

  const loadMembers = async () => {
    try {
      const response = await api.get("/members");

      setMembers(response.data || []);
    } catch (err) {
      console.error(
        "Members loading error:",
        err
      );
    }
  };

  useEffect(() => {
    loadAttendance();
    loadMembers();
  }, []);

  // =========================
  // FORM INPUT
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // OPEN ADD MODAL
  // =========================

  const openAddModal = () => {
    setEditingAttendance(null);

    const today = new Date()
      .toISOString()
      .split("T")[0];

    setForm({
      memberId: "",
      attendanceDate: today,
      status: "Present",
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  // =========================
  // OPEN EDIT MODAL
  // =========================

  const openEditModal = (item) => {
    setEditingAttendance(item);

    setForm({
      memberId: item.member?.id
        ? String(item.member.id)
        : "",
      attendanceDate:
        item.attendanceDate || "",
      status:
        item.status || "Present",
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  // =========================
  // CLOSE MODAL
  // =========================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingAttendance(null);
    setError("");
    setSuccess("");
  };

  // =========================
  // SAVE ATTENDANCE
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.memberId) {
      setError(
        "Please select a member."
      );
      return;
    }

    if (!form.attendanceDate) {
      setError(
        "Please select attendance date."
      );
      return;
    }

    if (!form.status) {
      setError(
        "Please select attendance status."
      );
      return;
    }

    try {
      setSaving(true);

      const attendanceData = {
        attendanceDate:
          form.attendanceDate,

        status: form.status,

        member: {
          id: Number(form.memberId),
        },
      };

      if (editingAttendance) {
        await api.put(
          `/attendance/${editingAttendance.id}`,
          attendanceData
        );

        setSuccess(
          "Attendance updated successfully."
        );
      } else {
        await api.post(
          "/attendance",
          attendanceData
        );

        setSuccess(
          "Attendance added successfully."
        );
      }

      await loadAttendance();

      setTimeout(() => {
        setShowModal(false);
        setEditingAttendance(null);
        setSuccess("");
      }, 700);

    } catch (err) {
      console.error(
        "Attendance save error:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You don't have permission for this action."
        );
      } else {
        setError(
          err.response?.data?.message ||
          "Unable to save attendance."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE ATTENDANCE
  // =========================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this attendance record?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/attendance/${id}`
      );

      setAttendance((previous) =>
        previous.filter(
          (item) => item.id !== id
        )
      );

      setSuccess(
        "Attendance deleted successfully."
      );

      setTimeout(() => {
        setSuccess("");
      }, 2000);

    } catch (err) {
      console.error(
        "Attendance delete error:",
        err
      );

      if (err.response?.status === 403) {
        setError(
          "You don't have permission to delete attendance."
        );
      } else {
        setError(
          "Unable to delete attendance."
        );
      }
    }
  };

  // =========================
  // SEARCH
  // =========================

  const filteredAttendance =
    attendance.filter((item) => {
      const searchText =
        search.toLowerCase();

      const memberName =
        item.member?.name || "";

      const status =
        item.status || "";

      const date =
        item.attendanceDate || "";

      return (
        memberName
          .toLowerCase()
          .includes(searchText) ||
        status
          .toLowerCase()
          .includes(searchText) ||
        date
          .toLowerCase()
          .includes(searchText)
      );
    });

  return (
    <div className="attendance-page">

      {/* Header */}

      <div className="attendance-header">

        <div>

          <p className="page-label">
            MANAGEMENT
          </p>

          <h1>
            Attendance
          </h1>

          <p className="page-description">
            Track and manage daily gym attendance.
          </p>

        </div>

        <button
          className="add-attendance-button"
          onClick={openAddModal}
        >
          <span>+</span>
          Mark Attendance
        </button>

      </div>

      {/* Alerts */}

      {error && (
        <div className="attendance-alert error">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {success && (
        <div className="attendance-alert success">
          <span>✓</span>
          {success}
        </div>
      )}

      {/* Attendance Card */}

      <section className="attendance-card">

        <div className="attendance-toolbar">

          <div>

            <h2>
              Attendance Records
            </h2>

            <span>
              {attendance.length}{" "}
              {attendance.length === 1
                ? "record"
                : "records"}
            </span>

          </div>

          <div className="attendance-search">

            <span>⌕</span>

            <input
              type="text"
              placeholder="Search attendance..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

        </div>

        {/* Loading */}

        {loading ? (

          <div className="attendance-loading">

            <div className="loading-spinner"></div>

            <p>
              Loading attendance...
            </p>

          </div>

        ) : filteredAttendance.length === 0 ? (

          <div className="attendance-empty">

            <div className="empty-icon">
              ✓
            </div>

            <h3>
              {search
                ? "No attendance found"
                : "No attendance records yet"}
            </h3>

            <p>
              {search
                ? "Try a different search."
                : "Mark attendance for your gym members."}
            </p>

            {!search && (
              <button
                className="empty-add-button"
                onClick={openAddModal}
              >
                + Mark Attendance
              </button>
            )}

          </div>

        ) : (

          <div className="attendance-table-wrapper">

            <table className="attendance-table">

              <thead>

                <tr>
                  <th>Member</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {filteredAttendance.map(
                  (item) => (

                    <tr key={item.id}>

                      <td>

                        <div className="attendance-member">

                          <div className="member-avatar">

                            {String(
                              item.member?.name ||
                              "M"
                            )
                              .charAt(0)
                              .toUpperCase()}

                          </div>

                          <div>

                            <strong>
                              {item.member?.name ||
                                "Unknown Member"}
                            </strong>

                            <small>
                              ID #
                              {item.member?.id ||
                                "—"}
                            </small>

                          </div>

                        </div>

                      </td>

                      <td>

                        <span className="attendance-date">

                          📅{" "}
                          {item.attendanceDate ||
                            "—"}

                        </span>

                      </td>

                      <td>

                        <span
                          className={`status-badge ${
                            String(
                              item.status
                            ).toLowerCase() ===
                            "present"
                              ? "present"
                              : "absent"
                          }`}
                        >
                          {String(
                            item.status
                          ).toLowerCase() ===
                          "present"
                            ? "✓ Present"
                            : "✕ Absent"}
                        </span>

                      </td>

                      <td>

                        <div className="attendance-actions">

                          <button
                            className="edit-button"
                            onClick={() =>
                              openEditModal(
                                item
                              )
                            }
                            title="Edit attendance"
                          >
                            ✎
                          </button>

                          <button
                            className="delete-button"
                            onClick={() =>
                              handleDelete(
                                item.id
                              )
                            }
                            title="Delete attendance"
                          >
                            🗑
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>

      {/* Add / Edit Modal */}

      {showModal && (

        <div
          className="attendance-modal-overlay"
          onMouseDown={(e) => {

            if (
              e.target ===
                e.currentTarget &&
              !saving
            ) {
              closeModal();
            }

          }}
        >

          <div className="attendance-modal">

            <div className="modal-header">

              <div>

                <p>
                  {editingAttendance
                    ? "UPDATE ATTENDANCE"
                    : "NEW ATTENDANCE"}
                </p>

                <h2>
                  {editingAttendance
                    ? "Edit Attendance"
                    : "Mark Attendance"}
                </h2>

              </div>

              <button
                className="modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>

            </div>

            <form
              className="attendance-form"
              onSubmit={handleSubmit}
            >

              {/* Member */}

              <div className="form-group">

                <label>
                  Member
                </label>

                <select
                  name="memberId"
                  value={form.memberId}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select a member
                  </option>

                  {members.map(
                    (member) => (

                      <option
                        key={member.id}
                        value={member.id}
                      >
                        {member.name}
                      </option>

                    )
                  )}

                </select>

              </div>

              {/* Date */}

              <div className="form-group">

                <label>
                  Attendance Date
                </label>

                <input
                  type="date"
                  name="attendanceDate"
                  value={
                    form.attendanceDate
                  }
                  onChange={handleChange}
                  required
                />

              </div>

              {/* Status */}

              <div className="form-group">

                <label>
                  Status
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  required
                >

                  <option value="Present">
                    Present
                  </option>

                  <option value="Absent">
                    Absent
                  </option>

                </select>

              </div>

              {/* Modal Error */}

              {error && (
                <div className="modal-error">
                  ⚠️ {error}
                </div>
              )}

              {/* Modal Success */}

              {success && (
                <div className="modal-success">
                  ✓ {success}
                </div>
              )}

              {/* Actions */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-attendance-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingAttendance
                    ? "Update Attendance"
                    : "Mark Attendance"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Attendance;