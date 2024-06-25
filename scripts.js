// scripts.js
// Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const storage = firebase.storage();

// Elements
const authContainer = document.getElementById('auth-container');
const profileContainer = document.getElementById('profile-container');
const formTitle = document.getElementById('form-title');
const authForm = document.getElementById('auth-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submit-btn');
const toggleAuth = document.getElementById('toggle-auth');
const usernameDisplay = document.getElementById('username-display');
const uploadForm = document.getElementById('upload-form');
const blendFileInput = document.getElementById('blend-file');
const frameNumberInput = document.getElementById('frame-number');
const filesList = document.getElementById('files-list');

let isRegistering = false;

// Toggle between login and registration
toggleAuth.addEventListener('click', () => {
    isRegistering = !isRegistering;
    formTitle.textContent = isRegistering ? 'Register' : 'Login';
    submitBtn.textContent = isRegistering ? 'Register' : 'Login';
    toggleAuth.innerHTML = isRegistering ? 'Already have an account? <a href="#">Login</a>' : 'Don\'t have an account? <a href="#">Register</a>';
});

// Handle form submission
authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = usernameInput.value;
    const password = passwordInput.value;

    if (isRegistering) {
        auth.createUserWithEmailAndPassword(username, password)
            .then(() => {
                alert('User registered successfully');
            })
            .catch(error => {
                alert(error.message);
            });
    } else {
        auth.signInWithEmailAndPassword(username, password)
            .then(() => {
                window.location.href = 'profile.html';
            })
            .catch(error => {
                alert(error.message);
            });
    }
});

// Check user state
auth.onAuthStateChanged(user => {
    if (user) {
        if (window.location.pathname.endsWith('profile.html')) {
            usernameDisplay.textContent = user.email;
            loadRenderedFiles(user.uid);
        } else {
            window.location.href = 'profile.html';
        }
    } else {
        if (window.location.pathname.endsWith('profile.html')) {
            window.location.href = 'index.html';
        }
    }
});

// Handle file upload
uploadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const file = blendFileInput.files[0];
    const frameNumber = frameNumberInput.value;

    if (file && file.size <= 1 * 1024 * 1024 * 1024) { // 1GB limit
        const user = auth.currentUser;
        const storageRef = storage.ref(`blenderFiles/${user.uid}/${file.name}`);
        storageRef.put(file).then(snapshot => {
            storageRef.updateMetadata({ customMetadata: { frameNumber } });
            alert('File uploaded successfully');
        }).catch(error => {
            alert(error.message);
        });
    } else {
        alert('Please upload a .blend file smaller than 1GB');
    }
});

// Load rendered files
function loadRenderedFiles(uid) {
    const filesRef = storage.ref(`renderedFiles/${uid}`);
    filesRef.listAll().then(result => {
        filesList.innerHTML = '';
        result.items.forEach(fileRef => {
            fileRef.getDownloadURL().then(url => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="${url}" target="_blank">${fileRef.name}</a>`;
                filesList.appendChild(li);
            });
        });
    }).catch(error => {
        alert(error.message);
    });
}
