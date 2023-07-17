class Executor {
  init() {
    this.driver = new Msvhd();
    this.driver.init().then(() => {
      const spinner = document.querySelector('.spinner');
      spinner.remove();
      this.startApp('login');
    });
  }

  getDriver() {
    return this.driver;
  }

  startApp(appName) {
    this.closeApp(appName);
    const files = this.driver.readFolder(`/apps/${appName}`);
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
const drive = new VirtualHardDrive();
const driver = executor.getDriver();
