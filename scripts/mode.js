document.addEventListener('DOMContentLoaded', () => {
  const modeToggle = document.getElementById('mode');
  const darkModeEnabled = localStorage.getItem('darkMode') === 'true';

  if (darkModeEnabled) {
    document.body.classList.add('dark-mode');
    modeToggle.textContent = '💡☀️';
  } else {
    modeToggle.textContent = '🕶️ ';
  }

  modeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    modeToggle.textContent = isDark ? '💡' : '🕶️';
  });
});
