import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTasksByProject, updateTask, updateTaskStatus, deleteTask } from "../services/taskService";
import { getComments, addComment, getHistory } from "../services/collaborationService";
import { getAllProjects } from "../services/projectService";

const STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");

  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});

  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        // Find the task by scanning all projects' tasks
        const pRes = await getAllProjects();
        let found = null;

        for (const p of pRes.data) {
          try {
            const tRes = await getTasksByProject(p.id);
            found = tRes.data.find((t) => String(t.id) === String(id));
            if (found) break;
          } catch {
            // skip projects we can't fetch tasks for
          }
        }

        if (found) {
          setTask(found);
          setEditForm({
            title: found.title,
            description: found.description || "",
            priority: found.priority,
            status: found.status,
            deadline: found.deadline || "",
            assignedToId: found.assignedTo?.id || "",
            projectId: found.project?.id,
          });
        }

        const [cRes, hRes] = await Promise.all([
          getComments(id),
          getHistory(id),
        ]);
        setComments(cRes.data);
        setHistory(hRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleUpdate(e) {
    e.preventDefault();
    try {
      const payload = { ...editForm, projectId: parseInt(editForm.projectId) };
      if (!payload.assignedToId) delete payload.assignedToId;
      else payload.assignedToId = parseInt(payload.assignedToId);
      await updateTask(id, payload);
      setTask({ ...task, ...editForm });
      setEditMode(false);
    } catch {
      alert("Failed to update task");
    }
  }

  async function handleStatusChange(status) {
    try {
      await updateTaskStatus(id, status);
      setTask({ ...task, status });
    } catch {
      alert("Failed to update status");
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this task?")) return;
    try {
      await deleteTask(id);
      navigate(-1);
    } catch {
      alert("Failed to delete task");
    }
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    setPosting(true);
    try {
      await addComment({ content: commentText, taskId: parseInt(id) });
      setCommentText("");
      const res = await getComments(id);
      setComments(res.data);
    } catch {
      alert("Failed to post comment");
    } finally {
      setPosting(false);
    }
  }

  if (loading) return <div className="p-8 text-sm text-gray-400">Loading...</div>;
  if (!task) return <div className="p-8 text-sm text-red-400">Task not found.</div>;

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-xs text-gray-400 hover:text-gray-600 mb-2 flex items-center gap-1"
          >
            ← Back
          </button>
          <h2 className="text-xl font-semibold text-gray-800">{task.title}</h2>
          <p className="text-xs text-gray-400 mt-0.5">Project: {task.project?.name || "—"}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEditMode(!editMode)}
            className="px-3 py-1.5 text-xs border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 transition-colors"
          >
            {editMode ? "Cancel" : "✎ Edit"}
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 text-xs border border-red-200 text-red-500 rounded-md hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Quick status bar */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => handleStatusChange(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              task.status === s
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s.replace("_", " ")}
          </button>
        ))}
        <PriorityBadge priority={task.priority} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-5">
        {["details", "comments", "history"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab} {tab === "comments" && `(${comments.length})`}
          </button>
        ))}
      </div>

      {/* Details Tab */}
      {activeTab === "details" && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          {editMode ? (
            <form onSubmit={handleUpdate} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                <input
                  type="date"
                  value={editForm.deadline}
                  onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign to (User ID)</label>
                <input
                  type="number"
                  value={editForm.assignedToId}
                  onChange={(e) => setEditForm({ ...editForm, assignedToId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                Save Changes
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              <Row label="Description" value={task.description || "—"} />
              <Row label="Status" value={task.status?.replace("_", " ")} />
              <Row label="Priority" value={task.priority} />
              <Row label="Deadline" value={task.deadline || "—"} />
              <Row label="Assigned To" value={task.assignedTo?.name || task.assignedTo?.email || "Unassigned"} />
              <Row label="Created By" value={task.createdBy?.name || task.createdBy?.email || "—"} />
            </div>
          )}
        </div>
      )}

      {/* Comments Tab */}
      {activeTab === "comments" && (
        <div>
          <form onSubmit={handleComment} className="flex gap-2 mb-5">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={posting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-md transition-colors"
            >
              {posting ? "..." : "Post"}
            </button>
          </form>
          <div className="space-y-3">
            {comments.length === 0 && (
              <p className="text-sm text-gray-400">No comments yet.</p>
            )}
            {comments.map((c) => (
              <div key={c.id} className="bg-white border border-gray-200 rounded-xl px-5 py-3 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700">
                    {c.user?.name || c.user?.email || "User"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {c.createdAt?.slice(0, 16).replace("T", " ")}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{c.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="space-y-3">
          {history.length === 0 && (
            <p className="text-sm text-gray-400">No history recorded.</p>
          )}
          {history.map((h) => (
            <div key={h.id} className="bg-white border border-gray-200 rounded-xl px-5 py-3 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700">
                  {h.changedBy?.name || h.changedBy?.email || "User"}
                </span>
                <span className="text-xs text-gray-400">
                  {h.changedAt?.slice(0, 16).replace("T", " ")}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Changed <span className="font-medium text-gray-800">{h.field}</span> from{" "}
                <span className="text-gray-500">{h.oldValue || "—"}</span> →{" "}
                <span className="text-gray-800">{h.newValue}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex gap-4">
      <span className="text-xs font-medium text-gray-500 w-28 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-800">{value}</span>
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