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
  let currentAudio = filesToOpen[0];
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
  const trackName = document.createElement('p');
  trackName.classList.add('track-name');
  trackName.innerText = getTrackNameFromFileName(currentAudio.name);
  const trackPoster = document.createElement('div');
  trackPoster.classList.add('track-poster');
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
  volumeButton.innerHTML = '<i class="fa fa-volume-down"></i>';
  const volumeIcon = document.createElement('button');
  volumeIcon.classList.add('volume-icon');
  volumeIcon.innerHTML = '<i class="fa fa-volume-up"></i>';
  volumeContainer.append(volumeButton, volumeLine, volumeIcon);
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
  currentTime.innerText = '00:00';
  const trackLine = document.createElement('input');
  trackLine.classList.add('track-line');
  trackLine.type = 'range';
  trackLine.min = 1;
  trackLine.max = 100;
  trackLine.value = 0;
  trackLine.classList.add('track-line');
  const duration = document.createElement('span');
  duration.innerText = '00:00';
  sliderContainer.append(currentTime, trackLine, duration);

  const playList = document.createElement('div');
  playList.classList.add('play-list');
  appWrapper.append(playList);
  const titlePlayList = document.createElement('p');
  titlePlayList.innerText = 'PLAY LIST';
  playList.append(titlePlayList);

  function fillPlayList() {
    filesToOpen.forEach((item, index) => {
      const videoItem = document.createElement('p');
      videoItem.classList.add('play-list-item');
      videoItem.setAttribute('data-name', item.name);
      if (item.name === currentAudio.name) {
        videoItem.classList.add('active-audio');
      }
      videoItem.innerText = `${index + 1} ${item.name}`;
      playList.append(videoItem);
    });
  }

  fillPlayList();

  playList.addEventListener('click', (event) => changeCurrentAudio(event));

  function changeCurrentAudio(event) {
    const item = event.target.closest('.play-list-item');
    if (!item) {
      return;
    }
    const currentActivePhoto = rootElement.querySelector('.active-audio');
    currentActivePhoto.classList.remove('active-audio');
    item.classList.add('active-audio');
    const name = item.getAttribute('data-name');
    currentAudio = filesToOpen.find((item) => item.name === name);
  }
})();
