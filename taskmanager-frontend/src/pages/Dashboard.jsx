import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllProjects } from "../services/projectService";
import { getMyTasks, getOverdueTasks } from "../services/taskService";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [projects, setProjects] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [pRes, tRes, oRes] = await Promise.all([
          getAllProjects(),
          getMyTasks(user.userId),
          getOverdueTasks(),
        ]);
        setProjects(pRes.data);
        setMyTasks(tRes.data);
        setOverdue(oRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const pending = myTasks.filter((t) => t.status === "PENDING").length;
  const inProgress = myTasks.filter((t) => t.status === "IN_PROGRESS").length;
  const completed = myTasks.filter((t) => t.status === "COMPLETED").length;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-0.5">Welcome back, {user.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Projects", value: projects.length, color: "bg-blue-50 text-blue-700" },
          { label: "Pending Tasks", value: pending, color: "bg-yellow-50 text-yellow-700" },
          { label: "In Progress", value: inProgress, color: "bg-purple-50 text-purple-700" },
          { label: "Completed", value: completed, color: "bg-green-50 text-green-700" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color.split(" ")[1]}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Recent Projects</h3>
            <button
              onClick={() => navigate("/projects")}
              className="text-xs text-blue-600 hover:underline"
            >
              View all
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {projects.slice(0, 5).map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/projects/${p.id}`)}
                className="px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <p className="text-sm font-medium text-gray-800">{p.name}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{p.description || "No description"}</p>
              </div>
            ))}
            {projects.length === 0 && (
              <p className="px-5 py-4 text-sm text-gray-400">No projects yet.</p>
            )}
          </div>
        </div>

        {/* Overdue Tasks */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">
              Overdue Tasks
              {overdue.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                  {overdue.length}
                </span>
              )}
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {overdue.slice(0, 5).map((t) => (
              <div
                key={t.id}
                onClick={() => navigate(`/tasks/${t.id}`)}
                className="px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <p className="text-sm font-medium text-gray-800">{t.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-red-500">Due {t.deadline}</span>
                  <PriorityBadge priority={t.priority} />
                </div>
              </div>
            ))}
            {overdue.length === 0 && (
              <p className="px-5 py-4 text-sm text-gray-400">No overdue tasks. Great job!</p>
            )}
          </div>
        </div>

        {/* My Tasks */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">My Tasks</h3>
            <button
              onClick={() => navigate("/tasks")}
              className="text-xs text-blue-600 hover:underline"
            >
              View all
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {myTasks.slice(0, 6).map((t) => (
              <div
                key={t.id}
                onClick={() => navigate(`/tasks/${t.id}`)}
                className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{t.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t.project?.name || ""}</p>
                </div>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={t.priority} />
                  <StatusBadge status={t.status} />
                </div>
              </div>
            ))}
            {myTasks.length === 0 && (
              <p className="px-5 py-4 text-sm text-gray-400">No tasks assigned to you.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    PENDING: "bg-yellow-100 text-yellow-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-green-100 text-green-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || "bg-gray-100 text-gray-600"}`}>
      {status?.replace("_", " ")}
    </span>
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