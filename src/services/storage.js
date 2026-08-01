import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

const storage = getStorage();

export function uploadFile(file, path) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file provided'));
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (uploadTask.onProgress) uploadTask.onProgress(progress);
      },
      (error) => reject(error),
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

export function getFileURL(path) {
  return getDownloadURL(ref(storage, path));
}

export function getStorageRef(path) {
  return ref(storage, path);
}

export function deleteFile(path) {
  return deleteObject(ref(storage, path));
}