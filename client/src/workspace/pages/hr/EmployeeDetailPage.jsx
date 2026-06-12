import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';
import { AddAssetModal, EmployeeAvatar, HR_DOCUMENT_TYPES } from './EmployeeModals';

const MAX_ASSET_IMAGE_BYTES = 2 * 1024 * 1024;
const MAX_DOC_BYTES = 10 * 1024 * 1024;
const MAX_PAYSLIP_BYTES = 10 * 1024 * 1024;

function emptyDocRow() {
  return { id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, type: 'id-proof', file: null };
}

function docTypeLabel(type) {
  return HR_DOCUMENT_TYPES.find((d) => d.value === type)?.label || type;
}

const STATUS_LABELS = {
  active: { label: 'Active', chip: 'ws-emp-status-active' },
  'on-leave': { label: 'On Leave', chip: 'ws-emp-status-leave' },
  inactive: { label: 'Inactive', chip: 'ws-emp-status-inactive' },
};

function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatINR(amount) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

function formatFileSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function EmployeeDetailPage() {
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [addAssetOpen, setAddAssetOpen] = useState(false);
  const [uploadingAssetId, setUploadingAssetId] = useState(null);
  const [documentRows, setDocumentRows] = useState([emptyDocRow()]);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [docError, setDocError] = useState('');
  const [payslipFile, setPayslipFile] = useState(null);
  const [uploadingPayslip, setUploadingPayslip] = useState(false);
  const [payslipError, setPayslipError] = useState('');
  const [deletingPayslipId, setDeletingPayslipId] = useState(null);

  const loadEmployee = () =>
    api.getHrEmployee(employeeId).then(setEmployee).catch(() => setEmployee(null));

  useEffect(() => {
    setLoading(true);
    loadEmployee().finally(() => setLoading(false));
  }, [employeeId]);

  useEffect(() => {
    document.querySelector('.ws-main')?.scrollTo({ top: 0, behavior: 'instant' });
    if (activeTab === 'documents') {
      setDocumentRows([emptyDocRow()]);
      setDocError('');
    }
    if (activeTab === 'finance') {
      setPayslipFile(null);
      setPayslipError('');
    }
  }, [activeTab]);

  if (loading) {
    return (
      <div className="ws-hr-page">
        <p className="ws-page-subtitle">Loading employee profile…</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="ws-hr-page">
        <Link to="/workspace/hr/employees" className="ws-back-link">
          <AppIcon icon={Icons.chevronRight} size={14} className="ws-back-chevron" />
          Back to Employee Directory
        </Link>
        <p>Employee not found.</p>
      </div>
    );
  }

  const status = STATUS_LABELS[employee.status] || STATUS_LABELS.active;
  const finance = employee.finance;
  const performance = employee.performance;
  const assets = employee.assets || [];
  const totalAssetValue = assets.reduce((sum, a) => sum + (a.value || 0), 0);
  const terms = employee.employmentTerms;
  const probationStatusLabel = {
    active: { label: 'On Probation', chip: 'ws-emp-status-leave' },
    completed: { label: 'Probation Completed', chip: 'ws-emp-status-active' },
    none: { label: 'No Probation', chip: 'chip-gray' },
  };
  const probStatus = probationStatusLabel[terms?.probation?.status] || probationStatusLabel.none;

  const handleAssetImageUpload = async (assetId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > MAX_ASSET_IMAGE_BYTES) return;

    setUploadingAssetId(assetId);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const updated = await api.updateHrEmployeeAssetImage(employeeId, assetId, {
          fileName: file.name,
          url: reader.result,
          uploadedAt: new Date().toISOString(),
        });
        setEmployee(updated);
      } catch {
        /* ignore */
      } finally {
        setUploadingAssetId(null);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const documents = employee?.documents || [];

  const addDocumentRow = () => setDocumentRows((prev) => [...prev, emptyDocRow()]);

  const updateDocumentRow = (rowId, updates) => {
    setDocumentRows((prev) => prev.map((row) => (row.id === rowId ? { ...row, ...updates } : row)));
  };

  const removeDocumentRow = (rowId) => {
    setDocumentRows((prev) => (prev.length === 1 ? [emptyDocRow()] : prev.filter((r) => r.id !== rowId)));
  };

  const handleDocRowFileChange = (rowId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_DOC_BYTES) {
      setDocError(`"${file.name}" exceeds the 10 MB limit per document`);
      return;
    }
    setDocError('');
    updateDocumentRow(rowId, {
      file: { fileName: file.name, size: file.size, uploadedAt: new Date().toISOString() },
    });
    e.target.value = '';
  };

  const handlePayslipFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_PAYSLIP_BYTES) {
      setPayslipError(`"${file.name}" exceeds the 10 MB limit`);
      return;
    }
    setPayslipError('');
    setPayslipFile({ fileName: file.name, size: file.size });
    e.target.value = '';
  };

  const handleUploadPayslip = async () => {
    if (!payslipFile?.fileName) {
      setPayslipError('Choose a payslip file to upload');
      return;
    }
    setUploadingPayslip(true);
    setPayslipError('');
    try {
      const updated = await api.addHrEmployeePayslip(employeeId, {
        fileName: payslipFile.fileName,
        size: payslipFile.size,
      });
      setEmployee(updated);
      setPayslipFile(null);
    } catch (err) {
      setPayslipError(err.message || 'Failed to upload payslip');
    } finally {
      setUploadingPayslip(false);
    }
  };

  const handleDeletePayslip = async (payslipId) => {
    if (!window.confirm('Remove this payslip from the employee record?')) return;
    setDeletingPayslipId(payslipId);
    try {
      const updated = await api.deleteHrEmployeePayslip(employeeId, payslipId);
      setEmployee(updated);
    } catch {
      /* ignore */
    } finally {
      setDeletingPayslipId(null);
    }
  };

  const handleUploadDocuments = async () => {
    const toUpload = documentRows.filter((row) => row.file?.fileName);
    if (!toUpload.length) {
      setDocError('Choose at least one file to upload');
      return;
    }
    setUploadingDocs(true);
    setDocError('');
    try {
      const payload = toUpload.map((row) => ({
        id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: row.type,
        fileName: row.file.fileName,
        size: row.file.size,
        uploadedAt: row.file.uploadedAt,
      }));
      const updated = await api.addHrEmployeeDocuments(employeeId, payload);
      setEmployee(updated);
      setDocumentRows([emptyDocRow()]);
    } catch (err) {
      setDocError(err.message || 'Failed to upload documents');
    } finally {
      setUploadingDocs(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'finance', label: 'Finance & Payroll' },
    { id: 'performance', label: 'Performance' },
    { id: 'documents', label: 'Documents' },
    { id: 'assets', label: 'Company Assets' },
  ];

  return (
    <div className="ws-hr-page ws-emp-profile-page">
      <Link to="/workspace/hr/employees" className="ws-back-link mb16">
        <AppIcon icon={Icons.chevronRight} size={14} className="ws-back-chevron" />
        Back to Employee Directory
      </Link>

      <div className="card ws-emp-profile-hero">
        <div className="ws-emp-profile-hero-inner">
          <EmployeeAvatar employee={employee} className="xl" />
          <div className="fx1">
            <h1 className="ws-page-title">{employee.name}</h1>
            <p className="ws-page-subtitle">{employee.role}</p>
            <div className="ws-emp-detail-badges mt8">
              <span className={`ws-emp-status ${status.chip}`}>{status.label}</span>
              <span className="chip chip-gray">{employee.department}</span>
              <span className="chip chip-gray">{employee.employmentType}</span>
              <span className="chip chip-gray">{employee.employeeId}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="ws-emp-profile-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`ws-emp-profile-tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="ws-emp-profile-content">
          <div className="ws-hr-grid-2">
            <section className="card ws-emp-detail-section">
              <h2 className="ws-emp-detail-section-title">Contact Information</h2>
              <DetailRow icon={Icons.mail} label="Email" value={employee.email} />
              <DetailRow icon={Icons.phone} label="Phone" value={employee.phone || '—'} />
              <DetailRow icon={Icons.mapPin} label="Location" value={employee.location} />
            </section>
            <section className="card ws-emp-detail-section">
              <h2 className="ws-emp-detail-section-title">Employment Details</h2>
              <DetailRow label="Employee ID" value={employee.employeeId} />
              <DetailRow label="Department" value={employee.department} />
              <DetailRow label="Joined" value={formatDate(employee.joinedAt)} />
              <DetailRow label="Tenure" value={employee.tenure || '—'} />
              <DetailRow label="Reports To" value={employee.reportsTo?.name || '—'} />
            </section>
          </div>

          {terms && (
            <div className="ws-hr-grid-2 mt16">
              <section className="card ws-emp-detail-section">
                <h2 className="ws-emp-detail-section-title">Probation & Notice Period</h2>
                <div className="ws-emp-detail-badges mb12">
                  <span className={`ws-emp-status ${probStatus.chip}`}>{probStatus.label}</span>
                </div>
                <DetailRow label="Probation Period" value={terms.probation?.durationMonths ? `${terms.probation.durationMonths} months` : '—'} />
                <DetailRow label="Probation Until" value={formatDate(terms.probation?.until)} />
                <DetailRow label="Notice (During Probation)" value={terms.noticePeriod?.duringProbationDays != null ? `${terms.noticePeriod.duringProbationDays} days` : '—'} />
                <DetailRow label="Notice (After Probation)" value={terms.noticePeriod?.afterProbationDays != null ? `${terms.noticePeriod.afterProbationDays} days` : '—'} />
              </section>
              <section className="card ws-emp-detail-section">
                <h2 className="ws-emp-detail-section-title">Bond Details</h2>
                {terms.bond?.applicable ? (
                  <>
                    <div className="ws-emp-detail-badges mb12">
                      <span className="ws-emp-status ws-emp-status-active">Bond Active</span>
                    </div>
                    <DetailRow label="Bond Duration" value={terms.bond.durationMonths ? `${terms.bond.durationMonths} months` : '—'} />
                    <DetailRow label="Bond Until" value={formatDate(terms.bond.until)} />
                    <DetailRow label="Bond Amount" value={terms.bond.amount ? formatINR(terms.bond.amount) : '—'} />
                  </>
                ) : (
                  <p className="ws-emp-detail-bio">No employment bond applicable for this employee.</p>
                )}
              </section>
            </div>
          )}

          <section className="card ws-emp-detail-section mt16">
            <h2 className="ws-emp-detail-section-title">About</h2>
            <p className="ws-emp-detail-bio">{employee.bio}</p>
          </section>

          {employee.skills?.length > 0 && (
            <section className="card ws-emp-detail-section mt16">
              <h2 className="ws-emp-detail-section-title">Skills</h2>
              <div className="ws-emp-skills">
                {employee.skills.map((skill) => (
                  <span key={skill} className="chip chip-blue">{skill}</span>
                ))}
              </div>
            </section>
          )}

          {employee.directReports?.length > 0 && (
            <section className="card ws-emp-detail-section mt16">
              <h2 className="ws-emp-detail-section-title">Direct Reports ({employee.directReports.length})</h2>
              <div className="ws-emp-reports">
                {employee.directReports.map((r) => (
                  <Link key={r.id} to={`/workspace/hr/employees/${r.id}`} className="ws-emp-report-item ws-emp-report-link">
                    <div className="ws-emp-avatar sm">{r.ini}</div>
                    <div>
                      <div className="ws-emp-name">{r.name}</div>
                      <div className="ws-emp-role">{r.role}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {activeTab === 'finance' && finance && (
        <div className="ws-emp-profile-content">
          <div className="ws-hr-grid-2">
            <section className="card ws-emp-detail-section">
              <h2 className="ws-emp-detail-section-title">Salary & Compensation</h2>
              <DetailRow label="Annual Salary (CTC)" value={formatINR(finance.annualSalary)} />
              <DetailRow label="Monthly Gross" value={formatINR(finance.monthlyGross)} />
              <DetailRow label="YTD Gross Earnings" value={formatINR(finance.ytdEarnings)} />
              <DetailRow label="YTD Net Paid" value={formatINR(finance.ytdNetPaid)} />
              <DetailRow label="YTD Deductions" value={formatINR(finance.ytdDeductions)} />
              <DetailRow label="Last Payment" value={`${formatINR(finance.lastPaymentAmount)} · ${formatDate(finance.lastPaymentDate)}`} />
            </section>

            <section className="card ws-emp-detail-section">
              <h2 className="ws-emp-detail-section-title">Payroll Details</h2>
              <DetailRow label="Bank" value={`${finance.bankName} ${finance.bankAccountMasked}`} />
              <DetailRow label="PAN" value={finance.panMasked} />
              <DetailRow label="UAN (PF)" value={finance.uan} />
            </section>
          </div>

          <section className="card ws-emp-detail-section mt16">
            <h2 className="ws-emp-detail-section-title">Bonuses & Reimbursements</h2>
            {finance.bonuses?.length === 0 && finance.reimbursements?.length === 0 && (
              <p className="ws-emp-detail-bio">No bonuses or reimbursements on record.</p>
            )}
            {finance.bonuses?.map((b) => (
              <div key={b.id} className="ws-emp-finance-line">
                <div>
                  <div className="ws-emp-name">{b.label}</div>
                  <div className="ws-emp-role">{formatDate(b.date)} · {b.status}</div>
                </div>
                <span className="ws-emp-finance-amount">{formatINR(b.amount)}</span>
              </div>
            ))}
            {finance.reimbursements?.map((r) => (
              <div key={r.id} className="ws-emp-finance-line">
                <div>
                  <div className="ws-emp-name">{r.description}</div>
                  <div className="ws-emp-role">{formatDate(r.date)} · {r.status}</div>
                </div>
                <span className="ws-emp-finance-amount">{formatINR(r.amount)}</span>
              </div>
            ))}
          </section>

          <section className="card ws-emp-detail-section mt16">
            <h2 className="ws-emp-detail-section-title">Payslips</h2>
            <p className="ws-emp-field-hint mb12">
              Upload payslip files for this employee&apos;s payroll records.
            </p>

            {finance.payslips?.length > 0 ? (
              <div className="ws-emp-table-wrap mb16">
                <table className="ws-emp-documents-table">
                  <thead>
                    <tr>
                      <th>File</th>
                      <th>Size</th>
                      <th>Uploaded</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {finance.payslips.map((slip) => (
                      <tr key={slip.id}>
                        <td>
                          <span className="ws-emp-doc-type-chip">
                            <AppIcon icon={Icons.fileText} size={16} />
                            {slip.fileName}
                          </span>
                        </td>
                        <td>{formatFileSize(slip.size)}</td>
                        <td>{formatDate(slip.uploadedAt)}</td>
                        <td>
                          <button
                            type="button"
                            className="ws-emp-delete-btn"
                            aria-label="Delete payslip"
                            disabled={deletingPayslipId === slip.id}
                            onClick={() => handleDeletePayslip(slip.id)}
                          >
                            <AppIcon icon={Icons.trash} size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="ws-emp-detail-bio mb16">No payslips uploaded yet.</p>
            )}

            <div className="ws-emp-doc-upload-section">
              <h3 className="ws-emp-form-section-title">Upload Payslip</h3>

              {payslipError && <div className="ws-emp-form-error">{payslipError}</div>}

              <div className="ws-emp-payslip-upload-simple">
                <label className="ws-hr-btn-outline ws-emp-file-label ws-emp-doc-file-btn">
                  <AppIcon icon={Icons.fileText} size={14} />
                  {payslipFile ? 'Change File' : 'Choose PDF'}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="ws-emp-file-input"
                    onChange={handlePayslipFileChange}
                  />
                </label>
                {payslipFile && (
                  <span className="ws-emp-doc-row-filename">
                    {payslipFile.fileName} · {formatFileSize(payslipFile.size)}
                  </span>
                )}
              </div>

              <div className="ws-emp-doc-upload-actions">
                <button
                  type="button"
                  className="ws-hr-btn-primary"
                  onClick={handleUploadPayslip}
                  disabled={uploadingPayslip}
                >
                  {uploadingPayslip ? 'Uploading…' : 'Upload Payslip'}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'performance' && performance && (
        <div className="ws-emp-profile-content">
          <div className="ws-hr-grid-2">
            <section className="card ws-emp-detail-section">
              <h2 className="ws-emp-detail-section-title">Current Review</h2>
              <div className="ws-perf-rating-summary">
                <div className="ws-perf-rating-main">
                  <span className="ws-perf-rating-value">{performance.overallRating}</span>
                  <span className="ws-perf-rating-of">/ 5</span>
                </div>
                <span className="chip chip-blue">{performance.ratingLabel}</span>
              </div>
              <DetailRow label="Reviewer" value={performance.reviewer || '—'} />
              <DetailRow label="Review Cycle" value={performance.reviewCycle || 'Half-yearly'} />
              <DetailRow label="Last Review" value={formatDate(performance.lastReviewDate)} />
              <DetailRow label="Next Review" value={formatDate(performance.nextReviewDate)} />
            </section>

            <section className="card ws-emp-detail-section">
              <h2 className="ws-emp-detail-section-title">Goals Summary</h2>
              <DetailRow
                label="Active Goals"
                value={performance.goals?.filter((g) => g.status !== 'Completed').length || 0}
              />
              <DetailRow
                label="Completed"
                value={performance.goals?.filter((g) => g.status === 'Completed').length || 0}
              />
              <DetailRow label="Total Goals" value={performance.goals?.length || 0} />
              <DetailRow
                label="KPIs Above Target"
                value={
                  performance.kpis?.filter((k) => k.score >= k.target).length || 0
                }
              />
            </section>
          </div>

          <section className="card ws-emp-detail-section mt16">
            <h2 className="ws-emp-detail-section-title">KPI Scores</h2>
            <div className="ws-hr-table-wrap">
              <table className="ws-hr-table ws-perf-kpi-table">
                <thead>
                  <tr>
                    <th>KPI</th>
                    <th>Score</th>
                    <th>Target</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {performance.kpis?.map((kpi) => (
                    <tr key={kpi.id}>
                      <td>{kpi.label}</td>
                      <td>{kpi.score}</td>
                      <td>{kpi.target}</td>
                      <td>
                        <span className={`chip ${kpi.score >= kpi.target ? 'chip-green' : 'chip-gray'}`}>
                          {kpi.score >= kpi.target ? 'Above target' : 'In progress'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card ws-emp-detail-section mt16">
            <h2 className="ws-emp-detail-section-title">Goals</h2>
            <div className="ws-perf-goals-list">
              {performance.goals?.map((goal) => (
                <div key={goal.id} className="ws-perf-goal-row">
                  <div className="ws-perf-goal-row-head">
                    <span className="ws-perf-goal-row-title">{goal.title}</span>
                    <span className={`chip ${goal.status === 'Completed' ? 'chip-green' : goal.status === 'On Track' ? 'chip-blue' : 'chip-gray'}`}>
                      {goal.status}
                    </span>
                  </div>
                  <div className="ws-perf-goal-progress">
                    <div className="ws-hr-progress-bar">
                      <div
                        className={`ws-hr-progress-fill${goal.status === 'Completed' ? ' complete' : ''}`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <span className="ws-perf-goal-pct">{goal.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card ws-emp-detail-section mt16">
            <h2 className="ws-emp-detail-section-title">Performance Reviews</h2>
            <div className="ws-perf-reviews-list">
              {performance.reviews?.map((review) => (
                <article key={review.id} className="ws-perf-review-entry">
                  <div className="ws-perf-review-entry-head">
                    <div>
                      <div className="ws-perf-review-period">{review.period}</div>
                      <div className="ws-perf-review-meta">
                        {formatDate(review.date)} · {review.reviewer}
                      </div>
                    </div>
                    <span className="ws-perf-review-score">{review.rating} / 5</span>
                  </div>
                  <p className="ws-perf-review-summary">{review.summary}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'assets' && (
        <div className="ws-emp-profile-content">
          <div className="ws-emp-assets-header">
            <p className="ws-emp-assets-summary">
              <strong>{assets.length}</strong> assets assigned
              <span className="ws-emp-assets-summary-sep">·</span>
              <strong>{formatINR(totalAssetValue)}</strong> estimated value
            </p>
            <button type="button" className="ws-hr-btn-primary" onClick={() => setAddAssetOpen(true)}>
              <AppIcon icon={Icons.plus} size={14} />
              Add Asset
            </button>
          </div>

          <div className="ws-emp-asset-grid">
            {assets.map((asset) => (
              <article key={asset.id} className="card ws-emp-asset-card">
                <div className="ws-emp-asset-image-wrap">
                  {asset.image?.url ? (
                    <img src={asset.image.url} alt={asset.name} className="ws-emp-asset-image" />
                  ) : (
                    <div className="ws-emp-asset-image-placeholder">
                      <AppIcon icon={assetIcon(asset.category)} size={32} />
                      <span className="ws-emp-field-hint">No image</span>
                    </div>
                  )}
                  <label className="ws-hr-btn-outline ws-emp-file-label ws-emp-asset-image-upload btn-sm">
                    <AppIcon icon={Icons.plus} size={12} />
                    {uploadingAssetId === asset.id ? 'Uploading…' : asset.image ? 'Change' : 'Add Photo'}
                    <input
                      type="file"
                      accept="image/*"
                      className="ws-emp-file-input"
                      disabled={uploadingAssetId === asset.id}
                      onChange={(e) => handleAssetImageUpload(asset.id, e)}
                    />
                  </label>
                </div>
                <div className="ws-emp-asset-card-body">
                  <div className="ws-emp-asset-card-head">
                    <h3 className="ws-emp-asset-name">{asset.name}</h3>
                    <span className={`chip ${asset.status === 'Assigned' ? 'chip-blue' : 'chip-gray'}`}>
                      {asset.status}
                    </span>
                  </div>
                  <span className="chip chip-gray">{asset.category}</span>
                  <div className="ws-emp-asset-meta">
                    <DetailRow label="Asset Tag" value={asset.assetTag} compact />
                    <DetailRow label="Serial No." value={asset.serial} compact />
                    <DetailRow label="Assigned" value={formatDate(asset.assignedAt)} compact />
                    {asset.value > 0 && <DetailRow label="Value" value={formatINR(asset.value)} compact />}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="ws-emp-profile-content">
          <section className="card ws-emp-detail-section">
            <h2 className="ws-emp-detail-section-title">Employee Documents</h2>
            {documents.length === 0 ? (
              <p className="ws-emp-detail-bio">No documents on file yet. Use the upload section below to add documents.</p>
            ) : (
              <div className="ws-emp-table-wrap">
                <table className="ws-emp-documents-table">
                  <thead>
                    <tr>
                      <th>Document</th>
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
                            <AppIcon icon={Icons.fileText} size={16} />
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

            <div className="ws-emp-doc-upload-section">
              <h3 className="ws-emp-form-section-title">Upload Documents</h3>
              <p className="ws-emp-field-hint mb12">
                Add ID proof, offer letter, contracts, or other HR documents. Use + to add multiple files at once.
              </p>

              {docError && <div className="ws-emp-form-error">{docError}</div>}

              <div className="ws-emp-doc-rows">
                {documentRows.map((row) => (
                  <div key={row.id} className="ws-emp-doc-row">
                    <select
                      className="fi ws-emp-doc-type"
                      value={row.type}
                      onChange={(e) => updateDocumentRow(row.id, { type: e.target.value })}
                    >
                      {HR_DOCUMENT_TYPES.map((d) => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                    <label className="ws-hr-btn-outline ws-emp-file-label ws-emp-doc-file-btn">
                      <AppIcon icon={Icons.fileText} size={14} />
                      {row.file ? 'Change File' : 'Choose File'}
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        className="ws-emp-file-input"
                        onChange={(e) => handleDocRowFileChange(row.id, e)}
                      />
                    </label>
                    {row.file && (
                      <span className="ws-emp-doc-row-filename" title={row.file.fileName}>
                        {row.file.fileName} · {formatFileSize(row.file.size)}
                      </span>
                    )}
                    {documentRows.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm ws-emp-doc-row-remove"
                        onClick={() => removeDocumentRow(row.id)}
                        aria-label="Remove row"
                      >
                        <AppIcon icon={Icons.x} size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="ws-emp-doc-upload-actions">
                <button type="button" className="ws-emp-add-doc-btn" onClick={addDocumentRow}>
                  <AppIcon icon={Icons.plus} size={14} />
                  Add another document
                </button>
                <button
                  type="button"
                  className="ws-hr-btn-primary"
                  onClick={handleUploadDocuments}
                  disabled={uploadingDocs}
                >
                  {uploadingDocs ? 'Uploading…' : 'Upload Documents'}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      <AddAssetModal
        open={addAssetOpen}
        employeeId={employeeId}
        onClose={() => setAddAssetOpen(false)}
        onAdded={(updated) => {
          setEmployee(updated);
          setAddAssetOpen(false);
        }}
      />
    </div>
  );
}

function assetIcon(category) {
  if (category === 'Laptop' || category === 'Tablet') return Icons.monitor;
  if (category === 'Phone') return Icons.phone;
  return Icons.fileText;
}

function DetailRow({ icon, label, value, compact = false }) {
  if (compact) {
    return (
      <div className="ws-emp-detail-row compact">
        <span className="ws-emp-detail-label">{label}</span>
        <span className="ws-emp-detail-value">{value}</span>
      </div>
    );
  }
  return (
    <div className="ws-emp-detail-row">
      <span className="ws-emp-detail-label">
        {icon && <AppIcon icon={icon} size={14} />}
        {label}
      </span>
      <span className="ws-emp-detail-value">{value}</span>
    </div>
  );
}
