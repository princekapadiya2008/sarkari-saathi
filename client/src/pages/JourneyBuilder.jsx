import React, { useState } from 'react';
import { Plus, Trash2, ArrowRight, Route, Save, GitBranch, AlertCircle, Loader2 } from 'lucide-react';
import { CATEGORIES } from '../lib/constants';
import Badge from '../components/Badge';

const blankStep = (index = 0) => ({
  id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  title: '',
  description: '',
  requiredDocuments: [],
  location: '',
  responsibleOrganization: '',
  estimatedTime: 'Not provided',
  possibleFee: 'Not provided',
  whatHappensNext: '',
  commonProblems: [],
  officialSource: '',
  branch: null,
});

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  wide = false,
  error = null,
  required = false,
  disabled = false,
}) {
  return (
    <label className={wide ? 'formField wide' : 'formField'}>
      <span>
        {label} {required && <strong className="requiredMark">*</strong>}
      </span>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={error ? 'inputError' : ''}
        disabled={disabled}
      />
      {error && <span className="fieldErrorText">{error}</span>}
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
  placeholder,
  error = null,
  required = false,
  disabled = false,
}) {
  return (
    <label className="formField wide">
      <span>
        {label} {required && <strong className="requiredMark">*</strong>}
      </span>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={error ? 'inputError' : ''}
        disabled={disabled}
        rows={3}
      />
      {error && <span className="fieldErrorText">{error}</span>}
    </label>
  );
}

