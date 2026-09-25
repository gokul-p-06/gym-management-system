import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.1.7:8080",
});

// =========================
// REQUEST INTERCEPTOR
// =========================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// =========================
// REFRESH CONTROL
// =========================

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => {
    callback(newToken);
  });

  refreshSubscribers = [];
};

// =========================
// RESPONSE INTERCEPTOR
// =========================

api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Only handle 401
    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    const refreshToken =
      localStorage.getItem("refreshToken");

    // =========================
    // NO REFRESH TOKEN
    // =========================

    if (!refreshToken) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // =========================
    // REFRESH ALREADY RUNNING
    // =========================

    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken) => {
          originalRequest.headers =
            originalRequest.headers || {};

          originalRequest.headers.Authorization =
            `Bearer ${newToken}`;

          resolve(api(originalRequest));
        });
      });
    }

    // =========================
    // START REFRESH
    // =========================

    isRefreshing = true;

    try {
      const response = await axios.post(
        "http://192.168.1.7:8080/users/refresh",
        {
          refreshToken: refreshToken,
        }
      );

      const newAccessToken =
        response.data.accessToken;

      if (!newAccessToken) {
        throw new Error(
          "Access token was not returned."
        );
      }

      // Save new token
      localStorage.setItem(
        "token",
        newAccessToken
      );

      // Notify waiting requests
      onRefreshed(newAccessToken);

      // Retry original request
      originalRequest.headers =
        originalRequest.headers || {};

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return api(originalRequest);

    } catch (refreshError) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");

      refreshSubscribers = [];

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }

      return Promise.reject(refreshError);

    } finally {
      isRefreshing = false;
    }
  }
);

export default api;