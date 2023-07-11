(async () => {
  const root = document.getElementById('root');
  const spinner = document.createElement('div');
  spinner.classList.add('spinner');
  root.append(spinner);

  // const responseDrive = await fetch('http://localhost:3001/drive');
  // const drive = await responseDrive.blob();

  const scriptDrive = document.createElement('script');
  scriptDrive.src = '/drive';
  // scriptDrive.src = URL.createObjectURL(drive);
  // scriptDrive.defer = true;
  // scriptDrive.type = 'module';
  document.body.append(scriptDrive);

  // const responseDriver = await fetch('http://localhost:3001/driver');
  // const driver = await responseDriver.blob();

  const scriptDriver = document.createElement('script');
  scriptDriver.src = '/driver';
  // scriptDriver.src = URL.createObjectURL(driver);
  // scriptDriver.defer = true;
  // scriptDriver.type = 'module';
  document.body.append(scriptDriver);
})();
