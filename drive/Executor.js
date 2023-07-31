class Executor {
  constructor() {
    this.filesQueueToOpen = [];
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

  getDriver() {
    return this.driver;
  }

  startApp(appName) {
    this.closeApp(appName);
    driver.addOpenApp(appName);
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
      this.changeIndexesOpenApps();
    }
  }
}

const executor = new Executor();
executor.init();
const hardDrive = new VirtualHardDrive();
const driver = executor.getDriver();
