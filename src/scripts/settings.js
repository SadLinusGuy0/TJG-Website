// JavaScript code for handling theme and settings
const htmlEl = document.documentElement;
const currentTheme = localStorage.getItem('theme') || 'auto';

// Set the initial theme based on localStorage or default to 'auto'
if (currentTheme) {
    console.log(`Initial theme set to: ${currentTheme}`);
    htmlEl.dataset.theme = currentTheme;
} else {
    console.log("No theme found in localStorage, setting to 'auto'.");
}

const toggleTheme = (theme) => {
    console.log(`Toggling theme to: ${theme}`);
    htmlEl.dataset.theme = theme;
    localStorage.setItem('theme', theme);
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed.');
    const form = document.getElementById('settings');
    const themeOptions = document.querySelectorAll('.theme-option');

    const initializeForm = () => {
        if (!form) {
            console.log('Settings form not found.');
            return;
        }

        console.log('Settings form found.');

        themeOptions.forEach(option => {
            option.addEventListener('change', (event) => {
                const theme = event.target.value;
                console.log(`Theme option changed. Selected theme: ${theme}`);
                toggleTheme(theme);
            });
        });

        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            console.log(`Setting form theme value to: ${storedTheme}`);
            document.querySelector(`input[name="theme-color"][value="${storedTheme}"]`).checked = true;
        }
    };

    initializeForm();
});
