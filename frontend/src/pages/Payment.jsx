import { useEffect, useState } from "react";
import api from "../services/api";
import "./Payment.css";

function Payment() {
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  // =====================================================
  // REVENUE HISTORY
  // =====================================================

  const [showRevenueHistory, setShowRevenueHistory] =
    useState(false);

  const [revenueLoading, setRevenueLoading] =
    useState(false);

  const [revenueError, setRevenueError] =
    useState("");

  const [revenue, setRevenue] = useState({
    month: "",
    monthNumber: 0,
    year: 0,
    thisMonthRevenue: 0,
    thisYearRevenue: 0,
    thisMonthPaymentCount: 0,
    thisYearPaymentCount: 0,
    monthWiseRevenue: [],
  });

  // =====================================================
  // PAYMENT FORM
  // =====================================================

  const [form, setForm] = useState({
    memberId: "",
    amount: "",
    paymentDate: "",
    paymentMethod: "Cash",
    status: "Paid",
  });

  // =====================================================
  // LOAD PAYMENTS
  // =====================================================

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/payments");

      const data =
        Array.isArray(response.data)
          ? response.data
          : [];

      setPayments(data);

    } catch (err) {
      console.error(
        "Payments loading error:",
        err
      );

      setError(
        "Unable to load payments."
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD MEMBERS
  // =====================================================

  const loadMembers = async () => {
    try {
      const response =
        await api.get("/members");

      setMembers(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (err) {
      console.error(
        "Members loading error:",
        err
      );
    }
  };

  // =====================================================
  // LOAD REVENUE
  // =====================================================

  const loadRevenue = async () => {
    try {
      setRevenueLoading(true);
      setRevenueError("");

      const response =
        await api.get("/payments/revenue");

      const data =
        response.data || {};

      setRevenue({
        month:
          data.month || "",

        monthNumber:
          Number(
            data.monthNumber || 0
          ),

        year:
          Number(
            data.year || 0
          ),

        thisMonthRevenue:
          Number(
            data.thisMonthRevenue || 0
          ),

        thisYearRevenue:
          Number(
            data.thisYearRevenue || 0
          ),

        thisMonthPaymentCount:
          Number(
            data.thisMonthPaymentCount || 0
          ),

        thisYearPaymentCount:
          Number(
            data.thisYearPaymentCount || 0
          ),

        monthWiseRevenue:
          Array.isArray(
            data.monthWiseRevenue
          )
            ? data.monthWiseRevenue
            : [],
      });

    } catch (err) {
      console.error(
        "Revenue loading error:",
        err
      );

      if (
        err.response?.status === 403
      ) {
        setRevenueError(
          "You don't have permission to view revenue."
        );
      } else {
        setRevenueError(
          "Unable to load revenue history."
        );
      }

    } finally {
      setRevenueLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadPayments();
    loadMembers();
  }, []);

  // =====================================================
  // OPEN REVENUE HISTORY
  // =====================================================

  const openRevenueHistory = async () => {
    setShowRevenueHistory(true);

    await loadRevenue();
  };

  // =====================================================
  // CLOSE REVENUE HISTORY
  // =====================================================

  const closeRevenueHistory = () => {
    if (revenueLoading) {
      return;
    }

    setShowRevenueHistory(false);
    setRevenueError("");
  };

  // =====================================================
  // FORM INPUT
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // OPEN ADD MODAL
  // =====================================================

  const openAddModal = () => {
    setEditingPayment(null);

    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    setForm({
      memberId: "",
      amount: "",
      paymentDate: today,
      paymentMethod: "Cash",
      status: "Paid",
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  // =====================================================
  // OPEN EDIT MODAL
  // =====================================================

  const openEditModal = (
    payment
  ) => {
    setEditingPayment(payment);

    setForm({
      memberId:
        payment.member?.id
          ? String(
              payment.member.id
            )
          : "",

      amount:
        payment.amount !==
          undefined &&
        payment.amount !==
          null
          ? String(
              payment.amount
            )
          : "",

      paymentDate:
        payment.paymentDate ||
        "",

      paymentMethod:
        payment.paymentMethod ||
        "Cash",

      status:
        payment.status ||
        "Paid",
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  // =====================================================
  // CLOSE PAYMENT MODAL
  // =====================================================

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingPayment(null);

    setError("");
    setSuccess("");
  };

  // =====================================================
  // SAVE PAYMENT
  // =====================================================

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.memberId) {
      setError(
        "Please select a member."
      );
      return;
    }

    if (
      !form.amount ||
      !form.amount.trim()
    ) {
      setError(
        "Please enter payment amount."
      );
      return;
    }

    const amount =
      Number(form.amount);

    if (
      Number.isNaN(amount) ||
      amount <= 0
    ) {
      setError(
        "Please enter a valid payment amount."
      );
      return;
    }

    if (!form.paymentDate) {
      setError(
        "Please select payment date."
      );
      return;
    }

    if (!form.paymentMethod) {
      setError(
        "Please select payment method."
      );
      return;
    }

    if (!form.status) {
      setError(
        "Please select payment status."
      );
      return;
    }

    try {
      setSaving(true);

      const paymentData = {
        amount: amount,

        paymentDate:
          form.paymentDate,

        paymentMethod:
          form.paymentMethod,

        status:
          form.status,

        member: {
          id:
            Number(
              form.memberId
            ),
        },
      };

      if (editingPayment) {
        await api.put(
          `/payments/${editingPayment.id}`,
          paymentData
        );

        setSuccess(
          "Payment updated successfully."
        );
      } else {
        await api.post(
          "/payments",
          paymentData
        );

        setSuccess(
          "Payment added successfully."
        );
      }

      await loadPayments();

      if (showRevenueHistory) {
        await loadRevenue();
      }

      setTimeout(() => {
        setShowModal(false);
        setEditingPayment(null);
        setSuccess("");
      }, 700);

    } catch (err) {
      console.error(
        "Payment save error:",
        err
      );

      if (
        err.response?.status ===
        401
      ) {
        setError(
          "Your session has expired. Please login again."
        );
      } else if (
        err.response?.status ===
        403
      ) {
        setError(
          "Only administrators can manage payments."
        );
      } else {
        setError(
          err.response?.data?.message ||
          "Unable to save payment."
        );
      }

    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE PAYMENT
  // =====================================================

  const handleDelete = async (
    id
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this payment?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/payments/${id}`
      );

      setPayments(
        (previous) =>
          previous.filter(
            (payment) =>
              payment.id !== id
          )
      );

      if (showRevenueHistory) {
        await loadRevenue();
      }

      setSuccess(
        "Payment deleted successfully."
      );

      setTimeout(() => {
        setSuccess("");
      }, 2000);

    } catch (err) {
      console.error(
        "Payment delete error:",
        err
      );

      if (
        err.response?.status ===
        403
      ) {
        setError(
          "Only administrators can delete payments."
        );
      } else {
        setError(
          "Unable to delete payment."
        );
      }
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredPayments =
    payments.filter(
      (payment) => {
        const searchText =
          search
            .toLowerCase()
            .trim();

        const memberName =
          payment.member?.name ||
          "";

        const amount =
          String(
            payment.amount || ""
          );

        const paymentDate =
          payment.paymentDate ||
          "";

        const paymentMethod =
          payment.paymentMethod ||
          "";

        const status =
          payment.status ||
          "";

        return (
          memberName
            .toLowerCase()
            .includes(searchText) ||
          amount
            .toLowerCase()
            .includes(searchText) ||
          paymentDate
            .toLowerCase()
            .includes(searchText) ||
          paymentMethod
            .toLowerCase()
            .includes(searchText) ||
          status
            .toLowerCase()
            .includes(searchText)
        );
      }
    );

  // =====================================================
  // PAYMENT RECORD COUNT
  // =====================================================

  const paymentRecordCount =
    payments.length;

  // =====================================================
  // FORMAT MONEY
  // =====================================================

  const formatMoney = (
    value
  ) => {
    return Number(
      value || 0
    ).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }
    );
  };

  // =====================================================
  // MONTH NAME
  // =====================================================

  const getMonthName = () => {
    if (
      !revenue.monthNumber
    ) {
      return "Current Month";
    }

    const monthIndex =
      revenue.monthNumber - 1;

    const date =
      new Date(
        revenue.year || new Date().getFullYear(),
        monthIndex,
        1
      );

    return date.toLocaleDateString(
      "en-IN",
      {
        month: "long",
      }
    );
  };

  // =====================================================
  // MONTH-WISE DATA
  // =====================================================

  const monthWiseRevenue =
    Array.isArray(
      revenue.monthWiseRevenue
    )
      ? revenue.monthWiseRevenue
      : [];

  return (
    <div className="payment-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="payment-header">

        <div>

          <p className="page-label">
            MANAGEMENT
          </p>

          <h1>
            Payments
          </h1>

          <p className="page-description">
            Manage and track gym membership payments.
          </p>

        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >

          <button
            type="button"
            className="add-payment-button"
            onClick={
              openRevenueHistory
            }
          >
            <span>₹</span>
            Revenue History
          </button>

          <button
            type="button"
            className="add-payment-button"
            onClick={
              openAddModal
            }
          >
            <span>+</span>
            Add Payment
          </button>

        </div>

      </div>

      {/* =================================================
          ALERTS
      ================================================= */}

      {error && (
        <div className="payment-alert error">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {success && (
        <div className="payment-alert success">
          <span>✓</span>
          {success}
        </div>
      )}

      {/* =================================================
          SUMMARY
      ================================================= */}

      <section className="payment-summary">

        <div className="payment-summary-card">

          <div className="summary-icon">
            #
          </div>

          <div>

            <span>
              Payment Records
            </span>

            <strong>
              {paymentRecordCount}
            </strong>

          </div>

        </div>

        <div className="payment-summary-card">

          <div className="summary-icon">
            ✓
          </div>

          <div>

            <span>
              Payment History
            </span>

            <strong>
              View when needed
            </strong>

          </div>

        </div>

      </section>

      {/* =================================================
          PAYMENT RECORDS
      ================================================= */}

      <section className="payment-card">

        <div className="payment-toolbar">

          <div>

            <h2>
              Payment Records
            </h2>

            <span>
              {filteredPayments.length}{" "}
              {filteredPayments.length ===
              1
                ? "payment"
                : "payments"}
            </span>

          </div>

          <div className="payment-search">

            <span>⌕</span>

            <input
              type="text"
              placeholder="Search payments..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>

        </div>

        {loading ? (

          <div className="payment-loading">

            <div className="loading-spinner"></div>

            <p>
              Loading payments...
            </p>

          </div>

        ) : filteredPayments.length ===
          0 ? (

          <div className="payment-empty">

            <div className="empty-icon">
              ₹
            </div>

            <h3>
              {search
                ? "No payments found"
                : "No payments yet"}
            </h3>

            <p>
              {search
                ? "Try a different search."
                : "Add your first payment record to get started."}
            </p>

            {!search && (
              <button
                className="empty-add-button"
                onClick={
                  openAddModal
                }
              >
                + Add Payment
              </button>
            )}

          </div>

        ) : (

          <div className="payment-table-wrapper">

            <table className="payment-table">

              <thead>

                <tr>

                  <th>
                    Member
                  </th>

                  <th>
                    Amount
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Method
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredPayments.map(
                  (payment) => (

                    <tr
                      key={
                        payment.id
                      }
                    >

                      <td>

                        <div className="payment-member">

                          <div className="member-avatar">

                            {String(
                              payment.member?.name ||
                                "M"
                            )
                              .charAt(0)
                              .toUpperCase()}

                          </div>

                          <div>

                            <strong>
                              {payment.member?.name ||
                                "Unknown Member"}
                            </strong>

                            <small>
                              ID #
                              {payment.member?.id ||
                                "—"}
                            </small>

                          </div>

                        </div>

                      </td>

                      <td>

                        <span className="payment-amount">

                          ₹
                          {formatMoney(
                            payment.amount
                          )}

                        </span>

                      </td>

                      <td>

                        <span className="payment-date">

                          📅{" "}
                          {payment.paymentDate ||
                            "—"}

                        </span>

                      </td>

                      <td>

                        <span className="payment-method">

                          {payment.paymentMethod ||
                            "—"}

                        </span>

                      </td>

                      <td>

                        <span
                          className={`payment-status ${
                            String(
                              payment.status
                            ).toLowerCase() ===
                            "paid"
                              ? "paid"
                              : String(
                                  payment.status
                                ).toLowerCase() ===
                                "pending"
                              ? "pending"
                              : "failed"
                          }`}
                        >

                          {payment.status ||
                            "Pending"}

                        </span>

                      </td>

                      <td>

                        <div className="payment-actions">

                          <button
                            type="button"
                            className="edit-button"
                            onClick={() =>
                              openEditModal(
                                payment
                              )
                            }
                            title="Edit payment"
                          >
                            ✎
                          </button>

                          <button
                            type="button"
                            className="delete-button"
                            onClick={() =>
                              handleDelete(
                                payment.id
                              )
                            }
                            title="Delete payment"
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

      {/* =================================================
          REVENUE HISTORY MODAL
      ================================================= */}

      {showRevenueHistory && (

        <div
          className="payment-modal-overlay"
          onMouseDown={(e) => {

            if (
              e.target ===
                e.currentTarget &&
              !revenueLoading
            ) {
              closeRevenueHistory();
            }

          }}
        >

          <div
            className="payment-modal"
            style={{
              maxWidth: "720px",
            }}
          >

            {/* HEADER */}

            <div className="modal-header">

              <div>

                <p>
                  PAYMENT HISTORY
                </p>

                <h2>
                  Revenue History
                </h2>

              </div>

              <button
                type="button"
                className="modal-close"
                onClick={
                  closeRevenueHistory
                }
                disabled={
                  revenueLoading
                }
              >
                ×
              </button>

            </div>

            {/* CONTENT */}

            <div
              style={{
                padding: "24px",
              }}
            >

              {revenueLoading ? (

                <div
                  className="payment-loading"
                  style={{
                    minHeight: "220px",
                  }}
                >

                  <div className="loading-spinner"></div>

                  <p>
                    Calculating revenue...
                  </p>

                </div>

              ) : revenueError ? (

                <div className="modal-error">

                  ⚠️{" "}
                  {revenueError}

                </div>

              ) : (

                <>

                  {/* =================================================
                      THIS MONTH
                  ================================================= */}

                  <div
                    style={{
                      border:
                        "1px solid #e7e8ed",
                      borderRadius:
                        "14px",
                      padding:
                        "20px",
                      marginBottom:
                        "16px",
                      background:
                        "#fafafd",
                    }}
                  >

                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "center",
                        gap:
                          "15px",
                      }}
                    >

                      <div>

                        <div
                          style={{
                            fontSize:
                              "12px",
                            color:
                              "#777b86",
                            fontWeight:
                              "700",
                            marginBottom:
                              "5px",
                          }}
                        >
                          THIS MONTH
                        </div>

                        <div
                          style={{
                            fontSize:
                              "15px",
                            fontWeight:
                              "700",
                          }}
                        >
                          {getMonthName()}{" "}
                          {revenue.year}
                        </div>

                      </div>

                      <div
                        style={{
                          textAlign:
                            "right",
                        }}
                      >

                        <strong
                          style={{
                            display:
                              "block",
                            fontSize:
                              "27px",
                            fontWeight:
                              "800",
                            color:
                              "#20834a",
                          }}
                        >
                          ₹
                          {formatMoney(
                            revenue.thisMonthRevenue
                          )}
                        </strong>

                        <span
                          style={{
                            fontSize:
                              "12px",
                            color:
                              "#777b86",
                          }}
                        >
                          {
                            revenue.thisMonthPaymentCount
                          }{" "}
                          paid{" "}
                          {revenue.thisMonthPaymentCount ===
                          1
                            ? "record"
                            : "records"}
                        </span>

                      </div>

                    </div>

                  </div>

                  {/* =================================================
                      THIS YEAR
                  ================================================= */}

                  <div
                    style={{
                      border:
                        "1px solid #e7e8ed",
                      borderRadius:
                        "14px",
                      padding:
                        "20px",
                      marginBottom:
                        "20px",
                      background:
                        "#fafafd",
                    }}
                  >

                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "center",
                        gap:
                          "15px",
                      }}
                    >

                      <div>

                        <div
                          style={{
                            fontSize:
                              "12px",
                            color:
                              "#777b86",
                            fontWeight:
                              "700",
                            marginBottom:
                              "5px",
                          }}
                        >
                          THIS YEAR
                        </div>

                        <div
                          style={{
                            fontSize:
                              "15px",
                            fontWeight:
                              "700",
                          }}
                        >
                          January – December{" "}
                          {revenue.year}
                        </div>

                      </div>

                      <div
                        style={{
                          textAlign:
                            "right",
                        }}
                      >

                        <strong
                          style={{
                            display:
                              "block",
                            fontSize:
                              "27px",
                            fontWeight:
                              "800",
                            color:
                              "#17191f",
                          }}
                        >
                          ₹
                          {formatMoney(
                            revenue.thisYearRevenue
                          )}
                        </strong>

                        <span
                          style={{
                            fontSize:
                              "12px",
                            color:
                              "#777b86",
                          }}
                        >
                          {
                            revenue.thisYearPaymentCount
                          }{" "}
                          paid{" "}
                          {revenue.thisYearPaymentCount ===
                          1
                            ? "record"
                            : "records"}
                        </span>

                      </div>

                    </div>

                  </div>

                  {/* =================================================
                      MONTH-WISE REVENUE
                  ================================================= */}

                  <div>

                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "center",
                        marginBottom:
                          "12px",
                      }}
                    >

                      <div>

                        <div
                          style={{
                            fontSize:
                              "12px",
                            color:
                              "#777b86",
                            fontWeight:
                              "700",
                            letterSpacing:
                              "0.5px",
                          }}
                        >
                          MONTH-WISE REVENUE
                        </div>

                        <div
                          style={{
                            fontSize:
                              "15px",
                            fontWeight:
                              "700",
                            marginTop:
                              "4px",
                          }}
                        >
                          {revenue.year} Revenue
                        </div>

                      </div>

                    </div>

                    <div
                      style={{
                        display:
                          "grid",
                        gridTemplateColumns:
                          "repeat(2, minmax(0, 1fr))",
                        gap:
                          "10px",
                      }}
                    >

                      {monthWiseRevenue.map(
                        (item) => {

                          const monthNumber =
                            Number(
                              item.monthNumber
                            );

                          const isCurrentMonth =
                            monthNumber ===
                            revenue.monthNumber;

                          const monthRevenue =
                            Number(
                              item.revenue || 0
                            );

                          const paymentCount =
                            Number(
                              item.paymentCount || 0
                            );

                          const monthDate =
                            new Date(
                              revenue.year,
                              monthNumber - 1,
                              1
                            );

                          const monthName =
                            monthDate.toLocaleDateString(
                              "en-IN",
                              {
                                month:
                                  "long",
                              }
                            );

                          return (
                            <div
                              key={
                                monthNumber
                              }
                              style={{
                                border:
                                  isCurrentMonth
                                    ? "2px solid #17191f"
                                    : "1px solid #e7e8ed",

                                borderRadius:
                                  "12px",

                                padding:
                                  "15px",

                                background:
                                  isCurrentMonth
                                    ? "#f4f5f7"
                                    : "#ffffff",
                              }}
                            >

                              <div
                                style={{
                                  display:
                                    "flex",
                                  justifyContent:
                                    "space-between",
                                  alignItems:
                                    "flex-start",
                                  gap:
                                    "10px",
                                }}
                              >

                                <div>

                                  <div
                                    style={{
                                      fontSize:
                                        "13px",
                                      fontWeight:
                                        "700",
                                      color:
                                        "#17191f",
                                    }}
                                  >
                                    {monthName}
                                  </div>

                                  <div
                                    style={{
                                      marginTop:
                                        "4px",
                                      fontSize:
                                        "11px",
                                      color:
                                        "#8a8e98",
                                    }}
                                  >
                                    {paymentCount}{" "}
                                    paid{" "}
                                    {paymentCount ===
                                    1
                                      ? "record"
                                      : "records"}
                                  </div>

                                </div>

                                <strong
                                  style={{
                                    fontSize:
                                      "16px",
                                    fontWeight:
                                      "800",
                                    color:
                                      monthRevenue >
                                      0
                                        ? "#20834a"
                                        : "#9a9da5",
                                    whiteSpace:
                                      "nowrap",
                                  }}
                                >
                                  ₹
                                  {formatMoney(
                                    monthRevenue
                                  )}
                                </strong>

                              </div>

                            </div>
                          );
                        }
                      )}

                    </div>

                  </div>

                  {/* =================================================
                      NOTE
                  ================================================= */}

                  <div
                    style={{
                      marginTop:
                        "18px",
                      padding:
                        "12px 14px",
                      borderRadius:
                        "9px",
                      background:
                        "#f4f5f7",
                      color:
                        "#6f737d",
                      fontSize:
                        "12px",
                      lineHeight:
                        "1.5",
                    }}
                  >
                    💡 Revenue is calculated only from{" "}
                    <strong>
                      PAID
                    </strong>{" "}
                    payment records using the actual
                    payment date. Pending and failed
                    payments are not included.
                  </div>

                </>
              )}

            </div>

            {/* FOOTER */}

            <div
              className="modal-actions"
              style={{
                padding:
                  "0 24px 24px",
              }}
            >

              <button
                type="button"
                className="cancel-button"
                onClick={
                  closeRevenueHistory
                }
                disabled={
                  revenueLoading
                }
              >
                Close
              </button>

              <button
                type="button"
                className="save-payment-button"
                onClick={
                  loadRevenue
                }
                disabled={
                  revenueLoading
                }
              >
                {revenueLoading
                  ? "Refreshing..."
                  : "Refresh Revenue"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =================================================
          ADD / EDIT PAYMENT MODAL
      ================================================= */}

      {showModal && (

        <div
          className="payment-modal-overlay"
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

          <div className="payment-modal">

            <div className="modal-header">

              <div>

                <p>
                  {editingPayment
                    ? "UPDATE PAYMENT"
                    : "NEW PAYMENT"}
                </p>

                <h2>
                  {editingPayment
                    ? "Edit Payment"
                    : "Add Payment"}
                </h2>

              </div>

              <button
                type="button"
                className="modal-close"
                onClick={
                  closeModal
                }
                disabled={
                  saving
                }
              >
                ×
              </button>

            </div>

            <form
              className="payment-form"
              onSubmit={
                handleSubmit
              }
            >

              {/* MEMBER */}

              <div className="form-group">

                <label>
                  Member
                </label>

                <select
                  name="memberId"
                  value={
                    form.memberId
                  }
                  onChange={
                    handleChange
                  }
                  required
                >

                  <option value="">
                    Select a member
                  </option>

                  {members.map(
                    (member) => (

                      <option
                        key={
                          member.id
                        }
                        value={
                          member.id
                        }
                      >
                        {
                          member.name
                        }
                      </option>

                    )
                  )}

                </select>

              </div>

              {/* AMOUNT */}

              <div className="form-group">

                <label>
                  Amount
                </label>

                <input
                  type="number"
                  name="amount"
                  placeholder="Enter payment amount"
                  min="1"
                  step="0.01"
                  value={
                    form.amount
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>

              {/* DATE + METHOD */}

              <div className="form-row">

                <div className="form-group">

                  <label>
                    Payment Date
                  </label>

                  <input
                    type="date"
                    name="paymentDate"
                    value={
                      form.paymentDate
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>

                <div className="form-group">

                  <label>
                    Payment Method
                  </label>

                  <select
                    name="paymentMethod"
                    value={
                      form.paymentMethod
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >

                    <option value="Cash">
                      Cash
                    </option>

                    <option value="UPI">
                      UPI
                    </option>

                    <option value="Card">
                      Card
                    </option>

                    <option value="Bank Transfer">
                      Bank Transfer
                    </option>

                  </select>

                </div>

              </div>

              {/* STATUS */}

              <div className="form-group">

                <label>
                  Status
                </label>

                <select
                  name="status"
                  value={
                    form.status
                  }
                  onChange={
                    handleChange
                  }
                  required
                >

                  <option value="Paid">
                    Paid
                  </option>

                  <option value="Pending">
                    Pending
                  </option>

                  <option value="Failed">
                    Failed
                  </option>

                </select>

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
                  onClick={
                    closeModal
                  }
                  disabled={
                    saving
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-payment-button"
                  disabled={
                    saving
                  }
                >
                  {saving
                    ? "Saving..."
                    : editingPayment
                    ? "Update Payment"
                    : "Add Payment"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Payment;