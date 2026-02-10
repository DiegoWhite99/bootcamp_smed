document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form[action="backend/form/FormContact.php"]');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const submitButton = form.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;

            try {
                submitButton.disabled = true;
                submitButton.textContent = 'Enviando...';

                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData
                });

                const rawText = await response.text();
                let result;
                try {
                    result = JSON.parse(rawText);
                } catch (e) {
                    console.error('Error parsing JSON:', e);
                    throw new Error('El servidor devolvió una respuesta inválida. Revisa la consola para más detalles.');
                }

                if (response.ok) {
                    alert('¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.');
                    form.reset();
                } else {
                    throw new Error(result.message || 'Ocurrió un error al enviar el mensaje.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error: ' + error.message);
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }
});
