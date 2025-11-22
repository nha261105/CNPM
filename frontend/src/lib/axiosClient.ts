import axios from "axios";

console.log("BASE URL:", process.env.NEXT_PUBLIC_BE_API_URL);

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BE_API_URL!,
  headers: {
    "Content-Type": "application/json",
  },
});

// tự động thêm token vào header
axiosClient.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem("token");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//xử lý lỗi 401
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      console.error("Unauthorized - Token invalid or expired");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;