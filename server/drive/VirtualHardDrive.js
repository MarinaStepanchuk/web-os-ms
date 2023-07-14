class VirtualHardDrive {
  constructor() {
    this.virtualDrive = [];
    this.activeUser = 'admin';
  }

  getDrive() {
    return this.virtualDrive;
  }

  setDrive(data) {
    this.virtualDrive = data;
  }

  async init() {
    const response = await fetch('http://localhost:3001/load-drive');
    const drive = await response.json();
    this.setDrive(drive);
  }

  getFile(path) {
    const pathArray = path.split('/');
    const isRootDirectory = pathArray.length === 2;

    if (isRootDirectory) {
      const file = this.virtualDrive.find(
        (element) => element.name === pathArray[1] && element.type === 'file'
      );
      return file || null;
    }

    const folderPath = [...pathArray];
    const fileName = folderPath.pop();
    const folder = this.getFolder(folderPath.join('/'));

    const file = folder.find(
      (element) => element.name === fileName && element.type === 'file'
    );

    return file || null;
  }

  getFolder(path) {
    const isRootDirectory = path === '/';

    if (isRootDirectory) {
      return this.virtualDrive;
    }

    const pathArray = path.slice(1).split('/');
    const result = pathArray.reduce((acc, item) => {
      const folder = acc.find(
        (element) => element.name === item && element.type === 'folder'
      );

      if (folder) {
        return folder.children;
      }
    }, this.virtualDrive);

    return result || null;
  }

  writeFile(path, newFile) {
    const fileExists = !!this.getFile(
      path === '/' ? `${path}${newFile.name}` : `${path}/${newFile.name}`
    );

    if (fileExists) {
      throw new Error('File with this name already exists');
    }

    getFolder(path).push(newFile);
  }

  writeFolder(path, name) {
    const folderExists = !!this.getFolder(
      path === '/' ? `/${name}` : `${path}/${name}`
    );

    if (folderExists) {
      throw new Error('Folder with this name already exists');
    }

    const newFolder = {
      id: Date.now(),
      name: name,
      type: 'folder',
      children: [],
    };

    this.getFolder(path).push(newFolder);

    return;
  }

  removeFile(path) {
    const pathArray = path.split('/');
    const isRootDirectory = pathArray.length === 2;

    if (isRootDirectory) {
      const fileName = path.slice(1);
      const index = this.virtualDrive.findIndex(
        (element) => element.name === fileName && element.type === 'file'
      );
      this.virtualDrive.splice(index, 1);
      return;
    }

    const folderPath = [...pathArray];
    const fileName = folderPath.pop();
    const parrentFolder = this.getFolder(folderPath.join('/'));
    const index = parrentFolder.findIndex(
      (element) => element.name === fileName && element.type === 'file'
    );
    parrentFolder.splice(index, 1);
  }

  removeFolder(path) {
    const isRootDirectory = path === '/';

    if (isRootDirectory) {
      this.virtualDrive = [];
      return;
    }

    const pathArray = path.split('/');
    const folderPath = [...pathArray];
    const folderName = folderPath.pop();
    const parrentFolder = this.getFolder(folderPath.join('/'));
    const index = parrentFolder.findIndex(
      (element) => element.name === folderName && element.type === 'folder'
    );
    parrentFolder.splice(index, 1);
  }

  updateFile(path, newFile) {
    const file = this.getFile(path);
    file.size = newFile.size;
    file.body = newFile.body;
  }

  renameFolder(path, newName) {
    const isRootDirectory = path === '/';

    if (isRootDirectory) {
      throw new Error('You cannot rename the root directory');
    }

    const pathArray = path.split('/');
    const folderPath = [...pathArray];
    const folderName = folderPath.pop();
    const parrentFolder = this.getFolder(folderPath.join('/'));
    const folder = parrentFolder.find(
      (element) => element.name === folderName && element.type === 'folder'
    );
    folder.name = newName;
  }

  renameFile(path, newName) {
    const pathArray = path.split('/');
    const isRootDirectory = pathArray.length === 2;

    if (isRootDirectory) {
      const fileName = path.slice(1);
      const extension = fileName.split('.').at(-1);
      const file = this.virtualDrive.find(
        (element) => element.name === fileName && element.type === 'file'
      );
      file.name = `${newName}.${extension}`;
      return;
    }

    const folderPath = [...pathArray];
    const fileName = folderPath.pop();
    const extension = fileName.split('.').at(-1);
    const parrentFolder = getFolder(folderPath.join('/'));
    const file = parrentFolder.find(
      (element) => element.name === fileName && element.type === 'file'
    );
    file.name = `${newName}.${extension}`;
  }
}
