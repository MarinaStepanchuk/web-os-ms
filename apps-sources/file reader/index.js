(() => {
  const appName = 'file reader';
  const icons = driver.readFolder('/apps/file reader/assets/icons');

  const rootElement = document.getElementById('file-reader');

  const appWrapper = document.querySelector('.file-reader-wrapper');
  executor.driver.addOpenApp('file reader');

  console.log(rootElement);

  const controlPanel = document.createElement('div');
  controlPanel.classList.add('control-panel');
  rootElement.prepend(controlPanel);

  const turnButton = document.createElement('div');
  turnButton.classList.add('control-button');
  turnButton.innerText = '–';

  const expandButton = document.createElement('div');
  expandButton.classList.add('control-button');
  expandButton.innerText = '◻';

  const closeButton = document.createElement('div');
  closeButton.classList.add('control-button');
  closeButton.classList.add('close-button');
  closeButton.innerText = '×';

  controlPanel.append(turnButton, expandButton, closeButton);

  const path = ['users', 'path'];
  const pathContainer = document.createElement('div');
  pathContainer.classList.add('path-container');
  appWrapper.append(pathContainer);
  const pathIcon = document.createElement('div');
  pathIcon.classList.add('path-icon');
  pathContainer.append(pathIcon);

  const fillPath = () => {
    if (path.length === 0) {
      pathIcon.style.backgroundImage = `url(${
        icons.find((item) => item.name === 'home.png').body
      })`;
      return;
    }

    pathIcon.style.backgroundImage = `url(${
      icons.find((item) => item.name === 'folder.png').body
    })`;

    const list = document.createElement('ul');
    list.classList.add('path');

    path.forEach((element) => {
      const item = document.createElement('li');
      item.classList.add('path-item');
      item.innerText = element;
      list.append(item);
    });

    pathContainer.append(list);
  };
  fillPath();

  const filesContainer = document.createElement('div');
  filesContainer.classList.add('files');
  appWrapper.append(filesContainer);
})();
