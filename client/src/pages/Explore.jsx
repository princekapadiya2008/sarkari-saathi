import React, { useMemo, useState } from 'react';
import { Filter, Search, SlidersHorizontal, Plus, MessageSquarePlus, X, Route } from 'lucide-react';
import JourneyCard from '../components/JourneyCard';
import { CATEGORIES } from '../lib/constants';

export default function Explore({
  journeys = [],
  categories = CATEGORIES,
  search = '',
  setSearch,
  openJourney,
  useJourney,
  startPersonalJourney,
  onRequestJourney,
}) {
  const [category, setCategory] = useState('All');

  const filtered = useMemo(
    () =>
      journeys.filter(
        (j) =>
          (category === 'All' || (j.category || '').toLowerCase() === category.toLowerCase()) &&
          (!search.trim() ||
            `${j.title} ${j.description} ${j.category} ${j.department || ''} ${j.region || ''} ${j.location || ''}`
              .toLowerCase()
              .includes(search.toLowerCase()))
      ),
    [journeys, search, category]
  );

  return (
    <main className="page">
      <div className="pageHeader">
        <div>
          <span className="eyebrow">Published Official Catalog</span>
          <h1>Explore Government Journeys</h1>
          <p>
            Browse verified, step-by-step guides for government schemes, certificates, and civic procedures.
            Save an independent copy to your personal workspace to check off documents and track your progress.
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

      <div className="filterPanel">
        <div className="filterSearch">
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by keyword, scheme name, department, certificate, or documents..."
            aria-label="Search journeys"
          />
          {search && (
            <button
              type="button"
              className="clearSearchBtn"
              onClick={() => setSearch('')}
              aria-label="Clear search query"
              title="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="filterBar">
          <span>
            <SlidersHorizontal size={14} /> Category:
          </span>
          <button
            className={category === 'All' ? 'filterChip active' : 'filterChip'}
            onClick={() => setCategory('All')}
          >
            All Categories ({journeys.length})
          </button>
          {categories.map((c) => {
            const count = journeys.filter(
              (j) => (j.category || '').toLowerCase() === c.id.toLowerCase()
            ).length;
            return (
              <button
                key={c.id}
                className={category.toLowerCase() === c.id.toLowerCase() ? 'filterChip active' : 'filterChip'}
                onClick={() => setCategory(c.id)}
              >
                {c.id} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>
      </div>

      <div className="filterMetaRow">
        <span>
          Showing <b>{filtered.length}</b> of <b>{journeys.length}</b> verified official journeys
          {category !== 'All' && ` in ${category}`}
          {search && ` matching "${search}"`}
        </span>
        {(search || category !== 'All') && (
          <button
            type="button"
            className="textButton"
            onClick={() => {
              setSearch('');
              setCategory('All');
            }}
          >
            Reset filters
          </button>
        )}
      </div>

      <div className="journeyGrid">
        {filtered.map((j) => (
          <JourneyCard
            key={j.id}
            journey={j}
            openJourney={openJourney}
            useJourney={useJourney}
          />
        ))}

        {filtered.length === 0 && (
          <div className="emptyState">
            <Route size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
            <h2>No matching journeys found</h2>
            <p>
              We couldn&apos;t find any published journeys matching your criteria. Try adjusting your search query or selecting another category.
            </p>
            {onRequestJourney && (
              <button
                className="button primary"
                style={{ marginTop: 16 }}
                onClick={onRequestJourney}
              >
                <MessageSquarePlus size={15} /> Request this service journey
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
