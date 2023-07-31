(() => {
  const appName = 'desktop';
  const activeUser = hardDrive.getActiveUser();
  const desktopPath = `/users/${activeUser}/desktop`;
  const getArrNameByPath = (path) => {
    const app = path.split('/').at(-1).split('.');
    app.splice(-1, 1);
    return app.join('.');
  };

  const appWrapper = document.querySelector('.desktop-wrapper');
  const sectionDesctop = document.createElement('section');
  sectionDesctop.classList.add('desktop');
  const footer = document.createElement('footer');
  appWrapper.append(sectionDesctop, footer);
  appWrapper.style.zIndex = driver.getOpenApps().indexOf(appName) * 10;

  const appFolder = driver.readFolder('/apps/desktop').body;
  const wallpaperUrl = appFolder.find(
    (item) => item.name === 'wallpapper.jpg'
  ).body;
  sectionDesctop.style.backgroundImage = `url(${wallpaperUrl})`;
  const userFolder = driver.readFolder(`/users/${activeUser}`).body;

  const desctopList = document.createElement('div');
  desctopList.classList.add('desktop-list');
  sectionDesctop.append(desctopList);

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

  function fillDesctop() {
    desctopList.innerHTML = '';
    const userFolder = driver.readFolder(`/users/${activeUser}`).body;
    const userDesctopFiles = userFolder.find(
      (item) => item.name === 'desktop' && item.type === 'folder'
    ).children;
    userDesctopFiles.forEach((file) => {
      const icon = getIconByType(file);
      desctopList.append(icon);
    });
  }

  fillDesctop();

  sectionDesctop.addEventListener('dblclick', (event) => {
    const file = event.target.closest('.desktop-item');

    if (!file) {
      return;
    }

    openFiles([file]);
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
  };

  function getAppNameByPath(path) {
    const app = [...path.split('/').at(-1).split('.')];

    if (app.length === 1) {
      return app.join('.');
    }

    app.splice(-1, 1);
    return app.join('.');
  }

  const activeApps = document.createElement('div');
  activeApps.classList.add('active-apps');
  footer.append(activeApps);

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
      const appName = getArrNameByPath(event.target.getAttribute('data-path'));
      executor.closeApp(appName);
      executor.startApp(appName);
    }
  });

  let startX = null;
  let startY = null;
  let deltaX = null;
  let deltaY = null;
  let raf = null;
  let dragItem = null;
  let rectDragElement = null;
  sectionDesctop.addEventListener('mousedown', dragStart, { passive: true });

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

      sectionDesctop.addEventListener('mousemove', dragElement, {
        passive: true,
      });
      sectionDesctop.addEventListener('mouseup', dragEnd, { passive: true });
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
    sectionDesctop.removeEventListener('mousemove', dragElement, {
      passive: true,
    });
    sectionDesctop.removeEventListener('mouseup', dragEnd, { passive: true });
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
})();
