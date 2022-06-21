const MAX_WIDTH = 512;
const MAX_HEIGHT = 512;
const ENCODING = 'image/jpg';

function dataURItoBlob(dataURI) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  const byteString = atob(dataURI.split(',')[1]);
  // separate out the mime component
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  // write the bytes of the string to an ArrayBuffer
  const ab = new ArrayBuffer(byteString.length);
  // create a view into the buffer
  const ia = new Uint8Array(ab);
  // set the bytes of the buffer to the correct values
  for (let i = 0; i < byteString.length; i += 1) {
    ia[i] = byteString.charCodeAt(i);
  }
  // write the ArrayBuffer to a blob, and you're done
  const blob = new Blob([ab], { type: mimeString });
  return blob;
}

function loadFile(reader, img, imgBlob) {
  reader.readAsDataURL(imgBlob);
  return new Promise(((resolve) => {
    reader.onload = function onload(e) {
      img.src = e.target.result;
      resolve();
    };
  }));
}

async function resizeImage(imgBlob) {
  if (!(imgBlob instanceof Blob)) {
    return null;
  }

  const canvas = document.createElement('canvas');
  const img = new Image();
  const reader = new FileReader();
  await loadFile(reader, img, imgBlob);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  let { width, height } = img;
  if (width > height) {
    if (width > MAX_WIDTH) {
      height *= MAX_WIDTH / width;
      width = MAX_WIDTH;
    }
  } else if (height > MAX_HEIGHT) {
    width *= MAX_HEIGHT / height;
    height = MAX_HEIGHT;
  }
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);
  const dataUrl = canvas.toDataURL(ENCODING);
  return new Promise(async resolve => resolve(dataURItoBlob(dataUrl)));
}

module.exports = {
  resizeImage,
};
