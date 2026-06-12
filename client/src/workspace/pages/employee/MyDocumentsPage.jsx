import { useEffect, useState } from 'react';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';
import { HR_DOCUMENT_TYPES } from '../hr/EmployeeModals';

const MAX_DOC_BYTES = 10 * 1024 * 1024;

function emptyDocRow() {
  return { id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, type: 'id-proof', file: null };
}

function docTypeLabel(type) {
  return HR_DOCUMENT_TYPES.find((d) => d.value === type)?.label || type;
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatFileSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MyDocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [documentRows, setDocumentRows] = useState([emptyDocRow()]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api
      .getEmployeeDocuments()
      .then(setDocuments)
      .catch(() => setDocuments([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const addRow = () => setDocumentRows((prev) => [...prev, emptyDocRow()]);
  const updateRow = (rowId, updates) => {
    setDocumentRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, ...updates } : r)));
  };
  const removeRow = (rowId) => {
    setDocumentRows((prev) => (prev.length === 1 ? [emptyDocRow()] : prev.filter((r) => r.id !== rowId)));
  };

  const handleFileChange = (rowId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_DOC_BYTES) {
      setError(`"${file.name}" exceeds the 10 MB limit`);
      return;
    }
    setError('');
    updateRow(rowId, {
      file: { fileName: file.name, size: file.size, uploadedAt: new Date().toISOString() },
    });
    e.target.value = '';
  };

  const handleUpload = async () => {
    const toUpload = documentRows.filter((r) => r.file?.fileName);
    if (!toUpload.length) {
      setError('Choose at least one file to upload');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const payload = toUpload.map((row) => ({
        id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: row.type,
        fileName: row.file.fileName,
        size: row.file.size,
        uploadedAt: row.file.uploadedAt,
      }));
      const updated = await api.addEmployeeDocuments(payload);
      setDocuments(updated);
      setDocumentRows([emptyDocRow()]);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="ws-hr-page ws-emp-portal-page">
      <div className="ws-admin-head">
        <div>
          <h1 className="ws-page-title">My documents</h1>
          <p className="ws-page-subtitle">Upload and view your HR documents</p>
        </div>
      </div>

      <div className="card ws-hr-panel">
        <div className="ws-hr-panel-head">
          <h2 className="ws-hr-panel-title">Uploaded documents</h2>
        </div>
        <div className="ws-hr-panel-body">
          {loading ? (
            <p className="ws-page-subtitle">Loading…</p>
          ) : documents.length === 0 ? (
            <p className="ws-page-subtitle">No documents on file yet.</p>
          ) : (
            <div className="ws-hr-table-wrap">
              <table className="ws-hr-table">
                <thead>
                  <tr>
                    <th>File</th>
                    <th>Type</th>
                    <th>Size</th>
                    <th>Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id}>
                      <td>
                        <span className="ws-emp-doc-type-chip">
                          <AppIcon icon={Icons.fileText} size={14} />
                          {doc.fileName}
                        </span>
                      </td>
                      <td>{docTypeLabel(doc.type)}</td>
                      <td>{formatFileSize(doc.size)}</td>
                      <td>{formatDate(doc.uploadedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="card ws-hr-panel">
        <div className="ws-hr-panel-head">
          <h2 className="ws-hr-panel-title">Upload documents</h2>
        </div>
        <div className="ws-hr-panel-body">
          <p className="ws-page-subtitle mb12">
            Add ID proof, certificates, or other documents for HR records.
          </p>
          {error && <div className="ws-emp-form-error">{error}</div>}
          <div className="ws-emp-doc-rows">
            {documentRows.map((row) => (
              <div key={row.id} className="ws-emp-doc-row">
                <select
                  className="fi ws-emp-doc-type"
                  value={row.type}
                  onChange={(e) => updateRow(row.id, { type: e.target.value })}
                >
                  {HR_DOCUMENT_TYPES.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
                <label className="ws-hr-btn-outline ws-emp-file-label ws-emp-doc-file-btn">
                  <AppIcon icon={Icons.upload} size={14} />
                  {row.file ? 'Change file' : 'Choose file'}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="ws-emp-file-input"
                    onChange={(e) => handleFileChange(row.id, e)}
                  />
                </label>
                {row.file && (
                  <span className="ws-emp-doc-row-filename">{row.file.fileName}</span>
                )}
                {documentRows.length > 1 && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeRow(row.id)}>
                    <AppIcon icon={Icons.x} size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="ws-emp-doc-upload-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={addRow}>
              <AppIcon icon={Icons.plus} size={14} />
              Add another
            </button>
            <button type="button" className="ws-hr-btn-primary" disabled={uploading} onClick={handleUpload}>
              {uploading ? 'Uploading…' : 'Upload documents'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
