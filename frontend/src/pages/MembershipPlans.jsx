import { useEffect, useState } from "react";
import api from "../services/api";
import "./MembershipPlans.css";

function MembershipPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    durationMonths: "",
    price: "",
    description: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // ROLE
  // =========================

  const token = localStorage.getItem("token");

  const getRoleFromToken = () => {
    try {
      if (!token) return "";

      const payload = JSON.parse(
        atob(token.split(".")[1])
      );

      return String(payload.role || "")
        .replace("ROLE_", "")
        .toUpperCase();

    } catch (error) {
      return "";
    }
  };

  const role = getRoleFromToken();
  const isAdmin = role === "ADMIN";

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
  // LOAD PLANS
  // =========================

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/plans");

      setPlans(response.data || []);

    } catch (error) {
      console.error(
        "Membership plans loading error:",
        error
      );

      if (error.response?.status === 403) {
        setError(
          "You don't have permission to view membership plans."
        );
      } else {
        setError(
          "Unable to load membership plans."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  // =========================
  // OPEN ADD MODAL
  // =========================

  const openAddModal = () => {

    if (!isAdmin) return;

    setEditingPlan(null);

    setFormData({
      name: "",
      durationMonths: "",
      price: "",
      description: "",
    });

    setError("");
    setShowModal(true);
  };

  // =========================
  // OPEN EDIT MODAL
  // =========================

  const openEditModal = (plan) => {

    if (!isAdmin) return;

    setEditingPlan(plan);

    setFormData({
      name: plan.name || "",
      durationMonths:
        plan.durationMonths
          ? String(plan.durationMonths)
          : "",
      price: plan.price ?? "",
      description: plan.description || "",
    });

    setError("");
    setShowModal(true);
  };

  // =========================
  // CLOSE MODAL
  // =========================

  const closeModal = () => {

    if (saving) return;

    setShowModal(false);
    setEditingPlan(null);
    setError("");
  };

  // =========================
  // FORM CHANGE
  // =========================

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // SAVE PLAN
  // =========================

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!isAdmin) {
      setError(
        "Only the administrator can manage membership plans."
      );
      return;
    }

    setError("");

    if (!formData.name.trim()) {
      setError("Please enter plan name.");
      return;
    }

    if (
      !formData.durationMonths ||
      Number(formData.durationMonths) <= 0
    ) {
      setError("Please select a valid duration.");
      return;
    }

    if (
      formData.price === "" ||
      Number(formData.price) < 0
    ) {
      setError("Please enter a valid price.");
      return;
    }

    try {

      setSaving(true);

      const planData = {
        name: formData.name.trim(),

        durationMonths:
          Number(formData.durationMonths),

        price: Number(formData.price),

        description:
          formData.description.trim(),
      };

      if (editingPlan) {

        await api.put(
          `/plans/${editingPlan.id}`,
          planData
        );

      } else {

        await api.post(
          "/plans",
          planData
        );
      }

      setShowModal(false);
      setEditingPlan(null);

      await loadPlans();

    } catch (error) {

      console.error(
        editingPlan
          ? "Update plan error:"
          : "Add plan error:",
        error
      );

      if (error.response?.status === 401) {

        setError(
          "Your session has expired. Please login again."
        );

      } else if (
        error.response?.status === 403
      ) {

        setError(
          "Only the administrator can manage membership plans."
        );

      } else {

        setError(
          editingPlan
            ? "Unable to update membership plan."
            : "Unable to create membership plan."
        );
      }

    } finally {

      setSaving(false);
    }
  };

  // =========================
  // DELETE PLAN
  // =========================

  const handleDelete = async (id) => {

    if (!isAdmin) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this membership plan?"
    );

    if (!confirmed) return;

    try {

      setError("");

      await api.delete(
        `/plans/${id}`
      );

      await loadPlans();

    } catch (error) {

      console.error(
        "Delete plan error:",
        error
      );

      if (error.response?.status === 401) {

        window.alert(
          "Your session has expired. Please login again."
        );

      } else if (
        error.response?.status === 403
      ) {

        window.alert(
          "Only the administrator can delete membership plans."
        );

      } else {

        window.alert(
          "Unable to delete membership plan."
        );
      }
    }
  };

  return (
    <div className="membership-plans-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="plans-header">

        <div>

          <p className="page-label">
            MEMBERSHIP
          </p>

          <h1>
            Membership Plans
          </h1>

          <p className="page-description">
            Manage your gym membership plans and pricing.
          </p>

        </div>

        {isAdmin && (
          <button
            className="add-plan-button"
            onClick={openAddModal}
          >
            <span>+</span>
            Add Plan
          </button>
        )}

      </div>

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div className="plans-error">
          ⚠️ {error}
        </div>
      )}

      {/* =========================
          PLANS CARD
      ========================= */}

      <section className="plans-card">

        <div className="plans-toolbar">

          <div>

            <h2>
              Available Plans
            </h2>

            <span>
              {plans.length}{" "}
              {plans.length === 1
                ? "plan"
                : "plans"}
            </span>

          </div>

        </div>

        {/* =========================
            LOADING
        ========================= */}

        {loading ? (

          <div className="plans-loading">

            <div className="loading-spinner"></div>

            <p>
              Loading membership plans...
            </p>

          </div>

        ) : plans.length === 0 ? (

          <div className="plans-empty">

            <div className="empty-icon">
              ◈
            </div>

            <h3>
              No membership plans yet
            </h3>

            <p>
              {isAdmin
                ? "Create your first membership plan."
                : "No membership plans are available."}
            </p>

            {isAdmin && (
              <button
                className="empty-add-button"
                onClick={openAddModal}
              >
                + Add Plan
              </button>
            )}

          </div>

        ) : (

          <div className="plans-grid">

            {plans.map((plan) => (

              <div
                className="plan-card"
                key={plan.id}
              >

                <div className="plan-icon">
                  ◈
                </div>

                <div className="plan-content">

                  <h3>
                    {plan.name}
                  </h3>

                  <p>
                    {plan.description ||
                      "Membership Plan"}
                  </p>

                  <div className="plan-details">

                    <span>
                      📅{" "}
                      {getDurationLabel(
                        plan.durationMonths
                      )}
                    </span>

                    <strong>
                      ₹
                      {Number(
                        plan.price
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                  </div>

                </div>

                {/* =========================
                    ADMIN ACTIONS
                ========================= */}

                {isAdmin && (
                  <div className="plan-actions">

                    <button
                      className="edit-plan-button"
                      onClick={() =>
                        openEditModal(plan)
                      }
                      title="Edit plan"
                    >
                      ✏️
                    </button>

                    <button
                      className="delete-plan-button"
                      onClick={() =>
                        handleDelete(plan.id)
                      }
                      title="Delete plan"
                    >
                      🗑️
                    </button>

                  </div>
                )}

              </div>

            ))}

          </div>
        )}

      </section>

      {/* =========================
          ADD / EDIT MODAL
      ========================= */}

      {showModal && isAdmin && (

        <div
          className="modal-overlay"
          onMouseDown={(e) => {

            if (
              e.target === e.currentTarget &&
              !saving
            ) {
              closeModal();
            }

          }}
        >

          <div
            className="plan-modal"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>

                <p className="page-label">
                  {editingPlan
                    ? "EDIT PLAN"
                    : "NEW PLAN"}
                </p>

                <h2>
                  {editingPlan
                    ? "Edit Membership Plan"
                    : "Add Membership Plan"}
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
              onSubmit={handleSubmit}
            >

              {/* PLAN NAME */}

              <div className="form-group">

                <label>
                  Plan Name
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Monthly"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

              </div>

              {/* DURATION + PRICE */}

              <div className="form-row">

                <div className="form-group">

                  <label>
                    Duration
                  </label>

                  <select
                    name="durationMonths"
                    value={
                      formData.durationMonths
                    }
                    onChange={handleChange}
                    required
                  >

                    <option value="">
                      Select duration
                    </option>

                    <option value="1">
                      Monthly
                    </option>

                    <option value="3">
                      3 Months
                    </option>

                    <option value="6">
                      6 Months
                    </option>

                    <option value="12">
                      Yearly
                    </option>

                  </select>

                </div>

                <div className="form-group">

                  <label>
                    Price (₹)
                  </label>

                  <input
                    type="number"
                    name="price"
                    placeholder="1500"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

              {/* DESCRIPTION */}

              <div className="form-group">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  placeholder="Enter plan description"
                  rows="4"
                  value={
                    formData.description
                  }
                  onChange={handleChange}
                ></textarea>

              </div>

              {/* ERROR */}

              {error && (
                <div className="modal-error">
                  ⚠️ {error}
                </div>
              )}

              {/* BUTTONS */}

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
                  className="save-plan-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingPlan
                    ? "Update Plan"
                    : "Add Plan"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default MembershipPlans;