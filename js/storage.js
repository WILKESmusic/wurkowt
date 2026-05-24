window.WurkStorage = (function () {
  const KEY = 'wurkowt_v1';

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultState();
      return Object.assign(defaultState(), JSON.parse(raw));
    } catch (e) {
      return defaultState();
    }
  }

  function save(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function defaultState() {
    return {
      onboarded: false,
      queueIndex: 0,
      baseline: null,
      weighIns: [],
      sessions: [],
      backpackWeight: 25,
      pushInclineLevel: 'bench',
      doorRow: false,
      forearmsSore: false,
      settings: {
        reminders: false,
        morning: '07:00',
        evening: '20:30',
        cardioDefault: 'ask',
      },
      benchmarks: [],
      lastBenchmarkPrompt: null,
      currentCardioMode: null,
      sessionDraft: null,
    };
  }

  function addSession(state, entry) {
    state.sessions.unshift(entry);
    if (state.sessions.length > 30) state.sessions.length = 30;
    state.queueIndex = (state.queueIndex + 1) % window.WURKOWT.QUEUE.length;
    state.sessionDraft = null;
    state.currentCardioMode = null;
    save(state);
    return state;
  }

  function currentDayType(state) {
    return window.WURKOWT.QUEUE[state.queueIndex];
  }

  function sessionsLast7Days(state) {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return state.sessions.filter(function (s) {
      return s.completed && new Date(s.at).getTime() > cutoff;
    });
  }

  function consecutiveTrainingDays(state) {
    let count = 0;
    for (let i = 0; i < state.sessions.length; i++) {
      const s = state.sessions[i];
      if (!s.completed || s.type === 'rest') break;
      count++;
    }
    return count;
  }

  return { load, save, addSession, currentDayType, sessionsLast7Days, consecutiveTrainingDays, defaultState };
})();
