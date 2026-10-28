import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  Tags,
  Inbox,
  ShieldAlert,
  Loader2,
  Check,
  XCircle,
  Eye,
  AlertCircle,
  Search,
  Building2,
  ExternalLink,
  Filter,
} from 'lucide-react';

export default function Admin({
  session,
  isVerifiedAdmin,
  journeys = [],
  categories = [],
  customCategories = [],
  requests = [],
  startAdminJourney,
  openJourney,
  editJourney,
  deleteJourney,
  setPublish,
  onAddCategory,
  onDeleteCategory,
  onUpdateRequestStatus,
  navigate,
}) {
  // Hard barrier: strictly ensure user has verified admin role
  if (!session || session.role !== 'admin' || !isVerifiedAdmin) {
    return (
      <main className="page adminPage">
        <div className="panel" style={{ textAlign: 'center', padding: '60px 24px', maxWidth: 560, margin: '40px auto' }}>
          <ShieldAlert size={48} color="#dc2626" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: 8, color: '#111827' }}>Access Denied</h2>
          <p style={{ color: '#4b5563', marginBottom: 24, lineHeight: 1.6 }}>
            You do not have administrative privileges to access this portal. This area is restricted to verified administrators.
          </p>
          <button
            className="button primary"
            onClick={() => navigate(session ? 'my' : 'signin')}
          >
            {session ? 'Go to My Journeys' : 'Sign In as Admin'}
          </button>
        </div>
      </main>
    );
  }

  const [tab, setTab] = useState('journeys');
  const [journeySearch, setJourneySearch] = useState('');
  const [requestFilter, setRequestFilter] = useState('all');
  const [newCategory, setNewCategory] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const published = journeys.filter((j) => j.status === 'published').length;
  const pendingRequests = requests.filter(
    (r) => r.status === 'submitted' || r.status === 'under_review' || r.status === 'pending'
  ).length;
  const recent = [...journeys].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));

  const filteredJourneys = useMemo(() => {
    if (!journeySearch.trim()) return journeys;
    const q = journeySearch.toLowerCase();
    return journeys.filter(
      (j) =>
        (j.title || '').toLowerCase().includes(q) ||
        (j.category || '').toLowerCase().includes(q) ||
        (j.organizationName || '').toLowerCase().includes(q)
    );
  }, [journeys, journeySearch]);

  const filteredRequests = useMemo(() => {
    if (requestFilter === 'all') return requests;
    if (requestFilter === 'pending') {
      return requests.filter(
        (r) => r.status === 'submitted' || r.status === 'under_review' || r.status === 'pending'
      );
    }
    return requests.filter((r) => r.status === requestFilter);
  }, [requests, requestFilter]);

  const handleDeleteJourney = (id, title) => {
    const ok = window.confirm(
      `Are you sure you want to delete the official journey "${title}"? This action cannot be undone.`
    );
    if (ok) {
      deleteJourney(id);
    }
  };

  const handleAddCategorySubmit = async (e) => {
    e.preventDefault();
    const val = newCategory.trim();
    if (!val) {
      setCategoryError('Category name cannot be empty.');
      return;
    }
    if (categories.some((c) => c.id.toLowerCase() === val.toLowerCase())) {
      setCategoryError('This category already exists.');
      return;
    }

    setActionLoading(true);
    setCategoryError('');
    try {
      await onAddCategory(val);
      setNewCategory('');
    } catch (err) {
      setCategoryError(err.message || 'Failed to create category.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCategorySubmit = async (id) => {
    const ok = window.confirm(`Are you sure you want to delete category "${id}"?`);
    if (!ok) return;

    setActionLoading(true);
    try {
      await onDeleteCategory(id);
    } catch (err) {
      alert(`Cannot delete category: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'accepted':
      case 'approved':
        return 'tableBadge published';
      case 'under_review':
        return 'tableBadge review';
      case 'rejected':
        return 'tableBadge rejected';
      default:
        return 'tableBadge draft';
    }
  };

  return (
    <main className="page adminPage">
      <div className="pageHeader">
        <div>
          <span className="eyebrow">Verified Administrator Workspace</span>
          <h1>Admin Dashboard</h1>
          <p>
            Manage official catalog journeys, review citizen requests, and maintain scheme taxonomy.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="button primary" onClick={startAdminJourney}>
            <Plus size={15} /> Create Official Journey
          </button>
        </div>
      </div>

      <div className="statsGrid">
        <Stat label="Total official journeys" value={journeys.length} />
        <Stat label="Published in catalog" value={published} />
        <Stat label="Pending citizen requests" value={pendingRequests} />
        <Stat label="Recently updated" value={recent[0]?.updatedAt?.slice(0, 10) || '—'} />
      </div>

      <div className="adminTabs" role="tablist">
        <button
          className={tab === 'journeys' ? 'active' : ''}
          onClick={() => setTab('journeys')}
          role="tab"
          aria-selected={tab === 'journeys'}
        >
          Journey Management <span>{journeys.length}</span>
        </button>
        <button
          className={tab === 'requests' ? 'active' : ''}
          onClick={() => setTab('requests')}
          role="tab"
          aria-selected={tab === 'requests'}
        >
          Citizen Requests <span>{pendingRequests} pending</span>
        </button>
        <button
          className={tab === 'categories' ? 'active' : ''}
          onClick={() => setTab('categories')}
          role="tab"
          aria-selected={tab === 'categories'}
        >
          Taxonomy &amp; Categories <span>{categories.length}</span>
        </button>
        <button
          className={tab === 'sources' ? 'active' : ''}
          onClick={() => setTab('sources')}
          role="tab"
          aria-selected={tab === 'sources'}
        >
          Sources &amp; Verification Audit
        </button>
      </div>

      {/* Tab: Journeys */}
      {tab === 'journeys' && (
        <section className="panel tablePanel" aria-label="Official Journeys">
          <div className="tableHeader">
            <div>
              <h2>Official Published &amp; Draft Journeys</h2>
              <span>Only journeys marked PUBLISHED appear in the public Explore catalog.</span>
            </div>
            {journeys.length > 2 && (
              <div className="tableSearchBox">
                <Search size={14} />
                <input
                  type="text"
                  value={journeySearch}
                  onChange={(e) => setJourneySearch(e.target.value)}
                  placeholder="Search official catalog..."
                  aria-label="Search official catalog"
                />
              </div>
            )}
          </div>

          {journeys.length === 0 ? (
            <div className="emptyInline">
              <b>No official journeys created yet.</b>
              <p>Create a new journey to populate the public catalog.</p>
              <button
                className="button primary"
                style={{ marginTop: 12 }}
                onClick={startAdminJourney}
              >
                <Plus size={14} /> Create Journey
              </button>
            </div>
          ) : filteredJourneys.length === 0 ? (
            <div className="emptyInline">
              <b>No journeys matching &quot;{journeySearch}&quot;.</b>
              <button
                type="button"
                className="textButton"
                style={{ marginTop: 8 }}
                onClick={() => setJourneySearch('')}
              >
                Clear search
              </button>
            </div>
          ) : (
            filteredJourneys.map((j) => (
              <div className="tableRow" key={j.id}>
                <div>
                  <b onClick={() => openJourney(j.id)} className="clickableTitle">
                    {j.title}
                  </b>
                  <span>
                    {j.category} · {j.steps?.length || 0} steps · {j.organizationName || 'Department not specified'}
                  </span>
                </div>

                <span className={`tableBadge ${j.status === 'published' ? 'published' : 'draft'}`}>
                  {j.status === 'published' ? 'PUBLISHED' : (j.verificationStatus || 'DRAFT').toUpperCase()}
                </span>

                <div className="rowButtons">
                  <button
                    type="button"
                    className={`button ${j.status === 'published' ? 'ghost' : 'secondary'}`}
                    onClick={() => setPublish(j.id, j.status !== 'published')}
                    title={j.status === 'published' ? 'Unpublish from catalog' : 'Publish to catalog'}
                  >
                    {j.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    type="button"
                    className="iconButton"
                    onClick={() => openJourney(j.id)}
                    title="View details"
                    aria-label={`View ${j.title}`}
                  >
                    <CheckCircle2 size={15} />
                  </button>
                  <button
                    type="button"
                    className="iconButton"
                    onClick={() => editJourney(j.id)}
                    title="Edit journey in Builder"
                    aria-label={`Edit ${j.title}`}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    className="iconButton danger"
                    onClick={() => handleDeleteJourney(j.id, j.title)}
                    title="Delete journey"
                    aria-label={`Delete ${j.title}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {/* Tab: Requests */}
      {tab === 'requests' && (
        <section className="panel tablePanel" aria-label="Journey Requests">
          <div className="tableHeader">
            <div>
              <h2>Citizen Service Requests</h2>
              <span>Review suggestions and requests submitted by citizens for missing processes.</span>
            </div>
            <div className="requestFilterGroup">
              <button
                type="button"
                className={`filterChip ${requestFilter === 'all' ? 'active' : ''}`}
                onClick={() => setRequestFilter('all')}
              >
                All ({requests.length})
              </button>
              <button
                type="button"
                className={`filterChip ${requestFilter === 'pending' ? 'active' : ''}`}
                onClick={() => setRequestFilter('pending')}
              >
                Pending ({pendingRequests})
              </button>
              <button
                type="button"
                className={`filterChip ${requestFilter === 'accepted' ? 'active' : ''}`}
                onClick={() => setRequestFilter('accepted')}
              >
                Accepted
              </button>
              <button
                type="button"
                className={`filterChip ${requestFilter === 'rejected' ? 'active' : ''}`}
                onClick={() => setRequestFilter('rejected')}
              >
                Rejected
              </button>
            </div>
          </div>

          {requests.length === 0 ? (
            <div className="emptyInline">
              <b>No requests submitted yet.</b>
              <p>Citizen requests will appear here for review and conversion into official routes.</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="emptyInline">
              <b>No requests matching filter &quot;{requestFilter}&quot;.</b>
            </div>
          ) : (
            filteredRequests.map((r) => (
              <div className="requestRow" key={r.id}>
                <div>
                  <b>{r.title}</b>
                  <span>
                    By {r.userName || r.user_name || 'Citizen'} ({r.userEmail || 'registered citizen'}) ·{' '}
                    {r.category || 'General'} · Submitted {r.createdAt?.slice(0, 10) || 'Recently'}
                  </span>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#4b5563', lineHeight: 1.5 }}>
                    {r.description}
                  </p>
                  {r.adminNotes && (
                    <div className="adminFeedbackNote">
                      <b>Admin Feedback:</b> {r.adminNotes}
                    </div>
                  )}
                </div>

                <span className={getStatusBadgeClass(r.status)}>
                  {(r.status || 'submitted').toUpperCase()}
                </span>

                <div className="rowButtons">
                  {r.status !== 'accepted' && (
                    <button
                      type="button"
                      className="button secondary"
                      onClick={() => {
                        const note = window.prompt(
                          'Add an admin acceptance note for the citizen (optional):',
                          'Accepted by admin team for official catalog mapping.'
                        );
                        if (note !== null) {
                          onUpdateRequestStatus(r.id, 'accepted', note);
                        }
                      }}
                      title="Accept request for mapping"
                    >
                      <Check size={13} /> Accept
                    </button>
                  )}
                  {r.status !== 'rejected' && r.status !== 'closed' && (
                    <button
                      type="button"
                      className="button ghost"
                      onClick={() => {
                        const note = window.prompt(
                          'Provide reason for rejection (optional):',
                          'Duplicate or out of scope.'
                        );
                        if (note !== null) {
                          onUpdateRequestStatus(r.id, 'rejected', note);
                        }
                      }}
                      title="Reject request"
                    >
                      <XCircle size={13} /> Reject
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {/* Tab: Categories */}
      {tab === 'categories' && (
        <section className="panel categoryAdminPanel" aria-label="Category Management">
          <div className="panelHeading">
            <div>
              <span className="eyebrow">Scheme Taxonomy</span>
              <h2>Categories &amp; Domains</h2>
              <p>Categories help citizens filter official journeys, welfare schemes, and visual routes.</p>
            </div>
          </div>

          <form onSubmit={handleAddCategorySubmit} className="categoryAdd" style={{ margin: '16px 0' }}>
            <input
              type="text"
              placeholder="New category name (e.g. Agriculture, Legal, Pension)"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              disabled={actionLoading}
              aria-label="New category name"
            />
            <button
              className="button primary"
              type="submit"
              disabled={actionLoading || !newCategory.trim()}
            >
              <Plus size={14} /> Add Category
            </button>
          </form>

          {categoryError && (
            <div className="formError" role="alert" style={{ marginBottom: 14 }}>
              <AlertCircle size={14} /> {categoryError}
            </div>
          )}

          <div className="customCategoryList">
            {categories.map((c) => (
              <span key={c.id} className="categoryPill">
                {c.id}
                {!c.isBuiltin && (
                  <button
                    type="button"
                    onClick={() => handleDeleteCategorySubmit(c.id)}
                    className="categoryDeleteBtn"
                    title={`Delete category ${c.id}`}
                    aria-label={`Delete category ${c.id}`}
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Tab: Sources Audit */}
      {tab === 'sources' && (
        <section className="panel tablePanel" aria-label="Sources & Verification Audit">
          <div className="tableHeader">
            <div>
              <h2>Official Sources &amp; Verification Audit</h2>
              <span>Audit source URLs and last verified dates across all published journeys.</span>
            </div>
          </div>

          {recent.length === 0 ? (
            <div className="emptyInline">
              <b>No sources to audit.</b>
            </div>
          ) : (
            recent.map((j) => (
              <div className="sourceRow" key={j.id}>
                <div>
                  <b onClick={() => openJourney(j.id)} className="clickableTitle">
                    {j.title}
                  </b>
                  <span>{j.organizationName || 'Department not specified'}</span>
                </div>
                <div>
                  <span>Last Verified</span>
                  <b>{j.lastVerified || 'Not set'}</b>
                </div>
                <div>
                  <span>Source URL</span>
                  <b>{j.sourceUrl || j.officialWebsite || 'None provided'}</b>
                </div>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => editJourney(j.id)}
                >
                  <Pencil size={13} /> Edit / Verify
                </button>
              </div>
            ))
          )}
        </section>
      )}
    </main>
  );
}

function Stat({ label, value }) {
  return (
    <div className="statCard">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}
