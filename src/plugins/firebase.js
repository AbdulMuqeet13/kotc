import firebase from "firebase/app";
import 'firebase/auth';
import "firebase/firestore";
import "firebase/storage";


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDNkhYP2qNLwxhujM9_2I5CTAAsELX0aLo",
    authDomain: "kings-of-the-curve-sonal.firebaseapp.com",
    projectId: "kings-of-the-curve-sonal",
    storageBucket: "kings-of-the-curve-sonal.appspot.com",
    messagingSenderId: "347848146862",
    appId: "1:347848146862:web:d1ed02b703921c4252523f",
    measurementId: "G-9FZQXBEEQ4"
};

firebase.initializeApp(firebaseConfig);

//utils
const db = firebase.firestore();
const storage = firebase.storage();

const firestore = firebase.firestore

//collections references

const users = db.collection('v2_users')

export {
    db, storage, firestore, users
}