export default function JourneyBuilder({
  initial,
  categories = CATEGORIES,
  mode = 'user',
  onSave,
  onCancel,
}) {
  const official = mode === 'admin';
  const [form, setForm] = useState(() =>
    initial
      ? JSON.parse(JSON.stringify(initial))
      : {
          title: '',
          category: categories[0]?.id || 'Government',
          country: 'India',
          region: '',
          description: '',
          targetUser: '',
          organizationName: '',
          department: '',
          officialWebsite: '',
          sourceUrl: '',
          verificationStatus: 'unverified',
          lastVerified: '',
          location: '',
          isDemo: false,
          documents: [],
          branches: [],
          steps: [blankStep(1)],
        }
  );

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (k, v) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    if (errors[k]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[k];
        return copy;
      });
    }
  };

  const updateStep = (id, k, v) => {
    setForm((prev) => ({
      ...prev,
      steps: prev.steps.map((s) => (s.id === id ? { ...s, [k]: v } : s)),
    }));
    const errorKey = `step_${id}_${k}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[errorKey];
        return copy;
      });
    }
  };

  const removeStep = (id) => {
    if (form.steps.length <= 1) {
      setErrors((prev) => ({ ...prev, steps: 'A journey must have at least one step.' }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      steps: prev.steps.filter((s) => s.id !== id),
    }));
  };

  const addStep = () => {
    setForm((prev) => ({
      ...prev,
      steps: [...prev.steps, blankStep(prev.steps.length + 1)],
    }));
    if (errors.steps) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.steps;
        return copy;
      });
    }
  };

  const toggleBranch = (id, on) => {
    updateStep(
      id,
      'branch',
      on ? { question: '', yes: 'Continue to next step', no: 'Alternative procedure' } : null
    );
  };

  const validate = () => {
    const errs = {};

    if (!form.title || !form.title.trim()) {
      errs.title = 'Journey name is required.';
    } else if (form.title.trim().length < 3) {
      errs.title = 'Journey name must be at least 3 characters.';
    } else if (form.title.trim().length > 150) {
      errs.title = 'Journey name must be 150 characters or fewer.';
    }

    if (!form.category || !form.category.trim()) {
      errs.category = 'Please select a category.';
    }

    if (!form.steps || form.steps.length === 0) {
      errs.steps = 'Add at least one step to this journey.';
    } else {
      form.steps.forEach((s, idx) => {
        if (!s.title || !s.title.trim()) {
          errs[`step_${s.id}_title`] = `Step ${idx + 1} requires a title.`;
        } else if (s.title.trim().length < 2) {
          errs[`step_${s.id}_title`] = `Step ${idx + 1} title must be at least 2 characters.`;
        }

        if (s.branch) {
          if (!s.branch.question || !s.branch.question.trim()) {
            errs[`step_${s.id}_branch_q`] = 'Decision question is required.';
          } else if (s.branch.question.trim().length < 3) {
            errs[`step_${s.id}_branch_q`] = 'Question must be at least 3 characters.';
          }

          if (!s.branch.yes || !s.branch.yes.trim()) {
            errs[`step_${s.id}_branch_yes`] = 'YES destination/path is required.';
          }

          if (!s.branch.no || !s.branch.no.trim()) {
            errs[`step_${s.id}_branch_no`] = 'NO destination/path is required.';
          }
        }

        if (s.officialSource && !/^https?:\/\//i.test(s.officialSource.trim())) {
          errs[`step_${s.id}_source`] = 'URL must start with http:// or https://';
        }
      });
    }

    if (form.officialWebsite && !/^https?:\/\//i.test(form.officialWebsite.trim())) {
      errs.officialWebsite = 'Official website must start with http:// or https://';
    }

    if (form.sourceUrl && !/^https?:\/\//i.test(form.sourceUrl.trim())) {
      errs.sourceUrl = 'Source URL must start with http:// or https://';
    }

    if (official && form.verificationStatus === 'verified') {
      if (!form.lastVerified) {
        errs.lastVerified = 'Verified journeys require a last verified date.';
      } else {
        const today = new Date().toISOString().slice(0, 10);
        if (form.lastVerified > today) {
          errs.lastVerified = 'Last verified date cannot be in the future.';
        }
      }
      if (!form.officialWebsite && !form.sourceUrl) {
        errs.sourceUrl = 'Verified journeys require an official website or source URL.';
      }
    }

    return errs;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;

    setGeneralError('');
    setErrors({});

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        description: (form.description || '').trim(),
        location: (form.location || form.region || 'Location to verify').trim(),
        steps: form.steps.map((s) => ({
          ...s,
          title: s.title.trim(),
          description: (s.description || '').trim(),
          requiredDocuments: Array.isArray(s.requiredDocuments) ? s.requiredDocuments : [],
          commonProblems: Array.isArray(s.commonProblems) ? s.commonProblems : [],
          branch: s.branch?.question?.trim()
            ? {
                question: s.branch.question.trim(),
                yes: (s.branch.yes || 'Continue to next step').trim(),
                no: (s.branch.no || 'Alternative procedure').trim(),
              }
            : null,
        })),
      };

      const result = await onSave(payload);
      if (result?.error) {
        setGeneralError(result.error);
        if (result.details?.fields) {
          setErrors(result.details.fields);
        }
      }
    } catch (err) {
      setGeneralError(err.message || 'Failed to save journey. Please check your inputs.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="page">
      <div className="pageHeader">
        <div>
          <span className="eyebrow">{official ? 'Admin workspace' : 'Your personal workspace'}</span>
          <h1>{initial ? 'Edit ' : 'Create '}{official ? 'Official Journey' : 'Personal Journey'}</h1>
          <p>
            {official
              ? 'Create and maintain official catalog journeys. Drafts must be published in Admin to appear in Explore.'
              : 'Build a private journey that exists only in your personal workspace.'}
          </p>
        </div>
        <Badge variant={official ? 'demo' : 'neutral'}>
          {official ? 'ADMIN JOURNEY' : 'PERSONAL JOURNEY'}
        </Badge>
      </div>

      {generalError && (
        <div className="formError" role="alert" style={{ marginBottom: 20 }}>
          <AlertCircle size={16} />
          <span>{generalError}</span>
        </div>
      )}

      <form className="builderForm" onSubmit={submit} noValidate>
        <section className="panel">
          <div className="builderTitle">
            <Route size={19} />
            <div>
              <h2>Journey information</h2>
              <p>Key information regarding this process route.</p>
            </div>
          </div>

          <div className="formGrid">
            <Field
              label="Journey name"
              value={form.title}
              onChange={(v) => update('title', v)}
              placeholder="e.g. Passport Fresh Application"
              error={errors.title}
              required
              disabled={saving}
            />

            <label className="formField">
              <span>
                Category <strong className="requiredMark">*</strong>
              </span>
              <select
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
                disabled={saving}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id}
                  </option>
                ))}
              </select>
              {errors.category && <span className="fieldErrorText">{errors.category}</span>}
            </label>

            <Field
              label="Country"
              value={form.country}
              onChange={(v) => update('country', v)}
              placeholder="India"
              disabled={saving}
            />

            <Field
              label="State / region"
              value={form.region}
              onChange={(v) => update('region', v)}
              placeholder="e.g. All India / Gujarat"
              disabled={saving}
            />

            <Field
              label="Target user"
              value={form.targetUser}
              onChange={(v) => update('targetUser', v)}
              placeholder="Who is this journey for?"
              disabled={saving}
            />

            <Field
              label="Organization name"
              value={form.organizationName}
              onChange={(v) => update('organizationName', v)}
              placeholder="e.g. Ministry of External Affairs"
              disabled={saving}
            />

            <Field
              label="Department"
              value={form.department}
              onChange={(v) => update('department', v)}
              placeholder="e.g. Consular, Passport & Visa Division"
              disabled={saving}
            />

            <Field
              label="Location"
              value={form.location}
              onChange={(v) => update('location', v)}
              placeholder="Where the service is processed"
              disabled={saving}
            />

            <Field
              label="Official website"
              value={form.officialWebsite}
              onChange={(v) => update('officialWebsite', v)}
              placeholder="https://..."
              error={errors.officialWebsite}
              disabled={saving}
            />

            <Field
              label="Source URL"
              value={form.sourceUrl}
              onChange={(v) => update('sourceUrl', v)}
              placeholder="https://..."
              error={errors.sourceUrl}
              disabled={saving}
            />

            {official && (
              <>
                <label className="formField">
                  <span>Verification status</span>
                  <select
                    value={form.verificationStatus || 'unverified'}
                    onChange={(e) => update('verificationStatus', e.target.value)}
                    disabled={saving}
                  >
                    <option value="unverified">Unverified</option>
                    <option value="pending">Pending verification</option>
                    <option value="verified">Verified by admin</option>
                  </select>
                </label>

                <Field
                  label="Last verified date"
                  value={form.lastVerified}
                  onChange={(v) => update('lastVerified', v)}
                  type="date"
                  error={errors.lastVerified}
                  disabled={saving}
                />
              </>
            )}
          </div>

          <Textarea
            label="Description"
            value={form.description}
            onChange={(v) => update('description', v)}
            placeholder="What should someone understand from this journey?"
            error={errors.description}
            disabled={saving}
          />
        </section>

        <section className="panel">
          <div className="builderTitle">
            <Route size={19} />
            <div>
              <h2>Journey steps</h2>
              <p>Add ordered steps and optional decision branches.</p>
            </div>
            <button
              type="button"
              className="button secondary"
              onClick={addStep}
              disabled={saving}
            >
              <Plus size={15} /> Add step
            </button>
          </div>

          {errors.steps && (
            <div className="formError" role="alert" style={{ margin: '10px 0' }}>
              <AlertCircle size={15} />
              <span>{errors.steps}</span>
            </div>
          )}

          {form.steps.length === 0 ? (
            <div className="emptyInline">
              <b>No steps added.</b>
              <p>Add at least one step to start the route.</p>
            </div>
          ) : (
            form.steps.map((s, i) => (
              <div className="builderStep" key={s.id}>
                <div className="builderStepHeader">
                  <div>
                    <span>STEP {String(i + 1).padStart(2, '0')}</span>
                    <b>{s.title || 'Untitled step'}</b>
                  </div>
                  {form.steps.length > 1 && (
                    <button
                      type="button"
                      className="iconButton danger"
                      onClick={() => removeStep(s.id)}
                      title="Remove this step"
                      disabled={saving}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                <div className="formGrid">
                  <Field
                    label="Title"
                    value={s.title}
                    onChange={(v) => updateStep(s.id, 'title', v)}
                    placeholder="Step title"
                    error={errors[`step_${s.id}_title`]}
                    required
                    disabled={saving}
                  />

                  <Field
                    label="Location"
                    value={s.location}
                    onChange={(v) => updateStep(s.id, 'location', v)}
                    placeholder="Where to go"
                    disabled={saving}
                  />

                  <Field
                    label="Responsible organization"
                    value={s.responsibleOrganization}
                    onChange={(v) => updateStep(s.id, 'responsibleOrganization', v)}
                    placeholder="Responsible organization / department"
                    disabled={saving}
                  />

                  <Field
                    label="Estimated time"
                    value={s.estimatedTime}
                    onChange={(v) => updateStep(s.id, 'estimatedTime', v)}
                    placeholder="Not provided"
                    disabled={saving}
                  />

                  <Field
                    label="Possible fee"
                    value={s.possibleFee}
                    onChange={(v) => updateStep(s.id, 'possibleFee', v)}
                    placeholder="Not provided"
                    disabled={saving}
                  />

                  <Field
                    label="Official source"
                    value={s.officialSource}
                    onChange={(v) => updateStep(s.id, 'officialSource', v)}
                    placeholder="https://..."
                    error={errors[`step_${s.id}_source`]}
                    disabled={saving}
                  />
                </div>

                <Textarea
                  label="Description"
                  value={s.description}
                  onChange={(v) => updateStep(s.id, 'description', v)}
                  placeholder="What happens at this step?"
                  disabled={saving}
                />

                <label className="formField wide">
                  <span>Required documents (comma separated)</span>
                  <input
                    value={(s.requiredDocuments || []).join(', ')}
                    onChange={(e) =>
                      updateStep(
                        s.id,
                        'requiredDocuments',
                        e.target.value.split(',').map((x) => x.trim()).filter(Boolean)
                      )
                    }
                    placeholder="Aadhaar Card, Address Proof, Photograph"
                    disabled={saving}
                  />
                </label>

                <Textarea
                  label="What happens next?"
                  value={s.whatHappensNext}
                  onChange={(v) => updateStep(s.id, 'whatHappensNext', v)}
                  placeholder="What follows this step?"
                  disabled={saving}
                />

                <label className="formField wide">
                  <span>Common problems (comma separated)</span>
                  <input
                    value={(s.commonProblems || []).join(', ')}
                    onChange={(e) =>
                      updateStep(
                        s.id,
                        'commonProblems',
                        e.target.value.split(',').map((x) => x.trim()).filter(Boolean)
                      )
                    }
                    placeholder="Server down, Mismatched name in records"
                    disabled={saving}
                  />
                </label>

                <div className="branchBuilder">
                  <div>
                    <b>
                      <GitBranch size={15} /> Decision branch
                    </b>
                    <span>Optional conditional route decision.</span>
                  </div>
                  <button
                    type="button"
                    className={`button ${s.branch ? 'secondary' : 'ghost'}`}
                    onClick={() => toggleBranch(s.id, !s.branch)}
                    disabled={saving}
                  >
                    {s.branch ? 'Remove branch' : 'Add branch'}
                  </button>

                  {s.branch && (
                    <div className="branchFields">
                      <Field
                        label="Question"
                        value={s.branch.question}
                        onChange={(v) =>
                          updateStep(s.id, 'branch', { ...s.branch, question: v })
                        }
                        placeholder="e.g. Do you already have a verified Aadhaar phone link?"
                        error={errors[`step_${s.id}_branch_q`]}
                        required
                        disabled={saving}
                      />
                      <Field
                        label="YES path (Condition met)"
                        value={s.branch.yes}
                        onChange={(v) =>
                          updateStep(s.id, 'branch', { ...s.branch, yes: v })
                        }
                        placeholder="e.g. Continue to next step"
                        error={errors[`step_${s.id}_branch_yes`]}
                        required
                        disabled={saving}
                      />
                      <Field
                        label="NO path (Condition not met)"
                        value={s.branch.no}
                        onChange={(v) =>
                          updateStep(s.id, 'branch', { ...s.branch, no: v })
                        }
                        placeholder="e.g. Visit enrollment center to update phone"
                        error={errors[`step_${s.id}_branch_no`]}
                        required
                        disabled={saving}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </section>

        <div className="builderBottom">
          <button
            type="button"
            className="button secondary"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="button primary"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 size={15} className="spinner" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>
                  {initial
                    ? 'Save changes'
                    : official
                    ? 'Create Official Journey'
                    : 'Create Personal Journey'}
                </span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </form>
    </main>
  );
}
