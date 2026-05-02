import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllProjects } from "../services/projectService";
import { getMyTasks, getOverdueTasks } from "../services/taskService";

const STATUS_COLOR = {
  PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-200",
  COMPLETED: "bg-green-100 text-green-700 border-green-200",
};

const PRIORITY_COLOR = {
  HIGH: "bg-red-100 text-red-600",
  MEDIUM: "bg-orange-100 text-orange-600",
  LOW: "bg-gray-100 text-gray-500",
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLOR[status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
      {status?.replace("_", " ")}
    </span>
  );
}

function PriorityBadge({ priority }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLOR[priority] || "bg-gray-100 text-gray-500"}`}>
      {priority}
    </span>
  );
}

function StatCard({ label, value, icon, color, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color.replace("text-", "bg-").replace("-600", "-100").replace("-700", "-100")}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

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

  const firstName = user.email?.split("@")[0] || "there";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Good morning, {firstName} 👋</h1>
        <p className="text-gray-500 text-sm mt-1">Here's what's happening with your projects today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard
          label="Total Projects"
          value={projects.length}
          color="text-blue-700"
          sub="Active workspaces"
          icon={
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            </svg>
          }
        />
        <StatCard
          label="Pending"
          value={pending}
          color="text-yellow-700"
          sub="Awaiting action"
          icon={
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="In Progress"
          value={inProgress}
          color="text-indigo-700"
          sub="Currently active"
          icon={
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
        <StatCard
          label="Completed"
          value={completed}
          color="text-green-700"
          sub="Tasks done"
          icon={
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Recent Projects */}
        <div className="xl:col-span-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">Recent Projects</h2>
            <button onClick={() => navigate("/projects")} className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline">View all →</button>
          </div>
          <div>
            {projects.length === 0 && (
              <div className="px-6 py-8 text-center">
                <p className="text-sm text-gray-400">No projects yet.</p>
                <button onClick={() => navigate("/projects")} className="mt-2 text-xs text-blue-600 hover:underline">Create your first project →</button>
              </div>
            )}
            {projects.slice(0, 5).map((p, i) => (
              <div
                key={p.id}
                onClick={() => navigate(`/projects/${p.id}`)}
                className={`px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-3 ${i !== 0 ? "border-t border-gray-50" : ""}`}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {p.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400 truncate">{p.description || "No description"}</p>
                </div>
                <svg className="w-4 h-4 text-gray-300 ml-auto shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))}
          </div>
        </div>

        {/* My Tasks */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">My Tasks</h2>
            <button onClick={() => navigate("/tasks")} className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline">View all →</button>
          </div>
          <div>
            {myTasks.length === 0 && (
              <div className="px-6 py-8 text-center">
                <p className="text-sm text-gray-400">No tasks assigned to you yet.</p>
              </div>
            )}
            {myTasks.slice(0, 6).map((t, i) => (
              <div
                key={t.id}
                onClick={() => navigate(`/tasks/${t.id}`)}
                className={`px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-4 ${i !== 0 ? "border-t border-gray-50" : ""}`}
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${t.status === "COMPLETED" ? "bg-green-400" : t.status === "IN_PROGRESS" ? "bg-blue-400" : "bg-yellow-400"}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${t.status === "COMPLETED" ? "text-gray-400 line-through" : "text-gray-800"}`}>{t.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t.project?.name || ""}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <PriorityBadge priority={t.priority} />
                  <StatusBadge status={t.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overdue Tasks */}
        {overdue.length > 0 && (
          <div className="xl:col-span-3 bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-red-100 bg-red-50">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <h2 className="text-sm font-semibold text-red-700">Overdue Tasks</h2>
                <span className="ml-1 px-2 py-0.5 bg-red-600 text-white text-xs rounded-full font-semibold">{overdue.length}</span>
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {overdue.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  onClick={() => navigate(`/tasks/${t.id}`)}
                  className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-4"
                >
                  <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{t.title}</p>
                    <p className="text-xs text-red-500 mt-0.5">Due {t.deadline}</p>
                  </div>
                  <PriorityBadge priority={t.priority} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}