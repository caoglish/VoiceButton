(function () {
  'use strict';

  const VERSION = '0.2.5';
  const DB_NAME = 'VoiceButtonDB';
  const STORE_NAME = 'buttons';
  const MAX_BUTTONS = 9;
  const MIN_RECORDING_MS = 200;
  const MAX_MULTI_RECORDINGS = 10;

  // ── Translations ──

  const translations = {
    zh: {
      appTitle: '语音按钮板',
      addNewButton: '添加新按钮',
      editMode: '编辑模式',
      buttonMode: '按钮模式',
      clickToRecord: '点击录音',
      noRecording: '暂无录音',
      playing: '播放中...',
      stop: '停止',
      record: '录音',
      reRecord: '重新录音',
      play: '播放',
      modalAddTitle: '添加新按钮',
      modalLabelText: '按钮标签',
      cancel: '取消',
      add: '添加',
      modalDeleteTitle: '删除按钮',
      modalDeleteMessage: '确定要删除 "{label}" 吗？',
      delete: '删除',
      footerText: '音频数据本地存储在浏览器中',
      remaining: '剩余',
      approxMinutes: '约',
      minutes: '分钟',
      recordingTooShort: '录音时间过短 — 已丢弃',
      failedToSave: '保存录音失败',
      playbackError: '播放错误',
      playbackFailed: '播放失败',
      noAudioToPlay: '没有可播放的音频',
      maxButtonsReached: '已达到最多9个按钮',
      failedToDelete: '删除按钮失败',
      failedToCreate: '创建按钮失败',
      storageQuotaExceeded: '存储空间不足',
      micPermissionDenied: '麦克风权限被拒绝',
      micUnavailable: '麦克风不可用',
      warningIndexedDB: 'IndexedDB 不受支持。此应用无法存储数据。',
      warningMediaDevices: 'MediaDevices API 不可用。录音功能将无法使用。',
      warningMediaRecorder: 'MediaRecorder 不受支持。录音功能将无法使用。',
      warningHTTPS: '此页面未通过 HTTPS 提供。麦克风访问可能被阻止。',
      emptyState: '还没有按钮。点击"添加新按钮"开始使用。',
      buttonCount: '{count} / {max}',
      defaultButtonLabel: '按钮 {count}',
      buttonType: '按钮类型',
      singleVoice: '单语音按钮',
      multiVoice: '多语音按钮',
      recordingCount: '{count} / {max}',
      addRecording: '添加录音',
      deleteRecording: '删除此录音',
      playThis: '播放',
      recording: '录音',
      maxRecordingsReached: '已达到最多10个录音',
    },
    en: {
      appTitle: 'Voice Button Board',
      addNewButton: 'Add New Button',
      editMode: 'Edit Mode',
      buttonMode: 'Button Mode',
      clickToRecord: 'Click to record',
      noRecording: 'No recording',
      playing: 'Playing...',
      stop: 'Stop',
      record: 'Record',
      reRecord: 'Re-record',
      play: 'Play',
      modalAddTitle: 'Add New Button',
      modalLabelText: 'Button Label',
      cancel: 'Cancel',
      add: 'Add',
      modalDeleteTitle: 'Delete Button',
      modalDeleteMessage: 'Are you sure you want to delete "{label}"?',
      delete: 'Delete',
      footerText: 'Audio is stored locally in your browser',
      remaining: 'Remaining',
      approxMinutes: 'approx',
      minutes: 'min',
      recordingTooShort: 'Recording too short — discarded',
      failedToSave: 'Failed to save recording',
      playbackError: 'Playback error',
      playbackFailed: 'Playback failed',
      noAudioToPlay: 'No audio to play',
      maxButtonsReached: 'Maximum 9 buttons reached',
      failedToDelete: 'Failed to delete button',
      failedToCreate: 'Failed to create button',
      storageQuotaExceeded: 'Storage quota exceeded',
      micPermissionDenied: 'Mic permission denied',
      micUnavailable: 'Mic unavailable',
      warningIndexedDB: 'IndexedDB is not supported. This app cannot store data.',
      warningMediaDevices: 'MediaDevices API not available. Recording will not work.',
      warningMediaRecorder: 'MediaRecorder is not supported. Recording will not work.',
      warningHTTPS: 'This page is not served over HTTPS. Microphone access may be blocked.',
      emptyState: 'No buttons yet. Click "Add New Button" to get started.',
      buttonCount: '{count} / {max}',
      defaultButtonLabel: 'Button {count}',
      buttonType: 'Button Type',
      singleVoice: 'Single Voice Button',
      multiVoice: 'Multi-Voice Button',
      recordingCount: '{count} / {max}',
      addRecording: 'Add Recording',
      deleteRecording: 'Delete Recording',
      playThis: 'Play',
      recording: 'Recording',
      maxRecordingsReached: 'Maximum 10 recordings reached',
    }
  };

  const Lang = {
    _current: 'zh',

    init() {
      const saved = localStorage.getItem('voiceboard-lang');
      this._current = saved || 'zh';
      this.updateHTML();
    },

    get(key, params = {}) {
      let text = translations[this._current][key] || translations['en'][key] || key;
      Object.keys(params).forEach(param => {
        text = text.replace(`{${param}}`, params[param]);
      });
      return text;
    },

    switch(lang) {
      if (lang !== 'zh' && lang !== 'en') return;
      this._current = lang;
      localStorage.setItem('voiceboard-lang', lang);
      this.updateHTML();
      UI.renderAll();
    },

    getCurrent() {
      return this._current;
    },

    updateHTML() {
      const h1 = document.querySelector('.header h1');
      if (h1) h1.textContent = this.get('appTitle');

      const btnAddText = document.getElementById('btn-add-text');
      if (btnAddText) btnAddText.textContent = this.get('addNewButton');

      const footer = document.querySelector('.footer');
      if (footer) footer.textContent = this.get('footerText');

      document.getElementById('modal-title').textContent = this.get('modalAddTitle');

      const buttonTypeLabel = document.getElementById('button-type-label');
      if (buttonTypeLabel) buttonTypeLabel.textContent = this.get('buttonType');

      const singleVoiceOption = document.getElementById('single-voice-option');
      if (singleVoiceOption) singleVoiceOption.textContent = this.get('singleVoice');

      const multiVoiceOption = document.getElementById('multi-voice-option');
      if (multiVoiceOption) multiVoiceOption.textContent = this.get('multiVoice');

      const modalLabels = document.querySelectorAll('.modal-label');
      if (modalLabels[1]) modalLabels[1].textContent = this.get('modalLabelText');

      document.getElementById('modal-cancel').textContent = this.get('cancel');
      document.getElementById('modal-confirm').textContent = this.get('add');

      document.getElementById('delete-title').textContent = this.get('modalDeleteTitle');
      document.getElementById('delete-cancel').textContent = this.get('cancel');
      document.getElementById('delete-confirm').textContent = this.get('delete');
    }
  };

  // ── SVG Icons ──

  const Icons = {
    mic: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>`,
    micCheck: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
      <circle cx="19" cy="5" r="4" fill="#2563eb" stroke="#2563eb"/>
      <path d="M17.5 5l1 1 2-2" stroke="#fff" stroke-width="1.5"/>
    </svg>`,
    recordDot: `<svg width="32" height="32" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" fill="#dc2626"/>
    </svg>`,
    speaker: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path class="speaker-wave" d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
      <path class="speaker-wave" d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    </svg>`,
    warning: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>`,
    x: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>`,
    play: `<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="6 3 20 12 6 21 6 3"/>
    </svg>`,
  };

  // ── IndexedDB Module ──

  const DB = {
    _db: null,

    open() {
      return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          }
        };
        req.onsuccess = (e) => {
          DB._db = e.target.result;
          resolve(DB._db);
        };
        req.onerror = (e) => reject(e.target.error);
      });
    },

    _tx(mode) {
      const tx = DB._db.transaction(STORE_NAME, mode);
      return tx.objectStore(STORE_NAME);
    },

    getAll() {
      return new Promise((resolve, reject) => {
        const req = DB._tx('readonly').getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = (e) => reject(e.target.error);
      });
    },

    get(id) {
      return new Promise((resolve, reject) => {
        const req = DB._tx('readonly').get(id);
        req.onsuccess = () => resolve(req.result);
        req.onerror = (e) => reject(e.target.error);
      });
    },

    put(data) {
      return new Promise((resolve, reject) => {
        const req = DB._tx('readwrite').put(data);
        req.onsuccess = () => resolve(req.result);
        req.onerror = (e) => reject(e.target.error);
      });
    },

    delete(id) {
      return new Promise((resolve, reject) => {
        const req = DB._tx('readwrite').delete(id);
        req.onsuccess = () => resolve();
        req.onerror = (e) => reject(e.target.error);
      });
    },
  };

  // ── Audio Manager ──

  const AudioManager = {
    _recorder: null,
    _stream: null,
    _chunks: [],
    _audio: null,
    _objectUrl: null,
    _recordingButtonId: null,
    _playingButtonId: null,
    _recordStartTime: null,
    _timerInterval: null,

    isRecording() { return this._recorder && this._recorder.state === 'recording'; },
    isPlaying() { return this._audio && !this._audio.paused; },
    getRecordingButtonId() { return this._recordingButtonId; },
    getPlayingButtonId() { return this._playingButtonId; },

    _getSupportedMimeType() {
      const types = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
      ];
      for (const type of types) {
        if (MediaRecorder.isTypeSupported(type)) return type;
      }
      return '';
    },

    async startRecording(buttonId) {
      if (this.isRecording()) await this.stopRecording();
      if (this.isPlaying()) this.stopPlayback();

      this._recordingButtonId = buttonId;
      this._chunks = [];

      try {
        this._stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err) {
        this._recordingButtonId = null;
        throw err;
      }

      const mimeType = this._getSupportedMimeType();
      const options = mimeType ? { mimeType } : {};
      this._recorder = new MediaRecorder(this._stream, options);

      this._recorder.ondataavailable = (e) => {
        if (e.data.size > 0) this._chunks.push(e.data);
      };

      this._recordStartTime = Date.now();
      this._recorder.start();

      this._timerInterval = setInterval(() => {
        const elapsed = Date.now() - this._recordStartTime;
        UI.updateRecordingTimer(buttonId, elapsed);
      }, 100);
    },

    stopRecording() {
      return new Promise((resolve) => {
        if (!this._recorder || this._recorder.state === 'inactive') {
          this._cleanupRecording();
          resolve(null);
          return;
        }

        const buttonId = this._recordingButtonId;
        const startTime = this._recordStartTime;
        const recorder = this._recorder;

        recorder.onstop = async () => {
          const elapsed = Date.now() - startTime;

          clearInterval(this._timerInterval);
          this._timerInterval = null;

          if (this._stream) {
            this._stream.getTracks().forEach((t) => t.stop());
            this._stream = null;
          }

          if (elapsed < MIN_RECORDING_MS) {
            showToast(Lang.get('recordingTooShort'));
            this._cleanupRecording();
            UI.setCardState(buttonId);
            resolve(null);
            return;
          }

          const mimeType = recorder.mimeType || 'audio/webm';
          const audioBlob = new Blob(this._chunks, { type: mimeType });
          const audioDuration = elapsed;

          // Convert to ArrayBuffer for reliable storage in IndexedDB (mobile compatibility)
          const arrayBuffer = await audioBlob.arrayBuffer();

          try {
            const record = await DB.get(buttonId);
            if (record) {
              if (record.type === 'multi') {
                // Multi-voice button: add to recordings array
                if (!record.recordings) record.recordings = [];
                if (record.recordings.length >= MAX_MULTI_RECORDINGS) {
                  showToast(Lang.get('maxRecordingsReached'));
                } else {
                  const recordingId = 'rec_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
                  record.recordings.push({
                    id: recordingId,
                    arrayBuffer: arrayBuffer, // Store as ArrayBuffer instead of Blob
                    duration: audioDuration,
                    mimeType: mimeType,
                    createdAt: new Date().toISOString()
                  });
                  record.hasAudio = record.recordings.length > 0;
                  await DB.put(record);
                  updateStorageInfo();
                }
              } else {
                // Single-voice button: replace the recording
                record.hasAudio = true;
                record.audioArrayBuffer = arrayBuffer; // Store as ArrayBuffer instead of Blob
                record.audioDuration = audioDuration;
                record.mimeType = mimeType;
                await DB.put(record);
                updateStorageInfo();
              }
            }
          } catch (err) {
            console.error('Failed to save recording:', err);
            showToast(Lang.get('failedToSave'));
          }

          this._cleanupRecording();
          UI.setCardState(buttonId);
          resolve(buttonId);
        };

        recorder.stop();
      });
    },

    _cleanupRecording() {
      if (this._stream) {
        this._stream.getTracks().forEach((t) => t.stop());
        this._stream = null;
      }
      clearInterval(this._timerInterval);
      this._timerInterval = null;
      this._recorder = null;
      this._chunks = [];
      this._recordingButtonId = null;
      this._recordStartTime = null;
    },

    startPlayback(buttonId, blob) {
      if (this.isRecording()) return;
      if (this.isPlaying()) this.stopPlayback();

      try {
        this._objectUrl = URL.createObjectURL(blob);
        this._audio = new Audio();
        this._playingButtonId = buttonId;

        this._audio.onended = () => {
          this.stopPlayback();
        };

        this._audio.onerror = (e) => {
          console.error('Audio playback error:', e);
          showToast(Lang.get('playbackError'));
          this.stopPlayback();
        };

        // Set src after event listeners are attached
        this._audio.src = this._objectUrl;
        this._audio.load();

        this._audio.play().catch((err) => {
          console.error('Play failed:', err);
          showToast(Lang.get('playbackFailed'));
          this.stopPlayback();
        });

        UI.setCardState(buttonId);
      } catch (err) {
        console.error('Failed to create playback:', err);
        showToast(Lang.get('playbackFailed'));
        if (this._objectUrl) {
          URL.revokeObjectURL(this._objectUrl);
          this._objectUrl = null;
        }
        this._playingButtonId = null;
      }
    },

    stopPlayback() {
      const buttonId = this._playingButtonId;
      if (this._audio) {
        this._audio.pause();
        this._audio.onended = null;
        this._audio.onerror = null;
        // Force release audio resources
        this._audio.src = '';
        this._audio.load();
        this._audio = null;
      }
      if (this._objectUrl) {
        URL.revokeObjectURL(this._objectUrl);
        this._objectUrl = null;
      }
      this._playingButtonId = null;
      if (buttonId) UI.setCardState(buttonId);
    },

    async stopPlaybackAsync() {
      this.stopPlayback();
      // Wait for resources to be fully released on mobile (increased delay)
      await new Promise(resolve => setTimeout(resolve, 300));
    },

    reset() {
      // Force stop and cleanup everything
      if (this.isPlaying()) {
        this.stopPlayback();
      }
      if (this.isRecording()) {
        this.stopRecording();
      }
      // Clear all state
      this._audio = null;
      this._objectUrl = null;
      this._playingButtonId = null;
      this._recorder = null;
      this._stream = null;
      this._chunks = [];
      this._recordingButtonId = null;
      this._recordStartTime = null;
      if (this._timerInterval) {
        clearInterval(this._timerInterval);
        this._timerInterval = null;
      }
    },
  };

  // ── UI Module ──

  const UI = {
    _grid: null,
    _countEl: null,
    _addBtn: null,
    _buttonData: new Map(),

    init() {
      this._grid = document.getElementById('button-grid');
      this._countEl = document.getElementById('button-count');
      this._addBtn = document.getElementById('btn-add');
    },

    updateCount() {
      const count = this._buttonData.size;
      this._countEl.textContent = `${count} / ${MAX_BUTTONS}`;
      this._addBtn.disabled = count >= MAX_BUTTONS;
    },

    formatDuration(ms) {
      const secs = Math.floor(ms / 1000);
      const mins = Math.floor(secs / 60);
      const remSecs = secs % 60;
      return `${mins}:${String(remSecs).padStart(2, '0')}`;
    },

    formatTimer(ms) {
      const secs = Math.floor(ms / 1000);
      const tenths = Math.floor((ms % 1000) / 100);
      return `${secs}.${tenths}s`;
    },

    updateRecordingTimer(buttonId, elapsed) {
      const card = document.querySelector(`[data-id="${buttonId}"]`);
      if (!card) return;
      const timer = card.querySelector('.recording-timer');
      if (timer) timer.textContent = this.formatTimer(elapsed);
    },

    getCardState(buttonId) {
      if (AudioManager.getRecordingButtonId() === buttonId) return 'recording';
      if (AudioManager.getPlayingButtonId() === buttonId) return 'playing';
      const data = this._buttonData.get(buttonId);
      if (data && data.type === 'multi') {
        if (data.recordings && data.recordings.length > 0) return 'has-audio';
        return 'empty';
      }
      if (data && data.hasAudio) return 'has-audio';
      return 'empty';
    },

    setCardState(buttonId) {
      const card = document.querySelector(`[data-id="${buttonId}"]`);
      if (!card) return;
      const data = this._buttonData.get(buttonId);
      if (!data) return;

      DB.get(buttonId).then((fresh) => {
        if (fresh) {
          this._buttonData.set(buttonId, fresh);
          this._applyCardState(card, fresh);
        } else {
          this._applyCardState(card, data);
        }
      }).catch(() => {
        this._applyCardState(card, data);
      });
    },

    _applyCardState(card, data) {
      const buttonId = data.id;
      const state = this.getCardState(buttonId);
      const isMulti = data.type === 'multi';

      card.classList.remove('state-empty', 'state-recording', 'state-has-audio', 'state-playing', 'state-error');
      card.classList.add(`state-${state}`);

      if (isMulti) {
        card.classList.add('multi-voice-card');
      } else {
        card.classList.remove('multi-voice-card');
      }

      const iconEl = card.querySelector('.card-icon');
      const big = isBigMode();

      // For multi-voice buttons, render differently
      if (isMulti && !big) {
        this._renderMultiVoiceCard(card, data, state);
        return;
      }

      if (big) {
        switch (state) {
          case 'empty':
            iconEl.innerHTML = Icons.mic;
            break;
          case 'recording':
            iconEl.innerHTML = Icons.recordDot;
            break;
          case 'has-audio':
            iconEl.innerHTML = Icons.play;
            break;
          case 'playing':
            iconEl.innerHTML = Icons.speaker;
            break;
        }
      } else {
        switch (state) {
          case 'empty':
            iconEl.innerHTML = Icons.mic;
            break;
          case 'recording':
            iconEl.innerHTML = Icons.recordDot;
            break;
          case 'has-audio':
            iconEl.innerHTML = Icons.micCheck;
            break;
          case 'playing':
            iconEl.innerHTML = Icons.speaker;
            break;
        }
      }

      const statusEl = card.querySelector('.card-status');
      if (big) {
        if (isMulti) {
          switch (state) {
            case 'recording':
              statusEl.innerHTML = '<span class="recording-timer">0.0s</span>';
              break;
            case 'playing':
              statusEl.textContent = Lang.get('playing');
              break;
            default:
              if (data.recordings) {
                statusEl.textContent = Lang.get('recordingCount', {
                  count: data.recordings.length,
                  max: MAX_MULTI_RECORDINGS
                });
              } else {
                statusEl.textContent = Lang.get('clickToRecord');
              }
              break;
          }
        } else {
          switch (state) {
            case 'empty':
              statusEl.innerHTML = Lang.get('clickToRecord');
              break;
            case 'recording':
              statusEl.innerHTML = '<span class="recording-timer">0.0s</span>';
              break;
            case 'has-audio':
              statusEl.textContent = this.formatDuration(data.audioDuration || 0);
              break;
            case 'playing':
              statusEl.textContent = Lang.get('playing');
              break;
          }
        }
      } else {
        switch (state) {
          case 'empty':
            statusEl.innerHTML = Lang.get('noRecording');
            break;
          case 'recording':
            statusEl.innerHTML = '<span class="recording-timer">0.0s</span>';
            break;
          case 'has-audio':
            statusEl.textContent = this.formatDuration(data.audioDuration || 0);
            break;
          case 'playing':
            statusEl.textContent = Lang.get('playing');
            break;
        }
      }

      const actionsEl = card.querySelector('.card-actions');
      actionsEl.innerHTML = '';

      if (big) {
        // In big mode, no action buttons — the whole card is clickable
      } else if (state === 'recording') {
        const stopBtn = document.createElement('button');
        stopBtn.className = 'card-btn btn-record recording';
        stopBtn.textContent = Lang.get('stop');
        stopBtn.addEventListener('click', () => handleStopRecording(buttonId));
        actionsEl.appendChild(stopBtn);
      } else {
        const recBtn = document.createElement('button');
        recBtn.className = 'card-btn btn-record';
        recBtn.textContent = data.hasAudio ? Lang.get('reRecord') : Lang.get('record');
        recBtn.addEventListener('click', () => handleStartRecording(buttonId));
        actionsEl.appendChild(recBtn);

        if (state === 'playing') {
          const stopBtn = document.createElement('button');
          stopBtn.className = 'card-btn btn-play playing';
          stopBtn.textContent = Lang.get('stop');
          stopBtn.addEventListener('click', () => AudioManager.stopPlayback());
          actionsEl.appendChild(stopBtn);
        } else if (data.hasAudio) {
          const playBtn = document.createElement('button');
          playBtn.className = 'card-btn btn-play';
          playBtn.textContent = Lang.get('play');
          playBtn.addEventListener('click', () => handlePlay(buttonId));
          actionsEl.appendChild(playBtn);
        }
      }
    },

    _renderMultiVoiceCard(card, data, state) {
      const iconEl = card.querySelector('.card-icon');
      const statusEl = card.querySelector('.card-status');
      const actionsEl = card.querySelector('.card-actions');

      // Icon based on state
      if (state === 'recording') {
        iconEl.innerHTML = Icons.recordDot;
        // Show recording timer
        statusEl.innerHTML = '<span class="recording-timer">0.0s</span>';
      } else if (state === 'playing') {
        iconEl.innerHTML = Icons.speaker;
        statusEl.textContent = Lang.get('playing');
      } else {
        const recordings = data.recordings || [];
        // Show recording count
        statusEl.textContent = Lang.get('recordingCount', {
          count: recordings.length,
          max: MAX_MULTI_RECORDINGS
        });

        if (recordings.length > 0) {
          iconEl.innerHTML = Icons.micCheck;
        } else {
          iconEl.innerHTML = Icons.mic;
        }
      }

      // Actions
      actionsEl.innerHTML = '';

      if (state === 'recording') {
        const stopBtn = document.createElement('button');
        stopBtn.className = 'card-btn btn-record recording';
        stopBtn.textContent = Lang.get('stop');
        stopBtn.addEventListener('click', () => handleStopRecording(data.id));
        actionsEl.appendChild(stopBtn);
      } else {
        const recordings = data.recordings || [];
        // Add recording button
        if (recordings.length < MAX_MULTI_RECORDINGS) {
          const addBtn = document.createElement('button');
          addBtn.className = 'card-btn btn-record';
          addBtn.textContent = Lang.get('addRecording');
          addBtn.addEventListener('click', () => handleStartRecording(data.id));
          actionsEl.appendChild(addBtn);
        }
      }

      // Render recordings list
      const listContainer = card.querySelector('.recordings-list');
      if (listContainer) {
        listContainer.remove();
      }

      const recordings = data.recordings || [];
      if (recordings.length > 0 && state !== 'recording') {
        const list = document.createElement('div');
        list.className = 'recordings-list';

        recordings.forEach((rec, index) => {
          const item = document.createElement('div');
          item.className = 'recording-item';

          const info = document.createElement('div');
          info.className = 'recording-info';
          info.innerHTML = `<span class="recording-number">${Lang.get('recording')} ${index + 1}</span><span class="recording-duration">${this.formatDuration(rec.duration)}</span>`;
          item.appendChild(info);

          const itemActions = document.createElement('div');
          itemActions.className = 'recording-actions';

          const playBtn = document.createElement('button');
          playBtn.className = 'recording-btn btn-play-small';
          playBtn.textContent = Lang.get('playThis');
          playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            handlePlayMultiRecording(data.id, rec.id);
          });
          itemActions.appendChild(playBtn);

          const delBtn = document.createElement('button');
          delBtn.className = 'recording-btn btn-delete-small';
          delBtn.innerHTML = Icons.x;
          delBtn.title = Lang.get('deleteRecording');
          delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleDeleteRecording(data.id, rec.id);
          });
          itemActions.appendChild(delBtn);

          item.appendChild(itemActions);
          list.appendChild(item);
        });

        card.appendChild(list);
      }
    },

    renderCard(data) {
      // Ensure backward compatibility: if no type field, treat as single-voice
      if (!data.type) {
        data.type = 'single';
      }
      this._buttonData.set(data.id, data);

      const card = document.createElement('div');
      card.className = 'voice-card';
      card.dataset.id = data.id;
      card.draggable = true;

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn-delete';
      deleteBtn.title = 'Delete';
      deleteBtn.innerHTML = Icons.x;
      deleteBtn.addEventListener('click', () => handleDelete(data.id));
      card.appendChild(deleteBtn);

      const label = document.createElement('div');
      label.className = 'card-label';
      label.textContent = data.label;
      card.appendChild(label);

      // Inline label editing (double-click, edit mode only)
      label.addEventListener('dblclick', (e) => {
        if (isBigMode()) return;
        e.stopPropagation();
        const oldText = label.textContent;
        label.contentEditable = 'true';
        label.classList.add('editing');
        label.focus();
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(label);
        sel.removeAllRanges();
        sel.addRange(range);

        const finishEdit = () => {
          label.contentEditable = 'false';
          label.classList.remove('editing');
          const newText = label.textContent.trim();
          if (!newText) {
            label.textContent = oldText;
            return;
          }
          if (newText !== oldText) {
            const record = UI._buttonData.get(data.id);
            if (record) {
              record.label = newText;
              DB.put(record);
            }
          }
        };

        const onKey = (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            label.blur();
          } else if (e.key === 'Escape') {
            label.textContent = oldText;
            label.blur();
          }
        };

        label.addEventListener('keydown', onKey);
        label.addEventListener('blur', () => {
          label.removeEventListener('keydown', onKey);
          finishEdit();
        }, { once: true });
      });

      const icon = document.createElement('div');
      icon.className = 'card-icon';
      card.appendChild(icon);

      const status = document.createElement('div');
      status.className = 'card-status';
      card.appendChild(status);

      const actions = document.createElement('div');
      actions.className = 'card-actions';
      card.appendChild(actions);

      this._grid.appendChild(card);
      this._applyCardState(card, data);
      this.updateCount();
    },

    removeCard(id) {
      this._buttonData.delete(id);
      const card = document.querySelector(`[data-id="${id}"]`);
      if (card) card.remove();
      this.updateCount();
    },

    async renderAll() {
      this._grid.innerHTML = '';
      this._buttonData.clear();
      const all = await DB.getAll();
      all.sort((a, b) => a.order - b.order);
      for (const data of all) {
        this.renderCard(data);
      }
    },

    setCardError(buttonId, message) {
      const card = document.querySelector(`[data-id="${buttonId}"]`);
      if (!card) return;

      card.classList.remove('state-empty', 'state-recording', 'state-has-audio', 'state-playing');
      card.classList.add('state-error');

      card.querySelector('.card-icon').innerHTML = Icons.warning;
      card.querySelector('.card-status').textContent = message;

      setTimeout(() => this.setCardState(buttonId), 3000);
    },
  };

  // ── Big Mode Helper ──

  function isBigMode() {
    return document.getElementById('button-grid').classList.contains('big-mode');
  }

  // ── Storage Estimation ──

  async function updateStorageInfo() {
    const el = document.getElementById('storage-info');
    if (!el) return;
    if (!navigator.storage || !navigator.storage.estimate) {
      el.textContent = '';
      return;
    }
    try {
      const { quota, usage } = await navigator.storage.estimate();
      const remainMB = Math.floor((quota - usage) / 1024 / 1024);
      const approxMinutes = Math.floor(remainMB / 1);
      if (remainMB > 1024) {
        el.textContent = `${Lang.get('remaining')} ${(remainMB / 1024).toFixed(1)} GB (${Lang.get('approxMinutes')} ${approxMinutes} ${Lang.get('minutes')})`;
      } else {
        el.textContent = `${Lang.get('remaining')} ${remainMB} MB (${Lang.get('approxMinutes')} ${approxMinutes} ${Lang.get('minutes')})`;
      }
    } catch (err) {
      el.textContent = '';
    }
  }

  // ── Helper Functions ──

  // Create blob with retry for mobile compatibility
  async function createBlobWithRetry(buffer, mimeType, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[createBlobWithRetry] Attempt ${attempt}/${maxRetries}`);
        const blob = new Blob([buffer], { type: mimeType });
        console.log('[createBlobWithRetry] Success');
        return blob;
      } catch (error) {
        console.error(`[createBlobWithRetry] Attempt ${attempt} failed:`, error);
        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          const delay = attempt * 100;
          console.log(`[createBlobWithRetry] Waiting ${delay}ms before retry`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw error; // Re-throw on final attempt
        }
      }
    }
  }

  // ── Event Handlers ──

  async function handleStartRecording(buttonId) {
    if (AudioManager.isRecording()) {
      const prevId = AudioManager.getRecordingButtonId();
      await AudioManager.stopRecording();
      if (prevId) UI.setCardState(prevId);
    }

    if (AudioManager.isPlaying()) {
      AudioManager.stopPlayback();
    }

    try {
      await AudioManager.startRecording(buttonId);
      UI.setCardState(buttonId);
    } catch (err) {
      console.error('Recording failed:', err);
      if (err.name === 'NotAllowedError') {
        UI.setCardError(buttonId, Lang.get('micPermissionDenied'));
      } else {
        UI.setCardError(buttonId, Lang.get('micUnavailable'));
      }
    }
  }

  async function handleStopRecording(buttonId) {
    await AudioManager.stopRecording();
    UI.setCardState(buttonId);
  }

  async function handlePlay(buttonId) {
    // Prevent rapid double-clicks while loading audio
    if (loadingButtonId === buttonId) {
      console.log('[handlePlay] Already loading:', buttonId);
      return;
    }

    // Stop current playback if playing, allow new playback to start
    if (AudioManager.isPlaying()) {
      console.log('[handlePlay] Stopping current playback and waiting for cleanup');
      await AudioManager.stopPlaybackAsync();
      console.log('[handlePlay] Cleanup complete');
    }

    // Block if recording
    if (AudioManager.isRecording()) {
      console.log('[handlePlay] Cannot play while recording');
      return;
    }

    console.log('[handlePlay] Starting play for:', buttonId);
    loadingButtonId = buttonId;

    try {
      const data = await DB.get(buttonId);
      if (!data) {
        console.log('[handlePlay] No data found');
        showToast(Lang.get('noAudioToPlay'));
        return;
      }

      if (data.type === 'multi') {
        // For multi-voice button, play random recording with history avoidance
        if (!data.recordings || data.recordings.length === 0) {
          showToast(Lang.get('noAudioToPlay'));
          return;
        }

        // Initialize play history if not exists
        if (!data.playHistory) {
          data.playHistory = [];
        }

        // Determine history size based on number of recordings
        // For 2 recordings: keep last 1 (avoid immediate repeat)
        // For 3+ recordings: keep last 2 (avoid repeat within 2-3 clicks)
        const historySize = data.recordings.length >= 3 ? 2 : 1;

        // Get available recordings (exclude recent history)
        let availableRecordings = data.recordings.filter(rec =>
          !data.playHistory.includes(rec.id)
        );

        // If all recordings are in history, reset and use all
        if (availableRecordings.length === 0) {
          availableRecordings = data.recordings;
          data.playHistory = [];
        }

        // Select random recording from available ones
        const randomIndex = Math.floor(Math.random() * availableRecordings.length);
        const recording = availableRecordings[randomIndex];

        // Create blob from stored ArrayBuffer (mobile-compatible)
        console.log('[handlePlay] Creating blob from ArrayBuffer');
        const arrayBuffer = recording.arrayBuffer || recording.blob?.arrayBuffer?.(); // Support both old and new format
        if (!arrayBuffer) {
          console.error('[handlePlay] No arrayBuffer found in recording');
          showToast(Lang.get('noAudioToPlay'));
          return;
        }
        // If it's a promise (old format with blob), await it
        let buffer = arrayBuffer instanceof Promise ? await arrayBuffer : arrayBuffer;

        // Validate buffer
        console.log('[handlePlay] Buffer type:', buffer?.constructor?.name, 'Size:', buffer?.byteLength);
        if (!buffer || buffer.byteLength === undefined || buffer.byteLength === 0) {
          console.error('[handlePlay] Invalid buffer:', buffer);
          showToast(Lang.get('noAudioToPlay'));
          return;
        }

        // CRITICAL: Copy ArrayBuffer to break IndexedDB reference (mobile fix)
        console.log('[handlePlay] Copying ArrayBuffer to break reference');
        try {
          // Use Uint8Array for more reliable copy on mobile
          const uint8Array = new Uint8Array(buffer);
          console.log('[handlePlay] Uint8Array created, length:', uint8Array.length);
          buffer = uint8Array.buffer;
          console.log('[handlePlay] ArrayBuffer copied, size:', buffer.byteLength);
        } catch (e) {
          console.error('[handlePlay] Failed to copy ArrayBuffer:', e);
          throw e;
        }

        console.log('[handlePlay] Creating Blob from buffer with retry');
        const blobToPlay = await createBlobWithRetry(buffer, recording.mimeType);
        console.log('[handlePlay] Blob created successfully');

        // Update play history
        data.playHistory.push(recording.id);
        if (data.playHistory.length > historySize) {
          data.playHistory.shift(); // Remove oldest entry
        }

        // Save updated history to database asynchronously (don't block playback)
        DB.put(data).catch(err => console.error('Failed to save play history:', err));

        console.log('[handlePlay] Starting playback');
        AudioManager.startPlayback(buttonId, blobToPlay);
        console.log('[handlePlay] Playback started successfully');
      } else {
        // For single-voice button
        const arrayBuffer = data.audioArrayBuffer || data.audioBlob?.arrayBuffer?.(); // Support both old and new format
        if (!arrayBuffer) {
          showToast(Lang.get('noAudioToPlay'));
          return;
        }
        // Create blob from stored ArrayBuffer (mobile-compatible)
        console.log('[handlePlay] Creating single-voice blob from ArrayBuffer');
        let buffer = arrayBuffer instanceof Promise ? await arrayBuffer : arrayBuffer;
        // CRITICAL: Copy ArrayBuffer to break IndexedDB reference (mobile fix)
        buffer = new Uint8Array(buffer).buffer;
        const blobToPlay = await createBlobWithRetry(buffer, data.mimeType || 'audio/webm');
        console.log('[handlePlay] Starting single-voice playback');
        AudioManager.startPlayback(buttonId, blobToPlay);
      }
    } catch (error) {
      console.error('[handlePlay] Error:', error);
      showToast(Lang.get('playbackFailed'));
    } finally {
      console.log('[handlePlay] Clearing loading state');
      loadingButtonId = null;
    }
  }

  async function handlePlayMultiRecording(buttonId, recordingId) {
    // Prevent rapid double-clicks
    if (loadingButtonId === buttonId) {
      console.log('[handlePlayMultiRecording] Already loading:', buttonId);
      return;
    }

    // Stop current playback if playing
    if (AudioManager.isPlaying()) {
      console.log('[handlePlayMultiRecording] Stopping current playback');
      await AudioManager.stopPlaybackAsync();
    }

    if (AudioManager.isRecording()) {
      return;
    }

    console.log('[handlePlayMultiRecording] Starting:', buttonId, recordingId);
    loadingButtonId = buttonId;

    try {
      const data = await DB.get(buttonId);
      if (!data || !data.recordings) {
        showToast(Lang.get('noAudioToPlay'));
        return;
      }
      const recording = data.recordings.find(r => r.id === recordingId);
      if (!recording) {
        showToast(Lang.get('noAudioToPlay'));
        return;
      }
      // Create blob from stored ArrayBuffer (mobile-compatible)
      const arrayBuffer = recording.arrayBuffer || recording.blob?.arrayBuffer?.();
      if (!arrayBuffer) {
        showToast(Lang.get('noAudioToPlay'));
        return;
      }
      let buffer = arrayBuffer instanceof Promise ? await arrayBuffer : arrayBuffer;
      // CRITICAL: Copy ArrayBuffer to break IndexedDB reference (mobile fix)
      buffer = new Uint8Array(buffer).buffer;
      const blobToPlay = await createBlobWithRetry(buffer, recording.mimeType);
      AudioManager.startPlayback(buttonId, blobToPlay);
    } catch (error) {
      console.error('[handlePlayMultiRecording] Error:', error);
      showToast(Lang.get('playbackFailed'));
    } finally {
      console.log('[handlePlayMultiRecording] Clearing loading state');
      loadingButtonId = null;
    }
  }

  async function handleDeleteRecording(buttonId, recordingId) {
    const data = await DB.get(buttonId);
    if (!data || !data.recordings) return;

    data.recordings = data.recordings.filter(r => r.id !== recordingId);
    data.hasAudio = data.recordings.length > 0;

    try {
      await DB.put(data);
      UI.setCardState(buttonId);
      updateStorageInfo();
    } catch (err) {
      console.error('Failed to delete recording:', err);
      showToast(Lang.get('failedToDelete'));
    }
  }

  function handleDelete(id) {
    const data = UI._buttonData.get(id);
    const label = data ? data.label : '';
    const deleteOverlay = document.getElementById('delete-overlay');
    document.getElementById('delete-message').textContent = Lang.get('modalDeleteMessage', { label });
    pendingDeleteId = id;
    deleteOverlay.hidden = false;
    document.getElementById('delete-confirm').focus();
  }

  async function confirmDelete() {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    pendingDeleteId = null;
    document.getElementById('delete-overlay').hidden = true;

    if (AudioManager.getRecordingButtonId() === id) {
      await AudioManager.stopRecording();
    }
    if (AudioManager.getPlayingButtonId() === id) {
      AudioManager.stopPlayback();
    }

    try {
      await DB.delete(id);
      UI.removeCard(id);
    } catch (err) {
      console.error('Failed to delete button:', err);
      showToast(Lang.get('failedToDelete'));
    }
  }

  // ── Toast ──

  let toastTimer = null;
  let pendingDeleteId = null;
  let loadingButtonId = null; // Track button currently loading audio

  function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.hidden = false;
    void toast.offsetHeight;
    toast.classList.add('show');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => { toast.hidden = true; }, 300);
    }, 2500);
  }

  // ── Modal Helpers ──

  function showAddModal() {
    const count = UI._buttonData.size;
    const modalInput = document.getElementById('modal-input');
    modalInput.value = Lang.get('defaultButtonLabel', { count: count + 1 });
    document.getElementById('modal-overlay').hidden = false;
    modalInput.select();
    modalInput.focus();
  }

  function hideAddModal() {
    document.getElementById('modal-overlay').hidden = true;
  }

  async function confirmAddButton() {
    const modalInput = document.getElementById('modal-input');
    const label = modalInput.value.trim();
    if (!label) {
      modalInput.focus();
      return;
    }

    if (UI._buttonData.size >= MAX_BUTTONS) {
      showToast(Lang.get('maxButtonsReached'));
      hideAddModal();
      return;
    }

    const typeSelect = document.getElementById('button-type-select');
    const buttonType = typeSelect ? typeSelect.value : 'single';

    const id = 'btn_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    const data = {
      id,
      label,
      type: buttonType,
      order: Date.now(),
      createdAt: new Date().toISOString(),
      hasAudio: false,
    };

    if (buttonType === 'multi') {
      data.recordings = [];
    } else {
      data.audioBlob = null;
      data.audioDuration = 0;
      data.mimeType = null;
    }

    try {
      await DB.put(data);
      UI.renderCard(data);
    } catch (err) {
      console.error('Failed to save button:', err);
      if (err.name === 'QuotaExceededError') {
        showToast(Lang.get('storageQuotaExceeded'));
      } else {
        showToast(Lang.get('failedToCreate'));
      }
    }

    hideAddModal();
  }

  // ── Browser Support Detection ──

  function checkBrowserSupport() {
    const warnings = [];

    if (!window.indexedDB) {
      warnings.push(Lang.get('warningIndexedDB'));
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      warnings.push(Lang.get('warningMediaDevices'));
    }

    if (typeof MediaRecorder === 'undefined') {
      warnings.push(Lang.get('warningMediaRecorder'));
    }

    const loc = window.location;
    if (loc.protocol !== 'https:' && loc.hostname !== 'localhost' && loc.hostname !== '127.0.0.1' && loc.protocol !== 'file:') {
      warnings.push(Lang.get('warningHTTPS'));
    }

    if (warnings.length > 0) {
      const warningEl = document.getElementById('browser-warning');
      document.getElementById('warning-text').textContent = warnings.join(' ');
      warningEl.hidden = false;
    }
  }

  // ── beforeunload Cleanup ──

  window.addEventListener('beforeunload', () => {
    if (AudioManager.isRecording()) {
      AudioManager.stopRecording();
    }
    if (AudioManager.isPlaying()) {
      AudioManager.stopPlayback();
    }
  });

  // ── Page Visibility Cleanup (important for mobile) ──

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Page is hidden (user switched tabs or app went to background)
      // Stop all audio operations to free resources on mobile
      if (AudioManager.isPlaying()) {
        AudioManager.stopPlayback();
      }
      if (AudioManager.isRecording()) {
        AudioManager.stopRecording();
      }
    }
  });

  // ── Init ──

  document.addEventListener('DOMContentLoaded', async () => {
    // Clean up any residual audio resources on page load/refresh
    // This ensures a fresh start and allows refresh to recover from issues
    AudioManager.reset();

    checkBrowserSupport();
    UI.init();

    // Add Button
    document.getElementById('btn-add').addEventListener('click', showAddModal);

    // Add Modal
    document.getElementById('modal-cancel').addEventListener('click', hideAddModal);
    document.getElementById('modal-confirm').addEventListener('click', confirmAddButton);

    document.getElementById('modal-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) hideAddModal();
    });

    document.getElementById('modal-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') confirmAddButton();
      if (e.key === 'Escape') hideAddModal();
    });

    // Delete Modal
    document.getElementById('delete-cancel').addEventListener('click', () => {
      pendingDeleteId = null;
      document.getElementById('delete-overlay').hidden = true;
    });

    document.getElementById('delete-confirm').addEventListener('click', confirmDelete);

    document.getElementById('delete-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        pendingDeleteId = null;
        e.currentTarget.hidden = true;
      }
    });

    // Global keyboard
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modalOverlay = document.getElementById('modal-overlay');
        const deleteOverlay = document.getElementById('delete-overlay');
        if (!modalOverlay.hidden) hideAddModal();
        if (!deleteOverlay.hidden) {
          pendingDeleteId = null;
          deleteOverlay.hidden = true;
        }
      }
    });

    // Big mode toggle
    const modeToggle = document.getElementById('mode-toggle');
    const modeLabel = document.getElementById('mode-label');
    const grid = document.getElementById('button-grid');

    function updateModeLabel() {
      modeLabel.textContent = modeToggle.checked ? Lang.get('buttonMode') : Lang.get('editMode');
    }

    modeToggle.addEventListener('change', () => {
      if (modeToggle.checked) {
        grid.classList.add('big-mode');
      } else {
        grid.classList.remove('big-mode');
      }
      updateModeLabel();
      localStorage.setItem('voiceboard-bigmode', modeToggle.checked ? '1' : '0');
      UI.renderAll();
    });

    // Restore big mode preference
    if (localStorage.getItem('voiceboard-bigmode') === '1') {
      modeToggle.checked = true;
      grid.classList.add('big-mode');
    }
    updateModeLabel();

    // Big mode card click delegation
    grid.addEventListener('click', (e) => {
      if (!isBigMode()) return;
      if (e.target.closest('.btn-delete')) return;

      const card = e.target.closest('.voice-card');
      if (!card) return;

      const buttonId = card.dataset.id;
      const state = UI.getCardState(buttonId);

      switch (state) {
        case 'playing':
          AudioManager.stopPlayback();
          break;
        case 'recording':
          handleStopRecording(buttonId);
          break;
        case 'has-audio':
          handlePlay(buttonId);
          break;
        case 'empty':
          handleStartRecording(buttonId);
          break;
      }
    });

    // Drag-and-drop reorder (edit mode only)
    let draggedCard = null;
    let dragStartY = null;

    grid.addEventListener('dragstart', (e) => {
      if (isBigMode()) { e.preventDefault(); return; }
      const card = e.target.closest('.voice-card');
      if (!card) return;
      // Prevent drag while editing label
      if (card.querySelector('.card-label.editing')) { e.preventDefault(); return; }
      draggedCard = card;
      dragStartY = e.clientY;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    grid.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (!draggedCard || dragStartY === null) return;

      // Find card directly under cursor (X and Y)
      const allCards = Array.from(grid.querySelectorAll('.voice-card'));
      let targetCard = null;

      for (const card of allCards) {
        if (card === draggedCard) continue;
        const rect = card.getBoundingClientRect();
        // Only swap if cursor is directly over another card
        if (e.clientY >= rect.top && e.clientY <= rect.bottom &&
            e.clientX >= rect.left && e.clientX <= rect.right) {
          targetCard = card;
          break;
        }
      }

      if (!targetCard) return;

      const rect = targetCard.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const isDraggingDown = e.clientY > dragStartY;

      // Consistent logic:
      // - If dragging down, insert after when crossing middle
      // - If dragging up, insert before when crossing middle
      if (isDraggingDown) {
        if (e.clientY > midY) {
          grid.insertBefore(draggedCard, targetCard.nextSibling);
        }
      } else {
        if (e.clientY < midY) {
          grid.insertBefore(draggedCard, targetCard);
        }
      }
    });

    grid.addEventListener('dragend', async () => {
      if (!draggedCard) return;
      draggedCard.classList.remove('dragging');
      draggedCard = null;
      dragStartY = null;
      // Persist new order
      const cards = grid.querySelectorAll('.voice-card');
      for (let i = 0; i < cards.length; i++) {
        const id = cards[i].dataset.id;
        const record = UI._buttonData.get(id);
        if (record) {
          record.order = i;
          await DB.put(record);
        }
      }
    });

    // Touch drag support for mobile
    let touchDragData = {
      card: null,
      placeholder: null,
      startX: 0,
      startY: 0,
      offsetX: 0,
      offsetY: 0,
      touchId: null,
      activateTimeout: null
    };

    function findCardAtPoint(x, y, excludeCard) {
      const cards = grid.querySelectorAll('.voice-card');
      for (const card of cards) {
        if (card === excludeCard) continue;
        const rect = card.getBoundingClientRect();
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
          return card;
        }
      }
      return null;
    }

    grid.addEventListener('touchstart', (e) => {
      if (isBigMode()) return;

      const card = e.target.closest('.voice-card');
      if (!card) return;

      // Prevent drag while editing label
      if (card.querySelector('.card-label.editing')) return;

      // Prevent drag if touching delete button
      if (e.target.closest('.btn-delete')) return;

      const touch = e.touches[0];
      touchDragData.touchId = touch.identifier;
      touchDragData.card = card;

      const rect = card.getBoundingClientRect();
      touchDragData.offsetX = touch.clientX - rect.left;
      touchDragData.offsetY = touch.clientY - rect.top;
      touchDragData.startX = touch.clientX;
      touchDragData.startY = touch.clientY;

      // Activate drag after 200ms to avoid conflicting with taps
      touchDragData.activateTimeout = setTimeout(() => {
        if (touchDragData.card) {
          touchDragData.card.classList.add('touch-dragging');

          const placeholder = document.createElement('div');
          placeholder.className = 'drag-placeholder';
          placeholder.style.height = rect.height + 'px';
          card.parentNode.insertBefore(placeholder, card);
          touchDragData.placeholder = placeholder;

          card.style.position = 'fixed';
          card.style.zIndex = '1000';
          card.style.width = rect.width + 'px';
          card.style.left = (touch.clientX - touchDragData.offsetX) + 'px';
          card.style.top = (touch.clientY - touchDragData.offsetY) + 'px';
          card.style.pointerEvents = 'none';
        }
      }, 200);
    }, { passive: false });

    grid.addEventListener('touchmove', (e) => {
      if (!touchDragData.card || !touchDragData.placeholder) {
        return;
      }

      e.preventDefault();

      const touch = Array.from(e.touches).find(t => t.identifier === touchDragData.touchId);
      if (!touch) return;

      const card = touchDragData.card;

      card.style.left = (touch.clientX - touchDragData.offsetX) + 'px';
      card.style.top = (touch.clientY - touchDragData.offsetY) + 'px';

      const targetCard = findCardAtPoint(touch.clientX, touch.clientY, card);

      if (targetCard && targetCard !== touchDragData.placeholder) {
        const targetRect = targetCard.getBoundingClientRect();
        const midY = targetRect.top + targetRect.height / 2;

        if (touch.clientY < midY) {
          grid.insertBefore(touchDragData.placeholder, targetCard);
        } else {
          grid.insertBefore(touchDragData.placeholder, targetCard.nextSibling);
        }
      }
    }, { passive: false });

    grid.addEventListener('touchend', async () => {
      clearTimeout(touchDragData.activateTimeout);

      if (!touchDragData.card) return;

      const card = touchDragData.card;

      if (touchDragData.placeholder) {
        // Fully reset all inline styles
        card.style.position = 'relative';
        card.style.zIndex = 'auto';
        card.style.width = 'auto';
        card.style.left = 'auto';
        card.style.top = 'auto';
        card.style.pointerEvents = 'auto';
        card.classList.remove('touch-dragging');

        // Replace placeholder with card
        if (touchDragData.placeholder.parentNode) {
          touchDragData.placeholder.parentNode.replaceChild(card, touchDragData.placeholder);
        }

        // Persist new order
        const cards = grid.querySelectorAll('.voice-card');
        for (let i = 0; i < cards.length; i++) {
          const id = cards[i].dataset.id;
          const record = UI._buttonData.get(id);
          if (record) {
            record.order = i;
            await DB.put(record);
          }
        }
      }

      touchDragData = {
        card: null,
        placeholder: null,
        startX: 0,
        startY: 0,
        offsetX: 0,
        offsetY: 0,
        touchId: null,
        activateTimeout: null
      };
    });

    grid.addEventListener('touchcancel', () => {
      clearTimeout(touchDragData.activateTimeout);

      if (touchDragData.card) {
        // Fully reset all inline styles
        touchDragData.card.style.position = 'relative';
        touchDragData.card.style.zIndex = 'auto';
        touchDragData.card.style.width = 'auto';
        touchDragData.card.style.left = 'auto';
        touchDragData.card.style.top = 'auto';
        touchDragData.card.style.pointerEvents = 'auto';
        touchDragData.card.classList.remove('touch-dragging');
      }

      if (touchDragData.placeholder && touchDragData.placeholder.parentNode) {
        touchDragData.placeholder.parentNode.removeChild(touchDragData.placeholder);
      }

      touchDragData = {
        card: null,
        placeholder: null,
        startX: 0,
        startY: 0,
        offsetX: 0,
        offsetY: 0,
        touchId: null,
        activateTimeout: null
      };
    });

    // Open DB and render
    try {
      await DB.open();
      await UI.renderAll();
      updateStorageInfo();
    } catch (err) {
      console.error('Failed to initialize database:', err);
      showToast(Lang.get('failedToCreate'));
    }

    // Initialize language system
    Lang.init();

    // Language selector event
    document.getElementById('lang-selector').addEventListener('change', (e) => {
      Lang.switch(e.target.value);
    });

    // Set initial language selector value
    document.getElementById('lang-selector').value = Lang.getCurrent();

    // Display version number in footer
    const footer = document.querySelector('.footer');
    if (footer) {
      const versionSpan = document.createElement('span');
      versionSpan.style.marginLeft = '1rem';
      versionSpan.style.fontSize = '0.75rem';
      versionSpan.style.color = '#d1d5db';
      versionSpan.textContent = `v${VERSION}`;
      footer.appendChild(versionSpan);
    }
  });

})();
