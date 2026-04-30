import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔴🔴🔴 APNA FIREBASE CONFIG YAHAN PASTE KAREIN 🔴🔴🔴
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_EMAIL = "rainbownouman@gmail.com";

// ---------- LOGIN ----------
window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    if (userCred.user.email === ADMIN_EMAIL) {
      window.location.href = "admin.html";
    } else {
      alert("Not authorized (admin only)");
      await signOut(auth);
    }
  } catch (err) {
    alert("Login failed: " + err.message);
  }
};

// ---------- LOGOUT ----------
window.logout = async function () {
  await signOut(auth);
  window.location.href = "index.html";
};

// ---------- ADD BOOK ----------
window.addBook = async function () {
  const title = document.getElementById("title").value.trim();
  const link = document.getElementById("link").value.trim();
  if (!title || !link) {
    alert("Please fill both fields");
    return;
  }
  try {
    await addDoc(collection(db, "books"), { 
      title: title,
      link: link,
      timestamp: new Date().toISOString()
    });
    alert("Book added!");
    document.getElementById("title").value = "";
    document.getElementById("link").value = "";
    loadBooks();
  } catch (err) {
    alert("Error: " + err.message);
  }
};

// ---------- DELETE BOOK ----------
window.deleteBook = async function (bookId) {
  if (confirm("Delete this book permanently?")) {
    try {
      await deleteDoc(doc(db, "books", bookId));
      alert("Book deleted");
      loadBooks();
    } catch (err) {
      alert("Error: " + err.message);
    }
  }
};

// ---------- LOAD BOOKS (public + admin) ----------
async function loadBooks() {
  try {
    const querySnapshot = await getDocs(collection(db, "books"));
    let html = "";
    querySnapshot.forEach((docSnap) => {
      const book = docSnap.data();
      const bookId = docSnap.id;
      html += `
        <div class="book">
          <h3>📘 ${escapeHtml(book.title)}</h3>
          <a href="${book.link}" target="_blank" rel="noopener noreferrer">
            <button>📥 Download / Read</button>
          </a>
      `;
      if (window.location.pathname.includes("admin.html")) {
        html += `<button onclick="deleteBook('${bookId}')" style="background:#FF6EC7; margin-left:10px;">🗑 Delete</button>`;
      }
      html += `</div>`;
    });
    if (html === "") html = "<p>No books yet. Admin can add books.</p>";

    if (document.getElementById("books")) 
      document.getElementById("books").innerHTML = html;
    if (document.getElementById("bookList")) 
      document.getElementById("bookList").innerHTML = html;
  } catch (err) {
    console.error(err);
  }
}

function escapeHtml(str) {
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// ---------- AUTH CHECK ON ADMIN PAGE ----------
if (window.location.pathname.includes("admin.html")) {
  onAuthStateChanged(auth, (user) => {
    if (!user || user.email !== ADMIN_EMAIL) {
      alert("Unauthorized! Redirecting to login.");
      window.location.href = "login.html";
    } else {
      loadBooks();
    }
  });
} else {
  // Public page (index.html or login.html)
  loadBooks();
}