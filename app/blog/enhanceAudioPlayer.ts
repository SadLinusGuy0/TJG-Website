const ICON_PLAY = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.76196 19.519L18.011 13.476C19.148 12.82 19.148 11.18 18.011 10.524L8.76196 4.481C7.62596 3.825 6.20496 4.645 6.20496 5.957V18.042C6.20496 19.355 7.62596 20.175 8.76196 19.519Z" fill="currentColor"/></svg>';

const ICON_PAUSE = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.02437 4.54102L8.16937 4.54692C9.07807 4.62122 9.79737 5.38782 9.79737 6.31402V17.685C9.79737 18.661 9.00037 19.459 8.02437 19.459C7.04737 19.459 6.25037 18.661 6.25037 17.685V6.31402C6.25037 5.33902 7.04737 4.54102 8.02437 4.54102ZM15.9756 4.54102L16.1206 4.54692C17.0294 4.62122 17.7496 5.38782 17.7496 6.31402V17.685C17.7496 18.661 16.9516 19.459 15.9756 19.459C14.9996 19.459 14.2026 18.661 14.2026 17.685V6.31402C14.2026 5.33902 14.9996 4.54102 15.9756 4.54102Z" fill="currentColor"/></svg>';

const ICON_VOL_HIGH = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.7197 5.30199C12.3336 4.75123 12.834 4.97513 12.834 5.80004V18.55C12.834 19.3749 12.3336 19.5978 11.7197 19.0471L7.12793 15.1721H4.5C3.6712 15.1719 3.00006 14.4999 3 13.6721V10.6721C3 9.84423 3.67117 9.17231 4.5 9.17211H7.13184L11.7197 5.30199Z" fill="currentColor"/><path d="M17.1367 5.66527C17.4184 5.36162 17.8936 5.34352 18.1973 5.62523C22.0876 9.235 22.0879 15.1152 18.1973 18.7248C17.8937 19.0064 17.4184 18.9881 17.1367 18.6848C16.8554 18.3812 16.8734 17.9068 17.1768 17.6252C20.4278 14.6091 20.4275 9.74111 17.1768 6.72484C16.8733 6.44328 16.8555 5.96893 17.1367 5.66527Z" fill="currentColor"/><path d="M15.0059 8.53441C15.2906 8.23368 15.7656 8.22049 16.0664 8.50512C18.2015 10.527 18.2018 13.8232 16.0664 15.845C15.7657 16.1294 15.2906 16.116 15.0059 15.8157C14.7213 15.5149 14.7345 15.0399 15.0352 14.7551C16.5453 13.3251 16.5451 11.0251 15.0352 9.59496C14.7345 9.31027 14.7213 8.83521 15.0059 8.53441Z" fill="currentColor"/></svg>';

const ICON_VOL_LOW = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.7197 5.30199C14.3336 4.75123 14.834 4.97513 14.834 5.80004V18.55C14.834 19.3749 14.3336 19.5978 13.7197 19.0471L9.12793 15.1721H6.5C5.6712 15.1719 5.00006 14.4999 5 13.6721V10.6721C5 9.84423 5.67117 9.17231 6.5 9.17211H9.13184L13.7197 5.30199Z" fill="currentColor"/><path d="M17.0059 8.53441C17.2906 8.23368 17.7656 8.22049 18.0664 8.50512C20.2015 10.527 20.2018 13.8232 18.0664 15.845C17.7657 16.1294 17.2906 16.116 17.0059 15.8157C16.7213 15.5149 16.7345 15.0399 17.0352 14.7551C18.5453 13.3251 18.5451 11.0251 17.0352 9.59496C16.7345 9.31027 16.7213 8.83521 17.0059 8.53441Z" fill="currentColor"/></svg>';

const ICON_VOL_MUTE = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.7197 5.30199C12.3336 4.75123 12.834 4.97513 12.834 5.80004V18.55C12.834 19.3749 12.3336 19.5978 11.7197 19.0471L7.12793 15.1721H4.5C3.6712 15.1719 3.00006 14.4999 3 13.6721V10.6721C3 9.84423 3.67117 9.17231 4.5 9.17211H7.13184L11.7197 5.30199Z" fill="currentColor"/><path d="M18.3613 10.0539C19.0684 9.34684 20.129 10.4074 19.4219 11.1145L18.3613 12.175L19.4219 13.2356C20.129 13.9427 19.0684 15.0032 18.3613 14.2961L17.3008 13.2356L16.2402 14.2961C15.5331 15.0032 14.4726 13.9427 15.1797 13.2356L16.2402 12.175L15.1797 11.1145C14.4726 10.4074 15.5331 9.34684 16.2402 10.0539L17.3008 11.1145L18.3613 10.0539Z" fill="currentColor"/></svg>';

