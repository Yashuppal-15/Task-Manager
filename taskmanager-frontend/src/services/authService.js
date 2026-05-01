import api from "../api/axios";

export const register = (data) => api.post("/api/auth/register", data);
export const login = (data) => api.post("/api/auth/login", data);
export const getProfile = () => api.get("/api/auth/profile");
export const getUserById = (id) => api.get(`/api/auth/users/${id}`);