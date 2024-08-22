//* Selectors
const resume = document.querySelector('#resumen');
const order = document.querySelector('#guardar-cliente');

//* Variables
let costumer = {
  mesa: '',
  hora: '',
  order: []
};

const categories = {
  1: 'Comida',
  2: 'Bebidas',
  3: 'Postres'
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

    displaySections();
    getSaucers();
  }
}

function displaySections() {
  const hideSections = document.querySelectorAll('.d-none');
  hideSections.forEach(section => section.classList.remove('d-none'));
}

function getSaucers() {
  const URL = 'http://localhost:4000/platillos';

  fetch(URL)
    .then(response => response.json())
    .then(data => displaySaucers(data));
}

function displaySaucers(saucers) {
  const content = document.querySelector('#platillos .contenido');

  saucers.forEach(sauce => {
    const { id, nombre, precio, categoria } = sauce;

    const row = document.createElement('DIV');
    row.classList.add('row', 'border-top', 'py-3');

    const name = document.createElement('DIV');
    name.classList.add('col-md-4');
    name.textContent = nombre;
    row.appendChild(name);

    const price = document.createElement('DIV');
    price.classList.add('col-md-3', 'fw-bold');
    price.textContent = `$${precio}`;
    row.appendChild(price);

    const category = document.createElement('DIV');
    category.classList.add('col-md-3');
    category.textContent = categories[categoria];
    row.appendChild(category);

    const quantity = document.createElement('INPUT');
    quantity.classList.add('form-control');
    quantity.type = 'number';
    quantity.min = 0;
    quantity.max = 100;
    quantity.value = 0;
    quantity.id = `producto-${id}`;

    const quantityDIV = document.createElement('DIV');
    quantityDIV.classList.add('col-md-2');
    quantityDIV.appendChild(quantity);
    row.appendChild(quantityDIV);

    content.appendChild(row);
  });
}
