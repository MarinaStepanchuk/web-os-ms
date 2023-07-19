class VirtualHardDrive {
  #activeUser = 'admin';

  constructor() {
    this.virtualDrive = [];
  }

  getDrive() {
    return this.virtualDrive;
  }

  setDrive(data) {
    this.virtualDrive = data;
  }

  setActiveUser(user) {
    this.#activeUser = user;
  }

  getActiveUser() {
    return this.#activeUser;
  }

  async init() {
    const response = await fetch('http://localhost:3001/load-drive');
    const drive = await response.json();
    this.setDrive(drive);
  }

  checkAccess(file, type) {
    const { creator, access } = file.accessRights;
    const activeUser = hardDrive.getActiveUser();

    switch (type) {
      case 'read':
        return (
          creator === activeUser ||
          access.reed.includes('all') ||
          access.reed.includes(activeUser)
        );
      case 'modify':
        return (
          creator === activeUser ||
          access.modify.includes('all') ||
          access.modify.includes(activeUser)
        );
      default:
        return false;
    }
  }

  getFile(path) {
    try {
      const pathArray = path.split('/');
      const isRootDirectory = pathArray.length === 2;

      if (isRootDirectory) {
        const file = this.virtualDrive.find(
          (element) => element.name === pathArray[1] && element.type === 'file'
        );

        if (!file) {
          throw new Error('file not found');
        }

        const accessAllowed = this.checkAccess(file, 'read');

        if (!accessAllowed) {
          throw new Error('access denied');
        }

        return { status: 'successfully', body: file };
      }

      const folderPath = [...pathArray];
      const fileName = folderPath.pop();
      const folder = this.getFolder(folderPath.join('/'));

      if (!folder.body) {
        throw new Error(folder.error);
      }

      const file = folder.body.find(
        (element) => element.name === fileName && element.type === 'file'
      );

      if (!file) {
        throw new Error(`file ${fileName} not found`);
      }

      const accessAllowed = this.checkAccess(file, 'read');

      if (!accessAllowed) {
        throw new Error('access denied');
      }

      return { status: 'successfully', body: file };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  getFolder(path) {
    try {
      const isRootDirectory = path === '/';

      if (isRootDirectory) {
        return { status: 'successfully', body: this.virtualDrive };
      }

      const pathArray = path.slice(1).split('/');
      const result = pathArray.reduce((acc, item) => {
        const folder = acc.find(
          (element) => element.name === item && element.type === 'folder'
        );

        if (folder) {
          const accessAllowed = this.checkAccess(folder, 'read');

          if (!accessAllowed) {
            throw new Error('access denied');
          }

          return folder.children;
        } else {
          throw new Error(`folder ${item} not found`);
        }
      }, this.virtualDrive);

      return { status: 'successfully', body: result };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
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

  checkFileExist(path, name) {
    return !!this.getFolder(path === '/' ? `/${name}` : `${path}/${name}`).body;
  }

  writeFolder(path, name) {
    try {
      let folderExists = this.checkFileExist(path, name);
      let count = 0;
      let newName = name;

      while (folderExists) {
        count++;
        newName = `${name}${count}`;
        folderExists = this.checkFileExist(path, newName);
      }

      const newFolder = {
        id: Date.now(),
        name: newName,
        type: 'folder',
        accessRights: {
          creator: this.#activeUser,
          public: true,
          access: {
            reed: [],
            modify: [],
          },
        },
        children: [],
      };

      this.getFolder(path).body.push(newFolder);

      return { status: 'successfully', body: newFolder };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  removeFile(path) {
    try {
      const pathArray = path.split('/');
      const isRootDirectory = pathArray.length === 2;

      if (isRootDirectory) {
        const fileName = path.slice(1);
        const file = this.virtualDrive.find(
          (element) => element.name === fileName && element.type === 'file'
        );

        const accessAllowed = this.checkAccess(file, 'modify');

        if (!accessAllowed) {
          throw new Error('access denied');
        }

        const index = this.virtualDrive.findIndex(
          (element) => element.name === fileName && element.type === 'file'
        );
        this.virtualDrive.splice(index, 1);
        return {
          status: 'successfully',
          body: true,
        };
      }

      const folderPath = [...pathArray];
      const fileName = folderPath.pop();
      const parrentFolder = this.getFolder(folderPath.join('/')).body;

      const file = parrentFolder.find(
        (element) => element.name === fileName && element.type === 'file'
      );
      const accessAllowed = this.checkAccess(file, 'modify');

      if (!accessAllowed) {
        throw new Error('access denied');
      }

      const index = parrentFolder.findIndex(
        (element) => element.name === fileName && element.type === 'file'
      );
      parrentFolder.splice(index, 1);

      return {
        status: 'successfully',
        body: true,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  removeFolder(path) {
    try {
      const isRootDirectory = path === '/';

      if (isRootDirectory) {
        throw new Error('deleting the root directory is forbidden');
      }

      const pathArray = path.split('/');
      const folderPath = [...pathArray];
      const folderName = folderPath.pop();
      const parrentFolder = this.getFolder(
        folderPath.length === 1 ? '/' : folderPath.join('/')
      ).body;
      const folder = parrentFolder.find(
        (element) => element.name === folderName && element.type === 'folder'
      );

      const accessAllowed = this.checkAccess(folder, 'modify');

      if (!accessAllowed) {
        throw new Error('access denied');
      }

      const index = parrentFolder.findIndex(
        (element) => element.name === folderName && element.type === 'folder'
      );
      parrentFolder.splice(index, 1);

      return {
        status: 'successfully',
        body: true,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  updateFile(path, newFile) {
    const file = this.getFile(path);
    file.size = newFile.size;
    file.body = newFile.body;
  }

  renameFolder(path, newName) {
    try {
      const isRootDirectory = path === '/';

      if (isRootDirectory) {
        throw new Error('You cannot rename the root directory');
      }

      const pathArray = path.split('/');
      const folderPath = [...pathArray];
      const folderName = folderPath.pop();
      const parrentFolder = this.getFolder(
        folderPath.length === 1 ? '/' : folderPath.join('/')
      ).body;
      const folder = parrentFolder.find(
        (element) => element.name === folderName && element.type === 'folder'
      );

      const accessAllowed = this.checkAccess(folder, 'modify');

      if (!accessAllowed) {
        throw new Error('access denied');
      }

      const isExists = parrentFolder.find(
        (element) => element.name === newName
      );

      if (isExists) {
        throw new Error('a file with this name already exists');
      }

      folder.name = newName;
      return {
        status: 'successfully',
        body: true,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  renameFile(path, newName) {
    try {
      const pathArray = path.split('/');
      const isRootDirectory = pathArray.length === 2;

      if (isRootDirectory) {
        const fileName = path.slice(1);
        const file = this.virtualDrive.find(
          (element) => element.name === fileName && element.type === 'file'
        );

        const accessAllowed = this.checkAccess(file, 'modify');

        if (!accessAllowed) {
          throw new Error('access denied');
        }

        const isExists = this.virtualDrive.find(
          (element) => element.name === newName
        );

        if (isExists) {
          throw new Error('a file with this name already exists');
        }

        file.name = newName;

        return {
          status: 'successfully',
          body: true,
        };
      }

      const folderPath = [...pathArray];
      const fileName = folderPath.pop();
      const parrentFolder = this.getFolder(folderPath.join('/')).body;
      const file = parrentFolder.find(
        (element) => element.name === fileName && element.type === 'file'
      );

      const accessAllowed = this.checkAccess(file, 'modify');

      if (!accessAllowed) {
        throw new Error('access denied');
      }

      const isExists = parrentFolder.find(
        (element) => element.name === newName
      );

      if (isExists) {
        throw new Error('a file with this name already exists');
      }

      file.name = newName;
      return {
        status: 'successfully',
        body: true,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }
}
