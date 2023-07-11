(async () => {
  const response = await fetch('http://localhost:3001/start');
  const startApp = await response.json();

  const root = document.getElementById('root');
  const spinner = document.createElement('div');
  spinner.classList.add('spinner');
  root.append(spinner);

  const script = document.createElement('script');
  script.id = 'start-script';
  script.innerHTML = startApp.body;
  document.body.append(script);
})();
