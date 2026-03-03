/**
 * ╔══════════════════════════════════════════════════════╗
 *  NOVA STREAM — Background Play Engine  v3.0  MOBILE FIRST
 *  Made in India 🇮🇳  By Sufiyan Absar  © 2014
 * ╚══════════════════════════════════════════════════════╝
 *
 *  WHY MOBILE IS HARD:
 *  Mobile browsers (Chrome Android, Safari iOS) suspend
 *  ALL iframe audio when the page goes to background.
 *  The ONLY reliable workaround is:
 *    → Keep an active Web Audio context running.
 *    → Browser sees "audio active" → won't suspend tab.
 *
 *  LAYERS:
 *  1. Silent Audio Heartbeat  ← THE KEY (mobile fix)
 *  2. Visibility API spoof    ← tricks iframe
 *  3. EventTarget patch       ← blocks YT's pause listener
 *  4. Hammer loop             ← re-sends playVideo every 400ms
 *  5. MediaSession API        ← lock screen controls (iOS+Android)
 *  6. Wake Lock API           ← prevents screen sleep (Chrome)
 *  7. Page Lifecycle freeze   ← handles Chrome's freeze event
 */

;(function (global) {
  'use strict';

  /* ── Save originals BEFORE any patches ───────────────────── */
  var _addEv  = EventTarget.prototype.addEventListener.bind
                  ? function(t,ev,fn,o){ return EventTarget.prototype.addEventListener.call(t,ev,fn,o); }
                  : function(t,ev,fn,o){ return t.addEventListener(ev,fn,o); };
  var _origAEL = EventTarget.prototype.addEventListener;
  var _origREL = EventTarget.prototype.removeEventListener;

  /* ── State ────────────────────────────────────────────────── */
  var ctx        = null;   // AudioContext
  var gainNode   = null;
  var loopTimer  = null;   // silence loop
  var hammerTimer= null;   // postMessage hammer
  var wakeLock   = null;
  var inited     = false;
  var callbacks  = {};     // {onPlay, onPause, onNext, onPrev}

  /* ════════════════════════════════════════════════════════════
     LAYER 1 — Silent Audio Heartbeat
     A near-zero-volume buffer looping every 0.5s.
     This keeps the AudioContext "active" which tells the
     OS/browser the page has live audio → don't suspend it.
  ════════════════════════════════════════════════════════════ */
  function startSilentLoop() {
    if (!ctx) return;
    if (ctx.state === 'suspended') { ctx.resume(); }
    if (loopTimer) return;

    function tick() {
      if (!ctx) return;
      try {
        var buf  = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.5), ctx.sampleRate);
        var data = buf.getChannelData(0);
        // Tiny random noise — NOT silence (silence gets optimized away by browser)
        for (var i = 0; i < data.length; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.0003;
        }
        var src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(gainNode);
        src.onended = tick;  // chain — loops forever
        src.start(0);
      } catch(e) {
        // Retry after 500ms if context was interrupted
        setTimeout(tick, 500);
      }
    }

    tick();
    loopTimer = true; // flag set
  }

  function createAudioContext() {
    try {
      ctx = new (global.AudioContext || global.webkitAudioContext)();
      gainNode = ctx.createGain();
      gainNode.gain.value = 0.001; // near-inaudible but NOT zero
      gainNode.connect(ctx.destination);
      return true;
    } catch(e) {
      return false;
    }
  }

  function resumeContext() {
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(function(){});
    }
  }

  /* ════════════════════════════════════════════════════════════
     LAYER 2 — Visibility API Spoof
     document.hidden  → always false
     visibilityState  → always 'visible'
     YouTube's iframe checks this to decide whether to pause.
  ════════════════════════════════════════════════════════════ */
  function spoofVisibility() {
    var props = {
      'hidden':               false,
      'visibilityState':      'visible',
      'webkitHidden':         false,
      'webkitVisibilityState':'visible',
      'mozHidden':            false,
      'mozVisibilityState':   'visible',
      'msHidden':             false,
      'msVisibilityState':    'visible',
    };
    Object.keys(props).forEach(function(k) {
      try {
        Object.defineProperty(document, k, {
          get: (function(v){ return function(){ return v; }; })(props[k]),
          configurable: true
        });
      } catch(e) {}
    });
  }

  /* ════════════════════════════════════════════════════════════
     LAYER 3 — EventTarget Patch
     Block ALL visibilitychange listeners app-wide.
     This prevents YouTube's embedded player JS from
     catching the tab-hide event and pausing itself.
  ════════════════════════════════════════════════════════════ */
  var BLOCKED_EVENTS = {
    'visibilitychange':         true,
    'webkitvisibilitychange':   true,
    'mozvisibilitychange':      true,
    'msvisibilitychange':       true,
    'pagehide':                 true,
    'freeze':                   true,  // Chrome Page Lifecycle
  };

  EventTarget.prototype.addEventListener = function(type, fn, opts) {
    if (BLOCKED_EVENTS[typeof type === 'string' ? type.toLowerCase() : '']) return;
    return _origAEL.call(this, type, fn, opts);
  };

  EventTarget.prototype.removeEventListener = function(type, fn, opts) {
    if (BLOCKED_EVENTS[typeof type === 'string' ? type.toLowerCase() : '']) return;
    return _origREL.call(this, type, fn, opts);
  };

  /* ════════════════════════════════════════════════════════════
     LAYER 4 — Real Visibility Listener + Hammer Loop
     Use SAVED original addEventListener to actually listen.
     When tab hides: fire playVideo every 400ms to fight
     browser's automatic pause.
  ════════════════════════════════════════════════════════════ */

  /* Read actual document.hidden bypassing our spoof */
  function realIsHidden() {
    var desc = Object.getOwnPropertyDescriptor(Document.prototype, 'hidden') ||
               Object.getOwnPropertyDescriptor(HTMLDocument.prototype, 'hidden');
    if (desc) { try { return desc.get.call(document); } catch(e) {} }
    // Fallback: check via iframe
    try {
      var f = document.createElement('iframe');
      f.style.display = 'none';
      document.body.appendChild(f);
      var h = f.contentDocument.hidden;
      document.body.removeChild(f);
      return h;
    } catch(e) {}
    return false;
  }

  function startHammer() {
    if (hammerTimer) return;
    hammerTimer = setInterval(function() {
      resumeContext();
      // Send playVideo to every iframe on page
      document.querySelectorAll('iframe').forEach(function(fr) {
        try {
          fr.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*'
          );
        } catch(e) {}
      });
      // Update badge
      showBadge(true);
      // Keep MediaSession "playing"
      if (navigator.mediaSession) {
        navigator.mediaSession.playbackState = 'playing';
      }
    }, 400);
  }

  function stopHammer() {
    if (hammerTimer) { clearInterval(hammerTimer); hammerTimer = null; }
    showBadge(false);
    // One clean play on resume
    document.querySelectorAll('iframe').forEach(function(fr) {
      try {
        fr.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*'
        );
      } catch(e) {}
    });
  }

  _addEv(document, 'visibilitychange', function() {
    if (realIsHidden()) {
      resumeContext();
      startHammer();
    } else {
      stopHammer();
    }
  });

  /* Also handle Chrome's Page Lifecycle 'freeze' event */
  _addEv(document, 'freeze', function() {
    resumeContext();
    startHammer();
  });
  _addEv(document, 'resume', function() {
    stopHammer();
  });

  /* ════════════════════════════════════════════════════════════
     LAYER 5 — MediaSession API
     Shows video title + controls on lock screen notification.
     Works on: Android Chrome, iOS Safari 15+, desktop browsers.
  ════════════════════════════════════════════════════════════ */
  function setupMediaSession(title, artist, thumbUrl) {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title:  title  || 'NOVA STREAM',
      artist: artist || 'By Sufiyan Absar',
      album:  'NOVA STREAM 🇮🇳',
      artwork: [
        {
          src: thumbUrl || 'https://ui-avatars.com/api/?name=NOVA&background=7c3aed&color=fff&size=512',
          sizes: '512x512',
          type: thumbUrl ? 'image/jpeg' : 'image/png'
        }
      ]
    });

    navigator.mediaSession.playbackState = 'playing';

    // Wire lock screen buttons
    function trySet(action, fn) {
      try { navigator.mediaSession.setActionHandler(action, fn); } catch(e) {}
    }

    trySet('play',          function() { callbacks.onPlay  && callbacks.onPlay();  navigator.mediaSession.playbackState = 'playing'; });
    trySet('pause',         function() { callbacks.onPause && callbacks.onPause(); navigator.mediaSession.playbackState = 'paused';  });
    trySet('previoustrack', function() { callbacks.onPrev  && callbacks.onPrev();  });
    trySet('nexttrack',     function() { callbacks.onNext  && callbacks.onNext();  });
    trySet('stop',          function() { callbacks.onPause && callbacks.onPause(); });
    trySet('seekbackward',  function() { callbacks.onPrev  && callbacks.onPrev();  });
    trySet('seekforward',   function() { callbacks.onNext  && callbacks.onNext();  });
  }

  /* ════════════════════════════════════════════════════════════
     LAYER 6 — Screen Wake Lock  (Chrome Android / Desktop)
     Prevents screen from going to sleep while video plays.
  ════════════════════════════════════════════════════════════ */
  async function requestWakeLock() {
    if (!('wakeLock' in navigator)) return;
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      // Re-acquire when tab comes back
      _addEv(document, 'visibilitychange', async function() {
        if (!realIsHidden() && wakeLock === null) {
          try { wakeLock = await navigator.wakeLock.request('screen'); } catch(e) {}
        }
      });
    } catch(e) {}
  }

  /* ════════════════════════════════════════════════════════════
     BADGE HELPER
  ════════════════════════════════════════════════════════════ */
  function showBadge(show) {
    var el = document.getElementById('bgBadge');
    if (el) el.classList.toggle('hidden', !show);
  }

  /* ════════════════════════════════════════════════════════════
     PUBLIC API  →  window.NovaPlay
  ════════════════════════════════════════════════════════════ */
  global.NovaPlay = {

    /**
     * Call on first user gesture (tap/click).
     * MUST be called from a user interaction for AudioContext to work on mobile.
     */
    init: function() {
      if (inited) { resumeContext(); return; }
      inited = true;
      spoofVisibility();
      if (createAudioContext()) {
        startSilentLoop();
      }
      requestWakeLock();

      // Resume audio on any future gesture (iOS Safari requires this)
      ['touchstart','touchend','click','keydown'].forEach(function(ev) {
        _addEv(document, ev, resumeContext, { passive: true });
      });
    },

    /**
     * Update lock screen / notification metadata.
     * Call whenever the playing video changes.
     */
    setMeta: function(title, artist, thumbUrl) {
      setupMediaSession(title, artist, thumbUrl);
    },

    /**
     * Register callbacks for lock screen buttons.
     */
    setControls: function(cbs) {
      callbacks = cbs || {};
    },

    /**
     * Force AudioContext resume (call after any user gesture).
     */
    resume: function() {
      resumeContext();
      startSilentLoop();
    },

    /**
     * Signal "paused" to lock screen.
     */
    setPaused: function(isPaused) {
      if (navigator.mediaSession) {
        navigator.mediaSession.playbackState = isPaused ? 'paused' : 'playing';
      }
    }
  };

  /* ── Auto-attach to first gesture ──────────────────────────── */
  /* Spoof runs immediately, audio needs gesture */
  spoofVisibility();

  ['touchstart','touchend','mousedown','keydown','scroll'].forEach(function(ev) {
    _addEv(document, ev, function onFirst() {
      global.NovaPlay && global.NovaPlay.init();
      ['touchstart','touchend','mousedown','keydown','scroll'].forEach(function(e2) {
        document.removeEventListener(e2, onFirst);
      });
    }, { once: true, passive: true });
  });

})(window);
  
