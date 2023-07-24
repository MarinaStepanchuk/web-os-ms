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
    const files = this.driver.readFolder(`/apps/${appName}`).body;
    console.log(1);
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
  }
}

const executor = new Executor();
executor.init();
const hardDrive = new VirtualHardDrive();
const driver = executor.getDriver();
