import { useEffect, useState } from "react";
import api from "../services/api";
import "./Workout.css";

function Workout() {
  const [workouts, setWorkouts] = useState([]);
  const [members, setMembers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);

  const [form, setForm] = useState({
    memberId: "",
    workoutName: "",
    workoutDate: "",
    duration: "",
    status: "Active",
  });

  // =========================
  // LOAD WORKOUTS
  // =========================

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/workouts");

      setWorkouts(response.data || []);
    } catch (err) {
      console.error(
        "Workouts loading error:",
        err
      );

      setError(
        "Unable to load workouts."
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
    loadWorkouts();
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
    setEditingWorkout(null);

    const today = new Date()
      .toISOString()
      .split("T")[0];

    setForm({
      memberId: "",
      workoutName: "",
      workoutDate: today,
      duration: "",
      status: "Active",
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  // =========================
  // OPEN EDIT MODAL
  // =========================

  const openEditModal = (workout) => {
    setEditingWorkout(workout);

    setForm({
      memberId: workout.member?.id
        ? String(workout.member.id)
        : "",
      workoutName:
        workout.workoutName || "",
      workoutDate:
        workout.workoutDate || "",
      duration:
        workout.duration || "",
      status:
        workout.status || "Active",
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
    setEditingWorkout(null);
    setError("");
    setSuccess("");
  };

  // =========================
  // SAVE WORKOUT
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

    if (!form.workoutName.trim()) {
      setError(
        "Please enter workout name."
      );
      return;
    }

    if (!form.workoutDate) {
      setError(
        "Please select workout date."
      );
      return;
    }

    if (!form.duration.trim()) {
      setError(
        "Please enter workout duration."
      );
      return;
    }

    if (!form.status) {
      setError(
        "Please select workout status."
      );
      return;
    }

    try {
      setSaving(true);

      const workoutData = {
        workoutName:
          form.workoutName.trim(),

        workoutDate:
          form.workoutDate,

        duration:
          form.duration.trim(),

        status:
          form.status,

        member: {
          id: Number(form.memberId),
        },
      };

      if (editingWorkout) {
        await api.put(
          `/workouts/${editingWorkout.id}`,
          workoutData
        );

        setSuccess(
          "Workout updated successfully."
        );
      } else {
        await api.post(
          "/workouts",
          workoutData
        );

        setSuccess(
          "Workout added successfully."
        );
      }

      await loadWorkouts();

      setTimeout(() => {
        setShowModal(false);
        setEditingWorkout(null);
        setSuccess("");
      }, 700);

    } catch (err) {
      console.error(
        "Workout save error:",
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
          "Unable to save workout."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE WORKOUT
  // =========================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this workout?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/workouts/${id}`
      );

      setWorkouts((previous) =>
        previous.filter(
          (workout) =>
            workout.id !== id
        )
      );

      setSuccess(
        "Workout deleted successfully."
      );

      setTimeout(() => {
        setSuccess("");
      }, 2000);

    } catch (err) {
      console.error(
        "Workout delete error:",
        err
      );

      if (err.response?.status === 403) {
        setError(
          "You don't have permission to delete workouts."
        );
      } else {
        setError(
          "Unable to delete workout."
        );
      }
    }
  };

  // =========================
  // SEARCH
  // =========================

  const filteredWorkouts =
    workouts.filter((workout) => {
      const searchText =
        search.toLowerCase();

      const memberName =
        workout.member?.name || "";

      const workoutName =
        workout.workoutName || "";

      const date =
        workout.workoutDate || "";

      const duration =
        workout.duration || "";

      const status =
        workout.status || "";

      return (
        memberName
          .toLowerCase()
          .includes(searchText) ||
        workoutName
          .toLowerCase()
          .includes(searchText) ||
        date
          .toLowerCase()
          .includes(searchText) ||
        duration
          .toLowerCase()
          .includes(searchText) ||
        status
          .toLowerCase()
          .includes(searchText)
      );
    });

  return (
    <div className="workout-page">

      {/* Header */}

      <div className="workout-header">

        <div>

          <p className="page-label">
            MANAGEMENT
          </p>

          <h1>
            Workouts
          </h1>

          <p className="page-description">
            Manage workout sessions for your gym members.
          </p>

        </div>

        <button
          className="add-workout-button"
          onClick={openAddModal}
        >
          <span>+</span>
          Add Workout
        </button>

      </div>

      {/* Alerts */}

      {error && (
        <div className="workout-alert error">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {success && (
        <div className="workout-alert success">
          <span>✓</span>
          {success}
        </div>
      )}

      {/* Workout Card */}

      <section className="workout-card">

        <div className="workout-toolbar">

          <div>

            <h2>
              Workout Records
            </h2>

            <span>
              {workouts.length}{" "}
              {workouts.length === 1
                ? "workout"
                : "workouts"}
            </span>

          </div>

          <div className="workout-search">

            <span>⌕</span>

            <input
              type="text"
              placeholder="Search workouts..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

        </div>

        {/* Loading */}

        {loading ? (

          <div className="workout-loading">

            <div className="loading-spinner"></div>

            <p>
              Loading workouts...
            </p>

          </div>

        ) : filteredWorkouts.length === 0 ? (

          <div className="workout-empty">

            <div className="empty-icon">
              ◆
            </div>

            <h3>
              {search
                ? "No workouts found"
                : "No workouts yet"}
            </h3>

            <p>
              {search
                ? "Try a different search."
                : "Add your first workout session to get started."}
            </p>

            {!search && (
              <button
                className="empty-add-button"
                onClick={openAddModal}
              >
                + Add Workout
              </button>
            )}

          </div>

        ) : (

          <div className="workout-table-wrapper">

            <table className="workout-table">

              <thead>

                <tr>
                  <th>Member</th>
                  <th>Workout</th>
                  <th>Date</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {filteredWorkouts.map(
                  (workout) => (

                    <tr key={workout.id}>

                      <td>

                        <div className="workout-member">

                          <div className="member-avatar">

                            {String(
                              workout.member?.name ||
                              "M"
                            )
                              .charAt(0)
                              .toUpperCase()}

                          </div>

                          <div>

                            <strong>
                              {workout.member?.name ||
                                "Unknown Member"}
                            </strong>

                            <small>
                              ID #
                              {workout.member?.id ||
                                "—"}
                            </small>

                          </div>

                        </div>

                      </td>

                      <td>

                        <span className="workout-name">
                          {workout.workoutName ||
                            "—"}
                        </span>

                      </td>

                      <td>

                        <span className="workout-date">
                          📅{" "}
                          {workout.workoutDate ||
                            "—"}
                        </span>

                      </td>

                      <td>

                        <span className="workout-duration">
                          ⏱{" "}
                          {workout.duration ||
                            "—"}
                        </span>

                      </td>

                      <td>

                        <span
                          className={`workout-status ${
                            String(
                              workout.status
                            ).toLowerCase() ===
                            "completed"
                              ? "completed"
                              : String(
                                  workout.status
                                ).toLowerCase() ===
                                "cancelled"
                              ? "cancelled"
                              : "active"
                          }`}
                        >
                          {workout.status ||
                            "Active"}
                        </span>

                      </td>

                      <td>

                        <div className="workout-actions">

                          <button
                            className="edit-button"
                            onClick={() =>
                              openEditModal(
                                workout
                              )
                            }
                            title="Edit workout"
                          >
                            ✎
                          </button>

                          <button
                            className="delete-button"
                            onClick={() =>
                              handleDelete(
                                workout.id
                              )
                            }
                            title="Delete workout"
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
          className="workout-modal-overlay"
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

          <div className="workout-modal">

            <div className="modal-header">

              <div>

                <p>
                  {editingWorkout
                    ? "UPDATE WORKOUT"
                    : "NEW WORKOUT"}
                </p>

                <h2>
                  {editingWorkout
                    ? "Edit Workout"
                    : "Add Workout"}
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
              className="workout-form"
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

              {/* Workout Name */}

              <div className="form-group">

                <label>
                  Workout Name
                </label>

                <input
                  type="text"
                  name="workoutName"
                  placeholder="e.g. Chest Workout"
                  value={
                    form.workoutName
                  }
                  onChange={handleChange}
                  required
                />

              </div>

              {/* Date + Duration */}

              <div className="form-row">

                <div className="form-group">

                  <label>
                    Workout Date
                  </label>

                  <input
                    type="date"
                    name="workoutDate"
                    value={
                      form.workoutDate
                    }
                    onChange={handleChange}
                    required
                  />

                </div>

                <div className="form-group">

                  <label>
                    Duration
                  </label>

                  <input
                    type="text"
                    name="duration"
                    placeholder="e.g. 60 minutes"
                    value={
                      form.duration
                    }
                    onChange={handleChange}
                    required
                  />

                </div>

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

                  <option value="Active">
                    Active
                  </option>

                  <option value="Completed">
                    Completed
                  </option>

                  <option value="Cancelled">
                    Cancelled
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
                  className="save-workout-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingWorkout
                    ? "Update Workout"
                    : "Add Workout"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Workout;