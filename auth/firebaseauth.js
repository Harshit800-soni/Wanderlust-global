import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { getFirestore, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBOKXfPbzuVQ_bjphS8HXHD-CxSI6i9LCQ",
  authDomain: "login-cb510.firebaseapp.com",
  projectId: "login-cb510",
  storageBucket: "login-cb510.firebasestorage.app",
  messagingSenderId: "1060681226682",
  appId: "1:1060681226682:web:94d918618836161e036583",
  measurementId: "G-FJ9ZC83LY8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Expose to window for app.js 
window.fbAuth = auth;
window.fbDb = db;

// Sign Up Logic
const signUpBtn = document.getElementById('submitSignUp');
if (signUpBtn) {
  signUpBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const fName = document.getElementById('fName').value; 
    
    if(!email || !password || !fName) {
      if (typeof showToast === 'function') showToast('⚠️', 'Please fill all fields.');
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential)=>{
      const user = userCredential.user;
      const userData = {
        email: email,
        fullName: fName,
      };
      const userDocRef = doc(db, 'users', user.uid);
      setDoc(userDocRef, userData)
      .then(()=>{
        if (typeof showToast === 'function') showToast('🎉', 'Account created! Redirecting...');
        setTimeout(() => { window.location.href="profile.html"; }, 1000);
      })
      .catch((error)=>{
        console.error("error writing document", error);
      });
    })
    .catch((error)=>{
      const errorCode = error.code;
      if(errorCode === 'auth/email-already-in-use'){
        if (typeof showToast === 'function') showToast('⚠️', 'Email already in use. Please log in instead.');
      } else {
        if (typeof showToast === 'function') showToast('❌', 'An error occurred. Please try again.');
        console.error(error);
      }
    });
  });
}

// Login Logic
const loginBtn = document.getElementById('loginBtn');
if (loginBtn) {
  loginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if(!email || !password) {
      if (typeof showToast === 'function') showToast('⚠️', 'Please enter email and password.');
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      
      if (typeof showToast === 'function') showToast('👋', 'Welcome back! Redirecting...');
      setTimeout(() => { window.location.href="profile.html"; }, 1000);
    })
    .catch((error) => {
      const errorCode = error.code;
      if (errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found' || errorCode === 'auth/invalid-credential') {
        if (typeof showToast === 'function') showToast('❌', 'Invalid email or password.');
      } else {
        if (typeof showToast === 'function') showToast('❌', 'Error logging in. Please try again.');
        console.error(error);
      }
    });
  });
}

// Forgot Password Logic
const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
if (forgotPasswordBtn) {
  forgotPasswordBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;

    if(!email) {
      if (typeof showToast === 'function') showToast('⚠️', 'Please enter your email in the email field to reset your password.');
      return;
    }

    sendPasswordResetEmail(auth, email)
      .then(() => {
        if (typeof showToast === 'function') showToast('✅', 'Password reset email sent! Please check your inbox.');
      })
      .catch((error) => {
        const errorCode = error.code;
        if(errorCode === 'auth/user-not-found') {
          if (typeof showToast === 'function') showToast('❌', 'No user found with this email address.');
        } else {
          if (typeof showToast === 'function') showToast('❌', 'Error sending reset email. Please try again.');
          console.error(error);
        }
      });
  });
}

