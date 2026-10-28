import React from 'react';
import { Check, Circle, Flag, CheckCircle2 } from 'lucide-react';

export default function Timeline({ steps = [], active = 0, setActive }) {
  return (
    <aside className="timelineCard" aria-label="Journey Steps Timeline">
      <div className="timelineHeader">
        <span>WORKFLOW STAGES</span>
        <b>{steps.length} {steps.length === 1 ? 'Step' : 'Steps'}</b>
      </div>

      <div className="timelineEnd">
        <Flag size={14} color="#00a2f9" /> START PROCEDURE
      </div>

      <nav className="timelineNav" aria-label="Step navigation">
        {steps.map((step, i) => {
          const isPassed = i < active;
          const isCurrent = i === active;
          return (
            <React.Fragment key={step.id || i}>
              <button
                type="button"
                className={`timelineStep ${isCurrent ? 'active' : ''}`}
                onClick={() => setActive(i)}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`Step ${i + 1}: ${step.title}`}
              >
                <span className={`timelineNode ${isPassed ? 'passed' : isCurrent ? 'current' : ''}`}>
                  {isPassed ? (
                    <Check size={12} />
                  ) : isCurrent ? (
                    <Circle size={10} fill="currentColor" />
                  ) : (
                    String(i + 1).padStart(2, '0')
                  )}
                </span>
                <span className="timelineText">
                  <b>{step.title || `Step ${i + 1}`}</b>
                  <small>{isCurrent ? 'Viewing details' : isPassed ? 'Completed' : 'Upcoming step'}</small>
                </span>
              </button>
              {i < steps.length - 1 && <div className={`timelineConnector ${isPassed ? 'passed' : ''}`} />}
            </React.Fragment>
          );
        })}
      </nav>

      <div className="timelineEnd">
        <CheckCircle2 size={14} color="#16a34a" /> PROCEDURE COMPLETE
      </div>
    </aside>
  );
}
