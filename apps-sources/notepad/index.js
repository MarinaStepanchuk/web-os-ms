(async () => {
  const appName = 'notepad';

  const rootElement = document.getElementById('notepad');
  rootElement.style.zIndex = driver.getOpenApps().indexOf(appName) * 10;
  rootElement.addEventListener('mousedown', (event) => {
    if (event.target.closest('.close-button')) {
      return;
    }
    const openApps = driver.getOpenApps();
    if (openApps.at(-1) !== appName) {
      executor.changeIndexesOpenApps(appName);
    }
  });
  let fullScreenMode = false;

  const pathOpenFiles = executor.getPathOpenFiles(appName);
  const filesToOpen = executor.getAppFilesToOpen(appName).map((item) => {
    return {
      file: {
        name: item.name,
        body: item.body,
      },
      editable: false,
    };
  });

  const newFile = {
    file: {
      name: 'Untitled',
      body: '',
      newFile: true,
    },
    editable: false,
  };

  if (!filesToOpen.length) {
    filesToOpen.push(structuredClone(newFile));
  }

  let tabActiveIndex = 0;

  const appWrapper = document.querySelector('.notepad-wrapper');

  const header = document.createElement('header');
  header.classList.add('draggable');
  rootElement.prepend(header);

  const controlPanel = document.createElement('div');
  controlPanel.classList.add('control-panel');
  header.append(controlPanel);

  const turnButton = document.createElement('div');
  turnButton.classList.add('control-button');
  turnButton.classList.add('turn-button');
  turnButton.innerText = '–';

  const expandButton = document.createElement('div');
  expandButton.classList.add('control-button');
  expandButton.classList.add('expand-button');
  expandButton.innerText = '◻';

  const closeButton = document.createElement('div');
  closeButton.classList.add('control-button');
  closeButton.classList.add('close-button');
  closeButton.innerText = '×';

  controlPanel.append(turnButton, expandButton, closeButton);

  closeButton.addEventListener('click', async () => {
    const lastTab = [...tabList.querySelectorAll('.tab-item')].at(-1);
    changeActiveTab(lastTab);
    await closeTabItem();
    executor.closeApp(appName);
  });

  async function closeTabItem() {
    const openTabs = [...tabList.querySelectorAll('.tab-item')].reverse();
    for (let currentElement of openTabs) {
      await removeTab(currentElement);
    }
  }

  expandButton.addEventListener('click', () => {
    if (fullScreenMode) {
      rootElement.style.width = '40%';
      rootElement.style.height = '60%';
      rootElement.style.left = '50%';
      rootElement.style.top = '50%';
      rootElement.style.transform = `translate(-50%, -50%)`;
    } else {
      rootElement.style.width = '100%';
      rootElement.style.height = '100%';
      rootElement.style.left = '0';
      rootElement.style.top = '0';
      rootElement.style.transform = `translate(0, 0)`;
    }
    fullScreenMode = !fullScreenMode;
  });

  const tabListWraper = document.createElement('div');
  tabListWraper.classList.add('tab-list-container');
  appWrapper.append(tabListWraper);
  const tabList = document.createElement('div');
  tabList.classList.add('tab-list');
  const addFileButton = document.createElement('div');
  addFileButton.classList.add('new-file-button');
  addFileButton.innerText = '+';
  tabListWraper.append(tabList, addFileButton);
  const editorContainer = document.createElement('div');
  appWrapper.append(editorContainer);
  editorContainer.classList.add('editor-container');
  editorContainer.setAttribute(
    'data-name',
    filesToOpen[tabActiveIndex].file.name
  );
  editorContainer.setAttribute('data-index', tabActiveIndex);
  const operatingButtons = document.createElement('div');
  operatingButtons.classList.add('operating-buttons');
  const saveButton = document.createElement('span');
  saveButton.classList.add('save-button');
  saveButton.innerText = '✔';
  const cancelButton = document.createElement('span');
  cancelButton.classList.add('cancel-button');
  cancelButton.innerText = '✖';
  operatingButtons.append(saveButton, cancelButton);
  const editor = document.createElement('textarea');
  editor.classList.add('editor');
  editor.value = filesToOpen[tabActiveIndex].file.body || '';
  editorContainer.append(operatingButtons, editor);

  addFileButton.addEventListener('click', createNewTab);
  tabList.addEventListener('click', async (event) => {
    if (!event.target.closest('.tab-item')) {
      return;
    }
    const clickedElement = event.target.closest('.tab-item');

    if (event.target.classList.contains('close-tab-button')) {
      await removeTab(clickedElement);
      return;
    }

    changeActiveTab(clickedElement);
    updateEditor();
  });

  cancelButton.addEventListener('click', (event) => {
    const tabIndex = event.target
      .closest('.editor-container')
      .getAttribute('data-index');
    const removedTab = tabList.querySelector(`[data-index="${tabIndex}"]`);
    closeTab(removedTab);
  });

  saveButton.addEventListener('click', async (event) => {
    const tabIndex = event.target
      .closest('.editor-container')
      .getAttribute('data-index');

    if (!filesToOpen[tabIndex].editable) {
      return;
    }

    await saveFile(tabIndex);
  });

  async function saveFile(tabIndex) {
    const fileObject = filesToOpen[tabIndex];
    const isNewFile = fileObject.file.newFile;
    if (isNewFile) {
      await saveNewFile(fileObject);
    } else {
      await updateFile(fileObject);
    }
  }

  async function saveNewFile(fileObject) {
    const path = prompt('Enter the path to save the file');
    const file = new File([editor.value], `${fileObject.file.name}.txt`, {
      type: 'text/plain',
    });
    const result = await driver.createFile(path, file);
    if (result.status === 'successfully') {
      fileObject.editable = false;
      fileObject.file.newFile = false;
      fileObject.file.body = editor.value;
      await driver.updateDrive();
    } else {
      alert(result.message);
    }
  }

  async function updateFile(fileObject) {
    const file = new File([editor.value], fileObject.file.name, {
      type: 'text/plain',
    });
    const path =
      pathOpenFiles === '/'
        ? `/${fileObject.file.name}.txt`
        : `${pathOpenFiles}/${fileObject.file.name}`;
    const result = await driver.updateFile(path, file);
    if (result.status === 'successfully') {
      fileObject.editable = false;
      fileObject.file.body = editor.value;
      await driver.updateDrive();
    } else {
      alert(result.message);
    }
  }

  async function removeTab(clickedElement) {
    const removeFileIndex = +clickedElement.getAttribute('data-index');
    const removeFileName = clickedElement.getAttribute('data-name');
    const fileObject = filesToOpen[removeFileIndex];

    if (!fileObject.editable) {
      closeTab(clickedElement);
    } else {
      const willSaveFile = confirm(
        `The file ${removeFileName} has been updated. Save before closing?`
      );

      if (willSaveFile) {
        saveCurrentDataFile(removeFileIndex, fileObject.file.body);
        await saveFile(removeFileIndex);
        closeTab(clickedElement);
      } else {
        closeTab(clickedElement);
      }
    }
  }

  function closeTab(removedTab) {
    const removeFileIndex = +removedTab.getAttribute('data-index');

    if (filesToOpen.length === 1) {
      executor.closeApp(appName);
      return;
    }

    removedTab.remove();
    filesToOpen.splice(removeFileIndex, 1);
    const tabs = tabList.querySelectorAll('.tab-item');
    tabs.forEach((tab, index) => {
      tab.setAttribute('data-index', index);
    });

    if (removeFileIndex === tabActiveIndex) {
      tabActiveIndex = filesToOpen.length - 1;
      const element = tabList.querySelector(`[data-index="${tabActiveIndex}"]`);
      changeActiveTab(element);
      updateEditor();
    }
  }

  fillTabList();

  function fillTabList() {
    filesToOpen.forEach((item, index) => {
      const tabItem = createTabItem(item.file);
      if (index === tabActiveIndex) {
        tabItem.classList.add('active-tab');
      }
      tabItem.setAttribute('data-index', index);
      tabList.append(tabItem);
    });
  }

  function createTabItem(file) {
    const tabItem = document.createElement('div');
    tabItem.classList.add('tab-item');
    tabItem.setAttribute('data-name', file.name);
    const fileName = document.createElement('div');
    fileName.classList.add('file-name');
    fileName.innerText = getFileName(file.name);
    const closeButton = document.createElement('div');
    closeButton.classList.add('close-tab-button');
    closeButton.innerText = '×';
    tabItem.append(fileName, closeButton);
    return tabItem;
  }

  function changeActiveTab(newActiveElement) {
    const activeTab = tabList.querySelector('.active-tab');
    if (activeTab) {
      activeTab.classList.remove('active-tab');
      const avtiveTabIndex = +activeTab.getAttribute('data-index');
      saveCurrentDataFile(avtiveTabIndex, editor.value);
    }
    tabActiveIndex = +newActiveElement.getAttribute('data-index');
    newActiveElement.classList.add('active-tab');
  }

  function saveCurrentDataFile(index, text) {
    const fileObject = filesToOpen[index];
    if (!fileObject.editable) {
      return;
    }
    fileObject.file.body = text;
  }

  function createNewTab() {
    const activeTab = tabList.querySelector('.active-tab');
    activeTab.classList.remove('active-tab');
    const avtiveTabIndex = +activeTab.getAttribute('data-index');
    saveCurrentDataFile(avtiveTabIndex, editor.value);
    filesToOpen.push(structuredClone(newFile));
    tabActiveIndex = filesToOpen.length - 1;
    const newItem = createTabItem(filesToOpen[tabActiveIndex].file);
    newItem.classList.add('active-tab');
    newItem.setAttribute('data-index', tabActiveIndex);
    tabList.append(newItem);
    updateEditor();
  }

  function updateEditor() {
    const openFile = filesToOpen[tabActiveIndex].file;
    editorContainer.setAttribute('data-name', openFile.name);
    editorContainer.setAttribute('data-index', tabActiveIndex);
    editor.value = openFile.body;
    editor.focus();
  }

  editor.addEventListener('input', (event) => {
    const text = event.target.value;
    setNewFileName(text);
  });

  function setNewFileName(text) {
    const fileObject = filesToOpen[tabActiveIndex];
    fileObject.editable = true;
    const file = fileObject.file;

    if (!file.newFile) {
      return;
    }

    if (text.length > 20) {
      return;
    }

    const tabItem = tabList.querySelector(`[data-index="${tabActiveIndex}"]`);
    const elementFileName = tabItem.querySelector('.file-name');
    const newName = text;
    file.name = newName;
    elementFileName.innerText = newName;
    editorContainer.setAttribute('data-name', newName);
    editorContainer.setAttribute('data-index', tabActiveIndex);
    tabItem.setAttribute('data-name', newName);
  }

  function getFileName(fileName) {
    if (!fileName.includes('.')) {
      return fileName;
    }

    const array = fileName.split('.');
    array.splice(-1, 1);
    return array.join('.');
  }
})();
