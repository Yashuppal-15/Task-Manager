import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyTasks, getOverdueTasks, updateTaskStatus, deleteTask } from "../services/taskService";

const STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED"];

export default function Tasks() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("mine");

  async function load() {
    setLoading(true);
    try {
      if (tab === "mine") {
        const res = await getMyTasks(user.userId);
        setTasks(res.data);
      } else {
        const res = await getOverdueTasks();
        setTasks(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [tab]);

  async function handleStatusChange(taskId, status) {
    try {
      await updateTaskStatus(taskId, status);
      setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status } : t));
    } catch (err) {
      alert("Failed to update");
    }
  }

  async function handleDelete(taskId) {
    if (!confirm("Delete this task?")) return;
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      alert("Failed to delete");
    }
  }

  const filtered = filter === "ALL" ? tasks : tasks.filter((t) => t.status === filter);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Tasks</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-5">
        {[
          { key: "mine", label: "My Tasks" },
          { key: "overdue", label: "Overdue" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filter by status */}
      {tab === "mine" && (
        <div className="flex gap-2 mb-5">
          {["ALL", ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === s
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <p className="text-sm text-gray-400">No tasks found.</p>
          )}
          {filtered.map((t) => (
            <div
              key={t.id}
              className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
              onClick={() => navigate(`/tasks/${t.id}`)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{t.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {t.project?.name && (
                    <span className="text-xs text-gray-400">{t.project.name}</span>
                  )}
                  {t.deadline && (
                    <span className={`text-xs ${tab === "overdue" ? "text-red-500" : "text-gray-400"}`}>
                      Due {t.deadline}
                    </span>
                  )}
                </div>
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
                  onClick={() => handleDelete(t.id)}
                  className="text-gray-300 hover:text-red-400 text-lg leading-none transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
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