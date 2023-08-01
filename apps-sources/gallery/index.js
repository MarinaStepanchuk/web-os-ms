(() => {
  const appName = 'gallery';

  const openAppIcon = document.createElement('div');
  openAppIcon.classList.add('open-app-item');
  openAppIcon.setAttribute('data-app', appName);
  const appIcon = driver.readFile(`/apps/${appName}/icon.png`).body.body;
  openAppIcon.style.backgroundImage = `url(${appIcon})`;
  const desktopOpenAppContainer = document.querySelector('.open-apps');
  desktopOpenAppContainer.append(openAppIcon);

  const rootElement = document.getElementById('gallery');
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
  let fullScreenMode = true;

  const filesToOpen = executor.getAppFilesToOpen(appName);
  let currentImage = filesToOpen[0];

  const appWrapper = document.querySelector('.gallery-wrapper');

  const header = document.createElement('header');
  header.classList.add('draggable');
  rootElement.prepend(header);

  const photoNameElement = document.createElement('span');
  photoNameElement.classList.add('photo-name');
  photoNameElement.innerText = currentImage?.name || '';

  const controlPanel = document.createElement('div');
  controlPanel.classList.add('control-panel');
  header.append(photoNameElement, controlPanel);

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

  turnButton.addEventListener('click', () => {
    rootElement.classList.add('hidden-app');
    openAppIcon.classList.add('underline');
  });

  openAppIcon.addEventListener('click', () => {
    rootElement.classList.toggle('hidden-app');
    openAppIcon.classList.toggle('underline');
  });

  closeButton.addEventListener('click', () => {
    executor.closeApp('gallery');
  });

  expandButton.addEventListener('click', () => {
    if (fullScreenMode) {
      rootElement.style.width = '60%';
      rootElement.style.height = '90%';
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

  const currentImageContainer = document.createElement('div');
  currentImageContainer.classList.add('open-image-container');
  appWrapper.append(currentImageContainer);
  const openImage = document.createElement('img');
  currentImageContainer.append(openImage);
  openImage.src = currentImage?.body || '';
  openImage.alt = currentImage?.name || '';

  const galleryList = document.createElement('div');
  galleryList.classList.add('gallery-list');
  appWrapper.append(galleryList);

  galleryList.addEventListener('click', (event) => changeActiveImage(event));

  function changeActiveImage(event) {
    const item = event.target.closest('.gallery-item');
    if (!item) {
      return;
    }
    const currentActivePhoto = rootElement.querySelector('.active-photo');
    currentActivePhoto.classList.remove('active-photo');
    item.classList.add('active-photo');
    const name = item.getAttribute('data-name');
    currentImage = filesToOpen.find((item) => item.name === name);
    openImage.src = currentImage.body;
    openImage.alt = currentImage.name;
    photoNameElement.innerText = currentImage.name;
  }

  function fillGallery() {
    filesToOpen.forEach((item) => {
      const photoContainer = document.createElement('div');
      photoContainer.classList.add('gallery-item');
      photoContainer.setAttribute('data-name', item.name);
      const galleryItem = document.createElement('img');
      galleryItem.src = item.body;
      galleryItem.alt = item.name;
      if (item.name === currentImage.name) {
        photoContainer.classList.add('active-photo');
      }
      photoContainer.append(galleryItem);
      galleryList.append(photoContainer);
    });
  }

  fillGallery();
})();
