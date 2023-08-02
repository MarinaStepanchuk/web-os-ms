(() => {
  const appName = 'app manager';

  const appContainer = document.getElementById('app-manager');
  appContainer.style.zIndex = driver.getOpenApps().indexOf(appName) * 10;
  const rootElement = document.querySelector('.app-manager-wrapper');
  const appDataList = driver
    .readFolder('/apps')
    .body.filter(
      (folder) =>
        folder.name !== 'default icons' &&
        folder.name !== 'login' &&
        folder.name !== 'app manager' &&
        folder.name !== 'desktop'
    );

  document.addEventListener('click', clickOutsideApp);

  function clickOutsideApp(event) {
    const rectApp = rootElement.getBoundingClientRect();
    const clickOutside =
      event.clientX > rectApp.right ||
      event.clientX < rectApp.left ||
      event.clientY > rectApp.bottom ||
      event.clientY < rectApp.top;

    if (clickOutside && !event.target.closest('.modal-wrapper')) {
      closeApp();
    }
  }

  function closeApp() {
    document.removeEventListener('click', clickOutsideApp);
    executor.closeApp(appName);
  }

  const searchContainer = document.createElement('div');
  searchContainer.classList.add('search-container');
  const searchIcon = document.createElement('div');
  searchIcon.classList.add('search-icon');
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.classList.add('search-input');
  searchContainer.append(searchInput, searchIcon);
  searchIcon.innerHTML = '<i class="fa fa-search" aria-hidden="true"></i>';
  const appList = document.createElement('div');
  appList.classList.add('app-list');
  fillAppList(appDataList);
  const userPanel = document.createElement('div');
  userPanel.classList.add('user-panel');
  rootElement.append(searchContainer, appList, userPanel);

  const userInfo = document.createElement('div');
  userInfo.classList.add('user-info');
  const userIcon = document.createElement('div');
  userIcon.classList.add('user-icon');
  const activeUser = hardDrive.getActiveUser();
  const userIconSrc = driver.readFile(`/users/${activeUser}/avatar.jpg`).body
    .body;
  userIcon.style.backgroundImage = `url(${userIconSrc})`;
  const userName = document.createElement('span');
  userName.classList.add('user-name');
  userName.innerText = activeUser;
  userInfo.append(userIcon, userName);
  const offButton = document.createElement('button');

  offButton.classList.add('off-button');
  offButton.innerHTML = '<i class="fa fa-power-off" aria-hidden="true"></i>';

  userPanel.append(userInfo, offButton);

  function fillAppList(list) {
    appList.innerHTML = '';
    list.forEach((appFolder) => {
      const appItem = document.createElement('div');
      appItem.classList.add('app-item');
      const name = appFolder.children.find((file) =>
        file.name.endsWith('exe')
      ).name;
      appItem.setAttribute('data-type', 'exe');
      appItem.setAttribute('data-path', `/apps/${appFolder.name}/${name}`);
      const appIconSrc = appFolder.children.find(
        (file) => file.name === 'icon.png'
      ).body;
      const appName = document.createElement('span');
      appName.classList.add('app-name');
      appName.innerText = name.slice(0, -4);
      const appIcon = document.createElement('div');
      appIcon.classList.add('app-icon');
      appIcon.style.backgroundImage = `url(${appIconSrc})`;
      appItem.append(appIcon, appName);
      appList.append(appItem);
    });
  }

  function getAppNameByPath(path) {
    const app = [...path.split('/').at(-1).split('.')];

    if (app.length === 1) {
      return app.join('.');
    }

    app.splice(-1, 1);
    return app.join('.');
  }

  appList.addEventListener('click', (event) => {
    const appItem = event.target.closest('.app-item');

    if (!appItem) {
      return;
    }

    const appName = getAppNameByPath(appItem.getAttribute('data-path'));
    closeApp();
    executor.startApp(appName);
  });

  searchInput.addEventListener('input', (event) => {
    const value = event.target.value;
    const searchResult = structuredClone(appDataList).filter((appFolder) =>
      appFolder.children
        .find((file) => file.name.endsWith('exe'))
        .name.slice(0, -4)
        .includes(value)
    );
    fillAppList(searchResult);
  });

  offButton.addEventListener('click', () => {
    executor.clearFilesQueue();
    driver.clearBuffer();
    const openedApps = driver.getOpenApps();
    [...openedApps]
      .filter((app) => app !== 'desktop')
      .forEach((app) => executor.closeApp(app));
    hardDrive.setActiveUser('admin');
    executor.closeApp('desktop');
    executor.startApp('login');
  });

  if (activeUser === 'admin') {
    addNewUserButton();
  }

  function addNewUserButton() {
    const newUserButton = document.createElement('button');
    newUserButton.classList.add('new-user-button');
    newUserButton.innerHTML = '<i class="fa fa-plus" aria-hidden="true"></i>';
    userInfo.append(newUserButton);
  }

  const newUserButton = rootElement.querySelector('.new-user-button');
  newUserButton?.addEventListener('click', () => {
    const desktop = document.querySelector('.desktop');
    const modal = createModal();
    desktop.append(modal);

    const closeModalButton = document.querySelector('.close-modal-wrapper');
    closeModalButton.addEventListener('click', () => {
      const modal = document.querySelector('.modal-wrapper');
      modal.remove();
    });

    const newUserForm = document.querySelector('.new-user-form');
    newUserForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const errorMessage = event.target.querySelector('.new-user-error');
      const inputName = event.target.querySelector('.new-user-name-input');
      const inputPassword = event.target.querySelector(
        '.new-user-password-input'
      );
      const newUserPhoto = event.target.querySelector('.new-user-photo');
      try {
        if (inputPassword.value.length < 3) {
          throw new Error('password must be more than 3 characters long');
        }

        if (inputName.value.length < 3) {
          throw new Error('name must be more than 3 characters long');
        }

        const result = driver.createNewUser(
          inputName.value,
          inputPassword.value,
          newUserPhoto.files[0]
        );

        if (result.status === 'error') {
          throw new Error('something went wrong, try again later');
        }

        await driver.updateDrive();
        modal.remove();
      } catch (error) {
        errorMessage.innerText = error.message;
        setTimeout(() => {
          errorMessage.innerText = '';
        }, 3000);
      }
    });

    const inputPhoto = document.querySelector('.new-user-photo');
    inputPhoto.addEventListener('change', (event) => {
      const photo = event.target.files[0];
      const label = newUserForm.querySelector('.new-user-photo-label');
      label.style.backgroundImage = `url(${URL.createObjectURL(photo)})`;
    });
  });

  function createModal() {
    const modalWrapper = document.createElement('div');
    modalWrapper.classList.add('modal-wrapper');
    modalWrapper.setAttribute('data-app', appName);
    const modalContainer = document.createElement('div');
    modalContainer.classList.add('modal-container');
    modalWrapper.append(modalContainer);
    const closeButton = document.createElement('div');
    closeButton.classList.add('close-modal-wrapper');
    closeButton.innerHTML = '<i class="fa fa-times" aria-hidden="true"></i>';
    const form = document.createElement('form');
    form.classList.add('new-user-form');
    const userContainer = document.createElement('div');
    userContainer.classList.add('new-user-info-container');
    const photoLabel = document.createElement('label');
    photoLabel.classList.add('new-user-photo-label');
    photoLabel.style.backgroundImage = `url(${
      driver.readFile(`/apps/${appName}/assets/photo-icon.png`).body.body
    })`;
    const inputPhoto = document.createElement('input');
    inputPhoto.type = 'file';
    inputPhoto.classList.add('new-user-photo');
    photoLabel.append(inputPhoto);
    const userInfo = document.createElement('div');
    userInfo.classList.add('new-user-info');
    const labelName = document.createElement('label');
    labelName.innerText = 'Name';
    labelName.classList.add('new-user-name-label');
    const userNameInput = document.createElement('input');
    userNameInput.classList.add('new-user-name-input');
    userNameInput.type = 'text';
    userNameInput.maxlength = '20';
    userNameInput.classList.add('new-user-name-input');
    labelName.append(userNameInput);
    const labelPassword = document.createElement('label');
    labelPassword.innerText = 'Password';
    labelPassword.classList.add('new-user-password-label');
    const userPasswordInput = document.createElement('input');
    userPasswordInput.classList.add('new-user-password-input');
    userPasswordInput.type = 'text';
    labelPassword.append(userPasswordInput);
    userPasswordInput.classList.add('new-user-password-input');
    userInfo.append(labelName, labelPassword);
    userContainer.append(photoLabel, userInfo);
    const saveUserButton = document.createElement('input');
    saveUserButton.type = 'submit';
    saveUserButton.classList.add('save-user-button');
    saveUserButton.value = 'CREATE USER';
    form.append(userContainer, saveUserButton);
    modalContainer.append(closeButton, form);
    const errorUser = document.createElement('p');
    errorUser.classList.add('new-user-error');
    form.append(errorUser);
    return modalWrapper;
  }
})();
