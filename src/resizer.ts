import { PSResizeSettings } from '../types/shared';

const MAX_WIDTH = 512;
const MAX_HEIGHT = 512;
const ENCODING = 'image/jpeg';

function dataURItoBlob(dataURI: string): Blob {
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

async function loadFile(reader: FileReader, img: HTMLImageElement, imgBlob: Blob): Promise<void> {
  reader.readAsDataURL(imgBlob);
  return new Promise((resolve) => {
    reader.onload = function onload(e: ProgressEvent<FileReader>): void {
      img.src = e.target?.result as string;
      resolve();
    };
  });
}

async function loadImage(img: HTMLImageElement): Promise<void> {
  return new Promise((resolve) => {
    img.onload = function onload(): void {
      resolve();
    };
  });
}

function drawAndResize(img: HTMLImageElement, resizeSettings?: PSResizeSettings): string | null {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return null;
  }
  ctx.drawImage(img, 0, 0);
  let { width, height } = img;

  const maxWidth = resizeSettings?.maxWidth || MAX_WIDTH;
  const maxHeight = resizeSettings?.maxHeight || MAX_HEIGHT;

  if (width > height && width > maxWidth) {
    height *= maxWidth / width;
    width = maxWidth;
  } else if (height > width && height > maxHeight) {
    width *= maxHeight / height;
    height = maxHeight;
  } else {
    return null;
  }
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL(ENCODING);
}

async function resizeImageFromDataUrl(imgAsDataUrl: string, resizeSettings?: PSResizeSettings): Promise<string | null> {
  const img = new Image();
  img.src = imgAsDataUrl;
  await loadImage(img);
  return drawAndResize(img, resizeSettings) || imgAsDataUrl;
}

async function resizeImage(imgBlob: Blob, resizeSettings?: PSResizeSettings): Promise<Blob | null> {
  if (!(imgBlob instanceof Blob)) {
    return null;
  }

  const img = new Image();
  const reader = new FileReader();
  await loadFile(reader, img, imgBlob);
  await loadImage(img);
  const dataUrl = drawAndResize(img, resizeSettings);
  if (!dataUrl) {
    return new Promise((resolve) => resolve(imgBlob));
  }
  return new Promise((resolve) => resolve(dataURItoBlob(dataUrl)));
}

export { resizeImageFromDataUrl, resizeImage };
