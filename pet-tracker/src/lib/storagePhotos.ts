import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from '../firebase'

// Uploads an already timestamp-stamped photo Blob and returns its public URL.
export async function uploadPhoto(path: string, blob: Blob): Promise<string> {
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, blob, { contentType: blob.type })
  return getDownloadURL(storageRef)
}
