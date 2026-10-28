import React, { useState, useMemo } from 'react';
import {
  Plane,
  Plus,
  Trash2,
  ArrowRight,
  Route,
  MessageSquarePlus,
  Clock,
  Inbox,
  CheckCircle2,
  FileCheck2,
  Search,
  ExternalLink,
  Edit3,
} from 'lucide-react';
import { LIVING_ABROAD_TASKS, DEMO_LABEL } from '../lib/constants';

export default function MyJourneys({
  journeys = [],
  userRequests = [],
  openJourney,
  deleteJourney,
  startPersonalJourney,
  onRequestJourney,
  abroad,
  setAbroad,
  navigate,
}) {
  const [activeTab, setActiveTab] = useState('journeys');
  const [filterQuery, setFilterQuery] = useState('');
  const tasks = abroad?.tasks || LIVING_ABROAD_TASKS;

  const updateTask = (id, value) =>
    setAbroad({
      ...abroad,
      tasks: tasks.map((t) => (t.id === id ? { ...t, progress: Number(value) } : t)),
    });

  const formatRequestBadge = (status) => {
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

  const totalStepsCompleted = journeys.reduce(
    (sum, j) => sum + (j.completedSteps?.length || 0),
    0
  );
  const totalStepsAvailable = journeys.reduce(
    (sum, j) => sum + (j.steps?.length || 0),
    0
  );
  const inProgressCount = journeys.filter(
    (j) => (j.progress || 0) > 0 && (j.progress || 0) < 100
  ).length;

  const filteredJourneys = useMemo(() => {
    if (!filterQuery.trim()) return journeys;
    const q = filterQuery.toLowerCase();
    return journeys.filter(
      (j) =>
        (j.title || '').toLowerCase().includes(q) ||
        (j.category || '').toLowerCase().includes(q)
    );
  }, [journeys, filterQuery]);

  return (
    <main className="page">
      <div className="pageHeader">
        <div>
          <span className="eyebrow">Citizen Workspace</span>
          <h1>My Journeys &amp; Saved Routes</h1>
          <p>
            Track your ongoing applications, manage document checklists, and review submitted scheme requests.
            Your progress is saved securely in your private account.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {onRequestJourney && (
            <button className="button secondary" onClick={onRequestJourney}>
              <MessageSquarePlus size={15} /> Request a Journey
            </button>
          )}
          <button className="button primary" onClick={startPersonalJourney}>
            <Plus size={15} /> Create Personal Journey
          </button>
        </div>
      </div>

      {/* Citizen Overview Metrics */}
      <div className="dashboardStatsGrid">
        <div className="citizenStatCard">
          <div className="citizenStatIcon">
            <Route size={20} color="#00a2f9" />
          </div>
          <div>
            <span className="citizenStatLabel">Saved Journeys</span>
            <b className="citizenStatValue">{journeys.length}</b>
          </div>
        </div>

        <div className="citizenStatCard">
          <div className="citizenStatIcon">
            <CheckCircle2 size={20} color="#16a34a" />
          </div>
          <div>
            <span className="citizenStatLabel">Steps Completed</span>
            <b className="citizenStatValue">
              {totalStepsCompleted}
              <small style={{ fontSize: 13, fontWeight: 500, color: '#64748b', marginLeft: 4 }}>
                / {totalStepsAvailable}
              </small>
            </b>
          </div>
        </div>

        <div className="citizenStatCard">
          <div className="citizenStatIcon">
            <Clock size={20} color="#f59e0b" />
          </div>
          <div>
            <span className="citizenStatLabel">In Progress</span>
            <b className="citizenStatValue">{inProgressCount}</b>
          </div>
        </div>

        <div className="citizenStatCard">
          <div className="citizenStatIcon">
            <Inbox size={20} color="#6366f1" />
          </div>
          <div>
            <span className="citizenStatLabel">Submitted Requests</span>
            <b className="citizenStatValue">{userRequests.length}</b>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="adminTabs" role="tablist" style={{ margin: '24px 0 20px' }}>
        <button
          className={activeTab === 'journeys' ? 'active' : ''}
          onClick={() => setActiveTab('journeys')}
          role="tab"
          aria-selected={activeTab === 'journeys'}
        >
          My Saved Journeys <span>{journeys.length}</span>
        </button>
        <button
          className={activeTab === 'requests' ? 'active' : ''}
          onClick={() => setActiveTab('requests')}
          role="tab"
          aria-selected={activeTab === 'requests'}
        >
          My Submitted Requests <span>{userRequests.length}</span>
        </button>
      </div>

      {/* Tab: Journeys */}
      {activeTab === 'journeys' && (
        <div className="myGrid">
          <section className="panel" aria-label="Personal Journey Collection">
            <div className="panelHeading">
              <div>
                <span className="eyebrow">Personal Collection</span>
                <h2>Active Application Routes</h2>
              </div>
              {journeys.length > 3 && (
                <div className="tableSearchBox">
                  <Search size={14} />
                  <input
                    type="text"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder="Filter saved journeys..."
                    aria-label="Filter saved journeys"
                  />
                </div>
              )}
            </div>

            {journeys.length === 0 ? (
              <div className="emptyInline">
                <Route size={32} color="#94a3b8" />
                <b>No personal journeys saved yet.</b>
                <p>
                  Explore official published journeys to save a private copy with your own document checklist, or map your own custom process.
                </p>
                <div style={{ display: 'flex', gap: 10, marginTop: 14, justifyContent: 'center' }}>
                  <button className="button primary" onClick={startPersonalJourney}>
                    <Plus size={14} /> Create Personal Journey
                  </button>
                  {navigate && (
                    <button className="button secondary" onClick={() => navigate('explore')}>
                      Explore Official Catalog
                    </button>
                  )}
                </div>
              </div>
            ) : filteredJourneys.length === 0 ? (
              <div className="emptyInline">
                <b>No journeys matching &quot;{filterQuery}&quot;.</b>
                <button
                  type="button"
                  className="textButton"
                  style={{ marginTop: 8 }}
                  onClick={() => setFilterQuery('')}
                >
                  Clear filter
                </button>
              </div>
            ) : (
              filteredJourneys.map((j) => {
                const docs = [
                  ...new Set((j.steps || []).flatMap((s) => s.requiredDocuments || []).map((d) => d.trim()).filter(Boolean)),
                ];
                const checkedSet = new Set(
                  (j.checklist || [])
                    .filter((item) => Boolean(item.completed))
                    .map((item) => (item.document_name || item.name || '').trim().toLowerCase())
                );
                const completed = docs.filter((x) => checkedSet.has(x.toLowerCase())).length;
                const pct = docs.length ? Math.round((completed / docs.length) * 100) : 0;
                return (
                  <div className="planRow" key={j.id}>
                    <span className="categoryIcon">
                      <Route size={18} color="#00a2f9" />
                    </span>
                    <div className="planRowMain">
                      <div className="planRowTitleGroup">
                        <h3 onClick={() => openJourney(j.id)} className="clickableTitle">
                          {j.title}
                        </h3>
                        <span className="planOriginBadge">
                          {j.sourceJourneyId ? 'Official Catalog Copy' : 'Custom Personal Route'} ·{' '}
                          {(j.steps || []).length} steps
                        </span>
                      </div>

                      <div className="microProgress">
                        <span style={{ width: `${j.progress || 0}%` }} />
                      </div>

                      <div className="planMetricsRow">
                        <small>
                          <b>{j.progress || 0}%</b> Steps Complete
                        </small>
                        {docs.length > 0 && (
                          <small>
                            • <b>{pct}%</b> Documents Prepared ({completed}/{docs.length})
                          </small>
                        )}
                      </div>
                    </div>

                    <div className="planRowActions">
                      <button
                        className="button primary"
                        onClick={() => openJourney(j.id)}
                        title="Open and continue this journey"
                        aria-label={`Open journey ${j.title}`}
                      >
                        Continue <ArrowRight size={14} />
                      </button>
                      <button
                        className="iconButton danger"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Are you sure you want to remove the personal journey "${j.title}"? Your saved progress and checklist will be cleared.`
                            )
                          ) {
                            deleteJourney(j.id);
                          }
                        }}
                        title="Remove personal journey"
                        aria-label={`Remove journey ${j.title}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </section>

          {/* Living Abroad / NRI Support Panel */}
          <section className="panel" aria-label="Living Abroad Tasks">
            <div className="panelHeading">
              <div>
                <span className="eyebrow">NRI &amp; Overseas Tool</span>
                <h2>Administrative Trip Planner</h2>
              </div>
              <span className="demoTag">{DEMO_LABEL}</span>
            </div>
            <p className="muted" style={{ margin: '0 0 16px', fontSize: 12 }}>
              Plan essential administrative requirements before arriving in India (e.g. Aadhaar updates, PAN-Aadhaar linking, bank KYC, NRI certificate).
            </p>

            <div className="tasksList">
              {tasks.map((t) => (
                <div className="taskLine" key={t.id}>
                  <div>
                    <b>{t.title}</b>
                    <span>{t.progress}% Ready</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={t.progress}
                    onChange={(e) => updateTask(t.id, e.target.value)}
                    aria-label={`${t.title} progress`}
                  />
                  <strong>{t.progress}%</strong>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="button secondary full"
              style={{ marginTop: 16 }}
              onClick={() => setAbroad({ ...abroad, mode: !abroad.mode })}
            >
              {abroad?.mode ? '✓ Living abroad mode enabled' : 'Turn on Living Abroad mode'}{' '}
              <Plane size={15} />
            </button>
          </section>
        </div>
      )}

      {/* Tab: Requests */}
      {activeTab === 'requests' && (
        <section className="panel tablePanel" aria-label="My Submitted Requests">
          <div className="tableHeader">
            <div>
              <h2>Your Scheme &amp; Service Requests</h2>
              <span>Visual guide requests you have submitted to the Sarkari Saathi portal.</span>
            </div>
            {onRequestJourney && (
              <button className="button primary" onClick={onRequestJourney}>
                <MessageSquarePlus size={14} /> Submit New Request
              </button>
            )}
          </div>

          {userRequests.length === 0 ? (
            <div className="emptyInline">
              <Inbox size={32} color="#94a3b8" />
              <b>No requests submitted yet.</b>
              <p>Can&apos;t find a specific government process, certificate, or welfare scheme? Submit a request so our administrators can map it.</p>
              {onRequestJourney && (
                <button
                  className="button primary"
                  style={{ marginTop: 14 }}
                  onClick={onRequestJourney}
                >
                  <MessageSquarePlus size={14} /> Submit a Request
                </button>
              )}
            </div>
          ) : (
            userRequests.map((r) => (
              <div className="requestRow" key={r.id}>
                <div>
                  <b>{r.title}</b>
                  <span>
                    Category: {r.category || 'General'} · Submitted on{' '}
                    {r.createdAt ? r.createdAt.slice(0, 10) : 'Recently'}
                  </span>
                  {r.description && (
                    <p style={{ fontSize: 12, color: '#4b5563', margin: '4px 0 0' }}>
                      {r.description}
                    </p>
                  )}
                  {r.adminNotes && (
                    <div className="adminFeedbackNote">
                      <b>Admin Response:</b> {r.adminNotes}
                    </div>
                  )}
                </div>

                <span className={formatRequestBadge(r.status)}>
                  {r.status?.toUpperCase() || 'SUBMITTED'}
                </span>
              </div>
            ))
          )}
        </section>
      )}

      {/* Privacy Guarantee Banner */}
      <section className="futurePanel" style={{ marginTop: 24 }}>
        <div>
          <span className="eyebrow" style={{ color: '#93c5fd' }}>Privacy &amp; Data Isolation</span>
          <h2>Your Personal Journey Data Stays Private</h2>
          <p>
            When you use a journey from the official catalog, an independent copy is cloned into your account.
            Changes to the official catalog will never overwrite your notes, checklist marks, or completion history.
          </p>
        </div>
        <div className="futureTokens">
          <span>Private User Workspace</span>
          <span>Independent Storage</span>
          <span>Encrypted Session</span>
        </div>
      </section>
    </main>
  );
}
