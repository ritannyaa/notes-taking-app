import { useState, useEffect } from 'react';
import './App.css';

const API_BASE = 'http://localhost:5000/api/notes';

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Show Toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch all notes
  const fetchNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error('Failed to fetch notes from server');
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      console.error(err);
      setError('Unable to connect to backend server. Make sure MongoDB backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Handle Add or Edit submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('Please fill in both title and content', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        // Update Note
        const res = await fetch(`${API_BASE}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: title.trim(), content: content.trim() }),
        });
        if (!res.ok) throw new Error('Failed to update note');
        const updated = await res.json();
        setNotes(notes.map((n) => (n._id === editingId ? updated : n)));
        showToast('Note updated successfully!');
        setEditingId(null);
      } else {
        // Create Note
        const res = await fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: title.trim(), content: content.trim() }),
        });
        if (!res.ok) throw new Error('Failed to create note');
        const newNote = await res.json();
        setNotes([newNote, ...notes]);
        showToast('Note created successfully!');
      }
      setTitle('');
      setContent('');
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Start Edit
  const handleEdit = (note) => {
    setEditingId(note._id);
    setTitle(note.title);
    setContent(note.content);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel Edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
  };

  // Delete Note
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete note');
      setNotes(notes.filter((n) => n._id !== id));
      showToast('Note deleted');
      if (editingId === id) {
        handleCancelEdit();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to delete note', 'error');
    }
  };

  // Copy Note content
  const handleCopy = (note) => {
    navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
    setCopiedId(note._id);
    showToast('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter notes by search query
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="app-header">
        <div className="logo-container">
          <div className="logo-icon">📝</div>
          <div>
            <h1>QuickNotes</h1>
            <p className="subtitle">Powered by Express & MongoDB</p>
          </div>
        </div>

        <div className="header-actions">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>
                ✕
              </button>
            )}
          </div>
          <div className="badge">
            {notes.length} {notes.length === 1 ? 'Note' : 'Notes'}
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={fetchNotes} className="retry-btn">Retry</button>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="main-layout">
        {/* Note Form Section */}
        <section className="form-section">
          <div className="form-card">
            <h2>{editingId ? '✏️ Edit Note' : '➕ Create New Note'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="note-title">Title</label>
                <input
                  id="note-title"
                  type="text"
                  placeholder="Enter note title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="note-content">Content</label>
                <textarea
                  id="note-content"
                  placeholder="Write your note here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  required
                ></textarea>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting
                    ? 'Saving...'
                    : editingId
                    ? 'Update Note'
                    : 'Save Note'}
                </button>

                {editingId && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancelEdit}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>
        </section>

        {/* Notes List / Grid Section */}
        <section className="notes-section">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading your notes from MongoDB...</p>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📂</div>
              <h3>
                {searchTerm
                  ? `No notes match "${searchTerm}"`
                  : 'No notes created yet!'}
              </h3>
              <p>
                {searchTerm
                  ? 'Try searching with different keywords.'
                  : 'Use the form on the left to create your first note.'}
              </p>
            </div>
          ) : (
            <div className="notes-grid">
              {filteredNotes.map((note) => (
                <div
                  key={note._id}
                  className={`note-card ${
                    editingId === note._id ? 'is-editing' : ''
                  }`}
                >
                  <div className="note-header">
                    <h3 className="note-title">{note.title}</h3>
                    <span className="note-date">
                      {formatDate(note.createdAt)}
                    </span>
                  </div>

                  <p className="note-content">{note.content}</p>

                  <div className="note-footer">
                    <button
                      onClick={() => handleCopy(note)}
                      className="icon-btn"
                      title="Copy content"
                    >
                      {copiedId === note._id ? '✅ Copied' : '📋 Copy'}
                    </button>
                    <button
                      onClick={() => handleEdit(note)}
                      className="icon-btn icon-btn-edit"
                      title="Edit note"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(note._id)}
                      className="icon-btn icon-btn-delete"
                      title="Delete note"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
