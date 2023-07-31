const convertBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    if (file.type.includes('text')) {
      fileReader.readAsText(file);
    } else {
      fileReader.readAsDataURL(file);
    }

    fileReader.onload = () => {
      resolve(fileReader.result);
    };

    fileReader.onerror = (error) => {
      reject(error);
    };
  });
};

class Msvhd {
  #openApps = [];
  #bufer = [];

  constructor() {
    this.hardDrive = new VirtualHardDrive();
    this.actionType = '';
  }

  getFileFromBufer() {
    return this.#bufer;
  }

  setFileInBufer(file, path) {
    const buferFile = { ...file };
    this.#bufer.push({ file: buferFile, path });
  }

  setActiveUser(name) {
    this.hardDrive.setActiveUser(name);
  }

  getActiveUser() {
    return this.hardDrive.getActiveUser();
  }

  clearBufer() {
    this.#bufer = [];
  }

  addOpenApp(appName) {
    this.#openApps.push(appName);
  }

  removeOpenApp(appName) {
    this.#openApps = this.#openApps.filter((app) => app !== appName);
  }

  reorderOpenApps(appName) {
    const oppenApps = [...this.getOpenApps()];
    const indexApp = oppenApps.indexOf(appName);
    this.#openApps.splice(indexApp, 1);
    this.#openApps.push(appName);
  }

  getOpenApps() {
    return this.#openApps;
  }

  async init() {
    await this.hardDrive.init();
  }

  async updateDrive() {
    try {
      const response = await fetch('http://localhost:3001/update-drive', {
        method: 'POST',
        body: JSON.stringify(this.hardDrive),
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  readFile(path) {
    return this.hardDrive.getFile(path);
  }

  readFolder(path) {
    return this.hardDrive.getFolder(path);
  }

  async createFile(path, file) {
    const fileString = await convertBase64(file);
    const newFile = {
      id: new Date(),
      name: file.name,
      mime: file.type,
      size: file.size,
      body: fileString,
      type: 'file',
      accessRights: {
        creator: this.hardDrive.getActiveUser(),
        public: true,
        access: {
          reed: [],
          modify: [],
        },
      },
    };

    return this.hardDrive.writeFile(path, newFile);
  }

  createFolder(path, name) {
    return this.hardDrive.writeFolder(path, name);
  }

  deleteFile(path) {
    return this.hardDrive.removeFile(path);
  }

  deleteFolder(path) {
    return this.hardDrive.removeFolder(path);
  }

  async updateFile(path, file) {
    const fileString = await convertBase64(file);
    const newFile = {
      size: file.size,
      body: fileString,
    };

    return this.hardDrive.updateFile(path, newFile);
  }

  renameFile(path, newName) {
    return this.hardDrive.renameFile(path, newName);
  }

  renameFolder(path, newName) {
    return this.hardDrive.renameFolder(path, newName);
  }

  copyFile(file, path) {
    const result = this.hardDrive.copyFile(file);

    if (result.status === 'successfully') {
      this.setFileInBufer(file, path);
    }

    return result;
  }

  pasteFile(pastePath, buferItem) {
    const result = this.hardDrive.pasteFile(
      pastePath,
      buferItem,
      this.actionType
    );

    return result;
  }

  pasteFolder(pastePath, buferItem) {
    const result = this.hardDrive.pasteFolder(
      pastePath,
      buferItem,
      this.actionType
    );

    return result;
  }
}
