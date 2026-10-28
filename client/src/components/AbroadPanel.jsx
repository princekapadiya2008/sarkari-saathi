import React from 'react';
import { CheckCircle2, FileText, Globe2, Plane, UserRound } from 'lucide-react';
import { DEMO_LABEL } from '../lib/constants';

export default function AbroadPanel({ mode, setMode, compact = false }) {
  return (
    <section className={`abroadPanel ${compact ? 'compact' : ''}`} aria-label="Living abroad mode">
      <div className="abroadTop">
        <div className="planeIcon">
          <Plane size={20} />
        </div>
        <div>
          <span className="eyebrow" style={{ color: '#93c5fd' }}>NRI &amp; Overseas Planning Mode</span>
          <h2>Where are you currently residing?</h2>
        </div>
        <div className="segmented">
          <button
            type="button"
            className={!mode ? 'selected' : ''}
            onClick={() => setMode(false)}
          >
            In India
          </button>
          <button
            type="button"
            className={mode ? 'selected' : ''}
            onClick={() => setMode(true)}
          >
            Outside India
          </button>
        </div>
      </div>

      {mode && (
        <div className="travelPlan">
          <div className="travelTitle">
            <Plane size={16} />
            <b>Plan Before You Travel to India</b>
            <span>{DEMO_LABEL}</span>
          </div>
          <p>
            Before travelling, verify mandatory physical-presence steps, embassy attestation requirements, prior appointment bookings, and online biometric submission options from official department portals.
          </p>
          <div className="travelChecks">
            <span>
              <FileText size={14} /> Documents to prepare
            </span>
            <span>
              <CheckCircle2 size={14} /> Prior appointment
            </span>
            <span>
              <Globe2 size={14} /> Online portal options
            </span>
            <span>
              <UserRound size={14} /> Physical counter step
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
