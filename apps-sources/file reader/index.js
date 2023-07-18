(() => {
  const filesIcons = driver.readFolder('/apps/file reader/assets/icons').body;

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

  let path = [];

  const history = {
    position: 0,
    memory: [[]],
  };

  const navigatePanel = document.createElement('nav');
  navigatePanel.classList.add('navigation-panel');
  appWrapper.append(navigatePanel);

  const navigateButtons = document.createElement('div');
  navigateButtons.classList.add('navigation-buttons-container');
  navigatePanel.append(navigateButtons);

  const previousButton = document.createElement('button');
  previousButton.classList.add('navigation-button');
  previousButton.disabled = true;
  previousButton.innerText = '←';
  const nextButton = document.createElement('button');
  nextButton.classList.add('navigation-button');
  nextButton.disabled = true;
  nextButton.innerText = '→';
  navigateButtons.append(previousButton, nextButton);

  previousButton.addEventListener('click', (event) => {
    history.position -= 1;
    path = [...history.memory[history.position]];
    fillFileReaderBody(path);
    nextButton.removeAttribute('disabled');

    if (history.position === 0) {
      event.currentTarget.disabled = true;
    }
  });

  nextButton.addEventListener('click', (event) => {
    history.position += 1;
    path = [...history.memory[history.position]];
    fillFileReaderBody(path);
    previousButton.removeAttribute('disabled');

    if (history.position === history.memory.length - 1) {
      event.currentTarget.disabled = true;
    }
  });

  const pathContainer = document.createElement('div');
  pathContainer.classList.add('path-container');
  navigatePanel.append(pathContainer);
  const pathIcon = document.createElement('div');
  pathIcon.classList.add('path-icon');
  pathContainer.append(pathIcon);

  const addHistoryPath = (path) => {
    history.memory.push([...path]);
    history.position = history.memory.length - 1;
    previousButton.removeAttribute('disabled');
    nextButton.disabled = true;
  };

  pathContainer.addEventListener('click', (event) => {
    const pathItem = event.target.closest('.path-item');

    if (!pathItem) {
      return;
    }

    const position = pathItem.getAttribute('data-position');

    if (!position) {
      path = [];
      addHistoryPath(path);
      fillFileReaderBody(path);
      return;
    }

    if (position === path.length) {
      return;
    }

    const newPath = [...path].slice(0, position);
    path = newPath;
    addHistoryPath(path);
    fillFileReaderBody(path);
  });

  const fillPath = () => {
    const pathList = pathContainer.querySelector('.path');
    if (pathList) {
      pathList.remove();
    }

    if (path.length === 0) {
      pathIcon.style.backgroundImage = `url(${
        filesIcons.find((item) => item.name === 'home.png').body
      })`;
    } else {
      pathIcon.style.backgroundImage = `url(${
        filesIcons.find((item) => item.name === 'folder.png').body
      })`;
    }

    const list = document.createElement('ul');
    list.classList.add('path');

    const rootDirectory = document.createElement('li');
    rootDirectory.classList.add('path-item');
    rootDirectory.innerText = 'This PC';
    rootDirectory.setAttribute('data-position', 0);
    list.append(rootDirectory);

    path.forEach((element, index) => {
      const item = document.createElement('li');
      item.classList.add('path-item');
      item.setAttribute('data-position', index + 1);
      item.innerText = element;
      list.append(item);
    });

    pathContainer.append(list);
  };

  const filesContainer = document.createElement('div');
  filesContainer.classList.add('file-list');
  appWrapper.append(filesContainer);

  const createFileItem = (file) => {
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
        filesIcons.find((element) => element.name === 'folder.png').body
      })`;
    } else {
      const type = file.mime.split('/')[0];
      item.setAttribute('data-type', type);

      switch (type) {
        case 'application':
          item.setAttribute('data-type', 'exe');
          const appName = file.body.split('/').at(-1).split('.');
          appName.splice(-1, 1);
          const appFolder = driver.readFolder(
            `/apps/${appName.join('.')}`
          ).body;
          const iconUrl = appFolder.find(
            (element) => element.name === 'icon.png' && element.type === 'file'
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
            filesIcons.find((element) => element.name === 'video.png').body
          })`;
          break;
        case 'audio':
          item.setAttribute('data-type', 'audio');
          icon.style.backgroundImage = `url(${
            filesIcons.find((element) => element.name === 'audio.png').body
          })`;
          break;
        case 'text':
          item.setAttribute('data-type', 'text');
          icon.style.backgroundImage = `url(${
            filesIcons.find((element) => element.name === 'text.png').body
          })`;
          break;
        case 'label':
          item.setAttribute('data-type', 'label');
          item.setAttribute('data-path', file.body);
          const pathArray = file.body.split('/');
          pathArray.splice(-1, 1);
          const urlIcon = driver
            .readFolder(pathArray.join('/'))
            .body.find(
              (item) => item.name === 'icon.png' && item.type === 'file'
            ).body;
          icon.style.backgroundImage = `url(${urlIcon})`;
          break;
        default:
          item.setAttribute('data-type', 'unknown');
          icon.style.backgroundImage = `url(${
            filesIcons.find((element) => element.name === 'unknown.png').body
          })`;
          break;
      }
    }

    item.append(icon, description);
    filesContainer.append(item);
  };

  function fillFileReaderBody(path) {
    const pathString = path.join('/');
    const files = driver.readFolder(`/${pathString}`);

    if (files.status === 'error') {
      alert(files.message);
      return;
    }

    fillPath();

    const fileList = document.querySelector('.file-list');
    fileList.innerHTML = '';

    files.body.forEach((file) => createFileItem(file));
  }

  fillFileReaderBody(path);

  const openFolder = (folderName) => {
    path.push(folderName);
    addHistoryPath(path);
    fillFileReaderBody(path);
  };

  const getAppNameByPath = (path) => {
    const app = [...path.split('/').at(-1).split('.')];

    if (app.length === 1) {
      return app.join('.');
    }

    app.splice(-1, 1);
    return app.join('.');
  };

  const openFile = (file) => {
    const type = file.getAttribute('data-type');
    const name = file.querySelector('.file-description').innerText;
    const appPath = file.getAttribute('data-path');

    switch (type) {
      case 'folder':
        openFolder(name);
        break;
      case 'exe':
        executor.startApp(getAppNameByPath(appPath));
        break;
      case 'label':
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

    return;
  };

  filesContainer.addEventListener('click', () => {
    closeContextMenus();
  });

  filesContainer.addEventListener('dblclick', (event) => {
    const file = event.target.closest('[data-type]');

    if (!file) {
      return;
    }

    openFile(file);
  });

  filesContainer.addEventListener('contextmenu', (event) => {
    event.preventDefault();

    if (event.target.closest('.file-item')) {
      openFileContextMenu(event);
      return;
    }

    openCommonContextMenu(event);
  });

  function closeContextMenus() {
    const openMenus = document.querySelectorAll('.context-menu');

    if (openMenus.length) {
      openMenus.forEach((item) => item.remove());
    }
  }

  function openFileContextMenu(event) {
    closeContextMenus();
    const fileElement = event.target.closest('.file-item');
    const menu = document.createElement('ul');
    menu.classList.add('file-context-menu');
    menu.classList.add('context-menu');
    const buttons = ['open', 'rename', 'copy', 'cut', 'delete'];
    buttons.forEach((item) => {
      const button = document.createElement('li');
      button.innerText = item;
      button.classList.add(item.split(' ').join('-'));
      menu.append(button);
    });
    rootElement.append(menu);

    const rectMenu = menu.getBoundingClientRect();
    const rectContainer = rootElement.getBoundingClientRect();
    const windowHeight = document.body.clientHeight;
    const windowWidth = document.body.clientWidth;

    if (rectMenu.height > windowHeight - event.clientY) {
      menu.style.top = `${
        event.clientY - rectContainer.top - rectMenu.height
      }px`;
    } else {
      menu.style.top = `${event.clientY - rectContainer.top}px`;
    }

    if (rectMenu.width > windowWidth - event.clientX) {
      menu.style.left = `${
        event.clientX - rectContainer.left - rectMenu.width
      }px`;
    } else {
      menu.style.left = `${event.clientX - rectContainer.left}px`;
    }

    menu.addEventListener('click', async (event) => {
      const actionType = event.target.innerText;

      await takeActionByType(actionType, fileElement);
    });
  }

  function openCommonContextMenu(event) {
    closeContextMenus();
    const menu = document.createElement('ul');
    menu.classList.add('common-context-menu');
    menu.classList.add('context-menu');
    const buttons = ['paste', 'load file', 'load folder'];
    buttons.forEach((item) => {
      const button = document.createElement('li');
      button.innerText = item;
      button.classList.add(item.split(' ').join('-'));
      menu.append(button);
    });
    rootElement.append(menu);

    const rectMenu = menu.getBoundingClientRect();
    const rectContainer = rootElement.getBoundingClientRect();
    const windowHeight = document.body.clientHeight;
    const windowWidth = document.body.clientWidth;

    if (rectMenu.height > windowHeight - event.clientY) {
      menu.style.top = `${
        event.clientY - rectContainer.top - rectMenu.height
      }px`;
    } else {
      menu.style.top = `${event.clientY - rectContainer.top}px`;
    }

    if (rectMenu.width > windowWidth - event.clientX) {
      menu.style.left = `${
        event.clientX - rectContainer.left - rectMenu.width
      }px`;
    } else {
      menu.style.left = `${event.clientX - rectContainer.left}px`;
    }

    menu.addEventListener('click', async (event) => {
      const actionType = event.target.innerText;

      await takeActionByType(actionType);
    });
  }

  async function takeActionByType(type, fileElement) {
    switch (type) {
      case 'Open':
        openFile(fileElement);
        closeContextMenus();
        break;
      case 'Delete':
        closeContextMenus();
        await deleteFile(fileElement);
      case 'Rename':
        closeContextMenus();
        renameFile(fileElement);
    }
  }

  function getFileOptionsFromFileElement(fileElement) {
    const type =
      fileElement.getAttribute('data-type') === 'folder' ? 'folder' : 'file';
    const fileName = fileElement.querySelector('.file-description').innerText;
    const filePath = path.length
      ? `/${path.join('/')}/${fileName}`
      : `/${fileName}`;

    return {
      type,
      fileName,
      filePath,
    };
  }

  async function deleteFile(fileElement) {
    const { type, filePath } = getFileOptionsFromFileElement(fileElement);

    const result =
      type === 'folder'
        ? driver.deleteFolder(filePath)
        : driver.deleteFile(filePath);

    if (result.status === 'successfully') {
      await driver.updateDrive();
      fillFileReaderBody(path);
    } else {
      alert(result.message);
    }
  }

  function renameFile(fileElement) {
    const { type, fileName, filePath } =
      getFileOptionsFromFileElement(fileElement);

    const description = fileElement.querySelector('.file-description');

    const inputName = document.createElement('input');
    inputName.classList.add('input-new-name');
    inputName.value = fileName;
    description.replaceWith(inputName);
    inputName.focus();

    inputName.addEventListener('blur', reverseNameChange);

    inputName.addEventListener('keypress', async (event) => {
      if (event.key === 'Enter') {
        event.target.removeEventListener('blut', reverseNameChange);
        await saveNewFileName(type, fileName, filePath);
      }
    });
  }

  function reverseNameChange(event) {
    const newDescription = document.createElement('p');
    newDescription.classList.add('file-description');
    newDescription.innerText = fileName;
    event.target.replaceWith(newDescription);
  }

  async function saveNewFileName(type, fileName, filePath) {
    const input = document.querySelector('.input-new-name');

    const newDescription = document.createElement('p');
    newDescription.classList.add('file-description');
    newDescription.innerText = fileName;
    const newFileName = input.value.trim();

    if (newFileName !== fileName) {
      const result =
        type === 'folder'
          ? driver.renameFolder(filePath, newFileName)
          : driver.renameFile(filePath, newFileName);

      if (result.status === 'successfully') {
        await driver.updateDrive();
        newDescription.innerText = newFileName;
        fillFileReaderBody(path);
      } else {
        input.removeEventListener('blur', reverseNameChange);
        alert(result.message);
        input.replaceWith(newDescription);
      }
    }
  }
})();
