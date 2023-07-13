const convertBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    if (
      file.type.includes('text') ||
      file.type.includes('js') ||
      file.type.includes('html') ||
      file.type.includes('css') ||
      file.type.includes('exe')
    ) {
      fileReader.readAsText(file);
    } else {
      fileReader.readAsDataURL(file);
    }

    fileReader.onload = () => {
      resolve(fileReader.result);
    };

    fileReader.onerror = (error) => {
      reject(error);
    };
  });
};
