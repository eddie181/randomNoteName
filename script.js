document.addEventListener('DOMContentLoaded', () => {
    const keyboard = document.querySelector('.keyboard');
    const keys = document.querySelectorAll('.key');
    const intervalSlider = document.getElementById('intervalSlider');
    const intervalValueDisplay = document.getElementById('intervalValue');
    const noteDisplay = document.getElementById('noteDisplay');
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');

    let selectedNotes = [];
    // Read initial interval from the slider's default value in HTML
    let currentInterval = parseFloat(intervalSlider.value) * 1000;
    let intervalId = null;
    let isRunning = false; // Track if the generator is active

    // --- Functions ---

    // Update the list of currently selected notes
    function updateSelectedNotes() {
        selectedNotes = [];
        keys.forEach(key => {
            if (key.classList.contains('white')) {
                if (key.getAttribute('data-selected') === 'true') {
                    selectedNotes.push(key.getAttribute('data-note'));
                }
            } else if (key.classList.contains('black')) {
                // Add sharp note if selected
                if (key.getAttribute('data-selected-sharp') === 'true') {
                    selectedNotes.push(key.getAttribute('data-note-sharp'));
                }
                // Add flat note if selected
                if (key.getAttribute('data-selected-flat') === 'true') {
                    selectedNotes.push(key.getAttribute('data-note-flat'));
                }
            }
        });
        console.log("Selected Notes:", selectedNotes); // For debugging
    }

    // Generate and display a random note from the selected list, with flash effect
    function generateRandomNote() {
        // Stop if not running or no notes are available
        if (!isRunning || selectedNotes.length === 0) {
            if (selectedNotes.length === 0) {
                noteDisplay.textContent = '--'; // Display placeholder if no notes
            }
            stopGenerator(); // Ensure timer is cleared and buttons are correct
            return;
        }

        // Pick a random note
        const randomIndex = Math.floor(Math.random() * selectedNotes.length);
        const newNote = selectedNotes[randomIndex];

        // Update the text content
        noteDisplay.textContent = newNote;

        // --- Trigger the flash animation ---
        // 1. Remove the class in case the previous animation was interrupted
        noteDisplay.classList.remove('note-flash');
        // 2. Force reflow/repaint (required for quick re-triggering)
        void noteDisplay.offsetWidth;
        // 3. Add the class to start the animation
        noteDisplay.classList.add('note-flash');
    }


    // Start the random note generator
    function startGenerator() {
        // Prevent starting if already running or no notes are selected
        if (isRunning || selectedNotes.length === 0) {
            if (selectedNotes.length === 0) {
                 console.log("Cannot start: No notes selected.");
            }
             if (!isRunning && selectedNotes.length === 0) {
                  startButton.disabled = false;
                  stopButton.disabled = true;
             }
            return;
        }

        console.log(`Starting generator with interval: ${currentInterval}ms`);
        isRunning = true;
        startButton.disabled = true; // Disable Start button
        stopButton.disabled = false; // Enable Stop button

        generateRandomNote(); // Display first note immediately (with flash)
        // Start the interval timer to generate subsequent notes
        intervalId = setInterval(generateRandomNote, currentInterval);
    }

    // Stop the random note generator
    function stopGenerator() {
        if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
        }
        isRunning = false;

        // Remove flash class if stop is hit mid-flash
        noteDisplay.classList.remove('note-flash');

        // Enable Start button ONLY if there are notes selected
        startButton.disabled = (selectedNotes.length === 0);
        stopButton.disabled = true; // Disable Stop button

        console.log("Generator stopped.");
    }

    // Handle clicks on piano keys
    function handleKeyClick(event) {
        const key = event.target.closest('.key');
        if (!key) return; // Exit if click wasn't on a key element

        if (key.classList.contains('white')) {
            // --- White Key Logic: Toggle Selection ---
            const isSelected = key.getAttribute('data-selected') === 'true';
            key.setAttribute('data-selected', !isSelected);
        } else if (key.classList.contains('black')) {
            // --- Black Key Logic: Cycle None -> Flat -> Sharp -> Both -> None ---
            const sharpSelected = key.getAttribute('data-selected-sharp') === 'true';
            const flatSelected = key.getAttribute('data-selected-flat') === 'true';

            if (!sharpSelected && !flatSelected) { // Current: None
                // Next: Flat Only
                key.setAttribute('data-selected-sharp', 'false');
                key.setAttribute('data-selected-flat', 'true');
            } else if (!sharpSelected && flatSelected) { // Current: Flat Only
                // Next: Sharp Only
                key.setAttribute('data-selected-sharp', 'true');
                key.setAttribute('data-selected-flat', 'false');
            } else if (sharpSelected && !flatSelected) { // Current: Sharp Only
                // Next: Both
                key.setAttribute('data-selected-sharp', 'true');
                key.setAttribute('data-selected-flat', 'true');
            } else { // Current: Both
                // Next: None
                key.setAttribute('data-selected-sharp', 'false');
                key.setAttribute('data-selected-flat', 'false');
            }
        }

        // Update the list of available notes
        updateSelectedNotes();

        // If the generator is running, restart it to apply the change
        if (isRunning) {
             stopGenerator(); // Stop the current timer
             if (selectedNotes.length > 0) {
                 startGenerator(); // Restart with the new set of notes
             } else {
                 // If no notes left while running, stop and update display/buttons
                 noteDisplay.textContent = '--';
                 startButton.disabled = true;
                 stopButton.disabled = true; // Already done in stopGenerator
             }
        } else {
            // If not running, just update the Start button's state
             startButton.disabled = (selectedNotes.length === 0);
             // If no notes selected now, clear display
             if (selectedNotes.length === 0) {
                 noteDisplay.textContent = '--';
             }
        }
    }

     // Handle changes on the interval slider
     function handleSliderChange() {
        const value = parseFloat(intervalSlider.value);
        intervalValueDisplay.textContent = value.toFixed(1); // Update display
        currentInterval = value * 1000; // Update interval in milliseconds

        // If the generator is running, restart it with the new interval
        if (isRunning) {
            stopGenerator();
             // Check again if notes are available before restarting
             if (selectedNotes.length > 0) {
                 startGenerator();
             } else {
                 // This case should be rare if it was running, but handle defensively
                 noteDisplay.textContent = '--';
                 startButton.disabled = true;
                 stopButton.disabled = true;
             }
        }
        // If not running, the interval is simply updated for the next time Start is pressed
    }

    // --- Initialization ---

    // Set initial slider value display based on HTML value attribute
    intervalValueDisplay.textContent = parseFloat(intervalSlider.value).toFixed(1);

    // Add event listeners
    keyboard.addEventListener('click', handleKeyClick);
    intervalSlider.addEventListener('input', handleSliderChange);
    startButton.addEventListener('click', startGenerator);
    stopButton.addEventListener('click', stopGenerator);

    // Perform initial setup
    updateSelectedNotes(); // Populate selectedNotes based on default HTML attributes
    // Set initial button states based on whether notes are initially selected
    startButton.disabled = (selectedNotes.length === 0);
    stopButton.disabled = true; // Generator starts stopped
    // Ensure initial display is placeholder if somehow no notes are selected initially
    if (selectedNotes.length === 0) {
         noteDisplay.textContent = '--';
    }

});