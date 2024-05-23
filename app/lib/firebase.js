import { initializeApp } from "firebase/app";
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage'
import { v4 } from 'uuid'

const firebaseConfig = {
    apiKey: "AIzaSyAddgsQWYczTfSkGdC_GCDB2zf3oUTa2dU",
    authDomain: "espindola-af8f7.firebaseapp.com",
    projectId: "espindola-af8f7",
    storageBucket: "espindola-af8f7.appspot.com",
    messagingSenderId: "668421265262",
    appId: "1:668421265262:web:bd7baa16b66cde36c7937f"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app)

export async function uploadFile(file) {
    const storageRef = ref(storage, v4())
    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)
    return url
}