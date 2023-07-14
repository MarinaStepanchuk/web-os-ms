(() => {
  const root = document.getElementById('root');
  const spinner = document.createElement('div');
  spinner.classList.add('spinner');
  root.append(spinner);
  const scriptDrive = document.createElement('script');
  scriptDrive.src = '/drive';
  scriptDrive.onload = () => {
    const scriptDriver = document.createElement('script');
    scriptDriver.src = '/driver';
    scriptDriver.onload = () => {
      const scriprExecutor = document.createElement('script');
      scriprExecutor.src = '/executor';
      document.body.append(scriprExecutor);
    };
    document.body.append(scriptDriver);
  };
  document.body.append(scriptDrive);
})();
