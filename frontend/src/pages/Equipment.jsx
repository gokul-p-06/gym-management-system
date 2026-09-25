import { useEffect, useState } from "react";
import api from "../services/api";
import "./Equipment.css";

function Equipment() {
  const [equipment, setEquipment] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);

  const [form, setForm] = useState({
    name: "",
    category: "",
    quantity: "",
    condition: "Good",
    purchaseDate: "",
  });

  // =========================
  // LOAD EQUIPMENT
  // =========================

  const loadEquipment = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/equipment");

      setEquipment(response.data || []);
    } catch (err) {
      console.error(
        "Equipment loading error:",
        err
      );

      setError(
        "Unable to load equipment."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEquipment();
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
    setEditingEquipment(null);

    setForm({
      name: "",
      category: "",
      quantity: "",
      condition: "Good",
      purchaseDate: "",
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  // =========================
  // OPEN EDIT MODAL
  // =========================

  const openEditModal = (item) => {
    setEditingEquipment(item);

    setForm({
      name: item.name || "",
      category: item.category || "",
      quantity:
        item.quantity !== undefined &&
        item.quantity !== null
          ? String(item.quantity)
          : "",
      condition:
        item.condition || "Good",
      purchaseDate:
        item.purchaseDate || "",
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
    setEditingEquipment(null);
    setError("");
    setSuccess("");
  };

  // =========================
  // SAVE EQUIPMENT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError(
        "Please enter equipment name."
      );
      return;
    }

    if (!form.category.trim()) {
      setError(
        "Please enter equipment category."
      );
      return;
    }

    if (!form.quantity.trim()) {
      setError(
        "Please enter equipment quantity."
      );
      return;
    }

    const quantity = Number(form.quantity);

    if (
      Number.isNaN(quantity) ||
      quantity < 1
    ) {
      setError(
        "Quantity must be at least 1."
      );
      return;
    }

    try {
      setSaving(true);

      const equipmentData = {
        name: form.name.trim(),
        category: form.category.trim(),
        quantity: quantity,
        condition: form.condition,
        purchaseDate:
          form.purchaseDate,
      };

      if (editingEquipment) {
        await api.put(
          `/equipment/${editingEquipment.id}`,
          equipmentData
        );

        setSuccess(
          "Equipment updated successfully."
        );
      } else {
        await api.post(
          "/equipment",
          equipmentData
        );

        setSuccess(
          "Equipment added successfully."
        );
      }

      await loadEquipment();

      setTimeout(() => {
        setShowModal(false);
        setEditingEquipment(null);
        setSuccess("");
      }, 700);

    } catch (err) {
      console.error(
        "Equipment save error:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "Only administrators can manage equipment."
        );
      } else {
        setError(
          err.response?.data?.message ||
          "Unable to save equipment."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE EQUIPMENT
  // =========================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this equipment?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/equipment/${id}`
      );

      setEquipment((previous) =>
        previous.filter(
          (item) => item.id !== id
        )
      );

      setSuccess(
        "Equipment deleted successfully."
      );

      setTimeout(() => {
        setSuccess("");
      }, 2000);

    } catch (err) {
      console.error(
        "Equipment delete error:",
        err
      );

      if (err.response?.status === 403) {
        setError(
          "Only administrators can delete equipment."
        );
      } else {
        setError(
          "Unable to delete equipment."
        );
      }
    }
  };

  // =========================
  // SEARCH
  // =========================

  const filteredEquipment =
    equipment.filter((item) => {
      const searchText =
        search.toLowerCase();

      return (
        String(item.name || "")
          .toLowerCase()
          .includes(searchText) ||
        String(item.category || "")
          .toLowerCase()
          .includes(searchText) ||
        String(item.quantity || "")
          .toLowerCase()
          .includes(searchText) ||
        String(item.condition || "")
          .toLowerCase()
          .includes(searchText) ||
        String(item.purchaseDate || "")
          .toLowerCase()
          .includes(searchText)
      );
    });

  // =========================
  // TOTAL QUANTITY
  // =========================

  const totalQuantity =
    equipment.reduce(
      (total, item) =>
        total + Number(item.quantity || 0),
      0
    );

  return (
    <div className="equipment-page">

      {/* Header */}

      <div className="equipment-header">

        <div>

          <p className="page-label">
            MANAGEMENT
          </p>

          <h1>
            Equipment
          </h1>

          <p className="page-description">
            Manage gym equipment and inventory.
          </p>

        </div>

        <button
          className="add-equipment-button"
          onClick={openAddModal}
        >
          <span>+</span>
          Add Equipment
        </button>

      </div>

      {/* Alerts */}

      {error && (
        <div className="equipment-alert error">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {success && (
        <div className="equipment-alert success">
          <span>✓</span>
          {success}
        </div>
      )}

      {/* Summary */}

      <section className="equipment-summary">

        <div className="equipment-summary-card">

          <div className="summary-icon">
            ◆
          </div>

          <div>

            <span>
              Equipment Types
            </span>

            <strong>
              {equipment.length}
            </strong>

          </div>

        </div>

        <div className="equipment-summary-card">

          <div className="summary-icon">
            #
          </div>

          <div>

            <span>
              Total Quantity
            </span>

            <strong>
              {totalQuantity}
            </strong>

          </div>

        </div>

      </section>

      {/* Equipment Card */}

      <section className="equipment-card">

        <div className="equipment-toolbar">

          <div>

            <h2>
              Equipment Inventory
            </h2>

            <span>
              {equipment.length}{" "}
              {equipment.length === 1
                ? "item"
                : "items"}
            </span>

          </div>

          <div className="equipment-search">

            <span>⌕</span>

            <input
              type="text"
              placeholder="Search equipment..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

        </div>

        {/* Loading */}

        {loading ? (

          <div className="equipment-loading">

            <div className="loading-spinner"></div>

            <p>
              Loading equipment...
            </p>

          </div>

        ) : filteredEquipment.length === 0 ? (

          <div className="equipment-empty">

            <div className="empty-icon">
              ◆
            </div>

            <h3>
              {search
                ? "No equipment found"
                : "No equipment yet"}
            </h3>

            <p>
              {search
                ? "Try a different search."
                : "Add your first gym equipment to get started."}
            </p>

            {!search && (
              <button
                className="empty-add-button"
                onClick={openAddModal}
              >
                + Add Equipment
              </button>
            )}

          </div>

        ) : (

          <div className="equipment-table-wrapper">

            <table className="equipment-table">

              <thead>

                <tr>
                  <th>Equipment</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Condition</th>
                  <th>Purchase Date</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {filteredEquipment.map(
                  (item) => (

                    <tr
                      key={item.id}
                    >

                      <td>

                        <div className="equipment-info">

                          <div className="equipment-avatar">
                            ◆
                          </div>

                          <div>

                            <strong>
                              {item.name}
                            </strong>

                            <small>
                              ID #{item.id}
                            </small>

                          </div>

                        </div>

                      </td>

                      <td>

                        <span className="category-badge">
                          {item.category ||
                            "—"}
                        </span>

                      </td>

                      <td>

                        <span className="quantity-value">
                          {item.quantity}
                        </span>

                      </td>

                      <td>

                        <span
                          className={`condition-badge ${
                            String(
                              item.condition
                            ).toLowerCase() ===
                            "good"
                              ? "good"
                              : String(
                                  item.condition
                                ).toLowerCase() ===
                                "needs repair"
                              ? "repair"
                              : "other"
                          }`}
                        >
                          {item.condition ||
                            "—"}
                        </span>

                      </td>

                      <td>

                        <span className="purchase-date">
                          📅{" "}
                          {item.purchaseDate ||
                            "—"}
                        </span>

                      </td>

                      <td>

                        <div className="equipment-actions">

                          <button
                            className="edit-button"
                            onClick={() =>
                              openEditModal(
                                item
                              )
                            }
                            title="Edit equipment"
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
                            title="Delete equipment"
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
          className="equipment-modal-overlay"
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

          <div className="equipment-modal">

            <div className="modal-header">

              <div>

                <p>
                  {editingEquipment
                    ? "UPDATE EQUIPMENT"
                    : "NEW EQUIPMENT"}
                </p>

                <h2>
                  {editingEquipment
                    ? "Edit Equipment"
                    : "Add Equipment"}
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
              className="equipment-form"
              onSubmit={handleSubmit}
            >

              {/* Name */}

              <div className="form-group">

                <label>
                  Equipment Name
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Treadmill"
                  value={form.name}
                  onChange={handleChange}
                  required
                />

              </div>

              {/* Category */}

              <div className="form-group">

                <label>
                  Category
                </label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select category
                  </option>

                  <option value="Cardio">
                    Cardio
                  </option>

                  <option value="Strength">
                    Strength
                  </option>

                  <option value="Free Weights">
                    Free Weights
                  </option>

                  <option value="Accessories">
                    Accessories
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>

              {/* Quantity + Condition */}

              <div className="form-row">

                <div className="form-group">

                  <label>
                    Quantity
                  </label>

                  <input
                    type="number"
                    name="quantity"
                    placeholder="Enter quantity"
                    min="1"
                    step="1"
                    value={form.quantity}
                    onChange={handleChange}
                    required
                  />

                </div>

                <div className="form-group">

                  <label>
                    Condition
                  </label>

                  <select
                    name="condition"
                    value={form.condition}
                    onChange={handleChange}
                    required
                  >

                    <option value="Good">
                      Good
                    </option>

                    <option value="Needs Repair">
                      Needs Repair
                    </option>

                    <option value="Damaged">
                      Damaged
                    </option>

                    <option value="New">
                      New
                    </option>

                  </select>

                </div>

              </div>

              {/* Purchase Date */}

              <div className="form-group">

                <label>
                  Purchase Date
                </label>

                <input
                  type="date"
                  name="purchaseDate"
                  value={
                    form.purchaseDate
                  }
                  onChange={handleChange}
                />

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
                  className="save-equipment-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingEquipment
                    ? "Update Equipment"
                    : "Add Equipment"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Equipment;