const ICON_DOWNLOAD = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M18.1536 19.7385C18.5676 19.7385 18.9036 20.0745 18.9036 20.4885C18.9036 20.9025 18.5676 21.2385 18.1536 21.2385H5.84656C5.43256 21.2385 5.09656 20.9025 5.09656 20.4885C5.09656 20.0745 5.43256 19.7385 5.84656 19.7385H18.1536ZM12.0092 2.76151C12.4232 2.76151 12.7592 3.09751 12.7592 3.51151V15.5725L16.6172 11.5485C16.9032 11.2485 17.3782 11.2385 17.6782 11.5255C17.9772 11.8115 17.9862 12.2865 17.7002 12.5865L13.1612 17.3215C12.8602 17.6355 12.4362 17.8165 12.0002 17.8165C11.5642 17.8165 11.1412 17.6355 10.8392 17.3215L6.30016 12.5865C6.01416 12.2865 6.02416 11.8115 6.32216 11.5255C6.62216 11.2385 7.09616 11.2485 7.38316 11.5485L11.2592 15.5915V3.51151C11.2592 3.09751 11.5952 2.76151 12.0092 2.76151Z" fill="currentColor"/></svg>';

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function updateRangeTrack(input: HTMLInputElement) {
  const min = parseFloat(input.min) || 0;
  const max = parseFloat(input.max) || 100;
  const val = parseFloat(input.value) || 0;
  const pct = ((val - min) / (max - min)) * 100;
  input.style.setProperty('--range-pct', `${pct}%`);
}

function volumeIcon(volume: number, muted: boolean): string {
  if (muted || volume === 0) return ICON_VOL_MUTE;
  if (volume < 0.5) return ICON_VOL_LOW;
  return ICON_VOL_HIGH;
}

interface PlayerCleanup {
  pause: () => void;
  destroy: () => void;
}

