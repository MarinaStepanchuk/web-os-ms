const convertBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    if (file.type.includes('text') || file.type.includes('js')) {
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

  constructor() {
    this.hardDrive = new VirtualHardDrive();
  }

  addOpenApp(appName) {
    this.#openApps.push(appName);
  }

  removeOpenApp(appName) {
    this.#openApps = this.openApps.filter((app) => app !== appName);
  }

  getOpenApp() {
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
      name: file.name,
      mime: file.type,
      size: file.size,
      body: fileString,
      type: 'file',
    };

    this.hardDrive.writeFile(path, newFile);
  }

  createFolder(path, name) {
    this.hardDrive.writeFolder(path, name);
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
      name: file.name,
      mime: file.type,
      size: file.size,
      body: fileString,
      type: 'file',
    };

    this.hardDrive.updateFile(path, newFile);
  }

  renameFile(path, newName) {
    this.hardDrive.renameFile(path, newName);
  }

  renameFolder(path, newName) {
    this.hardDrive.renameFolder(path, newName);
  }
}
