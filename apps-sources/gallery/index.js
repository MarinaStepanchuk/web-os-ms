(() => {
  const appName = 'gallery';
  driver.addOpenApp(appName);

  const rootElement = document.getElementById('gallery');
  rootElement.style.zIndex = driver.getOpenApps().indexOf(appName) * 10;
  rootElement.addEventListener('click', (event) => {
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
  rootElement.prepend(header);

  const photoNameElement = document.createElement('span');
  photoNameElement.innerText = currentImage.name;

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

  closeButton.addEventListener('click', () => {
    executor.closeApp('gallery');
  });

  expandButton.addEventListener('click', () => {
    if (fullScreenMode) {
      rootElement.style.width = '60%';
      rootElement.style.height = '90%';
    } else {
      rootElement.style.width = '100%';
      rootElement.style.height = '100%';
    }
    fullScreenMode = !fullScreenMode;
  });

  const currentImageContainer = document.createElement('div');
  currentImageContainer.classList.add('open-image-container');
  appWrapper.append(currentImageContainer);
  const openImage = document.createElement('img');
  currentImageContainer.append(openImage);
  openImage.src = currentImage.body;
  openImage.alt = currentImage.name;

  const galleryList = document.createElement('div');
  galleryList.classList.add('gallery-list');
  appWrapper.append(galleryList);

  function fillGallery() {
    filesToOpen.forEach((item) => {
      const photoContainer = document.createElement('div');
      photoContainer.classList.add('gallery-item');
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
