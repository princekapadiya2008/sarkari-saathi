import React from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Clock3,
  ExternalLink,
  Globe2,
  MapPin,
  Building2,
  WalletCards,
  FileCheck2,
  HelpCircle,
  GitBranch,
} from 'lucide-react';

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="infoCard">
      <Icon size={17} />
      <div>
        <small>{label}</small>
        <b>{value || 'Not specified'}</b>
      </div>
    </div>
  );
}

export default function StepInspector({ step, index, total, setIndex }) {
  if (!step) return null;

  return (
    <div className="stepInspectorWrapper">
      <section className="panel stepInspector">
        <div className="stepHeaderTop">
          <span className="stepEyebrow">
            STEP {String(index + 1).padStart(2, '0')} OF {String(total).padStart(2, '0')}
          </span>
          <span className="stepProgressBadge">
            {Math.round(((index + 1) / total) * 100)}% Through Workflow
          </span>
        </div>

        <h1>{step.title}</h1>
        <p className="stepDescription">{step.description || 'No detailed instructions recorded for this step.'}</p>

        {/* Action Sequence Grid */}
        <div className="nextFlow">
          <div>
            <small>ACTION REQUIRED</small>
            <b>{step.description || step.title}</b>
          </div>
          <ArrowDown size={16} className="flowArrow" />
          <div>
            <small>DOCUMENTS NEEDED</small>
            <b>
              {Array.isArray(step.requiredDocuments) && step.requiredDocuments.length > 0
                ? step.requiredDocuments.join(', ')
                : 'No mandatory documents for this step'}
            </b>
          </div>
          <ArrowDown size={16} className="flowArrow" />
          <div className="nextHighlight">
            <small>WHAT HAPPENS NEXT</small>
            <b>{step.whatHappensNext || 'Proceed to the next stage upon departmental verification.'}</b>
          </div>
        </div>

        {/* Metadata Fact Grid */}
        <div className="infoGrid">
          <InfoCard icon={MapPin} label="Location / Counter" value={step.location} />
          <InfoCard
            icon={Building2}
            label="Responsible Department / Authority"
            value={step.responsibleOrganization}
          />
          <InfoCard icon={Clock3} label="Estimated Processing Time" value={step.estimatedTime} />
          <InfoCard icon={WalletCards} label="Official Statutory Fee" value={step.possibleFee} />
        </div>

        {/* Required Documents Pill List if present */}
        {Array.isArray(step.requiredDocuments) && step.requiredDocuments.length > 0 && (
          <div className="stepDocsSection">
            <div className="stepDocsHeader">
              <FileCheck2 size={16} color="#00a2f9" />
              <b>Mandatory Documents For This Step:</b>
            </div>
            <div className="stepDocsList">
              {step.requiredDocuments.map((doc, i) => (
                <span key={i} className="stepDocPill">
                  {doc}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Common Pitfalls & Rejection Reasons */}
        {Array.isArray(step.commonProblems) && step.commonProblems.length > 0 && (
          <div className="problemBox">
            <AlertTriangle size={18} />
            <div>
              <b>Frequent Rejection Reasons &amp; Tips:</b>
              {step.commonProblems.map((prob, i) => (
                <p key={i}>• {prob}</p>
              ))}
            </div>
          </div>
        )}

        {/* Official Source Reference */}
        <div className="sourceBox">
          <Globe2 size={18} />
          <div>
            <b>Official Department Guidelines &amp; Portal:</b>
            <p>
              {step.officialSource
                ? 'Official departmental website or service link for this stage.'
                : 'No specific departmental URL linked for this step. Refer to the main journey source.'}
            </p>
            {step.officialSource && (
              <a
                href={step.officialSource}
                target="_blank"
                rel="noopener noreferrer"
                className="officialSourceLink"
              >
                Open Official Portal <ExternalLink size={13} />
              </a>
            )}
          </div>
        </div>

        {/* Previous / Next Stepper Controls */}
        <div className="stepControls">
          <button
            type="button"
            className="button secondary"
            disabled={index === 0}
            onClick={() => setIndex(index - 1)}
            aria-label="Previous step"
          >
            <ArrowLeft size={15} /> Previous Step
          </button>
          <button
            type="button"
            className="button primary"
            disabled={index === total - 1}
            onClick={() => setIndex(index + 1)}
            aria-label="Next step"
          >
            Next Step <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* Decision Branching Card if configured */}
      {step.branch && (
        <section className="panel branchPanel" aria-label="Conditional Decision Branch">
          <div className="branchHeader">
            <GitBranch size={16} color="#00a2f9" />
            <span className="eyebrow">DECISION BRANCH</span>
          </div>
          <h2>{step.branch.question}</h2>
          <div className="branchGrid">
            <div className="branchOption yes">
              <span className="branchTag yes">IF YES</span>
              <b>{step.branch.yes || 'Continue to standard next step'}</b>
            </div>
            <div className="branchOption no">
              <span className="branchTag no">IF NO</span>
              <b>{step.branch.no || 'Follow alternate verification route'}</b>
            </div>
          </div>
          <p className="branchHint">
            Branches outline alternative paths (e.g. online biometric vs. manual offline application). Verify specific office policies at your local center.
          </p>
        </section>
      )}
    </div>
  );
}
