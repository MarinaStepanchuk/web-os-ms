(() => {
  const filesIcons = driver.readFolder('/apps/file reader/assets/icons').body;

  let path = [];

  const history = {
    position: 0,
    memory: [[]],
  };

  let previousNameFile = '';

  let actionType = '';

  const rootElement = document.getElementById('file-reader');
  let fullScreenMode = false;

  const appWrapper = document.querySelector('.file-reader-wrapper');
  driver.addOpenApp('file reader');

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
          const appName = file.name.split('.');
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
      .filter((item) => item.type === 'file')
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

  function deselectActiveFiles() {
    const selectedElements = document.querySelectorAll('.active-item');
    selectedElements.forEach((element) =>
      element.classList.remove('active-item')
    );
  }

  function deselectCopyFiles() {
    const copiedFiles = filesContainer.querySelectorAll('.copied');
    copiedFiles.forEach((item) => item.classList.remove('copied'));
  }

  filesContainer.addEventListener('click', (event) => {
    closeContextMenus();
    deselectActiveFiles();
    const file = event.target.closest('.file-item');
    if (file) {
      file.classList.add('active-item');
    }
  });

  filesContainer.addEventListener('dblclick', (event) => {
    const file = event.target.closest('.file-item');

    if (!file) {
      return;
    }

    openFile(file);
  });

  filesContainer.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    const selectedFiles = filesContainer.querySelectorAll('.active-item');

    if (selectedFiles.length === 1) {
      selectedFiles.forEach((element) =>
        element.classList.remove('active-item')
      );
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
    }
    const selectedFiles = filesContainer.querySelectorAll('.active-item');
    const type = clickedElement.getAttribute('data-type');
    const menu = document.createElement('ul');
    menu.classList.add('file-context-menu');
    menu.classList.add('context-menu');
    const buttons = ['open', 'rename', 'copy', 'cut', 'paste', 'delete'];
    buttons.forEach((item) => {
      if (
        (item === 'paste' && type !== 'folder') ||
        (item === 'paste' && selectedFiles.length > 1)
      ) {
        return;
      }

      const button = document.createElement('li');
      button.innerText = item;
      button.classList.add(item.split(' ').join('-'));
      menu.append(button);
    });
    rootElement.append(menu);

    menuPositioning(event, menu);

    menu.addEventListener('click', async (event) => {
      closeContextMenus();
      const actionType = event.target.innerText.toLowerCase();

      await takeActionByType(actionType, selectedFiles, clickedElement);
    });
  }

  async function takeActionByType(type, selectedFiles, clickedElement) {
    closeContextMenus();
    switch (type) {
      case 'open':
        selectedFiles.forEach((file) => openFile(file));
        deselectActiveFiles();
        break;
      case 'delete':
        for (const file of selectedFiles) {
          await deleteFile(file);
        }
        break;
      case 'rename':
        renameFile(clickedElement);
        break;
      case 'copy':
        copyFiles(selectedFiles);
        break;
      case 'paste':
        await pasteFiles(clickedElement);
        break;
      case 'cut':
        cutFile(selectedFiles);
        break;
    }
  }

  function menuPositioning(event, menu) {
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
  }

  function copyFiles(selectedFiles) {
    actionType = 'copy';
    driver.clearBufer();
    selectedFiles.forEach((file) => copyFileInBufer(file));
  }

  function cutFile(selectedFiles) {
    actionType = 'cut';
    driver.clearBufer();
    selectedFiles.forEach((file) => copyFileInBufer(file));
  }

  function copyFileInBufer(fileElement) {
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
    const bufer = driver.getFileFromBufer();

    if (!bufer.length) {
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

      for (const buferItem of bufer) {
        if (buferItem.path === filePath && actionType === 'cut') {
          deselectCopyFiles();
          return;
        }

        const result =
          buferItem.file.type === 'folder'
            ? driver.pasteFolder(filePath, buferItem, actionType)
            : driver.pasteFile(filePath, buferItem, actionType);

        if (result.status === 'error') {
          alert(result.message);
        }
      }

      await driver.updateDrive();
      return;
    }

    const filePath = path.length === 0 ? `/` : `/${path.join('/')}`;

    for (const buferItem of bufer) {
      if (buferItem.path === filePath && actionType === 'cut') {
        deselectCopyFiles();
        return;
      }

      const result =
        buferItem.file.type === 'folder'
          ? driver.pasteFolder(filePath, buferItem, actionType)
          : driver.pasteFile(filePath, buferItem, actionType);

      if (result.status === 'error') {
        alert(result.message);
      }
    }

    await driver.updateDrive();
    fillFileReaderBody(path);
    return;
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

  function openCommonContextMenu(event) {
    closeContextMenus();
    const menu = document.createElement('ul');
    menu.classList.add('common-context-menu');
    menu.classList.add('context-menu');
    const buttons = ['paste', 'load file', 'create folder'];
    buttons.forEach((item) => {
      const button = document.createElement('li');
      button.innerText = item;
      button.classList.add(item.split(' ').join('-'));
      menu.append(button);
    });
    rootElement.append(menu);

    menuPositioning(event, menu);

    menu.addEventListener('click', async (event) => {
      closeContextMenus();
      const actionType = event.target.innerText.toLowerCase();
      if (actionType === 'create folder') {
        addNewFolder();
      }

      if (actionType === 'load file') {
      }

      if (actionType === 'paste') {
        pasteFiles();
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
      fileName || 'New file'
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

  let mouseIsDown = false;
  let mouseDownX = null;
  let mouseDownY = null;
  let mouseUpX = null;
  let mouseUpY = null;

  document.addEventListener('mousedown', (event) => {
    if (!driver.getOpenApps().at(-1) === 'file reader') {
      return;
    }

    const existingArea = document.querySelector('.selected-area');

    if (existingArea) {
      existingArea.remove();
    }

    mouseIsDown = true;
    mouseDownX = event.clientX;
    mouseDownY = event.clientY;
    const selectedArea = document.createElement('div');
    selectedArea.classList.add('selected-area');
    filesContainer.append(selectedArea);
  });

  document.addEventListener('mousemove', (event) => {
    if (!driver.getOpenApps().at(-1) === 'file reader' || !mouseIsDown) {
      return;
    }
    const selectedArea = filesContainer.querySelector('.selected-area');
    const rectFilesContainer = filesContainer.getBoundingClientRect();
    const rectRootElement = rootElement.getBoundingClientRect();

    if (event.clientX < mouseDownX) {
      const width =
        event.clientX > rectRootElement.left
          ? mouseDownX - event.clientX
          : mouseDownX - rectRootElement.left;
      selectedArea.style.width = `${width}px`;
      selectedArea.style.left =
        event.clientX > rectRootElement.left
          ? `${mouseDownX - rectRootElement.left - width}px`
          : '-1px';
    } else {
      selectedArea.style.left = `${mouseDownX - rectRootElement.left}px`;
      selectedArea.style.width =
        event.clientX < rectRootElement.right
          ? `${event.clientX - mouseDownX}px`
          : `${rectRootElement.right - mouseDownX}px`;
    }

    if (event.clientY < mouseDownY) {
      const height =
        event.clientY + 5 > rectFilesContainer.top
          ? mouseDownY - event.clientY
          : rectRootElement.top - mouseDownY;
      selectedArea.style.top =
        event.clientY + 5 > rectFilesContainer.top
          ? `${mouseDownY - rectRootElement.top - height}px`
          : `${rectRootElement.top}px`;
      selectedArea.style.height = `${height}px`;
    } else {
      selectedArea.style.top = `${mouseDownY - rectRootElement.top}px`;
      selectedArea.style.height =
        event.clientY < rectRootElement.bottom
          ? `${event.clientY - mouseDownY}px`
          : `${rectRootElement.bottom - mouseDownY}px`;
    }
  });

  document.addEventListener('mouseup', (event) => {
    if (!driver.getOpenApps().at(-1) === 'file reader') {
      return;
    }

    const existingArea = document.querySelector('.selected-area');

    if (existingArea) {
      existingArea.remove();
    }

    const rectFilesContainer = filesContainer.getBoundingClientRect();

    mouseIsDown = false;
    mouseUpX = event.clientX;
    mouseUpY = event.clientY;
  });
})();
