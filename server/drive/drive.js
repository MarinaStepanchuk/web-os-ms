const drive = [
  {
    id: 1,
    name: 'apps',
    type: 'folder',
    children: [
      {
        id: 2,
        name: 'start.js',
        type: 'file',
        size: 134,
        body: "(async () => {const response = await fetch('http://localhost:3001/drive');const drive = await response.json();console.log(drive);})();",
      },
    ],
  },
];

export default drive;
