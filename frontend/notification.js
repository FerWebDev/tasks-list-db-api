// notificaciones.js
/**
 * Crea una notificación
 * @param {object} options - Opciones para la notificación
 * @param {string} options.title - Título de la notificación
 * @param {string} options.description - Descripción de la notificación
 * @param {'success' | 'error'} options.type - Tipo de notificación
 */
export const createNotification = ({ title, description, type }) => {
  const div = document.createElement('div');
  div.className = 'notification';

  div.innerHTML = `
    <p class="notification-title">${title}</p>
    <p class="notification-description">${description}</p>
  `;

  if (type === 'success') {
    div.classList.add('notification-success');
  } else if (type === 'error') {
    div.classList.add('notification-error');
  }

  document.body.appendChild(div);

  setTimeout(() => div.remove(), 3000);
};
