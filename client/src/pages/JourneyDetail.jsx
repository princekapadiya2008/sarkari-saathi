import React, { useState } from 'react';
import {
  ChevronRight,
  Edit3,
  ExternalLink,
  MapPin,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Layers,
  ArrowLeft,
  Loader2,
  Route,
} from 'lucide-react';
import Timeline from '../components/Timeline';
import StepInspector from '../components/StepInspector';
import Checklist from '../components/Checklist';
import AbroadPanel from '../components/AbroadPanel';
import Badge from '../components/Badge';

export default function JourneyDetail({
  journey,
  kind,
  navigate,
  useJourney,
  updateProgress,
  onToggleChecklist,
  editUser,
  abroad,
  setAbroad,
  existingUserCopy = null,
  openUserJourney = null,
}) {
  const [active, setActive] = useState(0);
  const [isSavingStep, setIsSavingStep] = useState(false);
  const [progressError, setProgressError] = useState('');

  const personal = kind === 'user';
  const steps = journey?.steps || [];
  const step = steps[active] || steps[0] || null;
  const done = Boolean(step && journey?.completedSteps?.includes(step.id));
  const progress = personal ? journey?.progress || 0 : 0;

  if (!journey) {
    return (
      <main className="page">
        <div className="emptyState">
          <AlertCircle size={32} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h2>Journey not found</h2>
          <p>The requested government process route does not exist or has been unpublished.</p>
          <button
            className="button primary"
            style={{ marginTop: 14 }}
            onClick={() => navigate(personal ? 'my' : 'explore')}
          >
            <ArrowLeft size={15} /> Back to {personal ? 'My Journeys' : 'Explore Catalog'}
          </button>
        </div>
      </main>
    );
  }

  const handleToggleStep = async () => {
    if (!step || isSavingStep) return;
    setIsSavingStep(true);
    setProgressError('');
    try {
      if (updateProgress) {
        await updateProgress(journey.id, step.id);
      }
    } catch (err) {
      setProgressError(`Failed to save step status: ${err.message || 'Server connection error'}`);
    } finally {
      setIsSavingStep(false);
    }
  };

  return (
    <main className="page detailPage">
      {/* Breadcrumb Navigation */}
      <nav className="breadcrumbs" aria-label="Breadcrumbs">
        <button type="button" onClick={() => navigate(personal ? 'my' : 'explore')}>
          {personal ? 'My Journeys' : 'Explore'}
        </button>
        <ChevronRight size={13} />
        <span>{journey.category || 'Government Service'}</span>
        <ChevronRight size={13} />
        <b>{journey.title}</b>
      </nav>

      {/* Notice if user already has an active personal copy */}
      {!personal && existingUserCopy && openUserJourney && (
        <div className="existingCopyBanner" role="status">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Route size={20} color="#00a2f9" />
            <div>
              <b>You have an ongoing personal copy of this journey ({existingUserCopy.progress || 0}% complete).</b>
              <p style={{ margin: 0, fontSize: 13, color: '#4b5563' }}>
                Your step milestones and prepared documents are safely stored in your account.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="button primary"
            onClick={() => openUserJourney(existingUserCopy.id)}
          >
            Resume My Journey ({existingUserCopy.progress || 0}%)
          </button>
        </div>
      )}

      {/* Main Journey Header Card */}
      <div className="detailHeaderCard">
        <div className="detailHeaderTop">
          <div className="detailLabels">
            <span className="categoryBadge">{journey.category || 'Government'}</span>
            <Badge variant={personal ? 'neutral' : 'demo'}>
              {personal ? 'PERSONAL COPY' : 'OFFICIAL CATALOG'}
            </Badge>
            {!personal && (
              <span className="verifiedTag">
                <ShieldCheck size={14} color="#16a34a" />{' '}
                {journey.verificationStatus === 'verified'
                  ? 'Department Verified Route'
                  : 'Official Guidelines'}
              </span>
            )}
          </div>

          <div className="detailActions">
            {personal ? (
              <>
                {step && (
                  <button
                    type="button"
                    className={`button ${done ? 'secondary' : 'primary'}`}
                    disabled={isSavingStep}
                    onClick={handleToggleStep}
                    aria-label={done ? 'Mark Step Incomplete' : 'Mark Step Complete'}
                  >
                    {isSavingStep ? (
                      <Loader2 size={16} className="spinner" />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}
                    {isSavingStep
                      ? 'Saving...'
                      : done
                      ? 'Mark Step Incomplete'
                      : 'Mark Step Complete'}
                  </button>
                )}
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => editUser(journey.id)}
                >
                  <Edit3 size={15} /> Edit Personal Copy
                </button>
              </>
            ) : (
              <button
                type="button"
                className="button primary large"
                onClick={() => useJourney(journey.id)}
                title="Create or resume an independent copy in your personal workspace"
              >
                <Plus size={16} /> Use This Journey
              </button>
            )}
          </div>
        </div>

        {progressError && (
          <div className="formError" role="alert" style={{ margin: '14px 0' }}>
            <AlertCircle size={15} />
            <span>{progressError}</span>
          </div>
        )}

        <h1>{journey.title}</h1>
        <p className="detailSummary">{journey.description || 'No description provided.'}</p>

        <div className="journeyFacts">
          {journey.organizationName && (
            <span>
              <Building2 size={14} /> {journey.organizationName}
            </span>
          )}
          <span>
            <MapPin size={14} /> {journey.location || journey.region || 'National (All States)'}
          </span>
          <span>
            <Layers size={14} /> {steps.length} {steps.length === 1 ? 'Step' : 'Steps'}
          </span>
          {personal ? (
            <span>
              <CheckCircle2 size={14} color="#16a34a" /> {journey.completedSteps?.length || 0} of{' '}
              {steps.length} steps complete
            </span>
          ) : (
            journey.lastVerified && (
              <span>
                <Calendar size={14} /> Last Verified: {journey.lastVerified}
              </span>
            )
          )}
        </div>

        {/* Personal Progress Bar if in Personal Mode */}
        {personal && (
          <div className="detailProgress">
            <span>Overall Route Completion</span>
            <div className="progressBar">
              <span
                style={{
                  width: `${progress}%`,
                  background: progress === 100 ? '#16a34a' : '#00a2f9',
                }}
              />
            </div>
            <b>{progress}%</b>
          </div>
        )}
      </div>

      {/* Living Abroad Optional Planning Callout */}
      <AbroadPanel mode={abroad} setMode={setAbroad} compact />

      {/* Steps and Stepper Layout */}
      {steps.length === 0 ? (
        <div className="emptyInline">
          <AlertCircle size={24} color="#94a3b8" />
          <b>No steps recorded for this journey yet.</b>
        </div>
      ) : (
        <div className="detailGrid">
          <Timeline steps={steps} active={active} setActive={setActive} />
          <div className="detailRightCol">
            {step && (
              <StepInspector
                step={step}
                index={active}
                total={steps.length}
                setIndex={setActive}
              />
            )}
            {personal && (
              <Checklist journey={journey} onToggleChecklist={onToggleChecklist} />
            )}
          </div>
        </div>
      )}

      {/* Official Catalog Privacy Notice */}
      {!personal && (
        <div className="dataNote">
          <ExternalLink size={16} color="#00a2f9" />
          <span>
            <b>Independent Personal Storage:</b> Clicking <strong>&quot;Use This Journey&quot;</strong>{' '}
            creates or resumes an independent private copy in your personal account. Checking off
            documents and completing steps will be saved securely to your personal account in SQLite and
            will never alter the public catalog.
          </span>
        </div>
      )}
    </main>
  );
}
