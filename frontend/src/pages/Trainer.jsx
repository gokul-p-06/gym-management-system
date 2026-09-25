import { useEffect, useState } from "react";
import api from "../services/api";
import "./Trainer.css";

function Trainer() {
  const [trainers, setTrainers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
  });

  // =========================
  // LOAD TRAINERS
  // =========================

  const loadTrainers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/trainers");

      setTrainers(response.data || []);
    } catch (err) {
      console.error(
        "Trainers loading error:",
        err
      );

      setError(
        "Unable to load trainers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrainers();
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
    setEditingTrainer(null);

    setForm({
      name: "",
      email: "",
      phone: "",
      specialization: "",
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  // =========================
  // OPEN EDIT MODAL
  // =========================

  const openEditModal = (trainer) => {
    setEditingTrainer(trainer);

    setForm({
      name: trainer.name || "",
      email: trainer.email || "",
      phone: trainer.phone || "",
      specialization:
        trainer.specialization || "",
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
    setEditingTrainer(null);
    setError("");
    setSuccess("");
  };

  // =========================
  // SAVE TRAINER
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError(
        "Please enter trainer name."
      );
      return;
    }

    if (!form.phone.trim()) {
      setError(
        "Please enter trainer phone number."
      );
      return;
    }

    if (!form.specialization.trim()) {
      setError(
        "Please enter trainer specialization."
      );
      return;
    }

    try {
      setSaving(true);

      const trainerData = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        specialization:
          form.specialization.trim(),
      };

      if (editingTrainer) {
        await api.put(
          `/trainers/${editingTrainer.id}`,
          trainerData
        );

        setSuccess(
          "Trainer updated successfully."
        );
      } else {
        await api.post(
          "/trainers",
          trainerData
        );

        setSuccess(
          "Trainer added successfully."
        );
      }

      await loadTrainers();

      setTimeout(() => {
        setShowModal(false);
        setEditingTrainer(null);
        setSuccess("");
      }, 700);

    } catch (err) {
      console.error(
        "Trainer save error:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "Only administrators can manage trainers."
        );
      } else {
        setError(
          err.response?.data?.message ||
          "Unable to save trainer."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE TRAINER
  // =========================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this trainer?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/trainers/${id}`
      );

      setTrainers((previous) =>
        previous.filter(
          (trainer) =>
            trainer.id !== id
        )
      );

      setSuccess(
        "Trainer deleted successfully."
      );

      setTimeout(() => {
        setSuccess("");
      }, 2000);

    } catch (err) {
      console.error(
        "Trainer delete error:",
        err
      );

      if (err.response?.status === 403) {
        setError(
          "Only administrators can delete trainers."
        );
      } else {
        setError(
          "Unable to delete trainer."
        );
      }
    }
  };

  // =========================
  // SEARCH
  // =========================

  const filteredTrainers =
    trainers.filter((trainer) => {
      const searchText =
        search.toLowerCase();

      return (
        String(trainer.name || "")
          .toLowerCase()
          .includes(searchText) ||
        String(trainer.email || "")
          .toLowerCase()
          .includes(searchText) ||
        String(trainer.phone || "")
          .toLowerCase()
          .includes(searchText) ||
        String(
          trainer.specialization || ""
        )
          .toLowerCase()
          .includes(searchText)
      );
    });

  return (
    <div className="trainer-page">

      {/* Header */}

      <div className="trainer-header">

        <div>

          <p className="page-label">
            MANAGEMENT
          </p>

          <h1>
            Trainers
          </h1>

          <p className="page-description">
            Manage gym trainers and their specializations.
          </p>

        </div>

        <button
          className="add-trainer-button"
          onClick={openAddModal}
        >
          <span>+</span>
          Add Trainer
        </button>

      </div>

      {/* Alerts */}

      {error && (
        <div className="trainer-alert error">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {success && (
        <div className="trainer-alert success">
          <span>✓</span>
          {success}
        </div>
      )}

      {/* Trainers Card */}

      <section className="trainer-card">

        <div className="trainer-toolbar">

          <div>

            <h2>
              All Trainers
            </h2>

            <span>
              {trainers.length}{" "}
              {trainers.length === 1
                ? "trainer"
                : "trainers"}
            </span>

          </div>

          <div className="trainer-search">

            <span>⌕</span>

            <input
              type="text"
              placeholder="Search trainers..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

        </div>

        {/* Loading */}

        {loading ? (

          <div className="trainer-loading">

            <div className="loading-spinner"></div>

            <p>
              Loading trainers...
            </p>

          </div>

        ) : filteredTrainers.length === 0 ? (

          <div className="trainer-empty">

            <div className="empty-icon">
              ♟
            </div>

            <h3>
              {search
                ? "No trainers found"
                : "No trainers yet"}
            </h3>

            <p>
              {search
                ? "Try a different search."
                : "Add your first gym trainer to get started."}
            </p>

            {!search && (
              <button
                className="empty-add-button"
                onClick={openAddModal}
              >
                + Add Trainer
              </button>
            )}

          </div>

        ) : (

          <div className="trainer-table-wrapper">

            <table className="trainer-table">

              <thead>

                <tr>
                  <th>Trainer</th>
                  <th>Contact</th>
                  <th>Specialization</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {filteredTrainers.map(
                  (trainer) => (

                    <tr
                      key={trainer.id}
                    >

                      <td>

                        <div className="trainer-info">

                          <div className="trainer-avatar">

                            {String(
                              trainer.name ||
                              "T"
                            )
                              .charAt(0)
                              .toUpperCase()}

                          </div>

                          <div>

                            <strong>
                              {trainer.name}
                            </strong>

                            <small>
                              ID #{trainer.id}
                            </small>

                          </div>

                        </div>

                      </td>

                      <td>

                        <div className="contact-info">

                          <span>
                            {trainer.email ||
                              "No email"}
                          </span>

                          <small>
                            {trainer.phone ||
                              "No phone"}
                          </small>

                        </div>

                      </td>

                      <td>

                        <span className="specialization-badge">
                          {trainer.specialization ||
                            "Not specified"}
                        </span>

                      </td>

                      <td>

                        <div className="trainer-actions">

                          <button
                            className="edit-button"
                            onClick={() =>
                              openEditModal(
                                trainer
                              )
                            }
                            title="Edit trainer"
                          >
                            ✎
                          </button>

                          <button
                            className="delete-button"
                            onClick={() =>
                              handleDelete(
                                trainer.id
                              )
                            }
                            title="Delete trainer"
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
          className="trainer-modal-overlay"
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

          <div className="trainer-modal">

            <div className="modal-header">

              <div>

                <p>
                  {editingTrainer
                    ? "UPDATE TRAINER"
                    : "NEW TRAINER"}
                </p>

                <h2>
                  {editingTrainer
                    ? "Edit Trainer"
                    : "Add Trainer"}
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
              className="trainer-form"
              onSubmit={handleSubmit}
            >

              <div className="form-row">

                <div className="form-group">

                  <label>
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    placeholder="Enter trainer name"
                    value={form.name}
                    onChange={handleChange}
                  />

                </div>

                <div className="form-group">

                  <label>
                    Email (Optional)
                  </label>

                  <input
                    type="email"
                    name="email"
                    placeholder="Enter email address (optional)"
                    value={form.email}
                    onChange={handleChange}
                  />

                </div>

              </div>

              <div className="form-row">

                <div className="form-group">

                  <label>
                    Phone
                  </label>

                  <input
                    type="text"
                    name="phone"
                    placeholder="Enter phone number"
                    value={form.phone}
                    onChange={handleChange}
                  />

                </div>

                <div className="form-group">

                  <label>
                    Specialization
                  </label>

                  <input
                    type="text"
                    name="specialization"
                    placeholder="e.g. Strength Training"
                    value={
                      form.specialization
                    }
                    onChange={handleChange}
                  />

                </div>

              </div>

              {error && (
                <div className="modal-error">
                  ⚠️ {error}
                </div>
              )}

              {success && (
                <div className="modal-success">
                  ✓ {success}
                </div>
              )}

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
                  className="save-trainer-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingTrainer
                    ? "Update Trainer"
                    : "Add Trainer"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Trainer;