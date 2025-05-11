// utils.js
window.utils = {
  getCountdown: function(birthday) {
    const today = new Date();
    const nextBirthday = new Date(birthday);
    nextBirthday.setFullYear(today.getFullYear());
    if (nextBirthday < today) nextBirthday.setFullYear(today.getFullYear() + 1);
    const diffDays = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
    return `${diffDays} days until birthday! 🎉`;
  },

  getMoodEmoji: function(mood) {
    return mood === 'happy' ? '😊' : mood === 'sad' ? '😞' : '😐';
  },

  formatFirestoreDate: function(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // "YYYY-MM-DD"
  },

  calculateAge: function(dobString) {
    try {
      const birthDate = new Date(dobString);
      const today = new Date();
      let years = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        years--;
      }
      const months = (today.getMonth() + 12 - birthDate.getMonth()) % 12;
      return `${years} years, ${months} months`;
    } catch {
      return 'N/A';
    }
  },

  showErrorToUser: function(message, isSuccess = false) {
    try {
      const errorDiv = document.getElementById('error-message');
      if (!errorDiv) {
        const newErrorDiv = document.createElement('div');
        newErrorDiv.id = 'error-message';
        newErrorDiv.className = isSuccess ? 'success-message' : 'auth-error';
        newErrorDiv.textContent = message;
        document.querySelector('#authContainer').prepend(newErrorDiv);
      } else {
        errorDiv.textContent = message;
        errorDiv.className = isSuccess ? 'success-message' : 'auth-error';
        errorDiv.style.display = 'block';
      }
    } catch (fallbackError) {
      alert(message);
    }
  }
};
