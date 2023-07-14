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
  constructor() {
    this.hardDrive = new VirtualHardDrive();
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
      const res = await response.json();
    } catch (error) {
      console.log(error);
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
    this.hardDrive.removeFile(path);
  }

  deleteFolder(path) {
    this.hardDrive.removeFolder(path);
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
