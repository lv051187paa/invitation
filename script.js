let invitees = [];
let currentGuest = null;
let inviteesLoaded = false;

// LocalStorage keys
const STORAGE_KEYS = {
    CURRENT_GUEST: 'invitation_current_guest',
    EMAIL_SENT: 'invitation_email_sent'
};

document.addEventListener('DOMContentLoaded', function() {
    // Initialize EmailJS with your public key
    emailjs.init('YN-_wdGq5xFs99cQ-');
    
    // Check if email was already sent
    const emailSent = localStorage.getItem(STORAGE_KEYS.EMAIL_SENT);
    if (emailSent === 'true') {
        // Restore guest and show thank you message
        restoreGuestFromStorage();
        if (currentGuest) {
            showInvitation(currentGuest);
            showMessage('Дякуємо! Ваша позитивна відповідь вже була прийнята.', 'success');
            const form = document.getElementById('invitation-form');
            if (form) {
                form.classList.add('hidden');
            }
            // Hide the "not me" link since email was already sent
            const notMeLink = document.getElementById('not-me-link');
            if (notMeLink) {
                notMeLink.parentElement.classList.add('hidden');
            }
        }
        return;
    }
    
    // Try to restore guest from localStorage
    restoreGuestFromStorage();
    if (currentGuest) {
        // Guest was previously selected, show invitation directly
        showInvitation(currentGuest);
    }
    
    // Load invitees data
    loadInvitees();
    
    // Setup search form
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }
    
    // Setup "not me" link
    const notMeLink = document.getElementById('not-me-link');
    if (notMeLink) {
        notMeLink.addEventListener('click', handleNotMe);
    }
    
    // Setup "back to search" link
    const backToSearchLink = document.getElementById('back-to-search-link');
    if (backToSearchLink) {
        backToSearchLink.addEventListener('click', handleBackToSearch);
    }
    
    // Setup invitation form buttons
    const buttons = document.querySelectorAll('#invitation-form .btn-custom');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.getAttribute('data-response')) {
                e.preventDefault();
                const response = this.getAttribute('data-response');
                sendResponse(response);
            }
        });
    });
});

function restoreGuestFromStorage() {
    const storedGuest = localStorage.getItem(STORAGE_KEYS.CURRENT_GUEST);
    if (storedGuest) {
        try {
            currentGuest = JSON.parse(storedGuest);
        } catch (error) {
            console.error('Error parsing stored guest:', error);
            localStorage.removeItem(STORAGE_KEYS.CURRENT_GUEST);
        }
    }
}

function saveGuestToStorage(guest) {
    currentGuest = guest;
    localStorage.setItem(STORAGE_KEYS.CURRENT_GUEST, JSON.stringify(guest));
}

async function loadInvitees() {
    try {
        const response = await fetch('invitees.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        invitees = await response.json();
        inviteesLoaded = true;
        console.log('Loaded invitees:', invitees);
    } catch (error) {
        console.error('Error loading invitees:', error);
        inviteesLoaded = false;
        // Don't show error immediately - only show when user tries to search
    }
}

function handleSearch(e) {
    e.preventDefault();
    
    // Check if invitees are loaded
    if (!inviteesLoaded || invitees.length === 0) {
        showSearchError('Помилка завантаження даних. Будь ласка, оновіть сторінку.');
        return;
    }
    
    const lastNameInput = document.getElementById('lastName-input');
    const lastName = lastNameInput.value.trim();
    
    if (!lastName) {
        showSearchError('Будь ласка, введіть прізвище');
        return;
    }
    
    // Search for all guests with matching last name (case-insensitive)
    const matchingGuests = invitees.filter(invitee => 
        invitee.lastName.toLowerCase() === lastName.toLowerCase()
    );
    
    if (matchingGuests.length === 0) {
        showSearchError('На жаль, ваше прізвище не знайдено в списку запрошених. Перевірте правильність написання.');
    } else if (matchingGuests.length === 1) {
        // Only one match, go directly to invitation
        saveGuestToStorage(matchingGuests[0]);
        showInvitation(matchingGuests[0]);
    } else {
        // Multiple matches, show selection screen
        showSelectionScreen(matchingGuests);
    }
}

function handleNotMe(e) {
    e.preventDefault();
    
    // Clear current guest from localStorage
    localStorage.removeItem(STORAGE_KEYS.CURRENT_GUEST);
    currentGuest = null;
    
    // Hide invitation screen
    const invitationScreen = document.getElementById('invitation-screen');
    if (invitationScreen) {
        invitationScreen.classList.add('hidden');
    }
    
    // Clear and show search screen
    const searchScreen = document.getElementById('search-screen');
    const lastNameInput = document.getElementById('lastName-input');
    if (searchScreen) {
        searchScreen.classList.remove('hidden');
    }
    if (lastNameInput) {
        lastNameInput.value = '';
        lastNameInput.focus();
    }
}

function showSelectionScreen(guests) {
    // Hide search screen
    const searchScreen = document.getElementById('search-screen');
    if (searchScreen) {
        searchScreen.classList.add('hidden');
    }
    
    // Populate selection list
    const selectionList = document.getElementById('selection-list');
    if (selectionList) {
        selectionList.innerHTML = '';
        
        guests.forEach((guest, index) => {
            const item = document.createElement('div');
            item.className = 'selection-item';
            item.innerHTML = `
                <div class="selection-item-photo">
                    <img src="${guest.photo}" alt="${guest.firstName}">
                </div>
                <div class="selection-item-name">
                    ${guest.firstName} ${guest.lastName}
                </div>
            `;
            item.addEventListener('click', () => handleGuestSelection(guest));
            selectionList.appendChild(item);
        });
    }
    
    // Show selection screen
    const selectionScreen = document.getElementById('selection-screen');
    if (selectionScreen) {
        selectionScreen.classList.remove('hidden');
    }
}

function handleBackToSearch(e) {
    e.preventDefault();
    
    // Hide selection screen
    const selectionScreen = document.getElementById('selection-screen');
    if (selectionScreen) {
        selectionScreen.classList.add('hidden');
    }
    
    // Clear and show search screen
    const searchScreen = document.getElementById('search-screen');
    const lastNameInput = document.getElementById('lastName-input');
    if (searchScreen) {
        searchScreen.classList.remove('hidden');
    }
    if (lastNameInput) {
        lastNameInput.value = '';
        lastNameInput.focus();
    }
}

function handleGuestSelection(guest) {
    // Hide selection screen
    const selectionScreen = document.getElementById('selection-screen');
    if (selectionScreen) {
        selectionScreen.classList.add('hidden');
    }
    
    // Save selected guest and show invitation
    saveGuestToStorage(guest);
    showInvitation(guest);
}

function showSearchError(message) {
    const errorDiv = document.getElementById('search-error');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
        
        // Hide error after 5 seconds
        setTimeout(() => {
            errorDiv.classList.add('hidden');
        }, 5000);
    }
}

