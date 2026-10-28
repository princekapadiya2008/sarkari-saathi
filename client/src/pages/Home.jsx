import React from 'react';
import {
  ArrowRight,
  Check,
  ChevronRight,
  FileCheck,
  GitBranch,
  MapPin,
  MapPinned,
  Plane,
  ShieldCheck,
  Sparkles,
  Search,
  ExternalLink,
  Layers,
  BookOpen,
  Route,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import SearchBox from '../components/SearchBox';
import { CATEGORIES, EXAMPLE_SEARCHES, DEMO_LABEL } from '../lib/constants';

export default function Home({
  navigate,
  search,
  setSearch,
  abroad,
  setAbroad,
  session,
  userJourneys = [],
  openJourney,
}) {
  const submitSearch = () => navigate('explore');

  // Static preview stages when unauthenticated or no personal journey is active
  const previewStages = [
    { title: 'Check Eligibility & Guidelines', status: 'done', label: 'PREREQUISITE' },
    { title: 'Prepare Required Documents', status: 'done', label: 'DOCUMENTS READY' },
    { title: 'Submit Online / Offline Application', status: 'active', label: 'SUBMISSION' },
    { title: 'Fee Payment & Counter Verification', status: 'pending', label: 'VERIFICATION' },
    { title: 'Field / Police Verification (if applicable)', status: 'pending', label: 'AUDIT' },
    { title: 'Department Processing & Status Follow-up', status: 'pending', label: 'PROCESSING' },
    { title: 'Receive Certificate / Final Outcome', status: 'pending', label: 'COMPLETION' },
  ];

  // Active ongoing journey for authenticated user
  const activeUserJourneys = (userJourneys || []).filter((j) => (j.progress || 0) < 100);
  const primaryJourney = activeUserJourneys[0] || (userJourneys || [])[0] || null;

  return (
    <main className="homeContainer">
      {/* Hero Section */}
      <section className="heroSection">
        <div className="page heroGrid">
          <div className="heroCopy">
            <div className="eyebrow eyebrowPill">
              <ShieldCheck size={13} color="#00a2f9" /> Official Civic Process Navigator
            </div>
            <h1>
              Understand Any Government Service <span>Before You Start.</span>
            </h1>
            <p>
              Turn complicated administrative procedures, government welfare schemes, and certificate
              workflows into clear, verified, step-by-step visual journeys.
            </p>

            <SearchBox
              value={search}
              onChange={setSearch}
              onSubmit={submitSearch}
              placeholder="Search schemes, certificates, or services (e.g. Passport, Ration Card, Scholarship)..."
            />

            <div className="exampleSearches">
              <span>Popular searches:</span>
              {EXAMPLE_SEARCHES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => {
                    setSearch(example);
                    navigate('explore');
                  }}
                >
                  {example}
                </button>
              ))}
            </div>

            <div className="heroButtons">
              <button className="button primary large" onClick={() => navigate('explore')}>
                Explore Official Journeys <ArrowRight size={17} />
              </button>
              <button className="button secondary large" onClick={() => navigate('builder')}>
                Create a Journey
              </button>
            </div>

            <div className="heroTrust">
              <ShieldCheck size={16} color="#16a34a" />
              <span>
                Verified departmental workflows with official links. No middlemen, no spam, 100% open access.
              </span>
            </div>

            <div className="heroSignals">
              <span>
                <b>7</b> Standard Stages
              </span>
              <span>
                <b>1</b> Visual Route
              </span>
              <span>
                <b>0</b> Guesswork
              </span>
            </div>
          </div>

          {/* Interactive Route Visualizer (Live User Journey if authenticated, else Guided Demo) */}
          <div className="heroVisual">
            <div className="mapCard">
              <div className="mapTop">
                <span>
                  {primaryJourney && session
                    ? 'MY ACTIVE APPLICATION ROUTE'
                    : 'SAMPLE APPLICATION ROUTE'}
                </span>
                <span className="tinyTag">
                  {primaryJourney && session
                    ? `${primaryJourney.progress || 0}% COMPLETED`
                    : 'GUIDED WORKFLOW'}
                </span>
              </div>

              {primaryJourney && session ? (
                <>
                  <div className="mapStart">
                    <MapPinned size={16} /> {primaryJourney.title}
                  </div>

                  {(primaryJourney.steps || []).slice(0, 6).map((stage, i) => {
                    const isDone = (primaryJourney.completedSteps || []).includes(stage.id);
                    const isCurrent =
                      !isDone &&
                      (i === 0 ||
                        (primaryJourney.completedSteps || []).includes(
                          primaryJourney.steps[i - 1]?.id
                        ));
                    return (
                      <div className="miniStep" key={stage.id || i}>
                        <span
                          className={`miniNode ${
                            isDone ? 'done' : isCurrent ? 'active' : ''
                          }`}
                        >
                          {isDone ? (
                            <Check size={12} />
                          ) : (
                            String(i + 1).padStart(2, '0')
                          )}
                        </span>
                        <div>
                          <b>{stage.title}</b>
                          <small>
                            {isDone
                              ? 'COMPLETED'
                              : isCurrent
                              ? 'CURRENT STEP'
                              : 'UPCOMING'}
                          </small>
                        </div>
                      </div>
                    );
                  })}

                  <div className="mapDone">
                    <Check size={15} /> PROCEDURE COMPLETE / OUTCOME
                  </div>

                  <div className="routeProgress">
                    <span>Your Application Progress</span>
                    <div>
                      <i style={{ width: `${primaryJourney.progress || 0}%` }} />
                    </div>
                    <b>{primaryJourney.progress || 0}% Complete</b>
                  </div>

                  {openJourney && (
                    <button
                      type="button"
                      className="button primary full"
                      style={{ marginTop: 12 }}
                      onClick={() => openJourney(primaryJourney.id)}
                    >
                      Continue This Journey <ArrowRight size={14} />
                    </button>
                  )}
                </>
              ) : (
                <>
                  <div className="mapStart">
                    <MapPinned size={16} /> START APPLICATION
                  </div>

                  {previewStages.map((stage, i) => (
                    <div className="miniStep" key={stage.title}>
                      <span
                        className={`miniNode ${
                          stage.status === 'done'
                            ? 'done'
                            : stage.status === 'active'
                            ? 'active'
                            : ''
                        }`}
                      >
                        {stage.status === 'done' ? (
                          <Check size={12} />
                        ) : (
                          String(i + 1).padStart(2, '0')
                        )}
                      </span>
                      <div>
                        <b>{stage.title}</b>
                        <small>{stage.label}</small>
                      </div>
                    </div>
                  ))}

                  <div className="mapDone">
                    <Check size={15} /> CERTIFICATE / OUTCOME RECEIVED
                  </div>

                  <div className="routeProgress">
                    <span>Application Readiness</span>
                    <div>
                      <i style={{ width: '45%' }} />
                    </div>
                    <b>In Progress</b>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Citizen Active Journeys Section (Visible when user has saved journeys) */}
      {session && userJourneys && userJourneys.length > 0 && (
        <section className="section page inProgressSection">
          <div className="sectionHeading">
            <div>
              <span className="eyebrow">Citizen Workspace</span>
              <h2>Your In-Progress Journeys</h2>
              <p>
                Continue your active application workflows. All step milestones and document checklists
                persist securely in your account.
              </p>
            </div>
            <button className="textButton" onClick={() => navigate('my')}>
              View all in My Journeys ({userJourneys.length}) <ArrowRight size={14} />
            </button>
          </div>

          <div className="activeJourneysGrid">
            {userJourneys.slice(0, 3).map((j) => {
              const docs = [
                ...new Set(
                  (j.steps || [])
                    .flatMap((s) => s.requiredDocuments || [])
                    .map((d) => d.trim())
                    .filter(Boolean)
                ),
              ];
              const checkedCount = (j.checklist || []).filter((item) => item.completed).length;
              return (
                <div className="activeJourneyCard" key={j.id}>
                  <div className="activeJourneyHeader">
                    <span className="categoryBadge">{j.category || 'Government'}</span>
                    <span className="activeJourneyPercent">{j.progress || 0}% Done</span>
                  </div>
                  <h3>{j.title}</h3>
                  <p className="activeJourneyDept">
                    {j.organizationName || j.department || 'Official Department Workflow'}
                  </p>

                  <div className="progressBar" style={{ margin: '14px 0 10px' }}>
                    <span
                      style={{
                        width: `${j.progress || 0}%`,
                        background: (j.progress || 0) === 100 ? '#16a34a' : '#00a2f9',
                      }}
                    />
                  </div>

                  <div className="activeJourneyMeta">
                    <span>
                      <CheckCircle2 size={13} color="#16a34a" /> {j.completedSteps?.length || 0} of{' '}
                      {j.steps?.length || 0} steps
                    </span>
                    {docs.length > 0 && (
                      <span>
                        • <b>{checkedCount}</b>/{docs.length} docs ready
                      </span>
                    )}
                  </div>

                  {openJourney && (
                    <button
                      type="button"
                      className="button primary full"
                      style={{ marginTop: 14 }}
                      onClick={() => openJourney(j.id)}
                    >
                      Continue Journey <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Value Pillars Section */}
      <section className="section page">
        <div className="sectionHeading">
          <div>
            <span className="eyebrow">How It Helps You</span>
            <h2>Navigating Government Services Shouldn&apos;t Be A Puzzle</h2>
            <p>
              Sarkari Saathi breaks down complex administrative circulars into structured,
              citizen-friendly action items.
            </p>
          </div>
        </div>

        <div className="pillarsGrid">
          <div className="pillarCard">
            <div className="pillarIcon">
              <Layers size={22} color="#00a2f9" />
            </div>
            <h3>Verified Step-by-Step Routes</h3>
            <p>
              Every process is mapped into logical stages so you always know where to go, whom to
              approach, and what happens next.
            </p>
          </div>

          <div className="pillarCard">
            <div className="pillarIcon">
              <FileCheck size={22} color="#16a34a" />
            </div>
            <h3>Interactive Document Checklist</h3>
            <p>
              Review required identity proofs, residence documents, and affidavits before visiting
              government offices to avoid repeated visits.
            </p>
          </div>

          <div className="pillarCard">
            <div className="pillarIcon">
              <GitBranch size={22} color="#f59e0b" />
            </div>
            <h3>Decision Branching</h3>
            <p>
              Clear alternative guidance for online vs. offline procedures, Aadhaar-linked vs.
              non-linked workflows, and regional requirements.
            </p>
          </div>

          <div className="pillarCard">
            <div className="pillarIcon">
              <BookOpen size={22} color="#6366f1" />
            </div>
            <h3>Direct Official Sources</h3>
            <p>
              Every journey points directly to official government portals, department websites, and
              gazette guidelines for maximum reliability.
            </p>
          </div>
        </div>
      </section>

      {/* Category Explorer Section */}
      <section className="section page">
        <div className="sectionHeading">
          <div>
            <span className="eyebrow">Explore By Category</span>
            <h2>One Platform. Comprehensive Public Services.</h2>
            <p>
              Browse by administrative domain to inspect official steps, checklists, fees, and
              processing times.
            </p>
          </div>
          <button className="textButton" onClick={() => navigate('explore')}>
            View all categories <ArrowRight size={14} />
          </button>
        </div>

        <div className="categoryGrid">
          {CATEGORIES.map((cat) => (
            <button
              className="categoryTile"
              key={cat.id}
              onClick={() => {
                setSearch('');
                navigate('explore');
              }}
              aria-label={`Explore ${cat.id} schemes`}
            >
              <span className="categoryIcon">
                <cat.icon size={22} />
              </span>
              <b>{cat.id}</b>
              <p>{cat.description}</p>
              <ChevronRight size={15} />
            </button>
          ))}
        </div>
      </section>

      {/* Living Abroad / NRI Callout Banner */}
      <section className="page">
        <div className="abroadCallout">
          <div className="abroadCalloutIcon">
            <Plane size={24} />
          </div>
          <div>
            <span className="eyebrow" style={{ color: '#93c5fd' }}>
              For NRIs and Overseas Visitors
            </span>
            <h2>Plan Administrative Visits to India</h2>
            <p>
              Coordinate banking KYC, Aadhaar updates, PAN linking, and property document
              verifications before your visit.
            </p>
          </div>
          <div className="segmented">
            <button
              type="button"
              className={!abroad ? 'selected' : ''}
              onClick={() => setAbroad(false)}
            >
              Resident
            </button>
            <button
              type="button"
              className={abroad ? 'selected' : ''}
              onClick={() => setAbroad(true)}
            >
              Living Abroad
            </button>
          </div>
          {abroad && (
            <div className="abroadCalloutBody">
              <b>{DEMO_LABEL} — Overseas Administrative Planning Mode Active</b>
              <span>
                Surfacing recommended prior appointment bookings, embassy attestations, and document
                checklists required for overseas citizens. Verify all requirements on official
                portal portals.
              </span>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
