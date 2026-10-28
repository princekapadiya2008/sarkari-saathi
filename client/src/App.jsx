import React, { useEffect, useState, useCallback, useRef } from 'react';
import { DEMO_JOURNEYS, DEMO_REQUESTS } from './lib/demoData';
import { CATEGORIES, LIVING_ABROAD_TASKS } from './lib/constants';
import { readStorage, writeStorage } from './lib/storage';
import {
  cloneJourneyForUser,
  createAdminJourney,
  createUserJourney,
  updateAdminJourney,
  updateUserJourneyProgress,
} from './lib/journeyStore';
import { api } from './lib/api';

import Header from './components/Header';
import Footer from './components/Footer';
import RequestModal from './components/RequestModal';
import Home from './pages/Home';
import Explore from './pages/Explore';
import JourneyDetail from './pages/JourneyDetail';
import MyJourneys from './pages/MyJourneys';
import JourneyBuilder from './pages/JourneyBuilder';
import Admin from './pages/Admin';
import About from './pages/About';
import Auth from './pages/Auth';
import { Loader2, ShieldAlert } from 'lucide-react';

const KEYS = {
  session: 'journeymap_session',
  requests: 'jm_requests_v2',
  abroad: 'jm_abroad_v2',
  categories: 'jm_categories_v2',
};