function buildPlayer(audio: HTMLAudioElement, title: string | null): PlayerCleanup {
  const container = document.createElement('div');
  container.className = 'custom-audio-player';

  if (title) {
    const titleEl = document.createElement('div');
    titleEl.className = 'custom-audio-player__title';
    titleEl.textContent = title;
    container.appendChild(titleEl);
  }

  const progressRow = document.createElement('div');
  progressRow.className = 'custom-audio-player__progress';

  const timeEl = document.createElement('span');
  timeEl.className = 'custom-audio-player__time';
  timeEl.textContent = '0:00';

  const seekBar = document.createElement('input');
  seekBar.type = 'range';
  seekBar.className = 'custom-audio-player__seek';
  seekBar.min = '0';
  seekBar.max = '100';
  seekBar.value = '0';
  seekBar.step = '0.1';
  seekBar.setAttribute('aria-label', 'Seek');
  updateRangeTrack(seekBar);

  const durationEl = document.createElement('span');
  durationEl.className = 'custom-audio-player__duration';
  durationEl.textContent = '0:00';

  progressRow.appendChild(timeEl);
  progressRow.appendChild(seekBar);
  progressRow.appendChild(durationEl);
  container.appendChild(progressRow);

  const controlsRow = document.createElement('div');
  controlsRow.className = 'custom-audio-player__controls';

  const playBtn = document.createElement('button');
  playBtn.className = 'custom-audio-player__btn custom-audio-player__play';
  playBtn.setAttribute('aria-label', 'Play');
  playBtn.innerHTML = ICON_PLAY;

  const rightControls = document.createElement('div');
  rightControls.className = 'custom-audio-player__right-controls';

  const volumeWrap = document.createElement('div');
  volumeWrap.className = 'custom-audio-player__volume';

  const volBtn = document.createElement('button');
  volBtn.className = 'custom-audio-player__btn custom-audio-player__vol-btn';
  volBtn.setAttribute('aria-label', 'Toggle mute');
  volBtn.innerHTML = ICON_VOL_HIGH;

  const volSlider = document.createElement('input');
  volSlider.type = 'range';
  volSlider.className = 'custom-audio-player__vol-slider';
  volSlider.min = '0';
  volSlider.max = '100';
  volSlider.value = '100';
  volSlider.setAttribute('aria-label', 'Volume');
  updateRangeTrack(volSlider);

  volumeWrap.appendChild(volBtn);
  volumeWrap.appendChild(volSlider);

  const downloadLink = document.createElement('a');
  downloadLink.className = 'custom-audio-player__btn custom-audio-player__download';
  downloadLink.setAttribute('aria-label', 'Download');
  downloadLink.href = audio.src || audio.querySelector('source')?.src || '';
  downloadLink.download = '';
  downloadLink.target = '_blank';
  downloadLink.rel = 'noopener noreferrer';
  downloadLink.innerHTML = ICON_DOWNLOAD;

  rightControls.appendChild(volumeWrap);
  rightControls.appendChild(downloadLink);

  controlsRow.appendChild(playBtn);
  controlsRow.appendChild(rightControls);
  container.appendChild(controlsRow);

  audio.style.display = 'none';
  audio.removeAttribute('controls');
  audio.parentElement!.insertBefore(container, audio.nextSibling);

  let prevVolume = 1;

  const onPlay = () => {
    playBtn.innerHTML = ICON_PAUSE;
    playBtn.setAttribute('aria-label', 'Pause');
  };
  const onPause = () => {
    playBtn.innerHTML = ICON_PLAY;
    playBtn.setAttribute('aria-label', 'Play');
  };
  const onTimeUpdate = () => {
    if (!isFinite(audio.duration)) return;
    timeEl.textContent = formatTime(audio.currentTime);
    seekBar.value = String((audio.currentTime / audio.duration) * 100);
    updateRangeTrack(seekBar);
  };
  const onLoadedMetadata = () => {
    durationEl.textContent = formatTime(audio.duration);
  };
  const onEnded = () => {
    playBtn.innerHTML = ICON_PLAY;
    playBtn.setAttribute('aria-label', 'Play');
    seekBar.value = '0';
    updateRangeTrack(seekBar);
  };
  const onVolumeChange = () => {
    volBtn.innerHTML = volumeIcon(audio.volume, audio.muted);
    volSlider.value = String(audio.muted ? 0 : audio.volume * 100);
    updateRangeTrack(volSlider);
  };

  audio.addEventListener('play', onPlay);
  audio.addEventListener('pause', onPause);
  audio.addEventListener('timeupdate', onTimeUpdate);
  audio.addEventListener('loadedmetadata', onLoadedMetadata);
  audio.addEventListener('ended', onEnded);
  audio.addEventListener('volumechange', onVolumeChange);

  if (audio.readyState >= 1) {
    durationEl.textContent = formatTime(audio.duration);
  }

  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  });

  seekBar.addEventListener('input', () => {
    if (!isFinite(audio.duration)) return;
    audio.currentTime = (parseFloat(seekBar.value) / 100) * audio.duration;
  });

  volSlider.addEventListener('input', () => {
    const v = parseFloat(volSlider.value) / 100;
    audio.volume = v;
    audio.muted = v === 0;
    if (v > 0) prevVolume = v;
    updateRangeTrack(volSlider);
  });

  volBtn.addEventListener('click', () => {
    if (audio.muted || audio.volume === 0) {
      audio.muted = false;
      audio.volume = prevVolume || 0.5;
    } else {
      prevVolume = audio.volume;
      audio.muted = true;
    }
  });

  return {
    pause: () => { audio.pause(); },
    destroy: () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('volumechange', onVolumeChange);
      audio.pause();
      container.remove();
    },
  };
}

const ENHANCED_ATTR = 'data-custom-player';

export function enhanceAudioPlayer(scope: ParentNode = document): (() => void) {
  const cleanups: PlayerCleanup[] = [];

  const figures = scope.querySelectorAll<HTMLElement>('figure.wp-block-audio');
  figures.forEach((figure) => {
    if (figure.hasAttribute(ENHANCED_ATTR)) return;
    figure.setAttribute(ENHANCED_ATTR, 'true');

    const audio = figure.querySelector<HTMLAudioElement>('audio');
    if (!audio) return;

    const figcaption = figure.querySelector('figcaption');
    const title = figcaption?.textContent?.trim() || null;
    if (figcaption) figcaption.style.display = 'none';

    cleanups.push(buildPlayer(audio, title));
  });

  const standaloneAudios = scope.querySelectorAll<HTMLAudioElement>(
    'audio:not(figure.wp-block-audio audio)'
  );
  standaloneAudios.forEach((audio) => {
    if (audio.closest(`[${ENHANCED_ATTR}]`)) return;
    const wrapper = audio.parentElement;
    if (wrapper) wrapper.setAttribute(ENHANCED_ATTR, 'true');

    cleanups.push(buildPlayer(audio, null));
  });

  return () => {
    cleanups.forEach((c) => c.pause());
  };
}
