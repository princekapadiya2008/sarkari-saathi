import React from 'react';
import { ArrowRight, ListChecks, MapPin, CalendarClock, Plus, ExternalLink, FileText, Building2 } from 'lucide-react';
import { CATEGORIES, DEMO_LABEL } from '../lib/constants';
import Badge from './Badge';

export default function JourneyCard({ journey, openJourney, useJourney }) {
  const Icon = CATEGORIES.find((c) => c.id.toLowerCase() === (journey.category || '').toLowerCase())?.icon;
  const stepCount = (journey.steps || []).length;
  const docCount = [
    ...new Set((journey.steps || []).flatMap((s) => s.requiredDocuments || []).filter(Boolean)),
  ].length;

  const isVerified = journey.verificationStatus === 'verified' || journey.status === 'published';

  return (
    <article className="journeyCard">
      <div className="cardTop">
        <span className="categoryIcon" title={journey.category || 'Government Service'}>
          {Icon ? <Icon size={20} /> : <ExternalLink size={20} />}
        </span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span className="categoryBadge">{journey.category || 'Government'}</span>
          <Badge variant={journey.isDemo ? 'demo' : 'neutral'}>
            {journey.isDemo ? DEMO_LABEL : journey.status === 'published' ? 'OFFICIAL' : 'COMMUNITY'}
          </Badge>
        </div>
      </div>

      <h3 onClick={() => openJourney(journey.id)} className="clickableTitle">
        {journey.title}
      </h3>

      <p>{journey.description || 'No description provided.'}</p>

      {journey.organizationName && (
        <div className="departmentTag">
          <Building2 size={13} />
          <span>{journey.organizationName}</span>
        </div>
      )}

      <div className="cardMeta">
        <span>
          <ListChecks size={14} /> {stepCount} step{stepCount !== 1 ? 's' : ''}
        </span>
        {docCount > 0 && (
          <span>
            <FileText size={14} /> {docCount} document{docCount !== 1 ? 's' : ''}
          </span>
        )}
        <span>
          <MapPin size={14} /> {journey.location || journey.region || 'India'}
        </span>
      </div>

      <div className="cardStatus">
        <span>
          <span className={`statusDot ${isVerified ? 'active' : ''}`} />{' '}
          {isVerified ? 'Verified official route' : `Status: ${journey.isDemo ? 'Demo' : 'Draft'}`}
        </span>
        {journey.lastVerified && (
          <span>
            <CalendarClock size={13} /> Verified {journey.lastVerified}
          </span>
        )}
      </div>

      <div className="cardActions">
        <button
          className="button secondary"
          onClick={() => openJourney(journey.id)}
          aria-label={`View ${journey.title}`}
        >
          View Route <ArrowRight size={14} />
        </button>
        <button
          className="button primary"
          onClick={() => useJourney(journey.id)}
          aria-label={`Use ${journey.title}`}
          title="Save an independent copy to your personal workspace"
        >
          <Plus size={14} /> Use This Journey
        </button>
      </div>
    </article>
  );
}
