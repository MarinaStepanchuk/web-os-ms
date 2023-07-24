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
    const { app } = object;
    const filesQueue = this.getFilesQueue();
    const indexExistingAppQueue = filesQueue.findIndex(
      (item) => item.app === app
    );
    if (indexExistingAppQueue === -1) {
      this.filesQueueToOpen.push(object);
    } else {
      this.filesQueueToOpen.splice(indexExistingAppQueue, -1, object);
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
