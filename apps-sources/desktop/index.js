(() => {
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

  const appFolder = driver.readFolder('/apps/desktop');
  const wallpaperUrl = appFolder.find(
    (item) => item.name === 'wallpapper.jpg'
  ).body;
  const activeUser = drive.activeUser;
  sectionDesctop.style.backgroundImage = `url(${wallpaperUrl})`;
  const userFolder = driver.readFolder(`/users/${activeUser}`);
  const userDesctopFiles = userFolder.find(
    (item) => item.name === 'desktop' && item.type === 'folder'
  ).children;

  const getIconByType = (file) => {
    const desktopItem = document.createElement('div');
    desktopItem.classList.add('desktop-item');
    const icon = document.createElement('div');
    icon.classList.add('icon');
    const title = document.createElement('span');
    title.innerText = file.name;
    desktopItem.append(icon, title);
    const defaultIcons = driver.readFolder('/apps/default icons');

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
          .find(
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

  userDesctopFiles.forEach((file) => {
    const icon = getIconByType(file);
    sectionDesctop.append(icon);
  });

  sectionDesctop.addEventListener('dblclick', (event) => {
    const file = event.target.closest('.desktop-item');
    if (file) {
      const type = event.target
        .closest('.desktop-item')
        .getAttribute('data-type');
      switch (type) {
        case 'exe':
          const appName = getArrNameByPath(file.getAttribute('data-path'));
          executor.startApp(appName);
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
    }
  });

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
        .find((item) => item.name === 'icon.png' && item.type === 'file').body;
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
})();
