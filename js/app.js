//* Selectors
const saucers = document.querySelector('#platillos');
const resume = document.querySelector('#resumen');
const order = document.querySelector('#guardar-cliente');

//* Variables
let costumer = {
  mesa: '',
  hora: '',
  order: []
};

//* Event Listeners
order.addEventListener('click', saveOrder);

//* Functions
function saveOrder() {
  const mesa = document.querySelector('#mesa').value;
  const hora = document.querySelector('#hora').value;
  const emptyFields = [ mesa, hora ].some(field => field === '');

  if (emptyFields) {
    const alertExists = document.querySelector('.invalid-feedback');
    if (alertExists) {
      return;
    }

    const ALERT_DURATION = 3000;
    const alert = document.createElement('DIV');
    alert.classList.add('invalid-feedback', 'd-block', 'text-center');
    alert.textContent = 'Todos los campos son obligatorios';
    document.querySelector('.modal-body form').appendChild(alert);
    setTimeout(() => alert.remove(), ALERT_DURATION);

  } else {
    costumer = { ...costumer, mesa, hora };

    const modalForm = document.querySelector('#formulario');
    const modalBootstrap = bootstrap.Modal.getInstance(modalForm);
    modalBootstrap.hide();
  }
}
