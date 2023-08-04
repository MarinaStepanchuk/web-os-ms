(async () => {
  const appName = 'desktop';
  const activeUser = hardDrive.getActiveUser();
  const desktopPath = `/users/${activeUser}/desktop`;
  const actions = {
    paste: 'paste',
    createFolder: 'create folder',
    open: 'open',
    rename: 'rename',
    copy: 'copy',
    cut: 'cut',
    delete: 'delete',
  };
  let mouseIsDown = false;
  let mouseDownX = null;
  let mouseDownY = null;

  const appWrapper = document.querySelector('.desktop-wrapper');
  const sectionDesktop = document.createElement('section');
  sectionDesktop.classList.add('desktop');
  const footer = document.createElement('footer');
  appWrapper.append(sectionDesktop, footer);
  appWrapper.style.zIndex = driver.getOpenApps().indexOf(appName) * 10;

  const appFolder = driver.readFolder('/apps/desktop').body;
  const wallpaperUrl = appFolder.find(
    (item) => item.name === 'wallpaper.jpg'
  ).body;
  sectionDesktop.style.backgroundImage = `url(${wallpaperUrl})`;
  const userFolder = driver.readFolder(`/users/${activeUser}`).body;

  const desktopList = document.createElement('div');
  desktopList.classList.add('desktop-list');
  sectionDesktop.append(desktopList);

  const getIconByType = (file) => {
    const desktopItem = document.createElement('div');
    desktopItem.classList.add('desktop-item');
    const icon = document.createElement('div');
    icon.classList.add('icon');
    const title = document.createElement('span');
    title.classList.add('file-description');
    title.innerText = file.name;
    desktopItem.append(icon, title);
    const defaultIcons = driver.readFolder('/apps/default icons').body;

    if (file.type === 'folder') {
      desktopItem.setAttribute('data-type', 'folder');
      icon.style.backgroundImage = `url(${
        defaultIcons.find((item) => item.name === 'folder.icon').body
      })`;
      return desktopItem;
    }

    const type = file.mime.split('/')[0];

    switch (type) {
      case 'label':
        desktopItem.setAttribute('data-type', 'exe');
        desktopItem.setAttribute('data-path', file.body);
        const name = file.name.split('.');
        name.splice(-1, 1);
        title.innerText = name.join('.');
        const pathArray = file.body.split('/');
        pathArray.splice(-1, 1);
        const iconUrl = driver
          .readFolder(pathArray.join('/'))
          .body.find(
            (item) => item.name === 'icon.png' && item.type === 'file'
          ).body;
        icon.style.backgroundImage = `url(${iconUrl})`;
        return desktopItem;
      case 'image':
        desktopItem.setAttribute('data-type', 'image');
        icon.style.backgroundImage = `url(${file.body})`;
        title.innerText = file.name;
        return desktopItem;
      case 'video':
        desktopItem.setAttribute('data-type', 'video');
        icon.style.backgroundImage = `url(${
          defaultIcons.find((item) => item.name === 'video.icon').body
        })`;
        return desktopItem;
      case 'audio':
        desktopItem.setAttribute('data-type', 'audio');
        icon.style.backgroundImage = `url(${
          defaultIcons.find((item) => item.name === 'audio.icon').body
        })`;
        return desktopItem;
      case 'text':
        desktopItem.setAttribute('data-type', 'text');
        icon.style.backgroundImage = `url(${
          defaultIcons.find((item) => item.name === 'text.icon').body
        })`;
        return desktopItem;
      default:
        desktopItem.setAttribute('data-type', 'unknown');
        icon.style.backgroundImage = `url(${
          defaultIcons.find((item) => item.name === 'unknown.icon').body
        })`;
        return desktopItem;
    }
  };

  function fillDesktop() {
    desktopList.innerHTML = '';
    const userFolder = driver.readFolder(`/users/${activeUser}`).body;
    const userDesktopFiles = userFolder.find(
      (item) => item.name === 'desktop' && item.type === 'folder'
    ).children;
    userDesktopFiles.forEach((file) => {
      const icon = getIconByType(file);
      desktopList.append(icon);
    });
  }

  fillDesktop();

  sectionDesktop.addEventListener('dblclick', (event) => {
    closeContextMenus();
    deselectActiveFiles();
    const file = event.target.closest('.desktop-item');

    if (!file) {
      return;
    }

    openFiles([file]);
  });

  sectionDesktop.addEventListener('click', (event) => {
    closeContextMenus();

    if (mouseDownX === event.clientX && mouseDownY === event.clientY) {
      deselectActiveFiles();
    }

    const file = event.target.closest('.desktop-item');
    if (file) {
      file.classList.add('active-desktop-item');
      file.draggable = true;
    }
  });

  const openFiles = (files) => {
    const images = [];
    const videos = [];
    const audios = [];
    const textFiles = [];

    files.forEach((file) => {
      const type = file.getAttribute('data-type');
      const name = file.querySelector('.file-description').innerText;
      const appPath = file.getAttribute('data-path');

      const openingByTypeMap = {
        folder: () => {
          executor.fileReaderPath = `${desktopPath}/${name}`;
          executor.startApp('file reader');
        },
        exe: () => executor.startApp(getAppNameByPath(appPath)),
        label: () => executor.startApp(getAppNameByPath(appPath)),
        image: () => {
          const filePath = `${desktopPath}/${name}`;
          const searchFile = driver.readFile(filePath);
          if (searchFile.status === 'error') {
            alert(`can't open file ${name}`);
            return;
          }
          images.push(searchFile.body);
        },
        video: () => {
          const filePath = `${desktopPath}/${name}`;
          const searchFile = driver.readFile(filePath);
          if (searchFile.status === 'error') {
            alert(`can't open file ${name}`);
            return;
          }
          videos.push(searchFile.body);
        },
        audio: () => {
          const filePath = `${desktopPath}/${name}`;
          const searchFile = driver.readFile(filePath);
          if (searchFile.status === 'error') {
            alert(`can't open file ${name}`);
            return;
          }
          audios.push(searchFile.body);
        },
        text: () => {
          const filePath = `${desktopPath}/${name}`;
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
        path: desktopPath,
        app: 'gallery',
        files: [...images],
      });
      executor.startApp('gallery');
    }

    if (videos.length > 0) {
      executor.setFilesQueue({
        path: desktopPath,
        app: 'media player',
        files: [...videos],
      });
      executor.startApp('media player');
    }

    if (audios.length > 0) {
      executor.setFilesQueue({
        path: desktopPath,
        app: 'audio player',
        files: [...audios],
      });
      executor.startApp('audio player');
    }

    if (textFiles.length > 0) {
      executor.setFilesQueue({
        path: desktopPath,
        app: 'notepad',
        files: [...textFiles],
      });
      executor.startApp('notepad');
    }
    deselectActiveFiles();
  };

  function getAppNameByPath(path) {
    const app = [...path.split('/').at(-1).split('.')];

    if (app.length === 1) {
      return app.join('.');
    }

    app.splice(-1, 1);
    return app.join('.');
  }

  const weatherWidget = document.createElement('div');
  weatherWidget.classList.add('weather-widget');
  const weatherIcon = document.createElement('img');
  const weatherData = document.createElement('div');
  weatherData.classList.add('weather-description');
  const temperature = document.createElement('span');
  const city = document.createElement('span');
  weatherData.append(temperature, city);
  weatherWidget.append(weatherIcon, weatherData);
  footer.append(weatherWidget);

  await getWeather();

  async function getWeather() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { longitude, latitude } = position.coords;
          const responseCity = await fetch(
            `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=10&appid=464c0ac1c4af661625ccdc322e9deebd`
          );
          const dataCity = await responseCity.json();
          const cityValue = dataCity[0].name;
          const urlWeatherApi = `https://api.openweathermap.org/data/2.5/weather?q=${cityValue}&lang=en&appid=6482b58158f95b17d9dce830a81efd17&units=metric`;
          const responseWeather = await fetch(urlWeatherApi);
          const dataWeather = await responseWeather.json();

          if (dataWeather.cod === 200) {
            weatherIcon.src = `https://openweathermap.org/img/wn/${dataWeather.weather[0].icon}@2x.png`;
            temperature.innerText = `${Math.floor(dataWeather.main.temp)}°C`;
            city.innerText = cityValue;
          }
        },
        () => alert('Cannot get location, default city selected')
      );
    }
  }

  const footerAppsContainer = document.createElement('div');
  footerAppsContainer.classList.add('footer-apps-container');
  footer.append(footerAppsContainer);
  const activeApps = document.createElement('div');
  activeApps.classList.add('active-apps');
  const divider = document.createElement('div');
  divider.classList.add('vertical-divider');
  const openAppsContainer = document.createElement('div');
  openAppsContainer.classList.add('open-apps');
  footerAppsContainer.append(activeApps, divider, openAppsContainer);

  const userLaunchPadFiles = userFolder.find(
    (item) => item.name === 'launch pad' && item.type === 'folder'
  ).children;

  userLaunchPadFiles.forEach((file) => {
    if (file.mime.includes('label')) {
      const icon = document.createElement('div');
      icon.classList.add('footer-icon');
      icon.setAttribute('data-type', 'exe');
      icon.setAttribute('data-path', file.body);
      const pathArray = file.body.split('/');
      pathArray.splice(-1, 1);
      const iconUrl = driver
        .readFolder(pathArray.join('/'))
        .body.find(
          (item) => item.name === 'icon.png' && item.type === 'file'
        ).body;
      icon.style.backgroundImage = `url(${iconUrl})`;
      activeApps.append(icon);
    }
  });

  activeApps.addEventListener('click', (event) => {
    if (event.target.className.includes('footer-icon')) {
      const appName = getAppNameByPath(event.target.getAttribute('data-path'));
      executor.startApp(appName);
    }
  });

  const timeWidget = document.createElement('div');
  timeWidget.classList.add('time-widget');
  const timeContainer = document.createElement('span');
  const dateContainer = document.createElement('span');
  timeWidget.append(timeContainer, dateContainer);
  footer.append(timeWidget);
  showDateTime();

  function showDateTime() {
    const date = new Date();
    let hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    let minutes =
      date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    let second =
      date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();

    timeContainer.textContent = `${hours}:${minutes}:${second}`;
    showDate();
    setTimeout(showDateTime, 1000);
  }

  function showDate() {
    dateContainer.innerText = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
  }

  let startX = null;
  let startY = null;
  let deltaX = null;
  let deltaY = null;
  let raf = null;
  let dragItem = null;
  let rectDragElement = null;
  sectionDesktop.addEventListener('mousedown', dragStart, { passive: true });

  function dragStart(event) {
    const dragObject = event.target.closest('.draggable');
    if (dragObject) {
      dragItem = dragObject.parentElement;
      rectDragElement = dragItem.getBoundingClientRect();
      startX = event.clientX;
      startY = event.clientY;
      const startLeft = rectDragElement.left;
      const startTop = rectDragElement.top;
      dragItem.style.transform = 'translate3d(0px,0px,0px)';
      dragItem.style.left = `${startLeft}px`;
      dragItem.style.top = `${startTop}px`;

      sectionDesktop.addEventListener('mousemove', dragElement, {
        passive: true,
      });
      sectionDesktop.addEventListener('mouseup', dragEnd, { passive: true });
    }
  }

  function dragElement(event) {
    if (!raf) {
      deltaX = event.clientX - startX;
      deltaY = event.clientY - startY;
      raf = requestAnimationFrame(userMovedRaf);
    }
  }

  function userMovedRaf() {
    dragItem.style.transform =
      'translate3d(' + deltaX + 'px,' + deltaY + 'px, 0px)';
    raf = null;
  }

  function dragEnd(event) {
    sectionDesktop.removeEventListener('mousemove', dragElement, {
      passive: true,
    });
    sectionDesktop.removeEventListener('mouseup', dragEnd, { passive: true });
    if (raf) {
      cancelAnimationFrame(raf);
      raf = null;
    }
    dragItem.style.left = rectDragElement.left + deltaX + 'px';
    dragItem.style.top = rectDragElement.top + deltaY + 'px';
    dragItem.style.transform = 'translate3d(0px,0px,0px)';
    deltaX = null;
    deltaY = null;
  }

  function closeContextMenus() {
    const openMenus = document.querySelectorAll('.context-menu');
    openMenus.forEach((item) => item.remove());
  }

  function deselectActiveFiles() {
    const selectedElements = document.querySelectorAll('.active-desktop-item');
    selectedElements.forEach((element) => {
      element.classList.remove('active-desktop-item');
      element.draggable = false;
    });
  }

  sectionDesktop.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    const selectedFiles = sectionDesktop.querySelectorAll(
      '.active-desktop-item'
    );

    if (selectedFiles.length === 1) {
      selectedFiles.forEach((element) => {
        element.classList.remove('active-desktop-item');
        element.draggable = false;
      });
    }

    const file = event.target.closest('.desktop-item');

    if (file) {
      openFileContextMenu(event);
      return;
    }

    openCommonContextMenu(event);
  });

  function openFileContextMenu(event) {
    closeContextMenus();
    const clickedElement = event.target.closest('.desktop-item');
    if (!clickedElement.classList.contains('active-desktop-item')) {
      clickedElement.classList.add('active-desktop-item');
      clickedElement.draggable = true;
    }
    const selectedFiles = sectionDesktop.querySelectorAll(
      '.active-desktop-item'
    );
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
    sectionDesktop.append(menu);
    menu.style.zIndex = driver.getOpenApps().indexOf(appName) * 10;
    menuPositioning(event, menu);

    menu.addEventListener('click', async (event) => {
      event.stopImmediatePropagation();
      closeContextMenus();
      const actionType = event.target.innerText.toLowerCase();

      await takeActionByType(actionType, selectedFiles, clickedElement);
    });
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

  function openCommonContextMenu(event) {
    closeContextMenus();
    const menu = document.createElement('ul');
    menu.classList.add('common-context-menu');
    menu.classList.add('context-menu');
    const buttons = [actions.paste, actions.createFolder];
    buttons.forEach((item) => {
      const button = document.createElement('li');
      button.innerText = item;
      button.classList.add(item.split(' ').join('-'));
      menu.append(button);
    });
    sectionDesktop.append(menu);
    menu.style.zIndex = driver.getOpenApps().indexOf(appName) * 10;

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
    newFolder.classList.add('desktop-item');
    newFolder.classList.add('new-folder');
    newFolder.setAttribute('data-type', 'folder');
    desktopList.append(newFolder);
    const icon = document.createElement('div');
    icon.classList.add('icon');
    const defaultIcons = driver.readFolder('/apps/default icons').body;
    icon.style.backgroundImage = `url(${
      defaultIcons.find((element) => element.name === 'folder.icon').body
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
    const description = document.createElement('span');
    description.classList.add('file-description');
    const fileName = input.value.trim();

    const result = driver.createFolder(
      desktopPath,
      fileName || 'New folder',
      {}
    );

    if (result.status === 'successfully') {
      await driver.updateDrive();
      const newFolder = result.body;
      description.innerText = newFolder.name;
      input.replaceWith(description);
      fillDesktop();
    } else {
      input.removeEventListener('blur', saveFolder);
      alert(result.message);
      const newFolderElement = document.querySelector('.new-folder');
      newFolderElement.remove();
    }
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
    };

    executionByTypeMap[type]?.();
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
    fillDesktop();
  }

  function getFileOptionsFromFileElement(fileElement) {
    const type =
      fileElement.getAttribute('data-type') === 'folder' ? 'folder' : 'file';
    const fileName = fileElement.querySelector('.file-description').innerText;
    const filePath = `${desktopPath}/${fileName}`;

    return {
      type,
      fileName,
      filePath,
    };
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

  function deselectCopyFiles() {
    const copiedFiles = document.querySelectorAll('.copied');
    copiedFiles.forEach((item) => item.classList.remove('copied'));
  }

  async function saveNewFileName(type, fileName, filePath) {
    const input = desktopList.querySelector('.input-new-name');

    const newDescription = document.createElement('span');
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
        fillDesktop();
      } else {
        input.removeEventListener('blur', reverseNameChange);
        alert(result.message);
        input.replaceWith(newDescription);
      }
    }
  }

  function reverseNameChange() {
    const inputName = desktopList.querySelector('.input-new-name');
    const fileName = previousNameFile;
    const newDescription = document.createElement('span');
    newDescription.classList.add('file-description');
    newDescription.innerText = fileName;
    inputName.replaceWith(newDescription);
  }

  function copyFiles(selectedFiles) {
    driver.actionType = actions.copy;
    driver.clearBuffer();
    selectedFiles.forEach((file) => copyFileInBuffer(file));
  }

  function copyFileInBuffer(fileElement) {
    deselectActiveFiles();

    fileElement.classList.add('copied');
    const type = fileElement.getAttribute('data-type');
    const fileName = fileElement.querySelector('.file-description').innerText;

    if (type === 'folder') {
      const parentFolderPath = desktopPath;
      const resultSearch = driver.readFolder(parentFolderPath);
      const parentFolder = resultSearch.body;

      if (parentFolder) {
        const folder = parentFolder.find((item) => item.name === fileName);
        const copyResult = driver.copyFile(folder, desktopPath);

        if (copyResult.status === 'error') {
          alert(copyResult.message);
          fileElement.classList.remove('copied');
        }
      } else {
        alert(resultSearch.message);
        fileElement.classList.remove('copied');
      }
    } else {
      const filePath = `${desktopPath}/${fileName}`;
      const resultSearch = driver.readFile(filePath);
      const file = resultSearch.body;

      if (file) {
        driver.copyFile(file, desktopPath);
      } else {
        alert(resultSearch.message);
        fileElement.classList.remove('copied');
      }
    }
  }

  function cutFile(selectedFiles) {
    driver.actionType = actions.cut;
    driver.clearBuffer();
    selectedFiles.forEach((file) => copyFileInBuffer(file));
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
      const filePath = `${desktopPath}/${folderName}`;

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
      fillDesktop();
      return;
    }

    const filePath = desktopPath;

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
    fillDesktop();
    return;
  }

  let filesCollection = null;

  desktopList.addEventListener('mousedown', (event) => {
    if (!event.target.closest('.active-desktop-item')) {
      startSelectingArea(event);
    }
  });
  desktopList.addEventListener('mousemove', moveSelectedArea);
  desktopList.addEventListener('mouseup', removingSelectedArea);

  function startSelectingArea(event) {
    filesCollection = [...desktopList.querySelectorAll('.desktop-item')];
    const existingArea = document.querySelector('.selected-area');
    existingArea?.remove();
    mouseIsDown = true;
    mouseDownX = event.clientX;
    mouseDownY = event.clientY;

    if (cursorOutsideApp()) {
      return;
    }

    const selectedArea = document.createElement('div');
    selectedArea.classList.add('selected-area');
    desktopList.append(selectedArea);
    closeContextMenus();
  }

  function cursorOutsideApp() {
    const rectContainer = desktopList.getBoundingClientRect();
    return (
      mouseDownX > rectContainer.right ||
      mouseDownX < rectContainer.left ||
      mouseDownY < rectContainer.top ||
      mouseDownY > rectContainer.bottom
    );
  }

  function moveSelectedArea(event) {
    if (!mouseIsDown) {
      return;
    }

    filesCollection.forEach((element) => {
      element.classList.add('disabled-hover');
    });

    const selectedArea = desktopList.querySelector('.selected-area');

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
        item.classList.add('active-desktop-item');
        item.draggable = true;
        return true;
      } else {
        item.classList.remove('active-desktop-item');
        item.draggable = false;
      }
    });
  }

  function horizontalPositioningSelectedArea(event) {
    const selectedArea = desktopList.querySelector('.selected-area');
    const moveLeft = event.clientX < mouseDownX;

    if (moveLeft) {
      selectedArea.style.width = `${mouseDownX - event.clientX}px`;
      selectedArea.style.left = `${event.clientX}px`;
    } else {
      selectedArea.style.left = `${mouseDownX}px`;
      selectedArea.style.width = `${event.clientX - mouseDownX}px`;
    }
  }

  function verticalPositionSelectedArea(event) {
    const selectedArea = desktopList.querySelector('.selected-area');
    const moveUp = event.clientY < mouseDownY;

    if (moveUp) {
      selectedArea.style.height = `${mouseDownY - event.clientY}px`;
      selectedArea.style.top = `${event.clientY}px`;
    } else {
      selectedArea.style.top = `${mouseDownY}px`;
      selectedArea.style.height = `${event.clientY - mouseDownY}px`;
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

  function removingSelectedArea() {
    if (!mouseIsDown) {
      return;
    }
    const existingArea = document.querySelector('.selected-area');
    existingArea?.remove();

    mouseIsDown = false;
    filesCollection.forEach((element) =>
      element.classList.remove('disabled-hover')
    );
  }

  let dragged = [];

  desktopList.addEventListener('dragstart', (event) => {
    if (event.target.closest('.active-desktop-item')) {
      dragFilesStart(event);
    }
  });

  function dragFilesStart(event) {
    const activeElements = document.querySelectorAll('.active-desktop-item');
    activeElements.forEach((item) => {
      dragged.push(item);
    });

    const dragImage = document.createElement('img');
    const defaultIcons = driver.readFolder('/apps/default icons').body;
    dragImage.src = defaultIcons.find(
      (element) => element.name === 'unknown.icon'
    ).body;
    event.dataTransfer.setDragImage(dragImage, 0, 0);

    assignDropzoneApps(event);
    assignDropzoneFolders(event);
  }

  function assignDropzoneApps(event) {
    const openApps = [
      ...sectionDesktop.querySelectorAll(`[data-type="app"]`),
    ].filter((item) => item.id !== 'desktop' && item.id !== 'file-reader');
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
    const folders = desktopList.querySelectorAll('[data-type="folder"]');
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
    const elements = dragged.filter(
      (element) => element.getAttribute('data-type') === filesType
    );
    const files = elements.map((item) => {
      const name = item.querySelector('.file-description').innerText;
      const filePath = `${desktopPath}/${name}`;
      const searchFile = driver.readFile(filePath);
      if (searchFile.status !== 'error') {
        return searchFile.body;
      }
    });

    if (files.length > 0) {
      executor.setFilesQueue({
        path: desktopPath,
        app: appName,
        files: [...files],
      });
      executor.startApp(appName);
    }
    deselectActiveFiles();
  }
})();
