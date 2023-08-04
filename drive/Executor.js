class Executor {
  constructor() {
    this.filesQueueToOpen = [];
    this.fileReaderPath = '';
  }

  init() {
    this.driver = new Msvhd();
    this.driver.init().then(() => {
      const spinner = document.querySelector('.spinner');
      spinner.remove();
      this.startApp('login');
    });
  }

  getFilesQueue() {
    return this.filesQueueToOpen;
  }

  getAppFilesToOpen(appName) {
    const object = this.getFilesQueue().find((item) => item.app === appName);
    return object?.files || [];
  }

  getPathOpenFiles(appName) {
    const object = this.getFilesQueue().find((item) => item.app === appName);
    return object?.path || null;
  }

  changeIndexesOpenApps(topAppName) {
    if (topAppName) {
      this.driver.reorderOpenApps(topAppName);
    }
    const openApps = this.driver.getOpenApps();

    openApps.forEach((app, index) => {
      const appWraper = document.getElementById(app.split(' ').join('-'));
      appWraper.style.zIndex = index * 10;
    });
  }

  setFilesQueue(object) {
    const { app, files } = object;
    const filesQueue = this.getFilesQueue();
    const indexExistingAppQueue = filesQueue.findIndex(
      (item) => item.app === app
    );
    if (indexExistingAppQueue === -1) {
      this.filesQueueToOpen.push(object);
    } else {
      const appIsOpen = driver.getOpenApps().find((item) => item === app);
      if (appIsOpen) {
        const appInQueue = filesQueue.find((item) => item.app === app);
        const stringCollection = structuredClone(appInQueue.files).map((item) =>
          JSON.stringify(item)
        );
        files.forEach((file) => {
          const fileExists = stringCollection.find(
            (item) => item === JSON.stringify(file)
          );
          if (!fileExists) {
            appInQueue.files.push(file);
          }
        });
      } else {
        this.filesQueueToOpen.splice(indexExistingAppQueue, -1, object);
      }
    }
  }

  removeFilesQueue(appName) {
    const filesQueue = this.getFilesQueue();
    const index = filesQueue.findIndex((item) => item.app === appName);
    if (index !== -1) {
      filesQueue.splice(index, 1);
    }
  }

  clearFilesQueue() {
    this.filesQueueToOpen = [];
  }

  getDriver() {
    return this.driver;
  }

  updateDesktop() {
    const desktopList = document.querySelector('.desktop-list');
    desktopList.innerHTML = '';
    const activeUser = hardDrive.getActiveUser();
    const userFolder = this.driver.readFolder(`/users/${activeUser}`).body;
    const userDesktopFiles = userFolder.find(
      (item) => item.name === 'desktop' && item.type === 'folder'
    ).children;
    userDesktopFiles.forEach((file) => {
      const icon = this.getIconByType(file);
      desktopList.append(icon);
    });
  }

  getIconByType(file) {
    const desktopItem = document.createElement('div');
    desktopItem.classList.add('desktop-item');
    const icon = document.createElement('div');
    icon.classList.add('icon');
    const title = document.createElement('span');
    title.classList.add('file-description');
    title.innerText = file.name;
    desktopItem.append(icon, title);
    const defaultIcons = this.driver.readFolder('/apps/default icons').body;

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
        const iconUrl = this.driver
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
  }

  startApp(appName) {
    this.closeApp(appName);
    this.driver.addOpenApp(appName);
    const files = this.driver.readFolder(`/apps/${appName}`).body;
    if (!files) {
      alert('application start error');
      return;
    }

    const startFile = files.find((item) => item.name.includes('.exe')).body;
    const script = document.createElement('script');
    script.src = startFile;
    script.setAttribute('data-app', appName);
    document.body.append(script);
  }

  closeApp(appName) {
    const files = document.querySelectorAll(`[data-app="${appName}"]`);
    files.forEach((item) => {
      item.remove();
    });
    if (files.length) {
      driver.removeOpenApp(appName);
    }
  }
}

const executor = new Executor();
executor.init();
const hardDrive = new VirtualHardDrive();
const driver = executor.getDriver();
