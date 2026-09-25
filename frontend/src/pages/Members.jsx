import { useEffect, useState } from "react";
import api from "../services/api";
import "./Members.css";

function Members() {
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    joinDate: "",
    membershipPlanId: "",
  });

  // =========================
  // LOAD MEMBERS
  // =========================

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/members");

      setMembers(response.data || []);
    } catch (err) {
      console.error(
        "Members loading error:",
        err
      );

      setError("Unable to load members.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD MEMBERSHIP PLANS
  // =========================

  const loadPlans = async () => {
    try {
      const response = await api.get("/plans");

      setPlans(response.data || []);
    } catch (err) {
      console.error(
        "Membership plans loading error:",
        err
      );
    }
  };

  useEffect(() => {
    loadMembers();
    loadPlans();
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
    setEditingMember(null);

    setForm({
      name: "",
      email: "",
      phone: "",
      joinDate: new Date()
        .toISOString()
        .split("T")[0],
      membershipPlanId: "",
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  // =========================
  // OPEN EDIT MODAL
  // =========================

  const openEditModal = (member) => {
    setEditingMember(member);

    setForm({
      name: member.name || "",
      email: member.email || "",
      phone: member.phone || "",
      joinDate: member.joinDate || "",
      membershipPlanId:
        member.membershipPlan?.id
          ? String(member.membershipPlan.id)
          : "",
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
    setEditingMember(null);
    setError("");
    setSuccess("");
  };

  // =========================
  // SAVE MEMBER
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Name mandatory
    if (!form.name.trim()) {
      setError(
        "Please enter member name."
      );
      return;
    }

    // Phone mandatory
    if (!form.phone.trim()) {
      setError(
        "Please enter phone number."
      );
      return;
    }

    // Phone must contain exactly 10 digits
    if (
      !/^[0-9]{10}$/.test(
        form.phone.trim()
      )
    ) {
      setError(
        "Phone number must contain exactly 10 digits."
      );
      return;
    }

    // Join date mandatory
    if (!form.joinDate) {
      setError(
        "Please select join date."
      );
      return;
    }

    // Membership plan mandatory
    if (!form.membershipPlanId) {
      setError(
        "Please select a membership plan."
      );
      return;
    }

    // Email optional
    if (form.email.trim()) {
      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailPattern.test(
          form.email.trim()
        )
      ) {
        setError(
          "Please enter a valid email."
        );
        return;
      }
    }

    try {
      setSaving(true);

      const memberData = {
        name: form.name.trim(),

        email: form.email.trim()
          ? form.email.trim()
          : null,

        phone: form.phone.trim(),

        joinDate: form.joinDate,

        membershipPlan: {
          id: Number(
            form.membershipPlanId
          ),
        },
      };

      // =========================
      // UPDATE
      // =========================

      if (editingMember) {
        await api.put(
          `/members/${editingMember.id}`,
          memberData
        );

        setSuccess(
          "Member updated successfully."
        );
      }

      // =========================
      // ADD
      // =========================

      else {
        await api.post(
          "/members",
          memberData
        );

        setSuccess(
          "Member added successfully."
        );
      }

      await loadMembers();

      setTimeout(() => {
        setShowModal(false);
        setEditingMember(null);
        setSuccess("");
      }, 700);

    } catch (err) {
      console.error(
        "Member save error:",
        err
      );

      if (
        err.response?.status === 401
      ) {
        setError(
          "Your session has expired. Please login again."
        );
      } else if (
        err.response?.status === 403
      ) {
        setError(
          "You don't have permission for this action."
        );
      } else if (
        err.response?.status === 400
      ) {
        setError(
          err.response?.data?.message ||
          err.response?.data ||
          "Please check the entered details."
        );
      } else {
        setError(
          err.response?.data?.message ||
          "Unable to save member."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE MEMBER
  // =========================

  const handleDelete = async (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this member?"
      );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/members/${id}`
      );

      setMembers((previous) =>
        previous.filter(
          (member) =>
            member.id !== id
        )
      );

      setSuccess(
        "Member deleted successfully."
      );

      setTimeout(() => {
        setSuccess("");
      }, 2000);

    } catch (err) {
      console.error(
        "Member delete error:",
        err
      );

      setError(
        err.response?.status === 403
          ? "You don't have permission to delete members."
          : "Unable to delete member."
      );
    }
  };

  // =========================
  // SEARCH
  // =========================

  const filteredMembers =
    members.filter((member) => {
      const searchText =
        search.toLowerCase();

      return (
        String(
          member.name || ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          member.email || ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          member.phone || ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          member.joinDate || ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          member.membershipPlan?.name ||
            ""
        )
          .toLowerCase()
          .includes(searchText)
      );
    });

  // =========================
  // DURATION LABEL
  // =========================

  const getDurationLabel = (
    months
  ) => {
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

  return (
    <div className="members-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="members-header">

        <div>

          <p className="page-label">
            MANAGEMENT
          </p>

          <h1>
            Members
          </h1>

          <p className="page-description">
            Manage your gym members and their memberships.
          </p>

        </div>

        <button
          className="add-member-button"
          onClick={openAddModal}
        >
          <span>+</span>
          Add Member
        </button>

      </div>

      {/* =========================
          ALERTS
      ========================= */}

      {error && (
        <div className="members-alert error">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {success && (
        <div className="members-alert success">
          <span>✓</span>
          {success}
        </div>
      )}

      {/* =========================
          MEMBERS CARD
      ========================= */}

      <section className="members-card">

        <div className="members-toolbar">

          <div>

            <h2>
              All Members
            </h2>

            <span>
              {members.length}{" "}
              {members.length === 1
                ? "member"
                : "members"}
            </span>

          </div>

          <div className="member-search">

            <span>⌕</span>

            <input
              type="text"
              placeholder="Search members..."
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
            LOADING
        ========================= */}

        {loading ? (

          <div className="members-loading">

            <div className="loading-spinner"></div>

            <p>
              Loading members...
            </p>

          </div>

        ) : filteredMembers.length ===
          0 ? (

          <div className="members-empty">

            <div className="empty-icon">
              ♙
            </div>

            <h3>
              {search
                ? "No members found"
                : "No members yet"}
            </h3>

            <p>
              {search
                ? "Try a different search."
                : "Add your first gym member to get started."}
            </p>

            {!search && (
              <button
                onClick={
                  openAddModal
                }
                className="empty-add-button"
              >
                + Add Member
              </button>
            )}

          </div>

        ) : (

          <div className="members-table-wrapper">

            <table className="members-table">

              <thead>

                <tr>
                  <th>Member</th>
                  <th>Contact</th>
                  <th>Join Date</th>
                  <th>Plan</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {filteredMembers.map(
                  (member) => (

                    <tr
                      key={
                        member.id
                      }
                    >

                      {/* MEMBER */}

                      <td>

                        <div className="member-info">

                          <div className="member-avatar">

                            {String(
                              member.name ||
                                "M"
                            )
                              .charAt(0)
                              .toUpperCase()}

                          </div>

                          <div>

                            <strong>
                              {member.name}
                            </strong>

                            <small>
                              ID #{member.id}
                            </small>

                          </div>

                        </div>

                      </td>

                      {/* CONTACT */}

                      <td>

                        <div className="contact-info">

                          <span>
                            {member.email ||
                              "No email"}
                          </span>

                          <small>
                            {member.phone ||
                              "No phone"}
                          </small>

                        </div>

                      </td>

                      {/* JOIN DATE */}

                      <td>

                        <span className="plan-name">
                          {formatDate(
                            member.joinDate
                          )}
                        </span>

                      </td>

                      {/* PLAN */}

                      <td>

                        <div className="contact-info">

                          <strong>
                            {member.membershipPlan
                              ?.name ||
                              "No plan"}
                          </strong>

                          {member.membershipPlan
                            ?.durationMonths && (
                            <small>
                              {getDurationLabel(
                                member
                                  .membershipPlan
                                  .durationMonths
                              )}
                            </small>
                          )}

                        </div>

                      </td>

                      {/* ACTIONS */}

                      <td>

                        <div className="member-actions">

                          <button
                            className="edit-button"
                            onClick={() =>
                              openEditModal(
                                member
                              )
                            }
                            title="Edit member"
                          >
                            ✎
                          </button>

                          <button
                            className="delete-button"
                            onClick={() =>
                              handleDelete(
                                member.id
                              )
                            }
                            title="Delete member"
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

      {/* =========================
          ADD / EDIT MODAL
      ========================= */}

      {showModal && (

        <div
          className="member-modal-overlay"
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

          <div
            className="member-modal"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="modal-header">

              <div>

                <p>
                  {editingMember
                    ? "UPDATE MEMBER"
                    : "NEW MEMBER"}
                </p>

                <h2>
                  {editingMember
                    ? "Edit Member"
                    : "Add Member"}
                </h2>

              </div>

              <button
                className="modal-close"
                onClick={
                  closeModal
                }
                disabled={saving}
              >
                ×
              </button>

            </div>

            <form
              className="member-form"
              onSubmit={
                handleSubmit
              }
            >

              {/* =========================
                  NAME + EMAIL
              ========================= */}

              <div className="form-row">

                <div className="form-group">

                  <label>
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    placeholder="Enter member name"
                    value={
                      form.name
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>

                <div className="form-group">

                  <label>
                    Email
                    <span className="optional-label">
                      {" "}
                      Optional
                    </span>
                  </label>

                  <input
                    type="email"
                    name="email"
                    placeholder="Enter email address (optional)"
                    value={
                      form.email
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>

              </div>

              {/* =========================
                  PHONE + JOIN DATE
              ========================= */}

              <div className="form-row">

                <div className="form-group">

                  <label>
                    Phone
                  </label>

                  <input
                    type="text"
                    name="phone"
                    placeholder="Enter 10 digit phone number"
                    value={
                      form.phone
                    }
                    onChange={
                      handleChange
                    }
                    maxLength="10"
                    required
                  />

                </div>

                <div className="form-group">

                  <label>
                    Join Date
                  </label>

                  <input
                    type="date"
                    name="joinDate"
                    value={
                      form.joinDate
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>

              </div>

              {/* =========================
                  MEMBERSHIP PLAN
              ========================= */}

              <div className="form-group">

                <label>
                  Membership Plan
                </label>

                <select
                  name="membershipPlanId"
                  value={
                    form.membershipPlanId
                  }
                  onChange={
                    handleChange
                  }
                  required
                >

                  <option value="">
                    Select a membership plan
                  </option>

                  {plans.map(
                    (plan) => (

                      <option
                        key={
                          plan.id
                        }
                        value={
                          plan.id
                        }
                      >
                        {plan.name ||
                          `Plan #${plan.id}`}
                        {" — "}
                        {getDurationLabel(
                          plan.durationMonths
                        )}
                        {" — ₹"}
                        {Number(
                          plan.price ||
                            0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </option>

                    )
                  )}

                </select>

              </div>

              {/* =========================
                  ERROR
              ========================= */}

              {error && (
                <div className="modal-error">
                  ⚠️ {error}
                </div>
              )}

              {/* =========================
                  SUCCESS
              ========================= */}

              {success && (
                <div className="modal-success">
                  ✓ {success}
                </div>
              )}

              {/* =========================
                  ACTIONS
              ========================= */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={
                    closeModal
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-member-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="button-spinner"></span>
                      Saving...
                    </>
                  ) : (
                    editingMember
                      ? "Update Member"
                      : "Add Member"
                  )}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Members;