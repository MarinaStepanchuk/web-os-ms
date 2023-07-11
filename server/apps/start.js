(async () => {
  const response = await fetch('http://localhost:3001/drive');
  const drive = await response.json();

  console.log(drive);
})();
