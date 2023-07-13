(() => {
  const converterUserData = (data) => {
    const convertedData = window.atob(data.split('base64,')[1]);
    return convertedData.split(',').reduce((acc, item) => {
      const element = item.split(':');
      acc[element[0].trim()] = element[1].trim();
      return acc;
    }, {});
  };

  const usersFolder = driver.readFolder(`/users`);
  const fileActiveUser = usersFolder.find(
    (item) => item.name === 'active-user.txt'
  ).body;

  let activeUser = fileActiveUser
    ? window.atob(fileActiveUser.split('base64,')[1])
    : 'admin';

  const appWrapper = document.querySelector('.login-wrapper');
  const formContainer = document.createElement('div');
  formContainer.classList.add('login-form');
  appWrapper.append(formContainer);

  const form = document.createElement('form');
  form.id = 'register';

  const containerName = document.createElement('div');
  containerName.classList.add('name-container');
  const nameLabel = document.createElement('label');
  nameLabel.innerText = 'Name:';
  const inputName = document.createElement('input');
  inputName.type = 'text';
  nameLabel.append(containerName);
  nameLabel.append(inputName);

  const passwordLabel = document.createElement('label');
  passwordLabel.innerText = 'Password:';
  const inputPassword = document.createElement('input');
  inputPassword.type = 'password';
  passwordLabel.append(inputPassword);

  const errorUser = document.createElement('p');
  errorUser.classList.add('error');

  const submitButton = document.createElement('button');
  submitButton.innerHTML = 'SIGN IN';
  submitButton.classList.add('button-animate');
  form.append(nameLabel, passwordLabel, errorUser, submitButton);

  const folder = driver.readFolder('/apps/login');
  const avatarUser = usersFolder
    .find((user) => user.name === activeUser)
    .children.find((item) => item.name === 'avatar.jpg');
  const avatarUrl = avatarUser
    ? avatarUser.body
    : folder.find((item) => item.name === 'avatar.jpeg').body;
  const avatar = document.createElement('div');
  avatar.style.backgroundImage = `url(${avatarUrl})`;
  avatar.classList.add('avatar');

  formContainer.append(avatar, form);

  const list = document.createElement('ul');
  list.classList.add('close');
  containerName.append(list);

  usersFolder
    .filter((item) => item.type === 'folder')
    .forEach((user) => {
      const itemUser = document.createElement('li');
      itemUser.innerText = user.name;
      list.append(itemUser);

      if (user.name === activeUser) {
        inputName.value = user.name;
        const userData = user.children.find(
          (item) => item.name === 'user.txt'
        ).body;
        const userDataDecodet = converterUserData(userData);
        inputPassword.value =
          user.name === 'admin' && usersFolder.length === 2
            ? userDataDecodet.password
            : '';
      }
    });

  inputName.addEventListener('input', (event) => {
    if (!event.target.value) {
      list.classList.remove('close');
    } else {
      list.classList.add('close');
    }
  });

  list.addEventListener('click', (event) => {
    if (event.target.tagName === 'LI') {
      const name = event.target.innerText;
      activeUser = name;
      list.classList.add('close');
      inputPassword.value = '';
      inputName.value = name;
      const url = usersFolder
        .find((user) => user.name === activeUser)
        .children.find((item) => item.name === 'avatar.jpg');
      avatar.style.backgroundImage = `url(${
        url ? url.body : folder.find((item) => item.name === 'avatar.jpeg').body
      })`;
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = inputName.value;
    const password = inputPassword.value;

    try {
      const user = driver
        .readFolder(`/users/${name}`)
        .find((item) => item.name === 'user.txt').body;
      const userData = converterUserData(user);
      if (userData.password === password && userData.name === name) {
        const file = new File([name], 'active-user.txt', {
          type: 'text/plain',
        });
        driver.updateFile(`/users/active-user.txt`, file);
        driver.updateDrive();
        executor.closeApp('login');
        executor.startApp('desctop');
      } else {
        errorUser.innerText = 'data is incorrect';
        setTimeout(() => {
          errorUser.innerText = '';
        }, 3000);
      }
    } catch (error) {
      errorUser.innerText = 'user not found';
      setTimeout(() => {
        errorUser.innerText = '';
      }, 3000);
    }
  });
})();
