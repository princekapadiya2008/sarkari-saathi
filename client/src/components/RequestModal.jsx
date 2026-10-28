import React, { useState } from 'react';
import { X, Send, AlertCircle, Loader2 } from 'lucide-react';
import { CATEGORIES } from '../lib/constants';
import { api } from '../lib/api';

export default function RequestModal({ isOpen, onClose, onSubmitted, categories = CATEGORIES }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0]?.id || 'Government');
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!title.trim()) {
      errs.title = 'Title is required.';
    } else if (title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters.';
    } else if (title.trim().length > 150) {
      errs.title = 'Title must be 150 characters or fewer.';
    }

    if (!description.trim()) {
      errs.description = 'Please describe the process or journey needed.';
    } else if (description.trim().length < 10) {
      errs.description = 'Description must be at least 10 characters.';
    } else if (description.trim().length > 2000) {
      errs.description = 'Description must be 2000 characters or fewer.';
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setGeneralError('');
    setErrors({});

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const created = await api.createUserRequest({
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
      });
      setTitle('');
      setDescription('');
      if (onSubmitted) onSubmitted(created);
      onClose();
    } catch (err) {
      if (err.status === 409) {
        setGeneralError('You already have an open request with this title.');
      } else if (err.details?.fields) {
        setErrors(err.details.fields);
      } else {
        setGeneralError(err.message || 'Failed to submit request.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modalBackdrop" role="dialog" aria-modal="true" aria-labelledby="requestModalTitle">
      <div className="modalCard">
        <div className="modalHeader">
          <div>
            <span className="eyebrow">Citizen Feedback</span>
            <h2 id="requestModalTitle">Request a Service Journey</h2>
          </div>
          <button
            type="button"
            className="iconButton"
            onClick={onClose}
            aria-label="Close request dialog"
            disabled={loading}
          >
            <X size={16} />
          </button>
        </div>

        <p className="modalSub">
          Can't find a guide for a government process? Submit a request so our administrators can research and publish a visual route.
        </p>

        {generalError && (
          <div className="formError" role="alert" style={{ marginBottom: 14 }}>
            <AlertCircle size={15} />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <label className="formField">
            <span>
              Process / Service Title <strong className="requiredMark">*</strong>
            </span>
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
              }}
              placeholder="e.g. Birth Certificate Correction in Municipal Corporation"
              className={errors.title ? 'inputError' : ''}
              disabled={loading}
              required
            />
            {errors.title && <span className="fieldErrorText">{errors.title}</span>}
          </label>

          <label className="formField" style={{ marginTop: 12 }}>
            <span>Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={loading}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id}
                </option>
              ))}
            </select>
          </label>

          <label className="formField wide" style={{ marginTop: 12 }}>
            <span>
              Detailed Description <strong className="requiredMark">*</strong>
            </span>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors((prev) => ({ ...prev, description: null }));
              }}
              placeholder="Explain the required steps, documents, or pain points you encountered..."
              className={errors.description ? 'inputError' : ''}
              disabled={loading}
              rows={4}
              required
            />
            {errors.description && <span className="fieldErrorText">{errors.description}</span>}
          </label>

          <div className="modalActions">
            <button
              type="button"
              className="button secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="spinner" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
