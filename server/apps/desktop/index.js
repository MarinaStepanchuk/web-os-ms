(() => {
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

    if (file.mime.includes('label')) {
      desktopItem.setAttribute('data-type', 'exe');
      desktopItem.setAttribute('data-path', file.body);
      const pathArray = file.body.split('/');
      pathArray.splice(-1, 1);
      const iconUrl = driver
        .readFolder(pathArray.join('/'))
        .find((item) => item.name === 'icon.png' && item.type === 'file').body;
      icon.style.backgroundImage = `url(${iconUrl})`;
      return desktopItem;
    }

    const defaultIcons = driver.readFolder('/apps/default icons');

    if (file.mime.includes('image')) {
      desktopItem.setAttribute('data-type', 'image');
      icon.style.backgroundImage = `url(${file.body})`;
      title.innerText = file.name;
      return desktopItem;
    }

    if (file.mime.includes('video')) {
      desktopItem.setAttribute('data-type', 'video');
      icon.style.backgroundImage = `url(${
        defaultIcons.find((item) => item.name === 'video.icon').body
      })`;
      return desktopItem;
    }

    if (file.mime.includes('audio')) {
      desktopItem.setAttribute('data-type', 'audio');
      icon.style.backgroundImage = `url(${
        defaultIcons.find((item) => item.name === 'audio.icon').body
      })`;
      return desktopItem;
    }

    if (file.mime.includes('text')) {
      desktopItem.setAttribute('data-type', 'text');
      icon.style.backgroundImage = `url(${
        defaultIcons.find((item) => item.name === 'text.icon').body
      })`;
      return desktopItem;
    }

    desktopItem.setAttribute('data-type', 'unknown');
    icon.style.backgroundImage = `url(${
      defaultIcons.find((item) => item.name === 'unknown.icon').body
    })`;
    return desktopItem;
  };

  userDesctopFiles.forEach((file) => {
    const icon = getIconByType(file);
    sectionDesctop.append(icon);
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
    console.log(event.target.className);
    console.log(event.target);
    if (event.target.className.includes('footer-icon')) {
      const app = event.target
        .getAttribute('data-path')
        .split('/')
        .at(-1)
        .split('.');
      app.splice(-1, 1);
      console.log(app);
      // executor.startApp('');
    }
  });
})();
