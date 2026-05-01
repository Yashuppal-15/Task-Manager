import api from "../api/axios";

export const createTask = (data) => api.post("/api/tasks", data);
export const getTasksByProject = (projectId) => api.get(`/api/tasks/project/${projectId}`);
export const getMyTasks = (userId) => api.get(`/api/tasks/my/${userId}`);
export const getOverdueTasks = () => api.get("/api/tasks/overdue");
export const updateTaskStatus = (id, status) => api.patch(`/api/tasks/${id}/status?status=${status}`);
export const updateTask = (id, data) => api.put(`/api/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/api/tasks/${id}`);