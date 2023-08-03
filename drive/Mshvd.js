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
  #buffer = [];

  constructor() {
    this.hardDrive = new VirtualHardDrive();
    this.actionType = '';
  }

  getFileFromBuffer() {
    return this.#buffer;
  }

  setFileInBuffer(file, path) {
    const bufferFile = { ...file };
    this.#buffer.push({ file: bufferFile, path });
  }

  setActiveUser(name) {
    this.hardDrive.setActiveUser(name);
  }

  getActiveUser() {
    return this.hardDrive.getActiveUser();
  }

  clearBuffer() {
    this.#buffer = [];
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

  async createFile(path, file, access) {
    const fileString = await convertBase64(file);
    const { read = '', modify = '' } = access;
    const newFile = {
      id: new Date(),
      name: file.name,
      mime: file.type,
      size: file.size,
      body: fileString,
      type: 'file',
      accessRights: {
        creator: hardDrive.getActiveUser(),
        public: true,
        access: {
          read: read ? [read] : [],
          modify: modify ? [modify] : [],
        },
      },
    };

    return this.hardDrive.writeFile(path, newFile);
  }

  createFolder(path, name, access) {
    return this.hardDrive.writeFolder(path, name, access);
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
      this.setFileInBuffer(file, path);
    }

    return result;
  }

  pasteFile(pastePath, bufferItem) {
    const result = this.hardDrive.pasteFile(
      pastePath,
      bufferItem,
      this.actionType
    );

    return result;
  }

  pasteFolder(pastePath, bufferItem) {
    const result = this.hardDrive.pasteFolder(
      pastePath,
      bufferItem,
      this.actionType
    );

    return result;
  }

  createNewUser(name, password, photo) {
    try {
      const newUserFile = new File(
        [`{ user: ${name}, password: ${password} }`],
        'user.txt',
        {
          type: 'text/plain',
        }
      );
      this.createFolder('/users', name, { read: name, modify: name });
      this.hardDrive.writeFile(
        `/users/${name}`,
        this.createUserDataFile(name, password)
      );
      this.createFile(`/users/${name}`, newUserFile, {
        read: name,
        modify: name,
      });

      if (photo) {
        const avatarPhoto = new File([photo], 'avatar.jpg', {
          type: photo.type,
        });
        this.createFile(`/users/${name}`, avatarPhoto, {
          read: name,
          modify: name,
        });
      } else {
        const defaultAvatar = this.readFile('/apps/login/avatar.jpg').body;
        this.hardDrive.writeFile(
          `/users/${name}`,
          structuredClone(defaultAvatar)
        );
      }

      this.createFolder(`/users/${name}`, 'desktop', { read: name });
      this.hardDrive.writeFile(
        `/users/${name}/desktop`,
        this.createDefaultAppsLabelFiles(
          name,
          'My computer.lbl',
          '/apps/file reader/file reader.exe'
        )
      );
      this.createFolder(`/users/${name}`, 'launch pad', { read: name });
      this.hardDrive.writeFile(
        `/users/${name}/launch pad`,
        this.createDefaultAppsLabelFiles(
          name,
          'app manager.lbl',
          '/apps/app manager/app manager.exe'
        )
      );
      this.hardDrive.writeFile(
        `/users/${name}/launch pad`,
        this.createDefaultAppsLabelFiles(
          name,
          'file reader.lbl',
          '/apps/file reader/file reader.exe'
        )
      );

      return {
        status: 'successfully',
        body: {},
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  createDefaultAppsLabelFiles(userName, appName, path) {
    return {
      id: new Date(),
      name: appName,
      type: 'file',
      mime: 'label/lbl',
      size: '',
      accessRights: {
        creator: 'admin',
        public: false,
        access: {
          read: [userName],
          modify: [],
        },
      },
      body: path,
    };
  }

  createUserDataFile(userName, password) {
    return {
      id: new Date(),
      name: 'user.txt',
      size: 7139,
      type: 'file',
      mime: 'text/txt',
      accessRights: {
        creator: 'admin',
        public: false,
        access: {
          read: [userName],
          modify: [userName],
        },
      },
      body: window.btoa(`name: ${userName}, password: ${password}`),
    };
  }

  updateAccessRights(path, access) {
    return this.hardDrive.updateAccessRights(path, access);
  }
}
