import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getProjectById,
  updateProject,
  getMembers,
  addMember,
  removeMember,
} from "../services/projectService";
import { getTasksByProject, createTask, updateTaskStatus, deleteTask } from "../services/taskService";
import { getUserById } from "../services/authService";

const STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", description: "" });

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", priority: "MEDIUM", deadline: "", assignedToId: "", projectId: id });

  const [memberUserId, setMemberUserId] = useState("");
  const [memberError, setMemberError] = useState("");

  const [activeTab, setActiveTab] = useState("tasks");

  async function load() {
    try {
      const [pRes, mRes, tRes] = await Promise.all([
        getProjectById(id),
        getMembers(id),
        getTasksByProject(id),
      ]);
      setProject(pRes.data);
      setEditForm({ name: pRes.data.name, description: pRes.data.description || "" });
      setMembers(mRes.data);
      setTasks(tRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function handleUpdateProject(e) {
    e.preventDefault();
    try {
      await updateProject(id, editForm);
      setProject({ ...project, ...editForm });
      setEditMode(false);
    } catch (err) {
      alert("Failed to update project");
    }
  }

  async function handleAddMember(e) {
    e.preventDefault();
    setMemberError("");
    try {
      await addMember(id, memberUserId);
      setMemberUserId("");
      load();
    } catch (err) {
      setMemberError(err.response?.data?.message || "Failed to add member");
    }
  }

  async function handleRemoveMember(userId) {
    if (!confirm("Remove this member?")) return;
    try {
      await removeMember(id, userId);
      setMembers((prev) => prev.filter((m) => m.user?.id !== userId));
    } catch (err) {
      alert("Failed to remove member");
    }
  }

  async function handleCreateTask(e) {
    e.preventDefault();
    try {
      const payload = { ...taskForm, projectId: parseInt(id) };
      if (!payload.assignedToId) delete payload.assignedToId;
      else payload.assignedToId = parseInt(payload.assignedToId);
      await createTask(payload);
      setTaskForm({ title: "", description: "", priority: "MEDIUM", deadline: "", assignedToId: "", projectId: id });
      setShowTaskForm(false);
      load();
    } catch (err) {
      alert("Failed to create task");
    }
  }

  async function handleStatusChange(taskId, status) {
    try {
      await updateTaskStatus(taskId, status);
      setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status } : t));
    } catch (err) {
      alert("Failed to update status");
    }
  }

  async function handleDeleteTask(taskId) {
    if (!confirm("Delete this task?")) return;
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      alert("Failed to delete task");
    }
  }

  if (loading) return <div className="p-8 text-sm text-gray-400">Loading...</div>;
  if (!project) return <div className="p-8 text-sm text-red-400">Project not found.</div>;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <button
            onClick={() => navigate("/projects")}
            className="text-xs text-gray-400 hover:text-gray-600 mb-2 flex items-center gap-1"
          >
            ← Back to Projects
          </button>
          {editMode ? (
            <form onSubmit={handleUpdateProject} className="flex items-center gap-2">
              <input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="text-lg font-semibold border border-gray-300 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
              <button type="button" onClick={() => setEditMode(false)} className="text-xs px-3 py-1 border border-gray-300 text-gray-600 rounded hover:bg-gray-50">Cancel</button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-800">{project.name}</h2>
              <button onClick={() => setEditMode(true)} className="text-xs text-gray-400 hover:text-blue-600">✎ Edit</button>
            </div>
          )}
          <p className="text-sm text-gray-400 mt-0.5">{project.description || "No description"}</p>
        </div>
        <button
          onClick={() => setShowTaskForm(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
        >
          + Add Task
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {["tasks", "members"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab} {tab === "tasks" && `(${tasks.length})`} {tab === "members" && `(${members.length})`}
          </button>
        ))}
      </div>

      {/* Tasks Tab */}
      {activeTab === "tasks" && (
        <div className="space-y-3">
          {tasks.length === 0 && <p className="text-sm text-gray-400">No tasks yet. Add one!</p>}
          {tasks.map((t) => (
            <div
              key={t.id}
              className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
              onClick={() => navigate(`/tasks/${t.id}`)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{t.title}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{t.description || ""}</p>
                {t.deadline && <p className="text-xs text-gray-400 mt-0.5">Due: {t.deadline}</p>}
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <PriorityBadge priority={t.priority} />
                <select
                  value={t.status}
                  onChange={(e) => handleStatusChange(t.id, e.target.value)}
                  className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
                <button
                  onClick={() => handleDeleteTask(t.id)}
                  className="text-gray-300 hover:text-red-400 text-lg leading-none transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Members Tab */}
      {activeTab === "members" && (
        <div>
          <form onSubmit={handleAddMember} className="flex gap-2 mb-4">
            <input
              type="number"
              placeholder="User ID to add"
              value={memberUserId}
              onChange={(e) => setMemberUserId(e.target.value)}
              required
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              Add Member
            </button>
          </form>
          {memberError && <p className="text-xs text-red-500 mb-3">{memberError}</p>}

          <div className="space-y-2">
            {members.map((m) => (
              <div key={m.id} className="bg-white border border-gray-200 rounded-xl px-5 py-3 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-sm font-medium text-gray-800">{m.user?.name || "User"}</p>
                  <p className="text-xs text-gray-400">{m.user?.email}</p>
                </div>
                <button
                  onClick={() => handleRemoveMember(m.user?.id)}
                  className="text-xs text-red-400 hover:text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
            {members.length === 0 && <p className="text-sm text-gray-400">No members yet.</p>}
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Add Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Task title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Optional..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                  <input
                    type="date"
                    value={taskForm.deadline}
                    onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign to (User ID)</label>
                <input
                  type="number"
                  value={taskForm.assignedToId}
                  onChange={(e) => setTaskForm({ ...taskForm, assignedToId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional user ID"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors">
                  Create Task
                </button>
                <button type="button" onClick={() => setShowTaskForm(false)} className="flex-1 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function PriorityBadge({ priority }) {
  const map = {
    HIGH: "bg-red-100 text-red-600",
    MEDIUM: "bg-orange-100 text-orange-600",
    LOW: "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[priority] || "bg-gray-100 text-gray-500"}`}>
      {priority}
    </span>
  );
}