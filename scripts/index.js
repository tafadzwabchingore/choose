(() => {
    // Elements
    const navSelect = document.getElementById('nav-select');
    const navHistory = document.getElementById('nav-history');
    const navSignup = document.getElementById('nav-signup');
    const navLogin = document.getElementById('nav-login');
    const navLogout = document.getElementById('nav-logout');

    const sectionSelect = document.getElementById('section-select');
    const sectionHistory = document.getElementById('section-history');
    const sectionSignup = document.getElementById('section-signup');
    const sectionLogin = document.getElementById('section-login');

    const itemsInput = document.getElementById('items-input');
    const numberInput = document.getElementById('number-input');
    const pickBtn = document.getElementById('pick-btn');
    const resultDiv = document.getElementById('result');

    const historyList = document.getElementById('history-list');
    const historyWelcome = document.getElementById('history-welcome');

    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');
    const signupError = document.getElementById('signup-error');
    const loginError = document.getElementById('login-error');

    // In-memory "database"
    let users = JSON.parse(localStorage.getItem('users')) || {};
    // users structure: { username: { password, history: [] } }

    // Current logged in user
    let currentUser = localStorage.getItem('currentUser') || null;

    // Shared public history for not logged in users
    let publicHistory = JSON.parse(localStorage.getItem('publicHistory')) || [];

    // Utility functions
    function saveUsers() {
      localStorage.setItem('users', JSON.stringify(users));
    }
    function savePublicHistory() {
      localStorage.setItem('publicHistory', JSON.stringify(publicHistory));
    }
    function saveCurrentUser(user) {
      if (user) {
        localStorage.setItem('currentUser', user);
      } else {
        localStorage.removeItem('currentUser');
      }
    }

    // Navigation helpers
    function setActiveNav(button) {
      [navSelect, navHistory, navSignup, navLogin, navLogout].forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
    }
    function showSection(section) {
      [sectionSelect, sectionHistory, sectionSignup, sectionLogin].forEach(s => s.style.display = 'none');
      section.style.display = 'block';
    }
    function updateNavButtons() {
      if (currentUser) {
        navSignup.style.display = 'none';
        navLogin.style.display = 'none';
        navLogout.style.display = 'inline-block';
      } else {
        navSignup.style.display = 'inline-block';
        navLogin.style.display = 'inline-block';
        navLogout.style.display = 'none';
      }
    }

    // Random pick function
    function pickRandomItems(items, count) {
      const shuffled = items.slice().sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    }

    // Render history
    function renderHistory() {
    historyList.innerHTML = '';
    let historyToShow = [];
    if (currentUser) {
        historyWelcome.textContent = `Showing history for: ${currentUser}`;
        historyToShow = users[currentUser]?.history || [];
    } else {
        historyWelcome.textContent = 'Showing public history (no login)';
        historyToShow = publicHistory;
    }

    if (historyToShow.length === 0) {
        historyList.innerHTML = '<p>No history to show.</p>';
        return;
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️  Delete Selected';
    deleteBtn.className = 'pick-btn';
    deleteBtn.style.marginBottom = '20px';
    deleteBtn.addEventListener('click', () => {
        deleteSelectedHistory();
    });
    historyList.appendChild(deleteBtn);

    historyToShow.forEach((entry, index) => {
        const div = document.createElement('div');
        div.className = 'history-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.dataset.index = index;
        checkbox.style.marginRight = '10px';

        const date = new Date(entry.date).toLocaleString();
        div.appendChild(checkbox);
        div.appendChild(document.createTextNode(`${date} - Picked: ${entry.picked.join(', ')}`));
        
        historyList.appendChild(div);
    });
    }

    // Delete History
    function deleteSelectedHistory() {
    const checkboxes = historyList.querySelectorAll('input[type="checkbox"]:checked');
    if (checkboxes.length === 0) {
        alert('Please select at least one item to delete.');
        return;
    }

    const indicesToDelete = Array.from(checkboxes).map(cb => parseInt(cb.dataset.index));

    if (currentUser) {
        users[currentUser].history = users[currentUser].history.filter((_, i) => !indicesToDelete.includes(i));
        saveUsers();
    } else {
        publicHistory = publicHistory.filter((_, i) => !indicesToDelete.includes(i));
        savePublicHistory();
    }

    renderHistory();
    }


    // Save selection to history
    function saveSelection(pickedItems) {
      const entry = { date: new Date().toISOString(), picked: pickedItems };
      if (currentUser) {
        users[currentUser].history.push(entry);
        saveUsers();
      } else {
        publicHistory.push(entry);
        savePublicHistory();
      }
    }

    // Navigation click handlers
    navSelect.addEventListener('click', () => {
      setActiveNav(navSelect);
      showSection(sectionSelect);
      resultDiv.textContent = '';
    });
    navHistory.addEventListener('click', () => {
      setActiveNav(navHistory);
      showSection(sectionHistory);
      renderHistory();
    });
    navSignup.addEventListener('click', () => {
      setActiveNav(navSignup);
      showSection(sectionSignup);
      signupError.textContent = '';
      signupForm.reset();
    });
    navLogin.addEventListener('click', () => {
      setActiveNav(navLogin);
      showSection(sectionLogin);
      loginError.textContent = '';
      loginForm.reset();
    });
    navLogout.addEventListener('click', () => {
      currentUser = null;
      saveCurrentUser(null);
      updateNavButtons();
      setActiveNav(navSelect);
      showSection(sectionSelect);
      resultDiv.textContent = '';
      alert('Logged out successfully!');
    });

    // Pick button handler
    pickBtn.addEventListener('click', () => {
      const rawItems = itemsInput.value.trim();
      const count = Number(numberInput.value);

      if (!rawItems) {
        alert('Please enter some items.');
        return;
      }
      if (!count || count < 1) {
        alert('Please enter a valid number to pick.');
        return;
      }

      const items = rawItems.split('\n').map(i => i.trim()).filter(i => i.length > 0);
      if (count > items.length) {
        alert('Number to pick cannot be more than the number of items.');
        return;
      }

      const picked = pickRandomItems(items, count);
      resultDiv.textContent = `Picked: ${picked.join(', ')}`;

      // Save to history
      saveSelection(picked);
    });

    // Signup form submit
    signupForm.addEventListener('submit', e => {
      e.preventDefault();
      signupError.textContent = '';

      const username = signupForm['signup-username'].value.trim();
      const password = signupForm['signup-password'].value;

      if (!username || !password) {
        signupError.textContent = 'Please fill out all fields.';
        return;
      }
      if (users[username]) {
        signupError.textContent = 'Username already exists.';
        return;
      }

      users[username] = { password, history: [] };
      saveUsers();

      alert('Sign up successful! You can now login.');
      // Switch to login page
      navLogin.click();
    });

    // Login form submit
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      loginError.textContent = '';

      const username = loginForm['login-username'].value.trim();
      const password = loginForm['login-password'].value;

      if (!username || !password) {
        loginError.textContent = 'Please fill out all fields.';
        return;
      }
      if (!users[username] || users[username].password !== password) {
        loginError.textContent = 'Invalid username or password.';
        return;
      }

      currentUser = username;
      saveCurrentUser(username);
      updateNavButtons();

      alert(`Welcome, ${username}!`);
      navSelect.click();
    });

    // Initialize page
    updateNavButtons();
    if (currentUser) {
      navSelect.click();
    } else {
      navSelect.click();
    }
  })();