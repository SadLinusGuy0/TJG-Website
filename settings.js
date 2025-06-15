// Initialize theme handling
const htmlEl = document.documentElement;
const currentTheme = localStorage.getItem('theme') || 'auto';

// Set initial theme
if (currentTheme) {
    htmlEl.dataset.theme = currentTheme;
}

// Theme toggle function
const toggleTheme = (theme) => {
    htmlEl.dataset.theme = theme;
    localStorage.setItem('theme', theme);
};

// Add event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Find theme radio buttons
    const themeInputs = document.querySelectorAll('input[name="theme"]');
    
    // Set initial checked state
    themeInputs.forEach(input => {
        if (input.value === currentTheme) {
            input.checked = true;
        }
        
        // Add change listener
        input.addEventListener('change', (e) => {
            if (e.target.checked) {
                toggleTheme(e.target.value);
            }
        });
    });
});