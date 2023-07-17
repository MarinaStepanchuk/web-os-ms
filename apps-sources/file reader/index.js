(() => {
  const icons = driver.readFolder('/apps/file reader/assets/icons');

  const rootElement = document.getElementById('file-reader');
  let fullScreenMode = false;

  const appWrapper = document.querySelector('.file-reader-wrapper');
  executor.driver.addOpenApp('file reader');

  const controlPanel = document.createElement('div');
  controlPanel.classList.add('control-panel');
  rootElement.prepend(controlPanel);

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
    executor.closeApp('file reader');
  });

  expandButton.addEventListener('click', () => {
    if (fullScreenMode) {
      rootElement.style.width = '70%';
      rootElement.style.height = '80%';
    } else {
      rootElement.style.width = '100%';
      rootElement.style.height = '100%';
    }
    fullScreenMode = !fullScreenMode;
  });

  let path = ['users'];
  const pathContainer = document.createElement('div');
  pathContainer.classList.add('path-container');
  appWrapper.append(pathContainer);
  const pathIcon = document.createElement('div');
  pathIcon.classList.add('path-icon');
  pathContainer.append(pathIcon);

  const fillPath = () => {
    const pathItems = pathContainer.querySelectorAll('.path-item');
    pathItems.forEach((element) => element.remove());

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
  filesContainer.classList.add('file-list');
  appWrapper.append(filesContainer);

  const defaultIcons = driver.readFolder('/apps/default icons');

  const fillFileReaderBody = (path) => {
    const fileList = document.querySelector('.file-list');
    fileList.innerHTML = '';
    const pathString = path.join('/');
    const files = driver.readFolder(`/${pathString}`);
    files.forEach((file) => {
      const item = document.createElement('div');
      item.classList.add('file-item');

      if (!file.accessRights.public) {
        item.classList.add('hide');
        item.setAttribute('data-visibility', 'hidden');
      }

      const icon = document.createElement('div');
      icon.classList.add('icon');
      const description = document.createElement('p');
      description.classList.add('file-description');
      description.innerText = file.name;

      if (file.type === 'folder') {
        item.setAttribute('data-type', 'folder');
        icon.style.backgroundImage = `url(${
          icons.find((element) => element.name === 'folder.png').body
        })`;
      } else {
        const type = file.mime.split('/')[0];
        item.setAttribute('data-type', type);

        switch (type) {
          case 'application':
            item.setAttribute('data-type', 'exe');
            const appName = file.name.split('.');
            appName.splice(-1, 1);
            const appFolder = driver.readFolder(`/apps/${appName.join('.')}`);
            const iconUrl = appFolder.find(
              (element) =>
                element.name === 'icon.png' && element.type === 'file'
            ).body;
            item.setAttribute('data-path', `/apps/${appName}`);
            icon.style.backgroundImage = `url(${iconUrl})`;
            break;
          case 'image':
            item.setAttribute('data-type', 'image');
            icon.style.backgroundImage = `url(${file.body})`;
            break;
          case 'video':
            item.setAttribute('data-type', 'video');
            icon.style.backgroundImage = `url(${
              defaultIcons.find((element) => element.name === 'video.icon').body
            })`;
            break;
          case 'audio':
            item.setAttribute('data-type', 'audio');
            icon.style.backgroundImage = `url(${
              defaultIcons.find((element) => element.name === 'audio.icon').body
            })`;
            break;
          case 'text':
            item.setAttribute('data-type', 'text');
            icon.style.backgroundImage = `url(${
              defaultIcons.find((element) => element.name === 'text.icon').body
            })`;
            break;
          case 'label':
            item.setAttribute('data-type', 'label');
            item.setAttribute('data-path', file.body);
            const pathArray = file.body.split('/');
            pathArray.splice(-1, 1);
            const urlIcon = driver
              .readFolder(pathArray.join('/'))
              .find(
                (item) => item.name === 'icon.png' && item.type === 'file'
              ).body;
            icon.style.backgroundImage = `url(${urlIcon})`;
            break;
          default:
            item.setAttribute('data-type', 'unknown');
            icon.style.backgroundImage = `url(${
              defaultIcons.find((element) => element.name === 'unknown.icon')
                .body
            })`;
            break;
        }
      }

      item.append(icon, description);
      filesContainer.append(item);
    });
  };

  fillFileReaderBody(path);

  const openFolder = (folderName) => {
    path.push(folderName);
    fillPath();
    fillFileReaderBody(path);
  };

  const getAppNameByPath = (path) => {
    const app = path.split('/').at(-1).split('.');
    app.splice(-1, 1);
    return app.join('.');
  };

  filesContainer.addEventListener('dblclick', (event) => {
    const icon = event.target.closest('[data-type]');

    if (!icon) {
      return;
    }

    const type = icon.getAttribute('data-type');
    const name = icon.querySelector('.file-description').innerText;

    switch (type) {
      case 'folder':
        openFolder(name);
        break;
      case 'exe':
        const appName = name.split('.');
        appName.splice(-1, 1);
        executor.startApp(appName.join('.'));
        break;
      case 'label':
        const appPath = icon.getAttribute('data-path');
        executor.startApp(getAppNameByPath(appPath));
        break;
      case 'image':
        executor.startApp('photos');
        break;
      case 'video':
        executor.startApp('media player');
        break;
      case 'audio':
        executor.startApp('audio player');
        break;
      case 'text':
        executor.startApp('notepad');
        break;
      default:
        alert('Unknown extension');
        break;
    }

    console.log(icon.getAttribute('data-type'));
  });
})();
