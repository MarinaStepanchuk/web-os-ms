(() => {
  const appName = 'media player';

  const rootElement = document.getElementById('media-player');
  rootElement.classList.add('draggble-container');
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
  let fullScreenMode = false;

  const filesToOpen = executor.getAppFilesToOpen(appName);
  let currentVideo = filesToOpen[0];

  const appWrapper = document.querySelector('.media-player-wrapper');

  const header = document.createElement('header');
  header.classList.add('draggable');
  rootElement.prepend(header);

  const videoTitle = document.createElement('span');
  videoTitle.innerText = currentVideo.name;

  const controlPanel = document.createElement('div');
  controlPanel.classList.add('control-panel');
  controlPanel.classList.add('draggable');
  header.append(videoTitle, controlPanel);

  const turnButton = document.createElement('div');
  turnButton.classList.add('control-button');
  turnButton.classList.add('turn-button');
  turnButton.innerText = '–';

  const expandButton = document.createElement('div');
  expandButton.classList.add('control-button');
  expandButton.classList.add('expand-button');
  expandButton.innerText = '◻';

  const closeButton = document.createElement('div');
  closeButton.classList.add('control-button');
  closeButton.classList.add('close-button');
  closeButton.innerText = '×';

  controlPanel.append(turnButton, expandButton, closeButton);

  closeButton.addEventListener('click', () => {
    executor.closeApp(appName);
  });

  expandButton.addEventListener('click', () => {
    if (fullScreenMode) {
      rootElement.style.width = '70%';
      rootElement.style.height = '60%';
      rootElement.style.left = '50%';
      rootElement.style.top = '50%';
      rootElement.style.transform = `translate(-50%, -50%)`;
    } else {
      rootElement.style.width = '100%';
      rootElement.style.height = '100%';
      rootElement.style.left = '0';
      rootElement.style.top = '0';
      rootElement.style.transform = `translate(0, 0)`;
    }
    fullScreenMode = !fullScreenMode;
  });

  const currentVideoContainer = document.createElement('div');
  currentVideoContainer.classList.add('open-video-container');
  appWrapper.append(currentVideoContainer);
  const openVideo = document.createElement('video');
  currentVideoContainer.append(openVideo);
  openVideo.src = currentVideo.body;
  openVideo.controls = true;
  openVideo.autoplay = true;
  openVideo.muted = true;

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
      if (item.name === currentVideo.name) {
        videoItem.classList.add('active-video');
      }
      videoItem.innerText = `${index + 1} ${item.name}`;
      playList.append(videoItem);
    });
  }

  fillPlayList();

  playList.addEventListener('click', (event) => changeActiveVideo(event));

  function changeActiveVideo(event) {
    const item = event.target.closest('.play-list-item');
    if (!item) {
      return;
    }
    const currentActivePhoto = rootElement.querySelector('.active-video');
    currentActivePhoto.classList.remove('active-video');
    item.classList.add('active-video');
    const name = item.getAttribute('data-name');
    currentVideo = filesToOpen.find((item) => item.name === name);
    openVideo.src = currentVideo.body;
    videoTitle.innerText = currentVideo.name;
  }
})();
