const htmlEl = document.documentElement;

// Initialize theme from localStorage or default to 'auto'
const currentTheme = localStorage.getItem('theme') || 'auto';
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

// Initialize pattern from localStorage or default to 'enabled'
const currentPattern = localStorage.getItem('gradient') || 'enabled';
if (currentPattern) {
    htmlEl.dataset.pattern = currentPattern;
}

const togglePattern = (pattern) => {
    htmlEl.dataset.pattern = pattern;
    localStorage.setItem('gradient', pattern);
}

// Initialize animation from localStorage or default to 'enabled'
const currentAnimation = localStorage.getItem('animation') || 'enabled';
if (currentAnimation) {
    htmlEl.dataset.animation = currentAnimation;
}

const toggleAnimation = (animation) => {
    htmlEl.dataset.animation = animation;
    localStorage.setItem('animation', animation);
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed.');

    // Theme settings
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.addEventListener('change', (event) => {
            const theme = event.target.value;
            console.log(`Theme option changed. Selected theme: ${theme}`);
            toggleTheme(theme);
        });
    });

    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
        console.log(`Setting theme value to: ${storedTheme}`);
        let themeInput = document.querySelector(`input[name="theme-color"][value="${storedTheme}"]`);
        if (themeInput) {  // Check if the element exists
            themeInput.checked = true;
        }
    }

    // Pattern settings
    const patternToggle = document.getElementById('gradient-toggle');
    if (patternToggle) {
        patternToggle.checked = currentPattern === 'enabled';
        patternToggle.addEventListener('change', () => {
            togglePattern(patternToggle.checked ? 'enabled' : 'disabled');
        });
    }

    // Animation settings
    const animationToggle = document.getElementById('animation-toggle');
    if (animationToggle) {
        animationToggle.checked = currentAnimation === 'enabled';
        animationToggle.addEventListener('change', () => {
            toggleAnimation(animationToggle.checked ? 'enabled' : 'disabled');
        });
    }
});