// Global Auth State Observer
onAuthStateChanged(auth, async (user) => {
  const loginBtn = document.getElementById('nav-login-btn');
  const signupBtn = document.getElementById('nav-signup-btn');
  const profileBtn = document.getElementById('nav-profile-btn');
  const logoutBtn = document.getElementById('nav-logout-btn');
  const mobileProfileLink = document.getElementById('mobile-profile-link');
  const mobileSignupBtn = document.getElementById('mobile-signup-btn');
  const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
  
  if (user) {
    // User is signed in.
    if (window.location.pathname.endsWith('auth.html')) {
      window.location.href = 'profile.html';
      return;
    }

    if (loginBtn) loginBtn.style.display = 'none';
    if (signupBtn) signupBtn.style.display = 'none';
    if (mobileSignupBtn) mobileSignupBtn.style.display = 'none';
    
    // Fetch user data from firestore
    const userDocRef = doc(db, 'users', user.uid);
    try {
      const userSnap = await getDoc(userDocRef);
      let fullName = user.displayName || "Profile";
      if (userSnap.exists()) {
        const data = userSnap.data();
        fullName = data.fullName || fullName;
        
        populateProfilePage(data);
        if (typeof window.renderUserBookings === 'function') {
          window.renderUserBookings();
        }
      }

      if (profileBtn) {
        profileBtn.style.display = 'inline-flex';
        profileBtn.innerHTML = `👤 ${fullName}`;
      }
      if (logoutBtn) {
        logoutBtn.style.display = 'inline-flex';
      }
      if (mobileProfileLink) {
        mobileProfileLink.style.display = 'block';
        mobileProfileLink.innerHTML = `👤 ${fullName}`;
      }
      if (mobileLogoutBtn) {
        mobileLogoutBtn.style.display = 'block';
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  } else {
    // User is signed out.
    if (loginBtn) loginBtn.style.display = 'inline-flex';
    if (signupBtn) signupBtn.style.display = 'inline-flex';
    if (mobileSignupBtn) mobileSignupBtn.style.display = 'flex';
    if (profileBtn) profileBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (mobileProfileLink) mobileProfileLink.style.display = 'none';
    if (mobileLogoutBtn) mobileLogoutBtn.style.display = 'none';
  }
});

// Logout Logic
window.logout = function() {
  signOut(auth).then(() => {
    if (typeof showToast === 'function') showToast('👋', 'Logged out successfully!');
    setTimeout(() => { window.location.href = "index.html"; }, 1000);
  }).catch((error) => {
    console.error("Logout error", error);
  });
};

const navLogoutBtn = document.getElementById('nav-logout-btn');
if (navLogoutBtn) {
  navLogoutBtn.addEventListener('click', window.logout);
}
const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
if (mobileLogoutBtn) {
  mobileLogoutBtn.addEventListener('click', window.logout);
}

// Profile Save Logic
function populateProfilePage(data) {
  const fNameInput = document.getElementById('prof-fname');
  const lNameInput = document.getElementById('prof-lname');
  const emailInput = document.getElementById('prof-email');
  const phoneInput = document.getElementById('prof-phone');
  const addressInput = document.getElementById('prof-address');

  if (fNameInput && data.fullName) {
    const names = data.fullName.split(' ');
    fNameInput.value = names[0] || '';
    if (lNameInput) lNameInput.value = names.slice(1).join(' ') || '';
  } else {
    if (fNameInput && data.firstName) fNameInput.value = data.firstName;
    if (lNameInput && data.lastName) lNameInput.value = data.lastName;
  }
  
  if (emailInput && data.email) emailInput.value = data.email;
  if (phoneInput && data.phone) phoneInput.value = data.phone;
  if (addressInput && data.address) addressInput.value = data.address;
  
  // Update header in profile
  const headerName = document.querySelector('.profile-header__name');
  if (headerName && data.fullName) headerName.textContent = data.fullName;
  else if (headerName && data.firstName) headerName.textContent = `${data.firstName} ${data.lastName || ''}`.trim();
  
  const headerEmail = document.querySelector('.profile-header__email');
  if (headerEmail && data.email) headerEmail.textContent = data.email;
}

const saveProfileBtn = document.getElementById('save-profile-btn');
if (saveProfileBtn) {
  saveProfileBtn.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user) {
      if (typeof showToast === 'function') showToast('❌', 'Please log in to save changes.');
      return;
    }
    
    const fName = document.getElementById('prof-fname').value;
    const lName = document.getElementById('prof-lname').value;
    const email = document.getElementById('prof-email').value;
    const phone = document.getElementById('prof-phone').value;
    const address = document.getElementById('prof-address').value;
    
    const userData = {
      firstName: fName,
      lastName: lName,
      fullName: `${fName} ${lName}`.trim(),
      email: email,
      phone: phone,
      address: address
    };
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, userData, { merge: true });
      if (typeof showToast === 'function') showToast('✅', 'Profile updated successfully!');
      
      // Update header immediately
      const headerName = document.querySelector('.profile-header__name');
      if (headerName) headerName.textContent = userData.fullName;
      const headerEmail = document.querySelector('.profile-header__email');
      if (headerEmail) headerEmail.textContent = userData.email;
      
      // Also update the nav button if on profile page
      const profileBtn = document.getElementById('nav-profile-btn');
      if (profileBtn) profileBtn.innerHTML = `👤 ${userData.fullName}`;
      
    } catch (error) {
      console.error("Error updating profile", error);
      if (typeof showToast === 'function') showToast('❌', 'Error updating profile.');
    }
  });
}
// Booking Logic
import { collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

window.saveBookingToFirebase = async (bookingData) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  const bookingsRef = collection(db, 'bookings');
  const docRef = await addDoc(bookingsRef, {
    ...bookingData,
    uid: user.uid,
    createdAt: serverTimestamp(),
    status: 'confirmed'
  });
  return docRef.id;
};

window.getUserBookings = async () => {
  const user = auth.currentUser;
  if (!user) return [];

  const bookingsRef = collection(db, 'bookings');
  const q = query(bookingsRef, where("uid", "==", user.uid));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

window.cancelBooking = async (bookingId) => {
  const docRef = doc(db, 'bookings', bookingId);
  await deleteDoc(docRef);
};
