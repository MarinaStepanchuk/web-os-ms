// import VirtualHardDrive from './VirtualHardDrive.js';

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
  static readFile(path) {
    return VirtualHardDrive.getFile(path);
  }

  static readFolder(path) {
    return VirtualHardDrive.getFolder(path);
  }

  static async createFile(path, file) {
    const fileString = await convertBase64(file);
    const newFile = {
      name: file.name,
      mime: file.type,
      size: file.size,
      body: fileString,
      type: 'file',
    };

    VirtualHardDrive.writeFile(path, newFile);
  }

  static createFolder(path, name) {
    VirtualHardDrive.writeFolder(path, name);
  }

  static deleteFile(path) {
    VirtualHardDrive.removeFile(path);
  }

  static deleteFolder(path) {
    VirtualHardDrive.removeFolder(path);
  }

  static async updateFile(path, file) {
    const fileString = await convertBase64(file);
    const newFile = {
      name: file.name,
      mime: file.type,
      size: file.size,
      body: fileString,
      type: 'file',
    };

    VirtualHardDrive.updateFile(path, newFile);
  }

  static renameFile(path, newName) {
    VirtualHardDrive.renameFile(path, newName);
  }

  static renameFolder(path, newName) {
    VirtualHardDrive.renameFolder(path, newName);
  }
}

// export default Msvhd;
