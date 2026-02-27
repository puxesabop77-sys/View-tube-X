import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBSPZq2TqjPY-wUzqXYmtrSXqR3H9PLyuY",
  authDomain: "view-tube-x.firebaseapp.com",
  projectId: "view-tube-x",
  storageBucket: "view-tube-x.firebasestorage.app",
  messagingSenderId: "238794910286",
  appId: "1:238794910286:web:85d820232814a7e6fbb11f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Check if user is already logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User login hai, home page par bhejo
        window.location.href = "index.html";
    }
});

window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { 'size': 'normal' });

let confirmationResult;

document.getElementById('send-otp-btn').onclick = async () => {
    const phoneNumber = document.getElementById('phone-number').value;
    try {
        confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
        document.getElementById('phone-section').style.display = 'none';
        document.getElementById('otp-section').style.display = 'block';
    } catch (error) { alert(error.message); }
};

document.getElementById('verify-otp-btn').onclick = async () => {
    const code = document.getElementById('otp-code').value;
    try {
        await confirmationResult.confirm(code);
        // Login success, ab ye browser user ko yaad rakhega
        window.location.href = "index.html";
    } catch (error) { alert("Invalid OTP"); }
};
