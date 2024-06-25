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
const db = firebase.firestore();
const storage = firebase.storage();

// Register user
document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            alert('Registration successful!');
        })
        .catch((error) => {
            alert(error.message);
        });
});

// Login user
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
        })
        .catch((error) => {
            alert(error.message);
        });
});

// Monitor auth state
auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('profile-section').style.display = 'block';
        document.getElementById('username').innerText = user.email;
        loadUserJobs(user.uid);
    } else {
        document.getElementById('auth-section').style.display = 'block';
        document.getElementById('profile-section').style.display = 'none';
    }
});

// File upload handling
document.getElementById('upload-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const file = document.getElementById('blend-file').files[0];
    const frameNumber = document.getElementById('frame-number').value;
    const user = auth.currentUser;

    if (file.size > 1024 * 1024 * 1024) { // 1 GB
        alert('File size exceeds 1 GB');
        return;
    }

    const filePath = `blender_files/${user.uid}/${file.name}`;
    const fileRef = storage.ref(filePath);

    fileRef.put(file).then(() => {
        fileRef.getDownloadURL().then(url => {
            db.collection('jobs').add({
                userId: user.uid,
                fileUrl: url,
                frameNumber: frameNumber,
                status: 'pending'
            }).then(() => {
                alert('File uploaded successfully!');
            }).catch((error) => {
                alert(error.message);
            });
        });
    }).catch((error) => {
        alert(error.message);
    });
});

// Load user jobs and rendered files
function loadUserJobs(userId) {
    db.collection('jobs').where('userId', '==', userId).get().then(querySnapshot => {
        const jobStatus = document.getElementById('job-status');
        const renderedFiles = document.getElementById('rendered-files');
        jobStatus.innerHTML = '';
        renderedFiles.innerHTML = '';

        querySnapshot.forEach(doc => {
            const job = doc.data();
            const jobElement = document.createElement('div');
            jobElement.innerHTML = `Frame ${job.frameNumber}: ${job.status}`;
            jobStatus.appendChild(jobElement);

            if (job.status === 'completed') {
                const imgElement = document.createElement('img');
                imgElement.src = job.renderedImageUrl;
                imgElement.alt = `Frame ${job.frameNumber}`;
                renderedFiles.appendChild(imgElement);
            }
        });
    });
}
