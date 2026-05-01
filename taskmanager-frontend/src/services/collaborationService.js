import api from "../api/axios";

export const addComment = (data) => api.post("/api/collaboration/comments", data);
export const getComments = (taskId) => api.get(`/api/collaboration/comments/${taskId}`);
export const getHistory = (taskId) => api.get(`/api/collaboration/history/${taskId}`);