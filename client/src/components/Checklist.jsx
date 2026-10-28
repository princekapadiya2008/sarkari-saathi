import React, { useMemo, useState } from 'react';
import { Check, FileText, RotateCcw, Loader2 } from 'lucide-react';

export default function Checklist({ journey, onToggleChecklist }) {
  const [savingDoc, setSavingDoc] = useState(null);
  const [checklistError, setChecklistError] = useState('');

  // Extract all unique mandatory documents across the journey's steps
  const documents = useMemo(
    () => [...new Set((journey.steps || []).flatMap((s) => s.requiredDocuments || []).map((d) => d.trim()).filter(Boolean))],
    [journey]
  );

  // Derive checked status strictly from the authoritative journey checklist array
  const checkedSet = useMemo(() => {
    if (!Array.isArray(journey?.checklist)) return new Set();
    return new Set(
      journey.checklist
        .filter((item) => Boolean(item.completed))
        .map((item) => (item.document_name || item.name || '').trim().toLowerCase())
    );
  }, [journey?.checklist]);

  const toggle = async (doc) => {
    const isNowDone = !checkedSet.has(doc.trim().toLowerCase());
    setSavingDoc(doc);
    setChecklistError('');
    try {
      if (onToggleChecklist) {
        await onToggleChecklist(journey.id, doc, isNowDone);
      }
    } catch (err) {
      setChecklistError(`Failed to update "${doc}": ${err.message || 'Server error'}`);
    } finally {
      setSavingDoc(null);
    }
  };

  const resetAll = async () => {
    if (!window.confirm('Are you sure you want to uncheck all documents in this checklist?')) return;
    setChecklistError('');
    const currentlyChecked = documents.filter((doc) => checkedSet.has(doc.toLowerCase()));
    for (const doc of currentlyChecked) {
      try {
        if (onToggleChecklist) {
          await onToggleChecklist(journey.id, doc, false);
        }
      } catch (err) {
        setChecklistError(`Failed to reset checklist: ${err.message || 'Server error'}`);
        break;
      }
    }
  };

  const checkedCount = documents.filter((doc) => checkedSet.has(doc.toLowerCase())).length;
  const progress = documents.length ? Math.round((checkedCount / documents.length) * 100) : 0;

  return (
    <section className="panel checklistPanel" aria-label="Required Documents Checklist">
      <div className="panelHeading">
        <div>
          <span className="eyebrow">Document Readiness</span>
          <h2>Mandatory Documents Checklist</h2>
          <p className="checklistSubtitle">
            Check off each original document and self-attested copy before your office visit or upload. Selections are stored securely in your private account.
          </p>
        </div>
        <div className="checklistBadgeGroup">
          <span className="checklistCount">
            <b>{checkedCount}</b> of <b>{documents.length}</b> prepared
          </span>
          <span className={`checklistPercent ${progress === 100 ? 'ready' : ''}`}>
            {progress}% Ready
          </span>
        </div>
      </div>

      <div className="progressBar" style={{ margin: '12px 0 16px' }}>
        <span
          style={{
            width: `${progress}%`,
            background: progress === 100 ? '#16a34a' : '#00a2f9',
          }}
        />
      </div>

      {checklistError && (
        <div className="formError" role="alert" style={{ marginBottom: 12 }}>
          <span>{checklistError}</span>
        </div>
      )}

      {documents.length === 0 ? (
        <div className="emptyInline" style={{ padding: '24px 16px' }}>
          <FileText size={22} color="#94a3b8" />
          <b>No specific documents listed for this journey.</b>
          <p>Refer to the step-by-step guidelines for any unlisted prerequisite proofs.</p>
        </div>
      ) : (
        <div className="checklistItemsList">
          {documents.map((doc) => {
            const isDone = checkedSet.has(doc.toLowerCase());
            const isSaving = savingDoc === doc;
            return (
              <label className={`checkItem ${isDone ? 'done' : ''} ${isSaving ? 'saving' : ''}`} key={doc}>
                <input
                  type="checkbox"
                  checked={isDone}
                  disabled={isSaving}
                  onChange={() => toggle(doc)}
                  aria-label={`Mark document ${doc} as ${isDone ? 'not prepared' : 'prepared'}`}
                />
                <span className={`checkVisual ${isDone ? 'checked' : ''}`}>
                  {isSaving ? (
                    <Loader2 size={12} className="spinner" />
                  ) : isDone ? (
                    <Check size={13} />
                  ) : null}
                </span>
                <span className="checkDocName">{doc}</span>
                {isDone && <span className="checkDoneTag">Ready</span>}
                {isSaving && <span className="checkSavingTag">Saving...</span>}
              </label>
            );
          })}
        </div>
      )}

      {documents.length > 0 && (
        <div className="checklistFooter">
          <button type="button" className="textButton" onClick={resetAll} disabled={savingDoc !== null}>
            <RotateCcw size={13} /> Reset Checklist
          </button>
          <span className="checklistAutoSave">✓ Synced to SQLite database</span>
        </div>
      )}
    </section>
  );
}
