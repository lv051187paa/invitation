document.addEventListener('DOMContentLoaded', function() {
    // Initialize EmailJS with your public key
    emailjs.init('YN-_wdGq5xFs99cQ-');
    
    const buttons = document.querySelectorAll('.btn-custom');
    const form = document.getElementById('invitation-form');
    const messageContainer = document.getElementById('message-container');

    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const response = this.getAttribute('data-response');
            sendResponse(response);
        });
    });

    function sendResponse(response) {
        buttons.forEach(btn => btn.disabled = true);

        // EmailJS parameters
        const templateParams = {
            response: response,
            date: new Date().toLocaleString('uk-UA'),
            ip: 'N/A (GitHub Pages)' // IP not available on static sites
        };

        emailjs.send('service_3z5j3uy', 'template_tut1o6f', templateParams)
            .then(function(response) {
                console.log('SUCCESS!', response.status, response.text);
                showMessage('Дякуємо! Ваша відповідь прийнята. Чекаємо вас 17 січня о 15 годині з чимось смачненьким.', 'success');
                form.classList.add('hidden');
            }, function(error) {
                console.log('FAILED...', error);
                showMessage('Вибачте, сталася помилка при надсиланні вашої відповіді. Спробуйте ще раз.', 'error');
                buttons.forEach(btn => btn.disabled = false);
            });
    }

    function showMessage(message, type) {
        messageContainer.innerHTML = `
            <div class="alert-custom alert-${type}">
                ${message}
            </div>
        `;
    }
});
