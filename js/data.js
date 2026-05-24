/* WurkOwt program data */
window.WURKOWT = {
  QUEUE: ['push', 'pull', 'sculpt', 'lower', 'cardio', 'flex', 'rest'],

  LABELS: {
    push: 'Push',
    pull: 'Pull',
    sculpt: 'Sculpt',
    lower: 'Lower Body',
    cardio: 'Cardio',
    flex: 'Flex',
    rest: 'Rest',
  },

  EST_MINUTES: {
    push: 35,
    pull: 38,
    sculpt: 32,
    lower: 40,
    cardio: 28,
    flex: 25,
    rest: 0,
  },

  REST_TIPS: [
    'Aim for protein at each meal — roughly a palm-sized portion of meat, fish, eggs, or Greek yogurt.',
    'Drink water through the day; coffee is fine.',
    'Sleep 7–8 hours when you can — recomposition happens off the mat.',
    'Optional: 20–30 minute easy walk. No intensity required.',
    'Forearms: if you have mowing or tool work today, keep grips short before heavy Push or Pull.',
    'Sore vs hurt: dull muscle soreness is normal. Sharp wrist or forearm pain means rest that pattern.',
  ],

  SHARED_WARMUP: [
    { id: 'wm1', name: 'March in place or easy walk', duration: '2 min' },
    { id: 'wm2', name: 'Arm circles', reps: '10 each direction' },
    { id: 'wm3', name: 'Hip circles', reps: '10 each direction' },
    { id: 'wm4', name: 'Bodyweight squat (slow)', reps: '10' },
    { id: 'wm5', name: 'Walking lunges', reps: '6 each leg' },
    { id: 'wm6', name: 'Standing hamstring reach or inchworm', reps: '5' },
    { id: 'wm7', name: 'Wrist prep: open/close fists', reps: '10, then slow circles ×5 each way' },
  ],

  getGear(dayType, state) {
    const bp = state.backpackWeight || 25;
    const gear = {
      push: [
        'Sturdy bench, box, or step about knee to waist height (incline push-ups)',
        'Clear floor space (~6 ft)',
      ],
      pull: [
        `Backpack loaded to ~${bp} lb (books, water jugs, etc.)`,
        'Both straps tightened — use bent-over row and bear-hug row',
        state.doorRow ? 'Solid internal door frame if using lean-in rows' : 'No door rows today unless you enabled them in Settings',
      ],
      sculpt: [
        'Same bench/box as Push day',
        'Clear floor space for lunges and planks',
      ],
      lower: [
        'Clear wall for wall sit',
        'Optional low step or bench for split squat',
        'Floor space for glute finisher',
      ],
      cardio: [],
      flex: ['Floor space', 'Wall for calf stretch'],
      rest: [],
    };
    return gear[dayType] || [];
  },

  getCardioGear(mode) {
    if (mode === 'outdoor') {
      return [
        'Running shoes',
        'Watch or phone for interval timers (built into app)',
        'Plan: 3 min warmup walk → 10× (1 min brisk run / 1 min walk) → 3 min cooldown',
        'Total moving time ~26 min · approx. 1.5–2.5 miles depending on pace',
      ];
    }
    return [
      'Clear floor space in basement',
      'Plan: 3 min march → 8 rounds (40 sec hard / 50 sec easy) → 3 min cooldown',
      'Total ~26 min — all timed in app',
    ];
  },

  workouts: {
    push: {
      cooldown: [
        { name: 'Chest doorway stretch', duration: '30 sec each side' },
        { name: 'Triceps overhead stretch', duration: '30 sec each side' },
        { name: "Child's pose", duration: '45 sec' },
      ],
      main: [
        {
          id: 'incline-pushup',
          name: 'Incline push-up',
          sets: 3,
          reps: '8–12',
          cues: ['Hands on bench, body straight', 'Lower chest toward bench', 'Press up without flaring elbows wide'],
          alt: 'Wall push-up if wrists flare up',
          image: 'incline-pushup.svg',
          videoQuery: 'incline push up proper form',
        },
        {
          id: 'pike-pushup',
          name: 'Pike push-up',
          sets: 3,
          reps: '6–10',
          cues: ['Hips high, short range at first', 'Head between arms, controlled'],
          alt: 'Reduce range if dizzy',
          image: 'pike-pushup.svg',
          videoQuery: 'pike push up shoulder',
        },
        {
          id: 'close-incline-pushup',
          name: 'Close-grip incline push-up',
          sets: 2,
          reps: '8–10',
          cues: ['Hands shoulder-width on bench', 'Skip if wrists or elbows complain'],
          alt: 'Extra set of incline push-ups instead',
          image: 'incline-pushup.svg',
          videoQuery: 'close grip push up incline',
        },
        {
          id: 'forearm-plank',
          name: 'Forearm plank',
          sets: 2,
          reps: '20–40 sec',
          cues: ['On forearms, not palms', 'Glutes engaged, neutral neck'],
          alt: 'Shorter holds, more sets',
          image: 'plank.svg',
          videoQuery: 'forearm plank form',
        },
      ],
    },

    pull: {
      cooldown: [
        { name: 'Lat stretch at wall', duration: '30 sec each side' },
        { name: 'Gentle forearm extensor stretch', duration: '20 sec each, no pain' },
      ],
      main: [
        {
          id: 'backpack-row',
          name: 'Backpack bent-over row',
          sets: 4,
          reps: '8–12',
          cues: ['Hinge at hips, flat back', 'Row pack to ribs, brief grip'],
          alt: 'Lighter pack, more reps',
          image: 'backpack-row.svg',
          videoQuery: 'bent over backpack row',
          usesBackpack: true,
        },
        {
          id: 'bear-hug-row',
          name: 'Bear-hug backpack row',
          sets: 3,
          reps: '10–12',
          cues: ['Hug pack to chest', 'Row elbows back — less grip strain'],
          alt: 'Extra bent-over row set',
          image: 'backpack-row.svg',
          videoQuery: 'backpack row exercise',
          usesBackpack: true,
        },
        {
          id: 'door-row',
          name: 'Door / post lean-in row',
          sets: 3,
          reps: '8–12',
          cues: ['Only on a solid frame', 'Body angled, pull chest toward hands'],
          alt: 'Add another backpack row set',
          image: 'door-row.svg',
          videoQuery: 'inverted row door frame',
          optional: true,
        },
        {
          id: 'prone-ytw',
          name: 'Prone Y-T-W',
          sets: 2,
          reps: '8 each letter',
          cues: ['Lie face down, thumbs up', 'Light and controlled'],
          alt: 'Prone swimmers 20 reps',
          image: 'prone-ytw.svg',
          videoQuery: 'prone Y T W exercise',
        },
        {
          id: 'reverse-fly',
          name: 'Reverse fly (no weight)',
          sets: 2,
          reps: '12–15',
          cues: ['Bent over, arms wide', 'Squeeze shoulder blades'],
          alt: 'Prone Y-T-W extra set',
          image: 'reverse-fly.svg',
          videoQuery: 'reverse fly bodyweight',
        },
      ],
    },

    sculpt: {
      timedRounds: true,
      roundRest: 60,
      workRest: 30,
      rounds: 3,
      cooldown: [
        { name: 'Hip flexor lunge stretch', duration: '30 sec each' },
        { name: 'Cat-cow', reps: '8 slow' },
      ],
      main: [
        { id: 'squat-tempo', name: 'Tempo squat', work: 40, cues: ['3 sec down', 'Chest up'] },
        { id: 'rev-lunge', name: 'Reverse lunge', work: 40, cues: ['Alternate legs', 'Torso tall'] },
        { id: 'incline-pushup', name: 'Incline push-up', work: 40, image: 'incline-pushup.svg', videoQuery: 'incline push up' },
        { id: 'dead-bug', name: 'Dead bug', work: 40, cues: ['Low back pressed down'], image: 'dead-bug.svg', videoQuery: 'dead bug exercise' },
        { id: 'side-plank', name: 'Forearm side plank', work: 25, cues: ['Each side in next round if needed'], image: 'plank.svg', videoQuery: 'side plank forearm' },
        { id: 'mountain', name: 'High knees or mountain climbers', work: 40, videoQuery: 'mountain climbers' },
      ],
    },

    lower: {
      finisher: [
        { id: 'glute-bridge', name: 'Glute bridge', sets: 2, reps: '12', image: 'glute-bridge.svg', videoQuery: 'glute bridge' },
        { id: 'sl-bridge', name: 'Single-leg glute bridge', sets: 2, reps: '8 each', image: 'glute-bridge.svg', videoQuery: 'single leg glute bridge' },
        { id: 'fire-hydrant', name: 'Fire hydrant', sets: 2, reps: '12 each', image: 'fire-hydrant.svg', videoQuery: 'fire hydrant exercise' },
      ],
      cooldown: [
        { name: 'Figure-4 glute stretch', duration: '30 sec each' },
        { name: 'Hamstring stretch', duration: '30 sec each' },
        { name: 'Quad stretch', duration: '30 sec each' },
      ],
      main: [
        { id: 'squat', name: 'Bodyweight squat (3 sec down)', sets: 3, reps: '12–15', image: 'squat.svg', videoQuery: 'bodyweight squat form' },
        { id: 'rev-lunge-lower', name: 'Reverse lunge', sets: 3, reps: '10 each leg', image: 'lunge.svg', videoQuery: 'reverse lunge' },
        { id: 'sl-rdl', name: 'Single-leg RDL', sets: 3, reps: '8 each', image: 'rdl.svg', videoQuery: 'single leg romanian deadlift bodyweight' },
        { id: 'calf', name: 'Calf raise', sets: 3, reps: '15–20', image: 'calf.svg', videoQuery: 'calf raise bodyweight' },
        { id: 'wall-sit', name: 'Wall sit', sets: 2, reps: '30–45 sec', image: 'wall-sit.svg', videoQuery: 'wall sit', optional: true },
      ],
    },

    cardio: {
      outdoor: {
        totalNote: '~26 min · approx. 1.5–2.5 miles if jog pace is moderate',
        phases: [
          { label: 'Warmup walk', seconds: 180 },
          ...Array.from({ length: 10 }, (_, i) => [
            { label: `Interval ${i + 1} — brisk run`, seconds: 60, hard: true },
            { label: `Interval ${i + 1} — walk recovery`, seconds: 60, hard: false },
          ]).flat(),
          { label: 'Cooldown walk', seconds: 180 },
        ],
      },
      indoor: {
        totalNote: '~26 min timed — no distance',
        rounds: 8,
        warmup: 180,
        cooldown: 180,
        work: 40,
        rest: 50,
        moves: [
          'Jumping jacks',
          'Squat jumps',
          'High knees',
          'Burpees (skip if knees unhappy)',
          'Jumping jacks',
          'Squat jumps',
          'High knees',
          'Burpees or high knees',
        ],
      },
    },

    flex: {
      holds: [
        { name: 'Hip flexor lunge stretch', seconds: 40 },
        { name: 'Hamstring stretch (seated or standing)', seconds: 40 },
        { name: 'Calf stretch at wall', seconds: 40 },
        { name: "World's greatest stretch", reps: '5 each side' },
        { name: 'Open book (thoracic rotation)', reps: '8 each side' },
        { name: 'Figure-4 / pigeon', seconds: 40, each: true },
        { name: 'Gentle wrist flexor/extensor', seconds: 20, each: true },
      ],
    },
  },

  videoUrl(query) {
    return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(query + ' exercise form');
  },

  asset(path) {
    var base = window.WURKOWT_BASE || '';
    return (base ? base + '/' : '') + path.replace(/^\//, '');
  },
};
