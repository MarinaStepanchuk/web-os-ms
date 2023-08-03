(() => {
  const appName = 'file reader';
  const filesIcons = driver.readFolder('/apps/file reader/assets/icons').body;
  const activeUser = hardDrive.getActiveUser();
  let displayHiddenFiles = false;

  let path = executor.fileReaderPath
    ? executor.fileReaderPath
        .split('/')
        .filter((item) => item)
        .map((item) => [item])
    : [];

  const history = {
    position: 0,
    memory: [path.length ? [...path] : []],
  };

  let previousNameFile = '';

  const actions = {
    paste: 'paste',
    loadFile: 'load file',
    createFolder: 'create folder',
    hiddenFiles: 'show hidden files',
    open: 'open',
    rename: 'rename',
    copy: 'copy',
    cut: 'cut',
    delete: 'delete',
    properties: 'properties',
  };

  let mouseIsDown = false;
  let mouseDownX = null;
  let mouseDownY = null;

  const openAppIcon = document.createElement('div');
  openAppIcon.classList.add('open-app-item');
  openAppIcon.setAttribute('data-app', appName);
  const appIcon = driver.readFile(`/apps/${appName}/icon.png`).body.body;
  openAppIcon.style.backgroundImage = `url(${appIcon})`;
  openAppIcon.style.backgroundSize = '36px 36px';
  openAppIcon.style.backgroundPosition = 'top -5px left -2px';
  const desktopOpenAppContainer = document.querySelector('.open-apps');
  desktopOpenAppContainer.append(openAppIcon);

  const rootElement = document.getElementById('file-reader');
  const zIndexApp = driver.getOpenApps().indexOf(appName) * 10;
  rootElement.style.zIndex = zIndexApp;
  let fullScreenMode = false;
  rootElement.addEventListener('mousedown', (event) => {
    if (event.target.closest('.close-button')) {
      return;
    }
    const openApps = driver.getOpenApps();
    if (openApps.at(-1) !== appName) {
      executor.changeIndexesOpenApps(appName);
    }
  });

  const appWrapper = document.querySelector('.file-reader-wrapper');

  const controlPanel = document.createElement('div');
  controlPanel.classList.add('control-panel');
  controlPanel.classList.add('draggable');
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

  turnButton.addEventListener('click', () => {
    rootElement.classList.add('hidden-app');
    openAppIcon.classList.add('underline');
  });

  openAppIcon.addEventListener('click', () => {
    rootElement.classList.toggle('hidden-app');
    openAppIcon.classList.toggle('underline');
  });

  closeButton.addEventListener('click', () => {
    filesContainer.removeEventListener('mousedown', startSelectingArea);
    filesContainer.removeEventListener('mousemove', moveSelectedArea);
    filesContainer.removeEventListener('mouseup', removingSelectedArea);
    executor.closeApp('file reader');
  });

  expandButton.addEventListener('click', () => {
    if (fullScreenMode) {
      rootElement.style.width = '70%';
      rootElement.style.height = '80%';
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
    event.preventDefault();
    const pathItem = event.target.closest('.path-item');

    if (!pathItem) {
      return;
    }

    const position = pathItem.getAttribute('data-position');
    if (history.position !== history.memory.length - 1) {
      history.memory.push([...path]);
    }

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
    path = [...newPath];
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
    item.setAttribute(
      'data-path',
      `${path.length === 0 ? '/' : `/${path.join('/')}`}`
    );

    if (!file.accessRights.public && !displayHiddenFiles) {
      item.classList.add('hide');
      item.setAttribute('data-visibility', 'hidden');
    }

    if (!file.accessRights.public) {
      item.style.opacity = 0.8;
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
          const appName = file.name.split('.');
          appName.splice(-1, 1);
          const appFolder = driver.readFolder(`/apps/${appName.join('.')}`);
          if (appFolder.status === 'error') {
            item.setAttribute('data-type', 'unknown');
            icon.style.backgroundImage = `url(${
              filesIcons.find((element) => element.name === 'unknown.png').body
            })`;
            break;
          }
          const iconUrl = appFolder.body.find(
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
      return false;
    }

    fillPath();

    const fileList = document.querySelector('.file-list');
    fileList.innerHTML = '';

    const foldersElements = files.body
      .filter((item) => item.type === 'folder')
      .sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });

    const filesElements = files.body
      .filter((item) => {
        return (
          item.type === 'file' &&
          (item.accessRights.access.read.includes(activeUser) ||
            item.accessRights.access.read.includes('all') ||
            item.accessRights.creator === activeUser ||
            activeUser === 'admin')
        );
      })
      .sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });

    foldersElements.forEach((file) => createFileItem(file));
    filesElements.forEach((file) => createFileItem(file));
    return true;
  }

  fillFileReaderBody(path);

  const openFolder = (folderName) => {
    path.push(folderName);
    const folderIsOpen = fillFileReaderBody(path);

    if (folderIsOpen) {
      if (history.position !== history.memory.length - 1) {
        addHistoryPath(history.memory[history.position]);
        addHistoryPath(path);
      } else {
        addHistoryPath(path);
      }
    } else {
      path.pop();
    }
  };

  const getAppNameByPath = (path) => {
    const app = [...path.split('/').at(-1).split('.')];

    if (app.length === 1) {
      return app.join('.');
    }

    app.splice(-1, 1);
    return app.join('.');
  };

  const openFiles = (files) => {
    const images = [];
    const videos = [];
    const audios = [];
    const textFiles = [];
    const currentPath = path.length === 0 ? '/' : `/${path.join('/')}`;

    const fileList =
      files.length === 1
        ? [...files]
        : [...files].filter(
            (item) => item.getAttribute('data-type') !== 'folder'
          );

    fileList.forEach((file) => {
      const type = file.getAttribute('data-type');
      const name = file.querySelector('.file-description').innerText;
      const appPath = file.getAttribute('data-path');

      const openingByTypeMap = {
        folder: () => openFolder(name),
        exe: () => executor.startApp(getAppNameByPath(appPath)),
        label: () => executor.startApp(getAppNameByPath(appPath)),
        image: () => {
          const filePath = appPath === '/' ? `/${name}` : `${appPath}/${name}`;
          const searchFile = driver.readFile(filePath);
          if (searchFile.status === 'error') {
            alert(`can't open file ${name}`);
            return;
          }
          images.push(searchFile.body);
        },
        video: () => {
          const filePath = appPath === '/' ? `/${name}` : `${appPath}/${name}`;
          const searchFile = driver.readFile(filePath);
          if (searchFile.status === 'error') {
            alert(`can't open file ${name}`);
            return;
          }
          videos.push(searchFile.body);
        },
        audio: () => {
          const filePath = appPath === '/' ? `/${name}` : `${appPath}/${name}`;
          const searchFile = driver.readFile(filePath);
          if (searchFile.status === 'error') {
            alert(`can't open file ${name}`);
            return;
          }
          audios.push(searchFile.body);
        },
        text: () => {
          const filePath = appPath === '/' ? `/${name}` : `${appPath}/${name}`;
          const searchFile = driver.readFile(filePath);
          if (searchFile.status === 'error') {
            alert(`can't open file ${name}`);
            return;
          }
          textFiles.push(searchFile.body);
        },
        unknown: () => alert('Unknown extension'),
      };

      const action = openingByTypeMap[type];
      if (action) {
        openingByTypeMap[type]();
      } else {
        openingByTypeMap.unknown();
      }
      deselectActiveFiles();
    });

    if (images.length > 0) {
      executor.setFilesQueue({
        path: currentPath,
        app: 'gallery',
        files: [...images],
      });
      executor.startApp('gallery');
    }

    if (videos.length > 0) {
      executor.setFilesQueue({
        path: currentPath,
        app: 'media player',
        files: [...videos],
      });
      executor.startApp('media player');
    }

    if (audios.length > 0) {
      executor.setFilesQueue({
        path: currentPath,
        app: 'audio player',
        files: [...audios],
      });
      executor.startApp('audio player');
    }

    if (textFiles.length > 0) {
      executor.setFilesQueue({
        path: currentPath,
        app: 'notepad',
        files: [...textFiles],
      });
      executor.startApp('notepad');
    }
    deselectActiveFiles();
  };

  function deselectActiveFiles() {
    const selectedElements = document.querySelectorAll('.active-item');
    selectedElements.forEach((element) => {
      element.classList.remove('active-item');
      element.draggable = false;
    });
  }

  function deselectCopyFiles() {
    const copiedFiles = document.querySelectorAll('.copied');
    copiedFiles.forEach((item) => item.classList.remove('copied'));
  }

  filesContainer.addEventListener('click', (event) => {
    closeContextMenus();

    if (mouseDownX === event.clientX && mouseDownY === event.clientY) {
      deselectActiveFiles();
    }

    const file = event.target.closest('.file-item');
    if (file) {
      file.classList.add('active-item');
      file.draggable = true;
    }
  });

  filesContainer.addEventListener('dblclick', (event) => {
    const file = event.target.closest('.file-item');

    if (!file) {
      return;
    }

    openFiles([file]);
  });

  filesContainer.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const selectedFiles = filesContainer.querySelectorAll('.active-item');

    if (selectedFiles.length === 1) {
      selectedFiles.forEach((element) => {
        element.classList.remove('active-item');
        element.draggable = false;
      });
    }

    const file = event.target.closest('.file-item');

    if (file) {
      openFileContextMenu(event);
      return;
    }

    openCommonContextMenu(event);
  });

  function closeContextMenus() {
    const openMenus = document.querySelectorAll('.context-menu');
    openMenus.forEach((item) => item.remove());
  }

  function openFileContextMenu(event) {
    closeContextMenus();
    const clickedElement = event.target.closest('.file-item');
    if (!clickedElement.classList.contains('active-item')) {
      clickedElement.classList.add('active-item');
      clickedElement.draggable = true;
    }
    const selectedFiles = filesContainer.querySelectorAll('.active-item');
    const type = clickedElement.getAttribute('data-type');
    const menu = document.createElement('ul');
    menu.classList.add('file-context-menu');
    menu.classList.add('context-menu');
    const buttons = [
      actions.open,
      actions.rename,
      actions.copy,
      actions.cut,
      actions.paste,
      actions.delete,
      actions.properties,
    ];
    buttons.forEach((item) => {
      if (
        (item === actions.paste && type !== 'folder') ||
        (item === actions.paste && selectedFiles.length > 1)
      ) {
        return;
      }

      const button = document.createElement('li');
      button.innerText = item;
      button.classList.add(item.split(' ').join('-'));
      menu.append(button);
    });
    const desktop = document.querySelector('.desktop');
    desktop.append(menu);
    menu.style.zIndex = driver.getOpenApps().indexOf(appName) * 10;
    menuPositioning(event, menu);

    menu.addEventListener('click', async (event) => {
      event.stopImmediatePropagation();
      closeContextMenus();
      const actionType = event.target.innerText.toLowerCase();

      await takeActionByType(actionType, selectedFiles, clickedElement);
    });
  }

  async function takeActionByType(type, selectedFiles, clickedElement) {
    closeContextMenus();

    const executionByTypeMap = {
      [actions.open]: () => {
        openFiles(selectedFiles);
        deselectActiveFiles();
      },
      [actions.delete]: async () => await deleteFiles(selectedFiles),
      [actions.rename]: () => renameFile(clickedElement),
      [actions.paste]: async () => await pasteFiles(clickedElement),
      [actions.copy]: () => copyFiles(selectedFiles),
      [actions.cut]: () => cutFile(selectedFiles),
      [actions.properties]: () => showFileProperties(clickedElement),
    };

    executionByTypeMap[type]?.();
  }

  function menuPositioning(event, menu) {
    const rectMenu = menu.getBoundingClientRect();
    const windowHeight = document.body.clientHeight;
    const windowWidth = document.body.clientWidth;

    if (rectMenu.height > windowHeight - 45 - event.clientY) {
      menu.style.top = `${event.clientY - rectMenu.height}px`;
    } else {
      menu.style.top = `${event.clientY}px`;
    }

    if (rectMenu.width > windowWidth - event.clientX) {
      menu.style.left = `${event.clientX - rectMenu.width}px`;
    } else {
      menu.style.left = `${event.clientX}px`;
    }
  }

  function copyFiles(selectedFiles) {
    driver.actionType = actions.copy;
    driver.clearBuffer();
    selectedFiles.forEach((file) => copyFileInBuffer(file));
  }

  function cutFile(selectedFiles) {
    driver.actionType = actions.cut;
    driver.clearBuffer();
    selectedFiles.forEach((file) => copyFileInBuffer(file));
  }

  function copyFileInBuffer(fileElement) {
    deselectActiveFiles();

    fileElement.classList.add('copied');
    const type = fileElement.getAttribute('data-type');
    const fileName = fileElement.querySelector('.file-description').innerText;

    if (type === 'folder') {
      const parentFolderPath = `/${path.join('/')}`;
      const resultSearch = driver.readFolder(parentFolderPath);
      const parentFolder = resultSearch.body;

      if (parentFolder) {
        const folder = parentFolder.find((item) => item.name === fileName);
        const copyResult = driver.copyFile(
          folder,
          path.length === 0 ? '/' : `/${path.join('/')}`
        );

        if (copyResult.status === 'error') {
          alert(copyResult.message);
          fileElement.classList.remove('copied');
        }
      } else {
        alert(resultSearch.message);
        fileElement.classList.remove('copied');
      }
    } else {
      const filePath =
        path.length === 0 ? `/${fileName}` : `/${path.join('/')}/${fileName}`;
      const resultSearch = driver.readFile(filePath);
      const file = resultSearch.body;

      if (file) {
        driver.copyFile(file, path.length === 0 ? '/' : `/${path.join('/')}`);
      } else {
        alert(resultSearch.message);
        fileElement.classList.remove('copied');
      }
    }
  }

  async function pasteFiles(clickedFolder) {
    const buffer = driver.getFileFromBuffer();

    if (!buffer.length) {
      return;
    }

    deselectActiveFiles();

    if (clickedFolder) {
      const folderName =
        clickedFolder.querySelector('.file-description').innerText;
      const filePath =
        path.length === 0
          ? `/${folderName}`
          : `/${path.join('/')}/${folderName}`;

      for (const bufferItem of buffer) {
        if (bufferItem.path === filePath && driver.actionType === 'cut') {
          deselectCopyFiles();
          return;
        }
        const result =
          bufferItem.file.type === 'folder'
            ? driver.pasteFolder(filePath, bufferItem)
            : driver.pasteFile(filePath, bufferItem);

        if (result.status === 'error') {
          alert(result.message);
        }
      }

      deselectCopyFiles();
      await driver.updateDrive();
      fillFileReaderBody(path);

      if (buffer[0].path === `/users/${activeUser}/desktop`) {
        executor.updateDesktop();
      }
    }

    const filePath = path.length === 0 ? `/` : `/${path.join('/')}`;

    for (const bufferItem of buffer) {
      if (bufferItem.path === filePath && driver.actionType === 'cut') {
        deselectCopyFiles();
        return;
      }

      const result =
        bufferItem.file.type === 'folder'
          ? driver.pasteFolder(filePath, bufferItem)
          : driver.pasteFile(filePath, bufferItem);

      if (result.status === 'error') {
        alert(result.message);
      }
    }

    deselectCopyFiles();
    await driver.updateDrive();
    fillFileReaderBody(path);

    if (buffer[0].path === `/users/${activeUser}/desktop`) {
      executor.updateDesktop();
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

  async function deleteFiles(selectedFiles) {
    for (const file of selectedFiles) {
      const { type, filePath } = getFileOptionsFromFileElement(file);

      const result =
        type === 'folder'
          ? driver.deleteFolder(filePath)
          : driver.deleteFile(filePath);

      if (result.status === 'error') {
        alert(result.message);
      }
    }

    await driver.updateDrive();
    fillFileReaderBody(path);
  }

  function renameFile(fileElement) {
    deselectActiveFiles();
    deselectCopyFiles();

    const { type, fileName, filePath } =
      getFileOptionsFromFileElement(fileElement);

    const description = fileElement.querySelector('.file-description');

    const inputName = document.createElement('input');
    inputName.classList.add('input-new-name');
    previousNameFile = fileName;
    inputName.value = fileName;
    description.replaceWith(inputName);
    inputName.focus();

    inputName.addEventListener('input', (event) => {
      if (/[\\,\/,:,\*,\?,",<,>,\|]/g.test(event.target.value)) {
        event.target.value = event.target.value.replace(
          /[\\,\/,:,\*,\?,",<,>,\|]/g,
          ''
        );
        alert('A file name cannot include the following characters *<|>?:/');
      }
    });

    inputName.addEventListener('blur', reverseNameChange);

    inputName.addEventListener('keydown', async (event) => {
      if (event.key === 'Enter') {
        event.target.removeEventListener('blur', reverseNameChange);
        await saveNewFileName(type, fileName, filePath);
      }

      if (event.key === 'Escape') {
        event.target.removeEventListener('blur', reverseNameChange);
        reverseNameChange();
      }
    });
  }

  function reverseNameChange() {
    const inputName = document.querySelector('.input-new-name');
    const fileName = previousNameFile;
    const newDescription = document.createElement('p');
    newDescription.classList.add('file-description');
    newDescription.innerText = fileName;
    inputName.replaceWith(newDescription);
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

  let accessRead = null;
  let accessModify = null;
  let openPropertiesFile = null;
  let openPropertiesFilePath = null;

  function showFileProperties(fileElement) {
    const existingModalWindow = document.querySelector(
      '.modal-window-file-properties'
    );
    existingModalWindow?.remove();
    const name = fileElement.querySelector('.file-description').innerText;
    const iconUrl = fileElement.querySelector('.icon').style.backgroundImage;
    const type = fileElement.getAttribute('data-type');
    const path = fileElement.getAttribute('data-path');
    const file =
      type === 'folder'
        ? driver.readFolder(`${path}`).body.find((item) => item.name === name)
        : driver.readFile(`${path}/${name}`).body;
    openPropertiesFile = file;
    openPropertiesFilePath = path;
    const modalWindow = createPropertiesWindow(file, iconUrl, path);
    const desktop = document.querySelector('.desktop');
    desktop.append(modalWindow);
  }

  function createPropertiesWindow(file, iconUrl, path) {
    const canModifyProperty =
      openPropertiesFile.accessRights.creator === activeUser ||
      openPropertiesFile.accessRights.access.modify.includes(activeUser) ||
      openPropertiesFile.accessRights.access.modify.includes('all') ||
      activeUser === 'admin';
    const modalWindow = document.createElement('div');
    modalWindow.classList.add('modal-window-file-properties');
    const closeButton = document.createElement('div');
    closeButton.classList.add('close-modal-window');
    closeButton.innerHTML = '<i class="fa fa-times" aria-hidden="true"></i>';
    closeButton.classList.add('draggable');
    closeButton.addEventListener('click', closePropertiesWindow);
    const modalContainer = document.createElement('div');
    modalContainer.classList.add('modal-container');
    const list = document.createElement('ul');
    list.classList.add('list');
    const descriptionElement = document.createElement('li');
    const icon = document.createElement('div');
    icon.classList.add('icon');
    icon.style.backgroundImage = iconUrl;
    const fileName = document.createElement('span');
    fileName.innerText = file.name;
    descriptionElement.append(icon, fileName);
    const typeElement = document.createElement('li');
    const typeTitle = document.createElement('p');
    typeTitle.innerText = 'Type:';
    const type = document.createElement('span');
    type.innerText = file.mime || file.type;
    typeElement.append(typeTitle, type);
    const locationElement = document.createElement('li');
    const locationTitle = document.createElement('p');
    locationTitle.innerText = 'Location:';
    const location = document.createElement('span');
    location.innerText = path;
    locationElement.append(locationTitle, location);
    const sizeElement = document.createElement('li');
    const sizeTitle = document.createElement('p');
    sizeTitle.innerText = 'Size:';
    const size = document.createElement('span');
    const fileSize = file.type === 'file' ? file.size : getTotalSize(file);
    size.innerText =
      fileSize < 1024
        ? `${fileSize} bytes`
        : `${(fileSize / 1024).toFixed(2)} KB`;
    sizeElement.append(sizeTitle, size);
    const creatorElement = document.createElement('li');
    const creatorTitle = document.createElement('p');
    creatorTitle.innerText = 'Creator:';
    const creator = document.createElement('span');
    creator.innerText = file.accessRights.creator;
    creatorElement.append(creatorTitle, creator);
    list.append(
      descriptionElement,
      typeElement,
      locationElement,
      sizeElement,
      creatorElement
    );
    const form = document.createElement('form');
    form.classList.add('properties-form');
    form.addEventListener(
      'submit',
      async (event) => await saveProperties(event)
    );
    const hideElement = document.createElement('div');
    hideElement.classList.add('hiden-property');

    if (canModifyProperty) {
      const checkbox = document.createElement('input');
      checkbox.classList.add('hide-file');
      checkbox.type = 'checkbox';
      checkbox.checked = !file.accessRights.public;
      checkbox.name = 'hideFile';
      checkbox.addEventListener('change', activateSavePropertiesButton);
      const labelCheckbox = document.createElement('label');
      labelCheckbox.innerText = 'hide file';
      labelCheckbox.setAttribute('for', 'showFiles');
      hideElement.append(checkbox, labelCheckbox);
    } else {
      hideElement.innerText = !file.accessRights.public
        ? '✔ hide file'
        : '✖ hide file';
    }

    const rightsContainer = document.createElement('div');
    rightsContainer.classList.add('rights-container');
    const rightTitle = document.createElement('p');
    rightTitle.innerText = 'Access rights';
    const rightsList = document.createElement('div');
    rightsList.classList.add('right-lists-container');
    rightsContainer.append(rightTitle, rightsList);
    const readListContainer = document.createElement('div');
    readListContainer.classList.add('read-list-container');
    const readListTitle = document.createElement('p');
    readListTitle.innerText = 'read:';
    const readList = document.createElement('ul');
    readList.classList.add('read-list');
    accessRead = [...file.accessRights.access.read];
    updateAccessList(readList, file.accessRights.access.read);
    readListContainer.append(readListTitle, readList);

    if (canModifyProperty) {
      const addReadAccessButton = document.createElement('button');
      addReadAccessButton.classList.add('add-read-access');
      addReadAccessButton.innerHTML =
        '<i class="fa fa-plus" aria-hidden="true"></i>';
      addReadAccessButton.addEventListener('click', (event) => {
        event.preventDefault();
        openAccessRightModal('read');
      });
      readListContainer.append(addReadAccessButton);
    }

    const modifyListContainer = document.createElement('div');
    modifyListContainer.classList.add('modify-list-container');
    const modifyListTitle = document.createElement('p');
    modifyListTitle.innerText = 'modify:';
    const modifyList = document.createElement('ul');
    modifyList.classList.add('modify-list');
    accessModify = [...file.accessRights.access.modify];
    updateAccessList(modifyList, file.accessRights.access.modify);
    modifyListContainer.append(modifyListTitle, modifyList);

    if (canModifyProperty) {
      const addModifyAccessButton = document.createElement('button');
      addModifyAccessButton.classList.add('add-modify-access');
      addModifyAccessButton.innerHTML =
        '<i class="fa fa-plus" aria-hidden="true"></i>';
      addModifyAccessButton.addEventListener('click', (event) => {
        event.preventDefault();
        openAccessRightModal('modify');
      });
      modifyListContainer.append(addModifyAccessButton);
    }

    rightsList.append(readListContainer, modifyListContainer);
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');
    const submitButton = document.createElement('button');
    submitButton.classList.add('save-properties');
    submitButton.type = 'submit';
    submitButton.disabled = true;
    submitButton.innerText = 'Apply';
    const cancelButton = document.createElement('button');
    cancelButton.classList.add('cancel-properties');
    cancelButton.innerText = 'Cancel';
    cancelButton.addEventListener('click', closePropertiesWindow);
    buttonContainer.append(submitButton, cancelButton);
    form.append(hideElement, rightsContainer, buttonContainer);
    modalContainer.append(list, form);
    modalWindow.append(closeButton, modalContainer);

    return modalWindow;
  }

  function updateAccessList(listElement, list) {
    listElement.innerHTML = '';
    if (list.length) {
      list.forEach((item) => {
        const itemElement = document.createElement('li');
        itemElement.classList.add('list-item');
        itemElement.innerText = `✓ ${item}`;
        listElement.append(itemElement);
      });

      if (
        !list.includes(openPropertiesFile.accessRights.creator) &&
        !list.includes('all')
      ) {
        const itemElement = document.createElement('li');
        itemElement.classList.add('list-item');
        itemElement.innerText = `✓ ${openPropertiesFile.accessRights.creator}`;
        listElement.append(itemElement);
      }
    } else {
      const itemElement = document.createElement('li');
      itemElement.innerText = `✓ ${openPropertiesFile.accessRights.creator}`;
      listElement.append(itemElement);
    }
  }

  function closePropertiesWindow() {
    const modalWindow = document.querySelector('.modal-window-file-properties');
    modalWindow.remove();
    accessRead = null;
    accessModify = null;
    openPropertiesFile = null;
    openPropertiesFilePath = null;
  }

  async function saveProperties(event) {
    event.preventDefault();
    const name = openPropertiesFile.name;
    const pathFile =
      openPropertiesFilePath === '/'
        ? `/${name}`
        : `${openPropertiesFilePath}/${name}`;
    const hide = event.target.querySelector('.hide-file');

    const access = {
      publicFile: !hide.checked,
      read: [...accessRead],
      modify: [...accessModify],
    };

    const result = driver.updateAccessRights(pathFile, access);

    if (result.status === 'error') {
      alert(result.message);
    } else {
      await driver.updateDrive();
      closePropertiesWindow();
      fillFileReaderBody(path);
    }
  }

  function activateSavePropertiesButton() {
    const saveButton = document.querySelector('.save-properties');
    saveButton.disabled = false;
  }

  function openAccessRightModal(accessType) {
    const userList = driver
      .readFolder('/users')
      .body.filter((item) => item.type === 'folder');
    const modalWindowWrapper = document.createElement('div');
    modalWindowWrapper.classList.add('modal-access-wrapper');
    const form = document.createElement('form');
    form.classList.add('modal-access-form');
    modalWindowWrapper.append(form);
    const userContainer = document.createElement('ul');
    userList.forEach((userFolder) => {
      const userName = userFolder.name;
      const user = document.createElement('li');
      const label = document.createElement('label');
      label.setAttribute('for', userFolder.name);
      const checkbox = document.createElement('input');
      checkbox.classList.add('user-item');
      checkbox.type = 'checkbox';
      checkbox.checked =
        accessType === 'read'
          ? accessRead.includes(userName) ||
            userName === openPropertiesFile.accessRights.creator
          : accessModify.includes(userName) ||
            userName === openPropertiesFile.accessRights.creator;
      checkbox.name = userName;
      label.append(checkbox, userName);
      user.append(label);
      userContainer.append(user);
    });
    const allUserItem = document.createElement('li');
    const label = document.createElement('label');
    label.setAttribute('for', 'all');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked =
      openPropertiesFile.accessRights.access[accessType].includes('all');
    checkbox.name = 'all';
    checkbox.classList.add('user-item');
    label.append(checkbox, 'all');
    allUserItem.append(label);
    userContainer.append(allUserItem);
    const buttons = document.createElement('div');
    buttons.classList.add('buttons-container');
    const saveButton = document.createElement('button');
    saveButton.classList.add('save-access');
    saveButton.innerText = 'Save';
    const cancelButton = document.createElement('button');
    cancelButton.classList.add('cancel-access');
    cancelButton.innerText = 'Cancel';
    cancelButton.addEventListener('click', (event) => {
      event.preventDefault();
      const modalWindow = document.querySelector('.modal-access-wrapper');
      modalWindow?.remove();
    });
    buttons.append(saveButton, cancelButton);
    form.append(userContainer, buttons);

    saveButton.addEventListener('click', (event) =>
      saveAccessRight(event, accessType)
    );

    const modalWindowProperties = document.querySelector(
      '.modal-window-file-properties'
    );
    modalWindowProperties.append(modalWindowWrapper);
  }

  function saveAccessRight(event, accessType) {
    event.preventDefault();
    activateSavePropertiesButton();
    const modalWindow = document.querySelector('.modal-access-wrapper');
    const checkboxList = modalWindow.querySelectorAll('.user-item');
    const users = [...checkboxList]
      .filter((item) => item.checked)
      .map((item) => item.name);

    if (accessType === 'read') {
      accessRead = users.includes('all')
        ? ['all']
        : [...users].filter((item) => item !== 'all');
      const list = document.querySelector('.read-list');
      updateAccessList(list, accessRead);
    } else {
      accessModify = users.includes('all')
        ? ['all']
        : [...users].filter((item) => item !== 'all');
      const list = document.querySelector('.modify-list');
      updateAccessList(list, accessModify);
    }

    modalWindow?.remove();
  }

  function getTotalSize(file) {
    let totalSize = 0;
    getSize(file);

    function getSize(file) {
      file.children.forEach((file) => {
        if (file.type === 'file') {
          totalSize += file.size;
        } else {
          getSize(file);
        }
      });
    }

    return totalSize;
  }

  function openCommonContextMenu(event) {
    closeContextMenus();
    const menu = document.createElement('ul');
    menu.classList.add('common-context-menu');
    menu.classList.add('context-menu');
    const buttons = [
      actions.paste,
      actions.loadFile,
      actions.createFolder,
      actions.hiddenFiles,
    ];
    buttons.forEach((item) => {
      if (item === actions.loadFile) {
        const button = document.createElement('li');
        const label = document.createElement('label');
        label.classList.add('upload-files-label');
        label.innerText = item;
        button.append(label);
        const inputFile = document.createElement('input');
        inputFile.classList.add('upload-files-input');
        inputFile.type = 'file';
        inputFile.multiple = true;
        label.append(inputFile);
        menu.append(button);
        inputFile.addEventListener('change', async (event) => {
          const files = event.target.files;
          await loadFilesViaInput(files);
        });
        return;
      }

      if (item === actions.hiddenFiles) {
        const button = document.createElement('li');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = displayHiddenFiles;
        checkbox.name = 'showFiles';
        const labelCheckbox = document.createElement('label');
        labelCheckbox.innerText = actions.hiddenFiles;
        labelCheckbox.setAttribute('for', 'showFiles');
        button.append(checkbox, labelCheckbox);
        checkbox.addEventListener('change', (event) => {
          displayHiddenFiles = event.target.checked;
          fillFileReaderBody(path);
        });
        menu.append(button);
        return;
      }

      const button = document.createElement('li');
      button.innerText = item;
      button.classList.add(item.split(' ').join('-'));
      menu.append(button);
    });

    const desktop = document.querySelector('.desktop');
    desktop.append(menu);
    menu.style.zIndex = driver.getOpenApps().indexOf(appName) * 10;

    async function loadFilesViaInput(files) {
      const currentPath = path.length === 0 ? '/' : `/${path.join('/')}`;
      rootElement.style.opacity = 0.8;
      for (let i = 0; i < files.length; i++) {
        const result = await driver.createFile(currentPath, files[i], {});
        await driver.updateDrive();
        if (result.status === 'error') {
          alert(result.message);
        }
      }
      fillFileReaderBody(path);
      rootElement.style.opacity = 1;
    }

    menuPositioning(event, menu);

    menu.addEventListener('click', async (event) => {
      event.stopImmediatePropagation();
      closeContextMenus();
      const actionType = event.target.innerText.toLowerCase();
      if (actionType === actions.createFolder) {
        addNewFolder();
      }

      if (actionType === actions.paste) {
        await pasteFiles();
      }
    });
  }

  function addNewFolder() {
    const newFolder = document.createElement('div');
    newFolder.classList.add('file-item');
    newFolder.classList.add('new-folder');
    newFolder.setAttribute('data-type', 'folder');
    const fileList = document.querySelector('.file-list');
    fileList.append(newFolder);
    const icon = document.createElement('div');
    icon.classList.add('icon');
    icon.style.backgroundImage = `url(${
      filesIcons.find((element) => element.name === 'folder.png').body
    })`;
    const inputName = document.createElement('input');
    inputName.classList.add('input-new-name');
    newFolder.append(icon, inputName);
    inputName.focus();

    inputName.addEventListener('input', (event) => {
      if (/[\\,\/,:,\*,\?,",<,>,\|]/g.test(event.target.value)) {
        event.target.value = event.target.value.replace(
          /[\\,\/,:,\*,\?,",<,>,\|]/g,
          ''
        );
        alert('A file name cannot include the following characters *<|>?:/');
      }
    });

    inputName.addEventListener('blur', saveFolder);

    inputName.addEventListener('keydown', async (event) => {
      if (event.key === 'Enter') {
        event.target.removeEventListener('blur', saveFolder);
        await saveFolder(event);
      }

      if (event.key === 'Escape') {
        event.target.removeEventListener('blur', saveFolder);
        saveFolder(event);
      }
    });
  }

  async function saveFolder(event) {
    const input = event.target;
    const description = document.createElement('p');
    description.classList.add('file-description');
    const fileName = input.value.trim();

    const result = driver.createFolder(
      `/${path.join('/')}`,
      fileName || 'New folder',
      {}
    );

    if (result.status === 'successfully') {
      await driver.updateDrive();
      const newFolder = result.body;
      description.innerText = newFolder.name;
      input.replaceWith(description);
      fillFileReaderBody(path);
    } else {
      input.removeEventListener('blur', saveFolder);
      alert(result.message);
      const newFolderElement = document.querySelector('.new-folder');
      newFolderElement.remove();
    }
  }

  let filesCollection = null;
  let initialScroll = null;

  filesContainer.addEventListener('mousedown', (event) => {
    if (!event.target.closest('.active-item')) {
      startSelectingArea(event);
    }
  });
  filesContainer.addEventListener('mousemove', moveSelectedArea);
  filesContainer.addEventListener('mouseup', removingSelectedArea);

  const desktop = document.querySelector('.desktop');
  let dragged = [];

  rootElement.addEventListener('dragstart', (event) => {
    if (event.target.closest('.active-item')) {
      dragFilesStart(event);
    }
  });

  function dragFilesStart(event) {
    const activeElements = document.querySelectorAll('.active-item');
    activeElements.forEach((item) => {
      dragged.push(item);
    });

    const dragImage = document.createElement('img');
    dragImage.src = filesIcons.find(
      (element) => element.name === 'unknown.png'
    ).body;
    event.dataTransfer.setDragImage(dragImage, 0, 0);

    assignDropzoneApps(event);
    assignDropzoneFolders(event);
  }

  function assignDropzoneApps(event) {
    const openApps = [...desktop.querySelectorAll(`[data-type="app"]`)].filter(
      (item) => item.id !== 'desktop' && item.id !== 'file-reader'
    );
    openApps.forEach((app) => {
      app.classList.add('dropzone');
      app.addEventListener('dragover', (event) => {
        event.preventDefault();
        dragFiles(event);
      });

      app.addEventListener('drop', (event) => {
        event.preventDefault();
        dropFiles(event);
      });
    });
  }

  function assignDropzoneFolders(event) {
    const folders = rootElement.querySelectorAll('[data-type="folder"]');
    folders.forEach((folder) => {
      folder.classList.add('dropzone');
      folder.addEventListener('dragover', (event) => {
        event.preventDefault();
        dragFiles(event);
      });

      folder.addEventListener('drop', (event) => {
        event.preventDefault();
        dropFiles(event);
      });
    });
  }

  function dragFiles(event) {
    const app = event.target.closest('.dropzone');
    if (app) {
      executor.changeIndexesOpenApps(app.id.split('-').join(' '));
    }
  }

  async function dropFiles(event) {
    const dropzone = event.target.closest('.dropzone');

    const folderDropZone =
      dropzone && dropzone.getAttribute('data-type') === 'folder';

    const appDropZone =
      dropzone && dropzone.getAttribute('data-type') === 'app';

    if (folderDropZone) {
      cutFile(dragged);
      await pasteFiles(dropzone);
    }

    if (appDropZone) {
      const appName = dropzone.id.split('-').join(' ');

      const starterAppsMap = {
        'audio player': () => addToQueueFilesByAppType(appName, 'audio'),
        'media player': () => addToQueueFilesByAppType(appName, 'video'),
        gallery: () => addToQueueFilesByAppType(appName, 'image'),
        notepad: () => addToQueueFilesByAppType(appName, 'text'),
      };

      starterAppsMap[appName]?.();
      deselectActiveFiles();
    }

    mouseIsDown = false;
    dragged = [];
  }

  function addToQueueFilesByAppType(appName, filesType) {
    const currentPath = path.length === 0 ? '/' : `/${path.join('/')}`;
    const elements = dragged.filter(
      (element) => element.getAttribute('data-type') === filesType
    );
    const files = elements.map((item) => {
      const name = item.querySelector('.file-description').innerText;
      const filePath =
        path.length === 0 ? `/${name}` : `/${path.join('/')}/${name}`;
      const searchFile = driver.readFile(filePath);
      if (searchFile.status !== 'error') {
        return searchFile.body;
      }
    });
    if (files.length > 0) {
      executor.setFilesQueue({
        path: currentPath,
        app: appName,
        files: [...files],
      });
      executor.startApp(appName);
    }
    deselectActiveFiles();
  }

  function startSelectingArea(event) {
    const openApps = driver.getOpenApps();

    if (
      !driver.getOpenApps().at(-1) === 'file reader' ||
      clickOutsideApp(event) ||
      openApps.at(-1) !== appName
    ) {
      return;
    }

    filesCollection = [...filesContainer.querySelectorAll('.file-item')];
    const existingArea = document.querySelector('.selected-area');
    existingArea?.remove();
    initialScroll = filesContainer.scrollTop;
    mouseIsDown = true;
    mouseDownX = event.clientX;
    mouseDownY = event.clientY;

    if (cursorOutsideApp()) {
      controlPanel.style.opacity = 0.5;
      return;
    }

    controlPanel.style.opacity = 1;
    const selectedArea = document.createElement('div');
    selectedArea.classList.add('selected-area');
    filesContainer.append(selectedArea);
  }

  function cursorOutsideApp() {
    const rectContainer = filesContainer.getBoundingClientRect();
    return (
      mouseDownX > rectContainer.right ||
      mouseDownX < rectContainer.left ||
      mouseDownY < rectContainer.top ||
      mouseDownY > rectContainer.bottom
    );
  }

  function moveSelectedArea(event) {
    if (!driver.getOpenApps().at(-1) === 'file reader' || !mouseIsDown) {
      return;
    }

    closeContextMenus();

    filesCollection.forEach((element) => {
      element.classList.add('disabled-hover');
    });

    const selectedArea = filesContainer.querySelector('.selected-area');

    if (!selectedArea) {
      return;
    }

    horizontalPositioningSelectedArea(event);

    verticalPositionSelectedArea(event);

    const rectArea = selectedArea.getBoundingClientRect();
    const area = {
      topLeft: { x: rectArea.left, y: rectArea.top },
      bottomRight: { x: rectArea.right, y: rectArea.bottom },
    };

    filesCollection.forEach((item) => {
      const elementInArea = elementIsInArea(area, item);

      if (elementInArea) {
        item.classList.add('active-item');
        item.draggable = true;
        return true;
      } else {
        item.classList.remove('active-item');
        item.draggable = false;
      }
    });
    previousClientY = event.clientY;
  }

  function clickOutsideApp(event) {
    const rectContainer = filesContainer.getBoundingClientRect();
    return (
      event.clientX > rectContainer.right ||
      event.clientX < rectContainer.left ||
      event.clientY > rectContainer.bottom ||
      event.clientY < rectContainer.top
    );
  }

  function horizontalPositioningSelectedArea(event) {
    const rectContainer = filesContainer.getBoundingClientRect();
    const selectedArea = filesContainer.querySelector('.selected-area');

    const moveLeft = event.clientX < mouseDownX;

    if (moveLeft) {
      const cursorInContainer = event.clientX > rectContainer.left;
      const width = cursorInContainer
        ? mouseDownX - event.clientX
        : mouseDownX - rectContainer.left;
      selectedArea.style.width = `${width}px`;
      selectedArea.style.left = cursorInContainer
        ? `${mouseDownX - rectContainer.left - width}px`
        : '-1px';
    } else {
      selectedArea.style.left = `${mouseDownX - rectContainer.left}px`;
      const cursorInContainer =
        event.clientX <
        rectContainer.right -
          (filesContainer.offsetWidth - filesContainer.clientWidth);
      selectedArea.style.width = cursorInContainer
        ? `${event.clientX - mouseDownX}px`
        : `${
            rectContainer.right -
            (filesContainer.offsetWidth - filesContainer.clientWidth) -
            mouseDownX -
            1
          }px`;
    }
  }

  function verticalPositionSelectedArea(event) {
    const rectFilesContainer = filesContainer.getBoundingClientRect();
    const selectedArea = filesContainer.querySelector('.selected-area');

    const moveUp =
      event.clientY + (filesContainer.scrollTop - initialScroll) < mouseDownY;
    const scrollUp =
      event.clientY < rectFilesContainer.top && filesContainer.scrollTop > 0;
    const scrollDown =
      event.clientY > rectFilesContainer.bottom &&
      rectFilesContainer.height + filesContainer.scrollTop <
        filesContainer.scrollHeight + 5;

    if (scrollUp) {
      filesContainer.scrollBy(0, -5);
    }

    if (scrollDown) {
      filesContainer.scrollBy(0, 5);
    }

    if (moveUp) {
      selectedArea.style.height = `${
        mouseDownY - event.clientY + initialScroll - filesContainer.scrollTop
      }px`;

      selectedArea.style.top = scrollUp
        ? `${filesContainer.scrollTop}px`
        : `${
            event.clientY + filesContainer.scrollTop - rectFilesContainer.top
          }px`;
    } else {
      selectedArea.style.top = `${
        mouseDownY - rectFilesContainer.top + initialScroll
      }px`;
      selectedArea.style.height = scrollDown
        ? `${
            rectFilesContainer.bottom -
            mouseDownY +
            (filesContainer.scrollTop - initialScroll)
          }px`
        : `${
            event.clientY -
            mouseDownY +
            (filesContainer.scrollTop - initialScroll)
          }px`;
    }
  }

  function elementIsInArea(area, object) {
    const rectElement = object.getBoundingClientRect();
    const element = {
      x: rectElement.x,
      y: rectElement.y,
      width: rectElement.width,
      height: rectElement.height,
    };

    return (
      element.x < area.bottomRight.x &&
      element.x + element.width > area.topLeft.x &&
      element.y < area.bottomRight.y &&
      element.y + element.height > area.topLeft.y
    );
  }

  function removingSelectedArea(event) {
    event.stopPropagation();
    if (!driver.getOpenApps().at(-1) === 'file reader' || !mouseIsDown) {
      return;
    }

    const existingArea = document.querySelector('.selected-area');
    existingArea?.remove();

    mouseIsDown = false;
    filesCollection.forEach((element) =>
      element.classList.remove('disabled-hover')
    );
  }
})();
