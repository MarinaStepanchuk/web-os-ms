(() => {
  const appName = 'audio player';

  const rootElement = document.getElementById('audio-player');
  rootElement.style.zIndex = driver.getOpenApps().indexOf(appName) * 10;
  rootElement.addEventListener('mousedown', (event) => {
    if (event.target.closest('.close-button')) {
      return;
    }
    const openApps = driver.getOpenApps();
    if (openApps.at(-1) !== appName) {
      executor.changeIndexesOpenApps(appName);
    }
  });

  const filesToOpen = executor.getAppFilesToOpen(appName);
  const defaultPoster = driver.readFile(
    '/apps/audio player/assets/default_icon.png'
  ).body.body;
  const currentTrack = document.createElement('audio');

  let trackIndex = 0;
  let isPlaying = false;
  let isRandom = false;
  let updateTimer;

  const appWrapper = document.querySelector('.audio-player-wrapper');

  const header = document.createElement('header');
  header.classList.add('draggable');
  rootElement.prepend(header);

  const controlPanel = document.createElement('div');
  controlPanel.classList.add('control-panel');
  controlPanel.classList.add('draggable');
  header.append(controlPanel);

  const turnButton = document.createElement('div');
  turnButton.classList.add('control-button');
  turnButton.classList.add('turn-button');
  turnButton.innerText = '–';

  const closeButton = document.createElement('div');
  closeButton.classList.add('control-button');
  closeButton.classList.add('close-button');
  closeButton.innerText = '×';

  controlPanel.append(turnButton, closeButton);

  closeButton.addEventListener('click', () => {
    executor.closeApp(appName);
  });

  const player = document.createElement('div');
  player.classList.add('player');
  appWrapper.append(player);

  function getTrackNameFromFileName(fileName) {
    const array = fileName.split('.');
    array.splice(-1, 1);
    return array.join('.');
  }

  const detailsAudio = document.createElement('div');
  detailsAudio.classList.add('details');
  player.append(detailsAudio);
  player.append(currentTrack);
  const trackName = document.createElement('p');
  trackName.classList.add('track-name');
  const trackPoster = document.createElement('div');
  trackPoster.classList.add('track-poster');
  trackPoster.style.backgroundImage = `url(${defaultPoster})`;
  detailsAudio.append(trackName, trackPoster);
  const volumeContainer = document.createElement('div');
  player.append(volumeContainer);
  volumeContainer.classList.add('slider-container');
  const volumeLine = document.createElement('input');
  volumeLine.classList.add('volume-line');
  volumeLine.type = 'range';
  volumeLine.min = 1;
  volumeLine.max = 100;
  volumeLine.value = 60;
  const volumeButton = document.createElement('button');
  volumeButton.classList.add('volume-button');
  volumeButton.innerHTML = '<i class="fa fa-volume-up"></i>';
  volumeContainer.append(volumeButton, volumeLine);
  const buttonsContainer = document.createElement('div');
  buttonsContainer.classList.add('buttons-container');
  player.append(buttonsContainer);
  const randomButton = document.createElement('button');
  randomButton.classList.add('random-track-button');
  randomButton.innerHTML = '<i class="fas fa-random fa-2x" title="random"></i>';
  const previousButton = document.createElement('button');
  previousButton.classList.add('previous-track-button');
  previousButton.innerHTML = '<i class="fa fa-step-backward fa-2x"></i>';
  const playButton = document.createElement('button');
  playButton.classList.add('play-track-button');
  playButton.innerHTML = '<i class="fa fa-play-circle fa-4x"></i>';
  const nextButton = document.createElement('button');
  nextButton.classList.add('next-track-button');
  nextButton.innerHTML = '<i class="fa fa-step-forward fa-2x"></i>';
  const repeatButton = document.createElement('button');
  repeatButton.classList.add('repeat-track-button');
  repeatButton.innerHTML = '<i class="fa fa-repeat fa-2x" title="repeat">';
  buttonsContainer.append(
    randomButton,
    previousButton,
    playButton,
    nextButton,
    repeatButton
  );
  const sliderContainer = document.createElement('div');
  sliderContainer.classList.add('slider-container');
  player.append(sliderContainer);
  const currentTime = document.createElement('span');
  const trackLine = document.createElement('input');
  trackLine.classList.add('track-line');
  trackLine.type = 'range';
  trackLine.min = 1;
  trackLine.max = 100;
  trackLine.value = 0;
  trackLine.classList.add('track-line');
  const duration = document.createElement('span');
  sliderContainer.append(currentTime, trackLine, duration);

  const playList = document.createElement('div');
  playList.classList.add('play-list');
  appWrapper.append(playList);
  const titlePlayList = document.createElement('p');
  titlePlayList.textContent = 'PLAY LIST';
  playList.append(titlePlayList);

  function fillPlayList() {
    filesToOpen.forEach((item, index) => {
      const videoItem = document.createElement('p');
      videoItem.classList.add('play-list-item');
      videoItem.setAttribute('data-name', item.name);
      if (item.name === filesToOpen[trackIndex].name) {
        videoItem.classList.add('active-audio');
      }
      videoItem.textContent = `${index + 1} ${item.name}`;
      playList.append(videoItem);
    });
  }

  fillPlayList();

  playList.addEventListener('click', (event) => changeCurrentTrack(event));
  playButton.addEventListener('click', playpauseTrack);
  previousButton.addEventListener('click', prevTrack);
  nextButton.addEventListener('click', nextTrack);
  repeatButton.addEventListener('click', repeatTrack);
  randomButton.addEventListener('click', randomTrack);
  trackLine.addEventListener('change', rewind);
  volumeLine.addEventListener('change', changeVolume);
  volumeButton.addEventListener('click', mute);

  loadTrack(trackIndex);
  playTrack(trackIndex);

  function changeCurrentTrack(event) {
    const item = event.target.closest('.play-list-item');
    if (!item) {
      return;
    }
    const currentActivePhoto = rootElement.querySelector('.active-audio');
    currentActivePhoto.classList.remove('active-audio');
    item.classList.add('active-audio');
    const name = item.getAttribute('data-name');
    trackIndex = filesToOpen.findIndex((item) => item.name === name);
    loadTrack(trackIndex);
    playTrack(trackIndex);
  }

  function changeActiveTrack(index) {
    const list = rootElement.querySelectorAll('.play-list-item');
    list.forEach((item) => {
      if (item.classList.contains('active-audio')) {
        item.classList.remove('active-audio');
      }
    });
    list[index].classList.add('active-audio');
  }

  function loadTrack(index) {
    clearInterval(updateTimer);
    reset();
    const currentAudio = filesToOpen[index];
    currentTrack.src = currentAudio.body;
    currentTrack.load();

    trackName.textContent = getTrackNameFromFileName(currentAudio.name);
    updateTimer = setInterval(setUpdate, 1000);

    currentTrack.addEventListener('ended', nextTrack);
    random_bg_color();
  }

  function random_bg_color() {
    let hex = [
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      'a',
      'b',
      'c',
      'd',
      'e',
    ];
    let a;

    function populate() {
      let a = '';
      for (let i = 0; i < 6; i++) {
        let x = Math.round(Math.random() * 14);
        let y = hex[x];
        a += y;
      }
      return `#${a}`;
    }

    let Color1 = populate();
    let Color2 = populate();
    let gradient = `linear-gradient(to right, ${Color1}, ${Color2})`;
    appWrapper.style.background = gradient;
  }

  function reset() {
    currentTime.textContent = '00:00';
    duration.textContent = '00:00';
    trackLine.value = 0;
  }

  function playpauseTrack() {
    isPlaying ? pauseTrack() : playTrack();
  }

  function playTrack() {
    currentTrack.play();
    isPlaying = true;
    trackPoster.classList.add('rotate');
    playButton.innerHTML = '<i class="fa fa-pause-circle fa-4x"></i>';
  }

  function pauseTrack() {
    currentTrack.pause();
    isPlaying = false;
    trackPoster.classList.remove('rotate');
    playButton.innerHTML = '<i class="fa fa-play-circle fa-4x"></i>';
  }

  function nextTrack() {
    if (trackIndex < filesToOpen.length - 1 && isRandom === false) {
      trackIndex += 1;
    } else if (trackIndex < filesToOpen.length - 1 && isRandom === true) {
      trackIndex = Number.parseInt(Math.random() * filesToOpen.length);
    } else {
      trackIndex = 0;
    }
    loadTrack(trackIndex);
    playTrack();
    changeActiveTrack(trackIndex);
  }

  function prevTrack() {
    trackIndex = trackIndex > 0 ? trackIndex - 1 : filesToOpen.length - 1;
    loadTrack(trackIndex);
    playTrack();
    changeActiveTrack(trackIndex);
  }

  function repeatTrack() {
    loadTrack(trackIndex);
    playTrack();
  }

  function randomTrack() {
    if (isRandom) {
      pauseRandom();
    } else {
      playRandom();
    }
  }

  function playRandom() {
    isRandom = true;
    randomButton.classList.add('random-active');
  }

  function pauseRandom() {
    isRandom = false;
    randomButton.classList.remove('random-active');
  }

  function rewind() {
    currentTrack.currentTime = currentTrack.duration * (trackLine.value / 100);
  }

  function mute() {
    const volume = volumeLine.value;
    if (volume > 1) {
      volumeButton.innerHTML =
        '<i class="fa fa-volume-off" aria-hidden="true"></i>';
      currentTrack.volume = 0;
      volumeLine.value = 0;
      return;
    }

    volumeButton.innerHTML = '<i class="fa fa-volume-up"></i>';
    volumeLine.value = 50;
    currentTrack.volume = volumeLine.value / 100;
  }

  function changeVolume() {
    currentTrack.volume = volumeLine.value / 100;
    volumeButton.innerHTML =
      volumeLine.value > 1
        ? '<i class="fa fa-volume-up"></i>'
        : '<i class="fa fa-volume-off" aria-hidden="true"></i>';
  }

  function setUpdate() {
    let position = 0;
    if (!isNaN(currentTrack.duration)) {
      position = currentTrack.currentTime * (100 / currentTrack.duration);
      trackLine.value = position;

      let currentMinutes = Math.floor(currentTrack.currentTime / 60);
      let currentSeconds = Math.floor(
        currentTrack.currentTime - currentMinutes * 60
      );
      let durationMinutes = Math.floor(currentTrack.duration / 60);
      let durationSeconds = Math.floor(
        currentTrack.duration - durationMinutes * 60
      );

      if (currentSeconds < 10) {
        currentSeconds = `0${currentSeconds}`;
      }
      if (durationSeconds < 10) {
        durationSeconds = `0${durationSeconds}`;
      }
      if (currentMinutes < 10) {
        currentMinutes = `0${currentMinutes}`;
      }
      if (durationMinutes < 10) {
        durationMinutes = `0${durationMinutes}`;
      }

      currentTime.textContent = `${currentMinutes}:${currentSeconds}`;
      duration.textContent = `${durationMinutes}:${durationSeconds}`;
    }
  }
})();