function showInvitation(guest) {
    // Hide search screen
    const searchScreen = document.getElementById('search-screen');
    if (searchScreen) {
        searchScreen.classList.add('hidden');
    }
    
    // Update invitation with guest data
    const guestPhoto = document.getElementById('guest-photo');
    const guestName = document.getElementById('guest-name');
    
    if (guestPhoto) {
        guestPhoto.src = guest.photo;
    }
    if (guestName) {
        guestName.textContent = `${guest.firstName} ${guest.lastName}`;
    }
    
    // Show invitation screen
    const invitationScreen = document.getElementById('invitation-screen');
    if (invitationScreen) {
        invitationScreen.classList.remove('hidden');
    }
}

function sendResponse(response) {
    const buttons = document.querySelectorAll('.btn-custom');
    const form = document.getElementById('invitation-form');
    const messageContainer = document.getElementById('message-container');
    
    // Check if email was already sent
    const emailSent = localStorage.getItem(STORAGE_KEYS.EMAIL_SENT);
    if (emailSent === 'true') {
        showMessage('Ваша відповідь вже була надіслана раніше.', 'error');
        return;
    }
    
    // Handle rejection with joke screen
    if (response === 'rejected') {
        showRejectionScreen();
        return;
    }
    
    buttons.forEach(btn => btn.disabled = true);

    // EmailJS parameters with separate first and last name
    const templateParams = {
        response: response,
        first_name: currentGuest ? currentGuest.firstName : 'Unknown',
        last_name: currentGuest ? currentGuest.lastName : 'Unknown',
        date: new Date().toLocaleString('uk-UA'),
        ip: 'N/A (GitHub Pages)' // IP not available on static sites
    };

    emailjs.send('service_3z5j3uy', 'template_tut1o6f', templateParams)
        .then(function(response) {
            console.log('SUCCESS!', response.status, response.text);
            
            // Mark email as sent in localStorage
            localStorage.setItem(STORAGE_KEYS.EMAIL_SENT, 'true');
            
            showMessage('Дякуємо! Ваша відповідь прийнята. Чекаємо вас 31 січня з чимось смачненьким. Час узгодино враховуючи ваших міні босів :)', 'success');
            if (form) {
                form.classList.add('hidden');
            }
        }, function(error) {
            console.log('FAILED...', error);
            showMessage('Вибачте, сталася помилка при надсиланні вашої відповіді. Спробуйте ще раз.', 'error');
            buttons.forEach(btn => btn.disabled = false);
        });
}

function showRejectionScreen() {
    // Hide invitation screen
    const invitationScreen = document.getElementById('invitation-screen');
    if (invitationScreen) {
        invitationScreen.classList.add('hidden');
    }
    
    // Show rejection screen
    const rejectionScreen = document.getElementById('rejection-screen');
    if (rejectionScreen) {
        rejectionScreen.classList.remove('hidden');
    }
}

function showMessage(message, type) {
    const messageContainer = document.getElementById('message-container');
    if (messageContainer) {
        messageContainer.innerHTML = `
            <div class="alert-custom alert-${type}">
                ${message}
            </div>
        `;
    }
}
