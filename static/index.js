(() => {
  const root = document.getElementById('root');

  const spinner = document.createElement('div');
  spinner.classList.add('spinner');
  root.append(spinner);

  const drive = loadScript('/drive');
  drive.onload = () => {
    const driver = loadScript('/driver');
    driver.onload = () => {
      loadScript('/executor');
    };
  };

  function loadScript(path) {
    const script = document.createElement('script');
    script.src = path;
    document.body.append(script);
    return script;
  }
})();
