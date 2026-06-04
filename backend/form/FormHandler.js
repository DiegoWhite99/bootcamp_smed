// Maneja el envío de TODOS los formularios de contacto sin recargar la página.
// Usa delegación de eventos: funciona aunque el formulario se cargue dinámicamente
// (p. ej. el componente <form-contact>). Aplica a cualquier <form> cuyo action
// apunte a FormContact.php
(function () {
    const isContactForm = (form) =>
        form && form.tagName === 'FORM' &&
        (form.getAttribute('action') || '').includes('FormContact.php');

    const getFeedback = (form) => {
        let feedback = form.querySelector('.form-feedback');
        if (!feedback) {
            feedback = document.createElement('p');
            feedback.className = 'form-feedback';
            feedback.setAttribute('role', 'status');
            feedback.setAttribute('aria-live', 'polite');
            feedback.style.cssText =
                'margin-top:16px;font-family:Poppins,sans-serif;font-size:0.9rem;' +
                'text-align:center;display:none;';
            form.appendChild(feedback);
        }
        return feedback;
    };

    const showFeedback = (feedback, msg, ok) => {
        feedback.textContent = msg;
        feedback.style.color = ok ? '#22c55e' : '#ff6b6b';
        feedback.style.display = 'block';
    };

    document.addEventListener('submit', async (e) => {
        const form = e.target;
        if (!isContactForm(form)) return;

        e.preventDefault();

        const feedback = getFeedback(form);
        const submitBtn = form.querySelector('button[type="submit"], button:not([type])');
        const originalHTML = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Enviando...';
        }
        feedback.style.display = 'none';

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { 'Accept': 'application/json' },
            });

            const raw = await response.text();
            let result;
            try {
                result = JSON.parse(raw);
            } catch (_) {
                throw new Error('El servidor devolvió una respuesta inválida.');
            }

            if (response.ok && result.status === 'success') {
                showFeedback(feedback, result.message || '¡Mensaje enviado con éxito!', true);
                form.reset();
            } else {
                throw new Error(result.message || 'Ocurrió un error al enviar el mensaje.');
            }
        } catch (error) {
            showFeedback(feedback, error.message, false);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalHTML;
            }
        }
    });
})();
