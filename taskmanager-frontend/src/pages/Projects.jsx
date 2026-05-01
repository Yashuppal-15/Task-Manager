import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllProjects, createProject, deleteProject } from "../services/projectService";

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      const res = await getAllProjects();
      setProjects(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await createProject(form);
      setForm({ name: "", description: "" });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (!confirm("Delete this project?")) return;
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert("Failed to delete project");
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Projects</h2>
          <p className="text-sm text-gray-500 mt-0.5">{projects.length} total</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
        >
          + New Project
        </button>
      </div>

      {/* Create form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-base font-semibold text-gray-800 mb-4">New Project</h3>
            {error && (
              <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                {error}
              </div>
            )}
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Website Redesign"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Optional description..."
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-md transition-colors"
                >
                  {saving ? "Creating..." : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setError(""); }}
                  className="flex-1 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project list */}
      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(`/projects/${p.id}`)}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-200 cursor-pointer transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-800 truncate">{p.name}</h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                    {p.description || "No description"}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDelete(p.id, e)}
                  className="ml-2 text-gray-300 hover:text-red-400 text-lg leading-none transition-colors"
                  title="Delete"
                >
                  ×
                </button>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                <span>Owner: {p.owner?.name || p.owner?.email || "—"}</span>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <p className="text-sm text-gray-400 col-span-3">No projects yet. Create one to get started.</p>
          )}
        </div>
      )}
    </div>
  );
}