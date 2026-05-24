(function () {
  'use strict';

  const D = window.WURKOWT;
  let state = WurkStorage.load();
  let timerId = null;
  let timerSeconds = 0;
  let sessionCtx = null;

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  function asset(path) {
    return D.asset(path);
  }

  function showScreen(id) {
    $$('.screen').forEach((el) => el.classList.add('hidden'));
    const s = $('#screen-' + id);
    if (s) s.classList.remove('hidden');
  }

  function beep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.value = 880;
      g.gain.value = 0.15;
      o.start();
      o.stop(ctx.currentTime + 0.2);
    } catch (e) {}
  }

  function vibrate() {
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m + ':' + String(s).padStart(2, '0');
  }

  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    const swPath = asset('sw.js');
    navigator.serviceWorker.register(swPath).catch(function () {});
  }

  function init() {
    registerSW();
    bindGlobal();
    if (!state.onboarded) {
      showScreen('onboarding');
      return;
    }
    renderHome();
    showScreen('home');
    checkBenchmarkPrompt();
    scheduleReminders();
  }

  function bindGlobal() {
    $('#onboarding-form').addEventListener('submit', onOnboarding);
    $('#btn-start').addEventListener('click', onStartClick);
    $('#btn-prep').addEventListener('click', () => {
      sessionCtx = { prepType: currentType() };
      openPrep(false);
    });
    $('#prep-confirm').addEventListener('change', () => {
      $('#btn-prep-start').disabled = !$('#prep-confirm').checked;
    });
    $('#btn-prep-start').addEventListener('click', () => startSessionFromPrep());
    $('#btn-weigh').addEventListener('click', () => $('#dialog-weigh').showModal());
    $('#weigh-form').addEventListener('submit', onWeighIn);
    $('#btn-history').addEventListener('click', renderHistory);
    $('#btn-settings').addEventListener('click', openSettings);
    $('#btn-rest-walk').addEventListener('click', startWalkTimer);
    $('#btn-train-anyway').addEventListener('click', openTrainAnyway);
    $('#btn-train-cancel').addEventListener('click', () => $('#dialog-train-anyway').close());
    $('#btn-train-go').addEventListener('click', confirmTrainAnyway);
    $('#btn-cardio-outdoor').addEventListener('click', () => startCardio('outdoor'));
    $('#btn-cardio-indoor').addEventListener('click', () => startCardio('indoor'));
    $('#btn-skip-rest').addEventListener('click', hideRestTimer);
    $('#btn-skip-interval').addEventListener('click', hideIntervalOverlay);
    $('#btn-skip-session').addEventListener('click', skipDay);

    $$('[data-back]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const t = btn.getAttribute('data-back');
        if (t === 'home') {
          renderHome();
          showScreen('home');
        }
      });
    });

    $$('[data-close]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-close');
        document.getElementById(id).close();
      });
    });

    $('#set-reminders').addEventListener('change', saveSettingsFromForm);
    $('#set-morning').addEventListener('change', saveSettingsFromForm);
    $('#set-evening').addEventListener('change', saveSettingsFromForm);
    $('#set-cardio-default').addEventListener('change', saveSettingsFromForm);
    $('#set-forearms-sore').addEventListener('change', function () {
      state.forearmsSore = this.checked;
      WurkStorage.save(state);
    });
    $('#set-backpack').addEventListener('change', function () {
      state.backpackWeight = Number(this.value) || 25;
      WurkStorage.save(state);
    });
    $('#set-door-row').addEventListener('change', function () {
      state.doorRow = this.checked;
      WurkStorage.save(state);
    });
    $('#btn-benchmark').addEventListener('click', startBenchmarkSession);
    $('#btn-reset-queue').addEventListener('click', resetQueue);
  }

  function onOnboarding(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    state.baseline = {
      at: new Date().toISOString(),
      weight: Number(fd.get('weight')),
      pushups: Number(fd.get('pushups')) || null,
      notes: fd.get('notes') || '',
    };
    state.weighIns.push({ at: state.baseline.at, weight: state.baseline.weight });
    state.onboarded = true;
    WurkStorage.save(state);
    renderHome();
    showScreen('home');
  }

  function onWeighIn(e) {
    e.preventDefault();
    const w = Number(new FormData(e.target).get('weight'));
    state.weighIns.push({ at: new Date().toISOString(), weight: w });
    WurkStorage.save(state);
    $('#dialog-weigh').close();
    renderHome();
  }

  function currentType() {
    return WurkStorage.currentDayType(state);
  }

  function renderHome() {
    const type = currentType();
    const label = D.LABELS[type];
    const mins = D.EST_MINUTES[type];
    const week = Math.floor(state.sessions.length / 6) + 1;
    const done = state.sessions.filter((s) => s.completed).length;

    $('#home-progress').textContent = 'Week ' + week + ' · ' + done + ' sessions logged';

    let coach = '';
    if (type === 'pull') coach = 'Load your backpack to ~' + (state.backpackWeight || 25) + ' lb before you start.';
    else if (type === 'rest') coach = 'Recovery day — movement optional, not required.';
    else if (type === 'cardio') coach = 'Pick outdoor or indoor when you start.';
    else coach = 'Next in your plan — tap Start when ready.';

    $('#home-hero').innerHTML =
      '<h2>' +
      label +
      '</h2>' +
      '<p class="meta">' +
      (mins ? '~' + mins + ' min · ' : '') +
      coach +
      '</p>';

    $('#btn-start').textContent = type === 'rest' ? 'Open rest day' : 'Start session';
  }

  function onStartClick() {
    const type = currentType();
    if (type === 'rest') {
      renderRest();
      showScreen('rest');
      return;
    }
    if (type === 'cardio') {
      const def = state.settings.cardioDefault;
      if (def === 'outdoor') return startCardio('outdoor');
      if (def === 'indoor') return startCardio('indoor');
      showScreen('cardio-pick');
      return;
    }
    sessionCtx = { prepType: type };
    openPrep(false);
  }

  function openPrep() {
    const type = (sessionCtx && (sessionCtx.prepType || sessionCtx.overrideType)) || currentType();
    const cardioMode = state.currentCardioMode || (sessionCtx && sessionCtx.cardioMode) || 'outdoor';
    const gear = type === 'cardio' ? D.getCardioGear(cardioMode) : D.getGear(type, state);

    let html = '<ul class="prep-list">';
    gear.forEach(function (g) {
      html += '<li>' + g + '</li>';
    });
    if (type === 'pull') {
      html +=
        '<li><strong>Tip:</strong> When you hit 12 reps on all backpack rows, add ~5 lb next Pull day.</li>';
    }
    html += '</ul>';

    $('#prep-content').innerHTML = html;
    $('#prep-confirm').checked = false;
    $('#btn-prep-start').disabled = true;
    sessionCtx = sessionCtx || {};
    if (!sessionCtx.prepType) sessionCtx.prepType = type;
    showScreen('prep');
  }

  function startSessionFromPrep() {
    const type = sessionCtx?.prepType || currentType();
    beginWorkout(type);
  }

  function startCardio(mode) {
    state.currentCardioMode = mode;
    WurkStorage.save(state);
    sessionCtx = { prepType: 'cardio', cardioMode: mode };
    openPrep(false);
  }

  function beginWorkout(type) {
    const workout = D.workouts[type];
    if (!workout && type !== 'cardio' && type !== 'flex') return;
    sessionCtx = {
      type: type,
      phase: type === 'flex' ? 'flex' : 'warmup',
      warmupDone: {},
      exerciseIndex: 0,
      setDone: {},
      finisher: false,
      cardioMode: state.currentCardioMode || (sessionCtx && sessionCtx.cardioMode),
      intervalIndex: 0,
      startedAt: Date.now(),
    };

    if (type === 'cardio') {
      sessionCtx.phase = 'cardio';
      if (sessionCtx.cardioMode === 'outdoor') {
        sessionCtx.cardioPhases = D.workouts.cardio.outdoor.phases.slice();
      } else {
        sessionCtx.indoorRound = 0;
        sessionCtx.indoorPhase = 'warmup';
      }
    }

    if (state.sessionDraft && state.sessionDraft.type === type) {
      sessionCtx = state.sessionDraft;
    }

    showScreen('session');
    renderSession();
  }

  function renderSession() {
    const type = sessionCtx.type;
    const w = D.workouts[type];

    if (type === 'cardio') {
      renderCardioSession();
      return;
    }

    if (type === 'flex') {
      renderFlexSession();
      return;
    }

    if (sessionCtx.phase === 'warmup') {
      $('#session-phase-label').textContent = 'Warmup';
      $('#session-progress').textContent = 'Tap each item when done';
      let html = '<div class="card">';
      D.SHARED_WARMUP.forEach(function (item) {
        const done = sessionCtx.warmupDone[item.id];
        html +=
          '<div class="warmup-item' +
          (done ? ' done' : '') +
          '" data-warmup="' +
          item.id +
          '"><span class="warmup-check"></span><span>' +
          item.name +
          (item.duration ? ' — ' + item.duration : '') +
          (item.reps ? ' — ' + item.reps : '') +
          '</span></div>';
      });
      html += '</div>';
      html += '<button type="button" class="btn btn-ghost" id="btn-warmup-all">Mark all warmup done</button>';
      $('#session-body').innerHTML = html;
      $('#session-footer').innerHTML =
        '<button class="btn btn-primary" id="btn-next-phase">Continue to main workout</button>';

      $$('.warmup-item').forEach(function (el) {
        el.addEventListener('click', function () {
          const id = el.getAttribute('data-warmup');
          sessionCtx.warmupDone[id] = !sessionCtx.warmupDone[id];
          saveDraft();
          renderSession();
        });
      });
      $('#btn-warmup-all').addEventListener('click', function () {
        D.SHARED_WARMUP.forEach(function (i) {
          sessionCtx.warmupDone[i.id] = true;
        });
        saveDraft();
        renderSession();
      });
      $('#btn-next-phase').addEventListener('click', function () {
        sessionCtx.phase = 'main';
        sessionCtx.exerciseIndex = 0;
        saveDraft();
        renderSession();
      });
      return;
    }

    if (sessionCtx.phase === 'finisher' && w.finisher) {
      renderExerciseCard(w.finisher[sessionCtx.exerciseIndex], w.finisher.length, 'Glute finisher');
      return;
    }

    if (sessionCtx.phase === 'main' && type === 'sculpt' && w.timedRounds) {
      renderSculptCircuit(w);
      return;
    }

    if (sessionCtx.phase === 'main') {
      let exercises = w.main.filter(function (ex) {
        if (ex.id === 'door-row' && !state.doorRow) return false;
        return true;
      });
      if (sessionCtx.exerciseIndex >= exercises.length) {
        if (w.finisher && type === 'lower' && !sessionCtx.finisher) {
          sessionCtx.phase = 'finisher';
          sessionCtx.exerciseIndex = 0;
          sessionCtx.setDone = {};
          saveDraft();
          renderSession();
          return;
        }
        sessionCtx.phase = 'cooldown';
        sessionCtx.exerciseIndex = 0;
        saveDraft();
        renderSession();
        return;
      }
      renderExerciseCard(exercises[sessionCtx.exerciseIndex], exercises.length, 'Main');
      return;
    }

    if (sessionCtx.phase === 'cooldown') {
      $('#session-phase-label').textContent = 'Cooldown';
      let html = '<div class="card"><ul class="prep-list">';
      w.cooldown.forEach(function (c, i) {
        const done = sessionCtx.warmupDone['cd' + i];
        html +=
          '<li class="warmup-item' +
          (done ? ' done' : '') +
          '" data-cd="' +
          i +
          '"><span class="warmup-check"></span>' +
          c.name +
          ' — ' +
          (c.duration || c.reps) +
          '</li>';
      });
      html += '</ul></div>';
      $('#session-body').innerHTML = html;
      $('#session-footer').innerHTML =
        '<button class="btn btn-primary" id="btn-complete">Complete session</button>';
      $$('[data-cd]').forEach(function (el) {
        el.addEventListener('click', function () {
          sessionCtx.warmupDone['cd' + el.getAttribute('data-cd')] = true;
          saveDraft();
          renderSession();
        });
      });
      $('#btn-complete').addEventListener('click', completeSession);
    }
  }

  function renderExerciseCard(ex, total, sectionLabel) {
    const key = ex.id + (sessionCtx.finisher ? '-f' : '');
    const doneSets = sessionCtx.setDone[key] || [];
    const sets = ex.sets || 3;
    const complete = doneSets.length >= sets;

    $('#session-phase-label').textContent = sectionLabel;
    $('#session-progress').textContent =
      'Exercise ' + (sessionCtx.exerciseIndex + 1) + ' of ' + total;

    let dots = '';
    for (let i = 0; i < sets; i++) {
      dots +=
        '<button type="button" class="set-dot' +
        (doneSets.includes(i) ? ' done' : '') +
        '" data-set="' +
        i +
        '" aria-label="Set ' +
        (i + 1) +
        '">' +
        (i + 1) +
        '</button>';
    }

    const img = ex.image
      ? '<img class="exercise-visual" src="' +
        asset('assets/exercises/' + ex.image) +
        '" alt="' +
        ex.name +
        '" data-demo="' +
        ex.id +
        '" />'
      : '';

    const cues = ex.cues
      ? '<ul class="cues">' + ex.cues.map((c) => '<li>' + c + '</li>').join('') + '</ul>'
      : '';

    $('#session-body').innerHTML =
      '<article class="exercise-card card' +
      (complete ? ' complete' : '') +
      '">' +
      '<h3>' +
      ex.name +
      '</h3>' +
      '<p class="targets">' +
      sets +
      ' sets · ' +
      (ex.reps || '') +
      '</p>' +
      img +
      cues +
      (ex.alt ? '<button type="button" class="alt-link" data-alt>' + ex.alt + '</button>' : '') +
      '<button type="button" class="btn btn-ghost demo-btn" data-video="' +
      encodeURIComponent(ex.videoQuery || ex.name) +
      '">Watch demo' +
      (navigator.onLine ? '' : ' (needs internet)') +
      '</button>' +
      '<div class="set-dots">' +
      dots +
      '</div>' +
      '</article>';

    $('#session-footer').innerHTML =
      '<button class="btn btn-primary" id="btn-ex-next"' +
      (complete ? '' : ' disabled') +
      '>Next exercise</button>' +
      '<button class="btn btn-ghost" id="btn-ex-skip">Skip exercise</button>';

    $$('.set-dot').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const idx = Number(btn.getAttribute('data-set'));
        if (!sessionCtx.setDone[key]) sessionCtx.setDone[key] = [];
        const arr = sessionCtx.setDone[key];
        if (arr.includes(idx)) {
          sessionCtx.setDone[key] = arr.filter((x) => x !== idx);
        } else {
          arr.push(idx);
          arr.sort();
          const restSec = sessionCtx.type === 'sculpt' ? 30 : 90;
          startRestTimer(restSec);
        }
        saveDraft();
        renderSession();
      });
    });

    $('#btn-ex-next').addEventListener('click', function () {
      sessionCtx.exerciseIndex++;
      sessionCtx.setDone = {};
      saveDraft();
      renderSession();
    });
    $('#btn-ex-skip').addEventListener('click', function () {
      sessionCtx.exerciseIndex++;
      saveDraft();
      renderSession();
    });

    $('[data-video]')?.addEventListener('click', function () {
      const q = decodeURIComponent(this.getAttribute('data-video'));
      openDemo(q, ex.name);
    });
    $('.exercise-visual')?.addEventListener('click', function () {
      openDemo(ex.videoQuery || ex.name, ex.name);
    });
  }

  function openDemo(query, name) {
    const online = navigator.onLine;
    const url = D.videoUrl(query);
    $('#demo-content').innerHTML =
      '<h3>' +
      name +
      '</h3>' +
      (online
        ? '<p><a href="' +
          url +
          '" target="_blank" rel="noopener">Open video demonstration</a></p>'
        : '<p>Connect to the internet to watch a video. The illustration above works offline.</p>') +
      '<img class="exercise-visual" src="' +
      asset('assets/exercises/' + (sessionCtx.lastImage || 'squat.svg')) +
      '" onerror="this.style.display=\'none\'" />';
    $('#dialog-demo').showModal();
  }

  function renderSculptCircuit(w) {
    $('#session-phase-label').textContent = 'Sculpt circuit';
    const round = (sessionCtx.sculptRound || 0) + 1;
    const total = w.rounds;
    $('#session-progress').textContent = 'Round ' + round + ' of ' + total + ' · 40s work / 30s rest';
    $('#session-body').innerHTML =
      '<div class="card"><p>Complete each move in order. Timers run automatically.</p><ol class="prep-list">' +
      w.main.map(function (m) {
        return '<li>' + m.name + '</li>';
      }).join('') +
      '</ol></div>';
    $('#session-footer').innerHTML =
      '<button class="btn btn-primary" id="btn-sculpt-go">Start round ' + round + '</button>';
    $('#btn-sculpt-go').onclick = function () {
      runSculptRound(w, round - 1);
    };
  }

  function runSculptRound(w, roundIndex) {
    const moves = w.main;
    let i = 0;

    function nextMove() {
      if (i >= moves.length) {
        if (roundIndex + 1 >= w.rounds) {
          sessionCtx.phase = 'cooldown';
          sessionCtx.exerciseIndex = 0;
          saveDraft();
          renderSession();
          return;
        }
        sessionCtx.sculptRound = roundIndex + 1;
        runIntervalTimer(w.roundRest, 'Rest between rounds', function () {
          saveDraft();
          renderSculptCircuit(w);
        });
        return;
      }
      const m = moves[i];
      runIntervalTimer(m.work || 40, m.name, function () {
        runIntervalTimer(w.workRest || 30, 'Rest', function () {
          i++;
          nextMove();
        });
      });
    }

    nextMove();
  }

  function renderCardioSession() {
    const mode = sessionCtx.cardioMode;
    $('#session-phase-label').textContent = 'Cardio · ' + (mode === 'outdoor' ? 'Outdoor' : 'Indoor');

    if (mode === 'outdoor') {
      const phases = sessionCtx.cardioPhases;
      const i = sessionCtx.intervalIndex || 0;
      const phase = phases[i];
      $('#session-progress').textContent = D.workouts.cardio.outdoor.totalNote;
      $('#session-body').innerHTML =
        '<div class="card"><p class="active interval-step"><strong>Now:</strong> ' +
        phase.label +
        '</p><p>' +
        formatTime(phase.seconds) +
        ' on timer</p><ol class="prep-list">' +
        phases
          .map(function (p, idx) {
            return (
              '<li class="' +
              (idx === i ? 'interval-step active' : 'interval-step') +
              '">' +
              p.label +
              ' (' +
              formatTime(p.seconds) +
              ')</li>'
            );
          })
          .join('') +
        '</ol></div>';
      $('#session-footer').innerHTML =
        '<button class="btn btn-primary" id="btn-start-interval">Start ' +
        phase.label +
        '</button><button class="btn btn-ghost" id="btn-complete-cardio">End & complete early</button>';
      $('#btn-start-interval').onclick = function () {
        runIntervalTimer(phase.seconds, phase.label, function () {
          sessionCtx.intervalIndex = i + 1;
          if (sessionCtx.intervalIndex >= phases.length) {
            completeSession();
          } else {
            saveDraft();
            renderCardioSession();
          }
        });
      };
      $('#btn-complete-cardio').onclick = completeSession;
    } else {
      const ind = D.workouts.cardio.indoor;
      $('#session-progress').textContent = ind.totalNote;
      $('#session-body').innerHTML =
        '<div class="card"><p>8 rounds: 40 sec hard / 50 sec easy</p><ul class="prep-list">' +
        ind.moves
          .map(function (m, idx) {
            return '<li>Round ' + (idx + 1) + ': ' + m + '</li>';
          })
          .join('') +
        '</ul></div>';
      $('#session-footer').innerHTML =
        '<button class="btn btn-primary" id="btn-indoor-start">Start indoor cardio</button>';
      $('#btn-indoor-start').onclick = runIndoorCardio;
    }
  }

  function runIndoorCardio() {
    const ind = D.workouts.cardio.indoor;
    let round = 0;

    function warmup() {
      runIntervalTimer(ind.warmup, 'Warmup march', function () {
        nextRound();
      });
    }

    function nextRound() {
      if (round >= ind.rounds) {
        runIntervalTimer(ind.cooldown, 'Cooldown march', completeSession);
        return;
      }
      const move = ind.moves[round];
      runIntervalTimer(ind.work, 'Round ' + (round + 1) + ' — ' + move, function () {
        runIntervalTimer(ind.rest, 'Recovery', function () {
          round++;
          nextRound();
        });
      });
    }

    warmup();
  }

  function runIntervalTimer(seconds, label, onDone) {
    const overlay = $('#interval-overlay');
    overlay.classList.remove('hidden');
    $('#interval-label').textContent = label;
    let left = seconds;
    $('#interval-display').textContent = formatTime(left);
    $('#interval-hint').textContent = left <= 10 ? 'Keep going' : '';

    clearInterval(timerId);
    timerId = setInterval(function () {
      left--;
      $('#interval-display').textContent = formatTime(left);
      overlay.classList.toggle('warning', left <= 10 && left > 0);
      if (left <= 0) {
        clearInterval(timerId);
        overlay.classList.add('hidden');
        beep();
        vibrate();
        if (onDone) onDone();
      }
    }, 1000);

    $('#btn-skip-interval').onclick = function () {
      clearInterval(timerId);
      overlay.classList.add('hidden');
      if (onDone) onDone();
    };
  }

  function renderFlexSession() {
    const holds = D.workouts.flex.holds;
    $('#session-phase-label').textContent = 'Flex';
    let html = '<div class="card stack">';
    holds.forEach(function (h, i) {
      html +=
        '<button type="button" class="btn btn-secondary" data-flex="' +
        i +
        '">' +
        h.name +
        (h.seconds ? ' — ' + h.seconds + 's hold' : ' — ' + h.reps) +
        '</button>';
    });
    html += '</div>';
    $('#session-body').innerHTML = html;
    $('#session-footer').innerHTML =
      '<button class="btn btn-primary" id="btn-complete">Complete flex session</button>';

    $$('[data-flex]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const h = holds[Number(btn.getAttribute('data-flex'))];
        if (h.seconds) {
          runIntervalTimer(h.seconds, h.name, function () {});
        }
      });
    });
    $('#btn-complete').addEventListener('click', completeSession);
  }

  function startRestTimer(seconds) {
    const overlay = $('#timer-overlay');
    overlay.classList.remove('hidden', 'warning');
    timerSeconds = seconds;
    $('#timer-display').textContent = formatTime(timerSeconds);
    clearInterval(timerId);
    timerId = setInterval(function () {
      timerSeconds--;
      $('#timer-display').textContent = formatTime(timerSeconds);
      if (timerSeconds <= 10) overlay.classList.add('warning');
      if (timerSeconds <= 0) {
        clearInterval(timerId);
        hideRestTimer();
        beep();
        vibrate();
      }
    }, 1000);
  }

  function hideRestTimer() {
    clearInterval(timerId);
    $('#timer-overlay').classList.add('hidden');
  }

  function saveDraft() {
    state.sessionDraft = JSON.parse(JSON.stringify(sessionCtx));
    WurkStorage.save(state);
  }

  function completeSession() {
    const type = sessionCtx.type;
    const entry = {
      at: new Date().toISOString(),
      type: type,
      completed: true,
      cardioMode: sessionCtx.cardioMode || null,
    };

    if (type === 'pull') {
      const allDone = sessionCtx.setDone['backpack-row'];
      if (allDone && allDone.length >= 4) {
        state.backpackWeight = (state.backpackWeight || 25) + 5;
      }
    }

    state = WurkStorage.addSession(state, entry);
    sessionCtx = null;
    renderHome();
    showScreen('home');
  }

  function skipDay() {
    if (!confirm('Skip this session and move to the next day in your plan?')) return;
    state = WurkStorage.addSession(state, {
      at: new Date().toISOString(),
      type: sessionCtx?.type || currentType(),
      completed: false,
      skipped: true,
    });
    sessionCtx = null;
    renderHome();
    showScreen('home');
  }

  function renderRest() {
    let html = '<div class="stack">';
    D.REST_TIPS.forEach(function (t) {
      html += '<p>' + t + '</p>';
    });
    html += '</div>';
    $('#rest-content').innerHTML = html;
    if (!$('#btn-rest-done')) {
      const btn = document.createElement('button');
      btn.id = 'btn-rest-done';
      btn.className = 'btn btn-primary';
      btn.textContent = 'Finish rest day';
      btn.onclick = function () {
        state = WurkStorage.addSession(state, {
          at: new Date().toISOString(),
          type: 'rest',
          completed: true,
        });
        renderHome();
        showScreen('home');
      };
      $('#screen-rest').appendChild(btn);
    }
  }

  function openTrainAnyway() {
    const rec = recommendTrainAnyway();
    const body = $('#train-anyway-body');
    let html = '';
    if (rec.strong) {
      html += '<div class="recommend-strong">' + rec.strong + '</div>';
    }
    html += '<p>' + rec.suggestion + '</p>';
    html += '<p>Suggested workout: <strong>' + D.LABELS[rec.type] + '</strong></p>';
    body.innerHTML = html;
    sessionCtx = { overrideType: rec.type, trainAnyway: true };
    $('#dialog-train-anyway').showModal();
  }

  function recommendTrainAnyway() {
    const consec = WurkStorage.consecutiveTrainingDays(state);
    const sore = state.forearmsSore;
    let strong = '';
    if (consec >= 5 || sore) {
      strong =
        'You have trained ' +
        consec +
        ' recent days in a row' +
        (sore ? ', and forearms are marked sore' : '') +
        '. I really recommend resting today — recovery drives results with tendinitis.';
    }
    let type = 'flex';
    let suggestion = 'A Flex session keeps you moving without loading push/pull grips hard.';
    const last = state.sessions[0];
    if (last && last.type === 'pull') {
      type = 'sculpt';
      suggestion = 'You recently pulled — Sculpt gives full-body work without doubling row volume.';
    } else if (consec >= 3) {
      type = 'cardio';
      suggestion = 'Light cardio (walk intervals) adds conditioning without heavy gripping.';
    }
    return { type, suggestion, strong };
  }

  function confirmTrainAnyway() {
    $('#dialog-train-anyway').close();
    const type = sessionCtx.overrideType;
    state.sessionDraft = null;
    if (type === 'cardio') {
      showScreen('cardio-pick');
      return;
    }
    sessionCtx = { overrideType: type };
    openPrep(true);
    beginWorkout(type);
  }

  function startWalkTimer() {
    runIntervalTimer(20 * 60, 'Easy walk', function () {});
  }

  function renderHistory() {
    showScreen('history');
    const el = $('#history-content');
    const base = state.baseline;
    let html = '';

    if (base) {
      const latest = state.weighIns[state.weighIns.length - 1];
      const delta = latest && base.weight ? (latest.weight - base.weight).toFixed(1) : '—';
      html +=
        '<div class="card history-block"><h3>Starting point</h3><p>Weight: ' +
        base.weight +
        ' lb · Push-ups: ' +
        (base.pushups ?? '—') +
        '</p><p>Since start: ' +
        delta +
        ' lb</p></div>';
    }

    html += '<div class="card history-block"><h3>Weigh-ins</h3><ul class="history-list">';
    state.weighIns.slice(0, 10).forEach(function (w) {
      html +=
        '<li>' +
        new Date(w.at).toLocaleDateString() +
        ' — ' +
        w.weight +
        ' lb</li>';
    });
    html += '</ul></div>';

    html += '<div class="card history-block"><h3>Last 30 sessions</h3><ul class="history-list">';
    state.sessions.forEach(function (s) {
      html +=
        '<li>' +
        new Date(s.at).toLocaleDateString() +
        ' — ' +
        D.LABELS[s.type] +
        (s.completed ? ' ✓' : ' (skipped)') +
        '</li>';
    });
    html += '</ul></div>';

    if (state.benchmarks.length) {
      html += '<div class="card history-block"><h3>Benchmarks</h3><ul class="history-list">';
      state.benchmarks.forEach(function (b) {
        html +=
          '<li>' +
          new Date(b.at).toLocaleDateString() +
          ' — push ' +
          b.pushups +
          ', plank ' +
          b.plankSec +
          's, pack ' +
          b.backpackLb +
          ' lb</li>';
      });
      html += '</ul></div>';
    }

    html +=
      '<p class="muted">Backpack: ' +
      state.backpackWeight +
      ' lb · Incline: ' +
      state.pushInclineLevel +
      '</p>';

    el.innerHTML = html;
  }

  function openSettings() {
    $('#set-reminders').checked = state.settings.reminders;
    $('#set-morning').value = state.settings.morning;
    $('#set-evening').value = state.settings.evening;
    $('#set-cardio-default').value = state.settings.cardioDefault;
    $('#set-forearms-sore').checked = state.forearmsSore;
    $('#set-backpack').value = state.backpackWeight;
    $('#set-door-row').checked = state.doorRow;
    showScreen('settings');
    requestNotificationPermission();
  }

  function saveSettingsFromForm() {
    state.settings.reminders = $('#set-reminders').checked;
    state.settings.morning = $('#set-morning').value;
    state.settings.evening = $('#set-evening').value;
    state.settings.cardioDefault = $('#set-cardio-default').value;
    WurkStorage.save(state);
    scheduleReminders();
  }

  function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  function scheduleReminders() {
    if (!state.settings.reminders || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    const type = currentType();
    const label = D.LABELS[type];
    const key = 'wurkowt_last_notify_' + new Date().toDateString();
    function maybeNotify(slot) {
      const now = new Date();
      const [h, m] = slot.split(':').map(Number);
      const target = new Date(now);
      target.setHours(h, m, 0, 0);
      const diff = Math.abs(now - target);
      if (diff < 60000 && !sessionStorage.getItem(key + slot)) {
        sessionStorage.setItem(key + slot, '1');
        const body =
          type === 'pull'
            ? 'Pack your backpack (~' + (state.backpackWeight || 25) + ' lb) before Pull.'
            : 'Today: ' + label;
        new Notification('WurkOwt', { body: body });
      }
    }
    setInterval(function () {
      maybeNotify(state.settings.morning);
      maybeNotify(state.settings.evening);
    }, 30000);
  }

  function checkBenchmarkPrompt() {
    const baseline = state.baseline;
    if (!baseline) return;
    const start = new Date(baseline.at).getTime();
    const weeks = (Date.now() - start) / (7 * 24 * 60 * 60 * 1000);
    if (weeks >= 12 && state.benchmarks.length === 0) {
      setTimeout(function () {
        if (confirm('Roughly 12 weeks in — run a benchmark check in Settings when ready.')) {
          openSettings();
        }
      }, 800);
    }
  }

  function startBenchmarkSession() {
    const pushups = prompt('Push-ups completed (incline noted in mind):', '10');
    const plank = prompt('Forearm plank max (seconds):', '30');
    const pack = prompt('Backpack row weight used (lb):', String(state.backpackWeight));
    if (pushups === null) return;
    state.benchmarks.unshift({
      at: new Date().toISOString(),
      pushups: Number(pushups),
      plankSec: Number(plank),
      backpackLb: Number(pack),
    });
    WurkStorage.save(state);
    alert('Benchmark saved.');
    renderHistory();
  }

  function resetQueue() {
    if (!confirm('Reset plan to start at Push? History is kept.')) return;
    state.queueIndex = 0;
    WurkStorage.save(state);
    renderHome();
    showScreen('home');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
