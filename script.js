document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('Formular');

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const data = {
            vorname: form.elements['vorname'].value,
            nachname: form.elements['nachname'].value,
            email: form.elements['email'].value,
            nachricht: form.elements['nachricht'].value,
            zahl: form.elements['zahl'].value,
        };

        // Ajax request to send the form data to the server
        await fetch('/saveToDB', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),

        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text(); // Answer as text
            })
            .then(data => {
                console.log(data); // Show the server response in the console
                document.getElementById('responseMessage').innerText = data;
                clearFields(); // Clear form fields after successful submission
            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
                // Here you can customize the processing of the error message
            });
    });

    const clearFields = () => {
        form.reset(); // Reset the form
        console.log('Fields cleared');
    };
});


