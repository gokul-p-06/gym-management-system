import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!username.trim() || !password.trim()) {
      setError(
        "Please enter your username and password."
      );
      return;
    }

    try {
      setLoading(true);

      console.log("LOGIN START");
      console.log(
        "Backend:",
        "http://192.168.1.7:8080"
      );

      const response = await api.post(
        "/users/login",
        {
          username: username.trim(),
          password: password,
        }
      );

      console.log(
        "LOGIN RESPONSE:",
        response
      );

      // =========================
      // ACCESS TOKEN
      // =========================

      if (!response.data?.accessToken) {
        throw new Error(
          "Access token was not returned by server."
        );
      }

      // =========================
      // SAVE ACCESS TOKEN
      // =========================

      localStorage.setItem(
        "token",
        response.data.accessToken
      );

      // =========================
      // SAVE REFRESH TOKEN
      // =========================

      if (response.data.refreshToken) {
        localStorage.setItem(
          "refreshToken",
          response.data.refreshToken
        );
      }

      console.log(
        "LOGIN SUCCESS"
      );

      // =========================
      // DASHBOARD
      // =========================

      navigate("/dashboard", {
        replace: true,
      });

    } catch (err) {
      console.error(
        "LOGIN ERROR:",
        err
      );

      console.error(
        "LOGIN RESPONSE:",
        err.response
      );

      console.error(
        "LOGIN REQUEST:",
        err.request
      );

      // =========================
      // SERVER RESPONSE EXISTS
      // =========================

      if (err.response) {

        const status =
          err.response.status;

        console.log(
          "SERVER STATUS:",
          status
        );

        if (status === 401) {

          setError(
            "Invalid username or password."
          );

        } else if (status === 403) {

          setError(
            "Login forbidden. Please check your account permission."
          );

        } else if (status === 404) {

          setError(
            "Login endpoint not found."
          );

        } else if (status >= 500) {

          setError(
            "Server error. Please check the backend."
          );

        } else {

          setError(
            `Server error: ${status}`
          );
        }

      // =========================
      // REQUEST SENT
      // BUT NO RESPONSE
      // =========================

      } else if (err.request) {

        setError(
          "Request sent, but server did not respond."
        );

      // =========================
      // REQUEST ERROR
      // =========================

      } else {

        setError(
          `Login error: ${err.message}`
        );
      }

    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* =========================
          BACKGROUND
      ========================= */}

      <div className="login-background">

        <div className="glow glow-one"></div>

        <div className="glow glow-two"></div>

      </div>

      {/* =========================
          MAIN
      ========================= */}

      <main className="login-container">

        {/* =========================
            BRAND
        ========================= */}

        <section className="login-brand">

          <div className="brand-icon">
            GYM
          </div>

          <h1>
            Gym<span>Management</span>
          </h1>

          <p>
            Manage your gym smarter.
            <br />
            Train better. Grow stronger.
          </p>

          <div className="brand-stats">

            <div>

              <strong>
                24/7
              </strong>

              <span>
                Management
              </span>

            </div>

            <div>

              <strong>
                100%
              </strong>

              <span>
                Organized
              </span>

            </div>

            <div>

              <strong>
                Secure
              </strong>

              <span>
                Access
              </span>

            </div>

          </div>

        </section>

        {/* =========================
            LOGIN CARD
        ========================= */}

        <section className="login-card">

          <div className="login-header">

            <p className="welcome">
              WELCOME BACK
            </p>

            <h2>
              Sign in
            </h2>

            <p>
              Access your gym management dashboard
            </p>

          </div>

          {/* =========================
              FORM
          ========================= */}

          <form
            onSubmit={handleLogin}
          >

            {/* USERNAME */}

            <div className="input-group">

              <label>
                Username
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  👤
                </span>

                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) =>
                    setUsername(
                      e.target.value
                    )
                  }
                  autoComplete="username"
                  disabled={loading}
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div className="input-group">

              <label>
                Password
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  🔒
                </span>

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  autoComplete="current-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous
                    )
                  }
                  disabled={loading}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>

            </div>

            {/* ERROR */}

            {error && (

              <div className="login-error">

                <span>
                  !
                </span>

                {error}

              </div>

            )}

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >

              {loading ? (

                <>
                  <span className="spinner"></span>

                  Signing in...
                </>

              ) : (

                <>
                  Sign in

                  <span>
                    →
                  </span>
                </>

              )}

            </button>

          </form>

          {/* =========================
              SECURITY
          ========================= */}

          <p className="secure-text">
            🔐 Secure login powered by JWT authentication
          </p>

        </section>

      </main>

      {/* =========================
          FOOTER
      ========================= */}

      <footer className="login-footer">
        © 2026 Gym Management System
      </footer>

    </div>
  );
}

export default Login;