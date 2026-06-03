import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: 'AIzaSyD86NAom0JEc-hFoD3ma4nfiZw6iCZNNe0',
  authDomain: 'maanaim-e98b5.firebaseapp.com',
  databaseURL: 'https://maanaim-e98b5-default-rtdb.firebaseio.com',
  projectId: 'maanaim-e98b5',
  storageBucket: 'maanaim-e98b5.firebasestorage.app',
  messagingSenderId: '923714332871',
  appId: '1:923714332871:web:97bf1e9756f8f3233376e2',
  measurementId: 'G-NHCZKDNQ7W',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const rtdb = getDatabase(app)
