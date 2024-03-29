document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('Formular');

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(form); //create a new FormData object

        //Ajax request to send the form data to the server
        fetch('/saveToDB', {
            method: 'POST',
            body: formData
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text(); // answer as text
            })
            .then(data => {
                console.log(data); // show the server response in the console
                // here you can customize the processing of the server response
            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
                // here you can customize the processing of the error message
            });
    });
});

