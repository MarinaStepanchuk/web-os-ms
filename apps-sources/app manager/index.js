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

    if (clickOutside) {
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
})();