export default function App() {
  const [page, setPage] = useState(() => {
    try {
      return sessionStorage.getItem('jm_current_page') || 'home';
    } catch {
      return 'home';
    }
  });
  const [isBackendLive, setIsBackendLive] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isVerifiedAdmin, setIsVerifiedAdmin] = useState(false);
  const [session, setSession] = useState(null); // Never assume role before server verification
  const [adminJourneys, setAdminJourneys] = useState(DEMO_JOURNEYS);
  const [userJourneys, setUserJourneys] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  const [requests, setRequests] = useState(DEMO_REQUESTS);
  const [abroad, setAbroad] = useState(() => readStorage(KEYS.abroad, { mode: false, tasks: LIVING_ABROAD_TASKS }));
  const [customCategories, setCustomCategories] = useState(() => readStorage(KEYS.categories, []));
  const [selected, setSelected] = useState(() => {
    try {
      const saved = sessionStorage.getItem('jm_selected_journey');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Persist current page & selected journey across refreshes
  useEffect(() => {
    try {
      sessionStorage.setItem('jm_current_page', page);
      if (selected) {
        sessionStorage.setItem('jm_selected_journey', JSON.stringify(selected));
      } else {
        sessionStorage.removeItem('jm_selected_journey');
      }
    } catch { /* ignore */ }
  }, [page, selected]);
  const [builder, setBuilder] = useState(null);
  const [globalSearch, setGlobalSearch] = useState('');
  const [toast, setToast] = useState('');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // Operation ID reference to prevent race conditions during auth operations
  const authOpSeqRef = useRef(0);

  // Persist local cache for non-sensitive preferences
  useEffect(() => writeStorage(KEYS.abroad, abroad), [abroad]);
  useEffect(() => writeStorage(KEYS.categories, customCategories), [customCategories]);

  // Toast auto-clear
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Global listener for session expiration from API calls
  useEffect(() => {
    const handleExpired = () => {
      setSession(null);
      setIsVerifiedAdmin(false);
      setUserJourneys([]);
      setUserRequests([]);
      localStorage.removeItem(KEYS.session);
      setToast('Your session has expired. Please sign in again.');
      setPage('signin');
    };
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  // Authoritative Backend Synchronization
  const checkBackendAndSync = useCallback(async () => {
    const currentOp = ++authOpSeqRef.current;
    setIsAuthChecking(true);

    try {
      const health = await api.health();
      if (authOpSeqRef.current !== currentOp) return; // Superceded by newer action

      if (health?.ok) {
        setIsBackendLive(true);

        // 1. Fetch categories from backend (server authoritative)
        try {
          const apiCats = await api.getCategories();
          if (authOpSeqRef.current === currentOp && Array.isArray(apiCats)) {
            const extra = apiCats
              .filter((c) => !CATEGORIES.some((builtin) => builtin.id.toLowerCase() === c.id.toLowerCase()))
              .map((c) => ({ id: c.id, description: c.description || 'Custom category', icon: null }));
            setCustomCategories(extra);
          }
        } catch (err) {
          console.warn('Failed to fetch categories:', err);
        }

        // 2. Fetch public catalog journeys (server authoritative; do NOT merge stale local records)
        try {
          const apiJourneys = await api.getJourneys();
          if (authOpSeqRef.current === currentOp && Array.isArray(apiJourneys)) {
            setAdminJourneys(apiJourneys);
          }
        } catch (err) {
          console.warn('Failed to fetch catalog journeys:', err);
        }

        // 3. Authoritative Session Check with Backend
        try {
          const meData = await api.me();
          if (authOpSeqRef.current !== currentOp) return;

          if (meData?.user) {
            const user = meData.user;
            setSession(user);
            const isAdmin = user.role === 'admin';
            setIsVerifiedAdmin(isAdmin);

            // Fetch user personal journeys
            try {
              const uJourneys = await api.getUserJourneys();
              if (authOpSeqRef.current === currentOp && Array.isArray(uJourneys)) {
                setUserJourneys(uJourneys);
              }
            } catch (err) {
              console.warn('Failed to fetch user journeys:', err);
            }

            // Fetch user requests
            try {
              const uReqs = await api.getUserRequests();
              if (authOpSeqRef.current === currentOp && Array.isArray(uReqs)) {
                setUserRequests(uReqs);
              }
            } catch (err) {
              console.warn('Failed to fetch user requests:', err);
            }

            // If verified admin, fetch full admin catalog & review requests
            if (isAdmin) {
              try {
                const admJourneys = await api.getAdminJourneys();
                if (authOpSeqRef.current === currentOp && Array.isArray(admJourneys)) {
                  setAdminJourneys(admJourneys);
                }
                const admReqs = await api.getAdminRequests();
                if (authOpSeqRef.current === currentOp && Array.isArray(admReqs)) {
                  setRequests(admReqs);
                }
              } catch (err) {
                console.warn('Failed to fetch admin data:', err);
              }
            }
          } else {
            // Unauthenticated response
            setSession(null);
            setIsVerifiedAdmin(false);
            setUserJourneys([]);
            setUserRequests([]);
            localStorage.removeItem(KEYS.session);
          }
        } catch {
          // api.me() returned 401 or failed: session expired
          if (authOpSeqRef.current === currentOp) {
            setSession(null);
            setIsVerifiedAdmin(false);
            setUserJourneys([]);
            setUserRequests([]);
            localStorage.removeItem(KEYS.session);
          }
        }
      }
    } catch {
      // Backend unreachable: do not treat any cached user as authenticated
      if (authOpSeqRef.current === currentOp) {
        setIsBackendLive(false);
        setSession(null);
        setIsVerifiedAdmin(false);
        setUserJourneys([]);
        setUserRequests([]);
        localStorage.removeItem(KEYS.session);
      }
    } finally {
      if (authOpSeqRef.current === currentOp) {
        setIsAuthChecking(false);
      }
    }
  }, []);

  useEffect(() => {
    checkBackendAndSync();
  }, [checkBackendAndSync]);

  // Reactive Route Guardian Effect: ensures unauthorized state transitions are immediately corrected
  useEffect(() => {
    if (isAuthChecking) return;

    if (page === 'admin') {
      if (!session) {
        setPage('signin');
        setToast('Please sign in with an administrator account to access Admin.');
      } else if (session.role !== 'admin' || !isVerifiedAdmin) {
        setPage('my');
        setToast('Access denied: You do not have administrator permissions.');
      }
    } else if (page === 'my') {
      if (!session) {
        setPage('signin');
        setToast('Please sign in to view your personal journeys.');
      }
    } else if (page === 'builder') {
      if (builder?.kind === 'admin' && (!session || session.role !== 'admin' || !isVerifiedAdmin)) {
        setPage(session ? 'my' : 'signin');
        setToast('Access denied: Administrator permissions required.');
      } else if (!session) {
        setPage('signin');
        setToast('Please sign in to create or edit a journey.');
      }
    } else if ((page === 'signin' || page === 'signup') && session) {
      setPage(session.role === 'admin' && isVerifiedAdmin ? 'admin' : 'my');
    }
  }, [page, session, isVerifiedAdmin, isAuthChecking, builder?.kind]);

  const categories = [...CATEGORIES, ...customCategories];
  const publishedAdmin = adminJourneys.filter((j) => j.status === 'published');
  const activeUserJourneys = userJourneys.filter((j) => (session ? j.userId === session.id : false));

  // Explicit Route Navigation
  const navigate = (next) => {
    if (next === 'admin') {
      if (!session) {
        setToast('Please sign in with an administrator account to access Admin.');
        setPage('signin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (session.role !== 'admin' || !isVerifiedAdmin) {
        setToast('Access denied: You do not have administrator permissions.');
        setPage('my');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    if (next === 'my' && !session) {
      setToast('Please sign in to view your personal journeys.');
      setPage('signin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (next === 'builder') {
      if (builder?.kind === 'admin' && (!session || session.role !== 'admin' || !isVerifiedAdmin)) {
        setToast('Access denied: Administrator permissions required.');
        setPage(session ? 'my' : 'signin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (!session) {
        setToast('Please sign in to create or customize a journey.');
        setPage('signin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    if ((next === 'signin' || next === 'signup') && session) {
      setPage(session.role === 'admin' && isVerifiedAdmin ? 'admin' : 'my');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const requireUser = (action) => {
    if (session) return true;
    setToast(`Please sign in to ${action}.`);
    navigate('signin');
    return false;
  };

  const openAdminJourney = (id) => {
    setSelected({ kind: 'admin', id });
    navigate('detail');
  };

  const openUserJourney = async (id) => {
    setSelected({ kind: 'user', id });
    navigate('detail');
    if (isBackendLive && id && id.startsWith('uj_')) {
      try {
        const fresh = await api.getUserJourney(id);
        if (fresh) {
          setUserJourneys((prev) => {
            const exists = prev.some((j) => j.id === id);
            return exists ? prev.map((j) => (j.id === id ? fresh : j)) : [fresh, ...prev];
          });
        }
      } catch (err) {
        console.warn('Failed to fetch fresh user journey:', err);
      }
    }
  };

  const selectedJourney =
    selected?.kind === 'admin'
      ? adminJourneys.find((j) => j.id === selected.id)
      : activeUserJourneys.find((j) => j.id === selected?.id);

  const startAdmin = () => {
    if (!session || session.role !== 'admin' || !isVerifiedAdmin) {
      setToast('Access denied: Administrator permissions required.');
      navigate(session ? 'my' : 'signin');
      return;
    }
    setBuilder({ kind: 'admin', id: null });
    navigate('builder');
  };

  const startUser = () => {
    if (requireUser('create a personal journey')) {
      setBuilder({ kind: 'user', id: null });
      navigate('builder');
    }
  };

  const builderInitial =
    builder?.kind === 'admin'
      ? adminJourneys.find((j) => j.id === builder.id)
      : activeUserJourneys.find((j) => j.id === builder?.id);

  // Authentication Flow
  const handleAuth = (mode) => async ({ name, email, password }) => {
    const normalized = email.trim().toLowerCase();

    if (!isBackendLive) {
      return {
        error: 'Authentication server is currently unavailable. Please ensure the backend server is running on port 3001.',
      };
    }

    const currentOp = ++authOpSeqRef.current;

    try {
      let responseUser;
      if (mode === 'signup') {
        const res = await api.register({ name, email: normalized, password });
        responseUser = res?.user;
        setToast('Account created successfully!');
      } else {
        const res = await api.login({ email: normalized, password });
        responseUser = res?.user;
        setToast(`Welcome back, ${responseUser?.name || 'Citizen'}!`);
      }

      if (responseUser && authOpSeqRef.current === currentOp) {
        setSession(responseUser);
        const isAdmin = responseUser.role === 'admin';
        setIsVerifiedAdmin(isAdmin);

        // Fetch user data
        try {
          const uJourneys = await api.getUserJourneys();
          if (Array.isArray(uJourneys)) setUserJourneys(uJourneys);
          const uReqs = await api.getUserRequests();
          if (Array.isArray(uReqs)) setUserRequests(uReqs);
        } catch { /* ignore */ }

        // Fetch admin data if admin
        if (isAdmin) {
          try {
            const admJourneys = await api.getAdminJourneys();
            if (Array.isArray(admJourneys)) setAdminJourneys(admJourneys);
            const admReqs = await api.getAdminRequests();
            if (Array.isArray(admReqs)) setRequests(admReqs);
          } catch { /* ignore */ }
          navigate('admin');
        } else {
          navigate('my');
        }
        return {};
      }
    } catch (err) {
      return {
        error: err.message || 'Authentication failed. Please check credentials.',
        code: err.code,
        details: err.details,
      };
    }
  };

  const handleSignOut = async () => {
    ++authOpSeqRef.current;
    try {
      if (isBackendLive) {
        await api.logout();
      }
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      setSession(null);
      setIsVerifiedAdmin(false);
      setUserJourneys([]);
      setUserRequests([]);
      localStorage.removeItem(KEYS.session);
      try {
        sessionStorage.removeItem('jm_current_page');
        sessionStorage.removeItem('jm_selected_journey');
      } catch { /* ignore */ }
      setToast('Signed out successfully.');
      navigate('home');
    }
  };

  // Clone an official catalog journey to user's personal journeys
  const useJourney = async (id) => {
    if (!requireUser('use this journey')) return;
    const existing = activeUserJourneys.find((uj) => uj.sourceJourneyId === id);
    if (existing) {
      setToast('Resuming your active personal journey with your saved progress.');
      openUserJourney(existing.id);
      return;
    }
    const source = publishedAdmin.find((j) => j.id === id);
    if (!source) {
      setToast('Source journey not found.');
      return;
    }

    if (isBackendLive) {
      try {
        const created = await api.createUserJourney({
          sourceJourneyId: source.id,
          title: source.title,
          category: source.category,
          country: source.country,
          region: source.region,
          description: source.description,
          targetUser: source.targetUser,
          organizationName: source.organizationName,
          department: source.department,
          officialWebsite: source.officialWebsite,
          sourceUrl: source.sourceUrl,
          location: source.location,
          steps: source.steps || [],
        });
        if (created) {
          setUserJourneys((prev) => [created, ...prev]);
          setToast('Personal copy created in My Journeys.');
          openUserJourney(created.id);
          return;
        }
      } catch (err) {
        setToast(`Error creating personal copy: ${err.message}`);
        return;
      }
    }

    // Offline fallback for demo only
    const clone = cloneJourneyForUser(source, session.id);
    setUserJourneys((prev) => [...prev, clone]);
    setToast('Personal copy created in My Journeys.');
    openUserJourney(clone.id);
  };

  // Save Admin Journey (Create / Update)
  const saveAdmin = async (data) => {
    if (!session || session.role !== 'admin' || !isVerifiedAdmin) {
      return { error: 'Access denied: You do not have administrator privileges.' };
    }

    if (isBackendLive) {
      try {
        if (data.id && !data.id.startsWith('admin-')) {
          const updated = await api.updateAdminJourney(data.id, data);
          setAdminJourneys((prev) => prev.map((j) => (j.id === data.id ? { ...j, ...updated } : j)));
          setToast('Official journey updated on server.');
          navigate('admin');
          return {};
        } else {
          const created = await api.createAdminJourney(data);
          setAdminJourneys((prev) => [created, ...prev]);
          setToast('Official journey created as draft on server.');
          navigate('admin');
          return {};
        }
      } catch (err) {
        return {
          error: err.message || 'Failed to save official journey to server.',
          code: err.code,
          details: err.details,
        };
      }
    }

    return { error: 'Backend server is offline. Saving official journeys requires a live backend connection.' };
  };

  // Save Personal Journey (Create / Update)
  const saveUser = async (data) => {
    if (!requireUser('create a personal journey')) {
      return { error: 'Sign in required.' };
    }

    if (isBackendLive) {
      try {
        if (data.id && data.id.startsWith('uj_')) {
          const updated = await api.updateUserJourney(data.id, data);
          setUserJourneys((prev) => prev.map((j) => (j.id === data.id ? { ...j, ...updated } : j)));
          setToast('Personal journey updated on server.');
          openUserJourney(data.id);
          return {};
        } else {
          const created = await api.createUserJourney(data);
          setUserJourneys((prev) => [created, ...prev]);
          setToast('Personal journey created on server.');
          openUserJourney(created.id);
          return {};
        }
      } catch (err) {
        return {
          error: err.message || 'Failed to save personal journey to server.',
          code: err.code,
          details: err.details,
        };
      }
    }

    return { error: 'Backend server is offline. Personal journeys require a live backend connection to persist.' };
  };

  // Update step progress
  const updateProgress = async (journeyId, stepId) => {
    const journey = userJourneys.find((j) => j.id === journeyId);
    if (!journey) return;

    const isDone = (journey.completedSteps || []).includes(stepId);
    const newCompleted = isDone
      ? journey.completedSteps.filter((x) => x !== stepId)
      : [...(journey.completedSteps || []), stepId];

    // Optimistic UI update
    setUserJourneys((prev) =>
      prev.map((j) => (j.id === journeyId ? updateUserJourneyProgress(j, newCompleted) : j))
    );

    if (isBackendLive) {
      try {
        const updated = await api.patchProgress(journeyId, { stepId, completed: !isDone });
        if (updated) {
          setUserJourneys((prev) =>
            prev.map((j) => (j.id === journeyId ? updated : j))
          );
        }
      } catch (err) {
        console.error('Failed to patch progress on backend:', err);
        // Rollback optimistic update on error
        setUserJourneys((prev) =>
          prev.map((j) => (j.id === journeyId ? journey : j))
        );
        setToast(`Failed to save step progress to server: ${err.message || 'Server error'}`);
        throw err;
      }
    }
  };

  // Update checklist item
  const handleToggleChecklist = async (journeyId, documentName, checked) => {
    const journey = userJourneys.find((j) => j.id === journeyId);
    if (!journey) return;

    // Optimistic UI update
    setUserJourneys((prev) =>
      prev.map((j) => {
        if (j.id !== journeyId) return j;
        const currentList = Array.isArray(j.checklist) ? j.checklist : [];
        const exists = currentList.some((item) => (item.document_name || item.name) === documentName);
        const nextList = exists
          ? currentList.map((item) =>
              (item.document_name || item.name) === documentName
                ? { ...item, completed: checked }
                : item
            )
          : [...currentList, { name: documentName, document_name: documentName, completed: checked }];
        return { ...j, checklist: nextList };
      })
    );

    if (isBackendLive) {
      try {
        const updated = await api.patchChecklist(journeyId, {
          documentName,
          checked,
          completed: checked,
        });
        if (updated) {
          setUserJourneys((prev) =>
            prev.map((j) => (j.id === journeyId ? updated : j))
          );
        }
      } catch (err) {
        console.error('Failed to patch checklist on backend:', err);
        // Rollback optimistic update on error
        setUserJourneys((prev) =>
          prev.map((j) => (j.id === journeyId ? journey : j))
        );
        setToast(`Failed to save checklist selection to server: ${err.message || 'Server error'}`);
        throw err;
      }
    }
  };

  // Admin delete
  const deleteAdmin = async (id) => {
    if (!session || session.role !== 'admin' || !isVerifiedAdmin) {
      setToast('Access denied.');
      return;
    }

    if (isBackendLive && !id.startsWith('admin-')) {
      try {
        await api.deleteAdminJourney(id);
      } catch (err) {
        setToast(`Failed to delete from server: ${err.message}`);
        return;
      }
    }
    setAdminJourneys((prev) => prev.filter((j) => j.id !== id));
    setToast('Official journey deleted.');
  };

  // Admin publish/unpublish
  const setPublish = async (id, publish) => {
    if (!session || session.role !== 'admin' || !isVerifiedAdmin) {
      setToast('Access denied.');
      return;
    }

    const newStatus = publish ? 'published' : 'draft';
    if (isBackendLive && !id.startsWith('admin-')) {
      try {
        await api.setAdminJourneyStatus(id, newStatus);
      } catch (err) {
        setToast(`Failed to update status on server: ${err.message}`);
        return;
      }
    }
    setAdminJourneys((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: newStatus, updatedAt: new Date().toISOString() } : j))
    );
    setToast(publish ? 'Journey published to Explore.' : 'Journey unpublished from Explore.');
  };

  // Admin Category Operations
  const handleAddCategory = async (name) => {
    if (!session || session.role !== 'admin' || !isVerifiedAdmin) return;
    if (isBackendLive) {
      const created = await api.createAdminCategory({
        id: name,
        name,
        description: 'Custom category',
      });
      setCustomCategories((prev) => [...prev, { id: created.id || name, description: 'Custom category', icon: null }]);
    } else {
      setCustomCategories((prev) => [...prev, { id: name, description: 'Custom category', icon: null }]);
    }
    setToast(`Category "${name}" added.`);
  };

  const handleDeleteCategory = async (id) => {
    if (!session || session.role !== 'admin' || !isVerifiedAdmin) return;
    if (isBackendLive) {
      try {
        await api.deleteAdminCategory(id);
      } catch (err) {
        setToast(`Failed to delete category: ${err.message}`);
        return;
      }
    }
    setCustomCategories((prev) => prev.filter((c) => c.id !== id));
    setToast(`Category "${id}" removed.`);
  };

  // Admin Request Review Operations
  const handleUpdateRequestStatus = async (id, status, note = '') => {
    if (!session || session.role !== 'admin' || !isVerifiedAdmin) return;
    if (isBackendLive) {
      try {
        await api.updateAdminRequest(id, { status, note });
      } catch (err) {
        setToast(`Failed to update request: ${err.message}`);
        return;
      }
    }
    setRequests((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
    setToast(`Request status updated to ${status}.`);
  };

  // Delete personal journey
  const deleteUser = async (id) => {
    if (isBackendLive && id.startsWith('uj_')) {
      try {
        await api.deleteUserJourney(id);
      } catch (err) {
        setToast(`Failed to delete journey on server: ${err.message}`);
        return;
      }
    }
    setUserJourneys((prev) => prev.filter((j) => j.id !== id));
    setToast('Personal journey removed.');
  };

  // Citizen request submitted
  const handleCitizenRequestSubmitted = (created) => {
    if (created) {
      setUserRequests((prev) => [created, ...prev]);
      setToast('Journey request submitted successfully for administrative review!');
    }
  };

  return (
    <div className="appShell">
      <Header
        page={page}
        navigate={navigate}
        startNewJourney={startUser}
        session={session}
        onSignOut={handleSignOut}
        isBackendLive={isBackendLive}
      />

      {page === 'home' && (
        <Home
          navigate={navigate}
          search={globalSearch}
          setSearch={setGlobalSearch}
          abroad={abroad.mode}
          setAbroad={(mode) => setAbroad((v) => ({ ...v, mode }))}
          session={session}
          userJourneys={activeUserJourneys}
          openJourney={openUserJourney}
        />
      )}

      {page === 'explore' && (
        <Explore
          journeys={publishedAdmin}
          categories={categories}
          search={globalSearch}
          setSearch={setGlobalSearch}
          openJourney={openAdminJourney}
          useJourney={useJourney}
          startPersonalJourney={startUser}
          onRequestJourney={() => {
            if (requireUser('request a journey')) {
              setIsRequestModalOpen(true);
            }
          }}
        />
      )}

      {page === 'my' && (
        isAuthChecking ? (
          <main className="page">
            <div className="emptyState" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <Loader2 size={32} className="spinner" style={{ margin: '0 auto 12px' }} />
              <h2>Verifying session...</h2>
            </div>
          </main>
        ) : session ? (
          <MyJourneys
            journeys={activeUserJourneys}
            userRequests={userRequests}
            openJourney={openUserJourney}
            deleteJourney={deleteUser}
            startPersonalJourney={startUser}
            onRequestJourney={() => setIsRequestModalOpen(true)}
            abroad={abroad}
            setAbroad={setAbroad}
            navigate={navigate}
          />
        ) : (
          <main className="page">
            <div className="emptyState" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <h2>Sign In Required</h2>
              <p>Please sign in to access your personal journey collection and saved progress.</p>
              <button className="button primary" onClick={() => navigate('signin')}>
                Sign In
              </button>
            </div>
          </main>
        )
      )}

      {page === 'detail' && selectedJourney && (
        <JourneyDetail
          journey={selectedJourney}
          kind={selected.kind}
          navigate={navigate}
          useJourney={useJourney}
          updateProgress={updateProgress}
          onToggleChecklist={handleToggleChecklist}
          editUser={(id) => {
            setBuilder({ kind: 'user', id });
            navigate('builder');
          }}
          abroad={abroad.mode}
          setAbroad={(mode) => setAbroad((v) => ({ ...v, mode }))}
          existingUserCopy={
            selected.kind === 'admin'
              ? activeUserJourneys.find((uj) => uj.sourceJourneyId === selectedJourney.id)
              : null
          }
          openUserJourney={openUserJourney}
        />
      )}

      {page === 'builder' && (
        isAuthChecking ? (
          <main className="page">
            <div className="emptyState" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <Loader2 size={32} className="spinner" style={{ margin: '0 auto 12px' }} />
              <h2>Verifying credentials...</h2>
            </div>
          </main>
        ) : (builder?.kind === 'admin' ? (session?.role === 'admin' && isVerifiedAdmin) : session) ? (
          <JourneyBuilder
            initial={builderInitial}
            categories={categories}
            mode={builder?.kind || 'user'}
            onSave={builder?.kind === 'admin' ? saveAdmin : saveUser}
            onCancel={() => {
              navigate(builder?.kind === 'admin' ? 'admin' : 'my');
            }}
          />
        ) : (
          <main className="page">
            <div className="emptyState" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <h2>{builder?.kind === 'admin' ? 'Admin Access Required' : 'Sign In Required'}</h2>
              <p>
                {builder?.kind === 'admin'
                  ? 'Administrator privileges are required to create or edit official catalog journeys.'
                  : 'Please sign in to create or customize journeys.'}
              </p>
              <button className="button primary" onClick={() => navigate(session ? 'my' : 'signin')}>
                {session ? 'Go to My Journeys' : 'Sign In'}
              </button>
            </div>
          </main>
        )
      )}

      {page === 'admin' && (
        isAuthChecking ? (
          <main className="page adminPage">
            <div className="emptyState" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <Loader2 size={32} className="spinner" style={{ margin: '0 auto 12px' }} />
              <h2>Verifying administrator credentials...</h2>
            </div>
          </main>
        ) : (session?.role === 'admin' && isVerifiedAdmin) ? (
          <Admin
            session={session}
            isVerifiedAdmin={isVerifiedAdmin}
            journeys={adminJourneys}
            categories={categories}
            customCategories={customCategories}
            setCustomCategories={setCustomCategories}
            requests={requests}
            startAdminJourney={startAdmin}
            openJourney={openAdminJourney}
            editJourney={(id) => {
              setBuilder({ kind: 'admin', id });
              navigate('builder');
            }}
            deleteJourney={deleteAdmin}
            setPublish={setPublish}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onUpdateRequestStatus={handleUpdateRequestStatus}
            navigate={navigate}
          />
        ) : (
          <main className="page adminPage">
            <div className="panel" style={{ textAlign: 'center', padding: '60px 24px', maxWidth: 560, margin: '40px auto' }}>
              <ShieldAlert size={48} color="#dc2626" style={{ margin: '0 auto 16px' }} />
              <h2 style={{ fontSize: '1.5rem', marginBottom: 8, color: '#111827' }}>Access Denied</h2>
              <p style={{ color: '#4b5563', marginBottom: 24, lineHeight: 1.6 }}>
                You do not have administrative privileges to access this portal. This area is strictly restricted to verified administrators.
              </p>
              <button
                className="button primary"
                onClick={() => navigate(session ? 'my' : 'signin')}
              >
                {session ? 'Go to My Journeys' : 'Sign In as Admin'}
              </button>
            </div>
          </main>
        )
      )}

      {page === 'signin' && (
        <Auth
          mode="signin"
          onSubmit={handleAuth('signin')}
          navigate={navigate}
          isBackendLive={isBackendLive}
        />
      )}

      {page === 'signup' && (
        <Auth
          mode="signup"
          onSubmit={handleAuth('signup')}
          navigate={navigate}
          isBackendLive={isBackendLive}
        />
      )}

      {page === 'about' && <About />}

      {!selectedJourney && page === 'detail' && (
        <main className="page">
          <div className="emptyState" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <h2>Journey not found</h2>
            <p>The requested journey could not be found or has been removed.</p>
            <button className="button primary" onClick={() => navigate('explore')}>
              Back to Explore
            </button>
          </div>
        </main>
      )}

      <Footer navigate={navigate} />

      <RequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSubmitted={handleCitizenRequestSubmitted}
        categories={categories}
      />

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  );
}
