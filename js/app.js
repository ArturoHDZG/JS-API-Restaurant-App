//* Selectors
const resume = document.querySelector('#resumen');
const newOrder = document.querySelector('#guardar-cliente');

//* Variables
let costumer = {
  mesa: '',
  hora: '',
  orden: []
};

const categories = {
  1: 'Comida',
  2: 'Bebidas',
  3: 'Postres'
};

//* Event Listeners
newOrder.addEventListener('click', saveOrder);

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

  saucers.forEach(saucer => {
    const { id, nombre, precio, categoria } = saucer;

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

    const quantityInput = document.createElement('INPUT');
    quantityInput.classList.add('form-control');
    quantityInput.type = 'number';
    quantityInput.min = 0;
    quantityInput.max = 100;
    quantityInput.value = 0;
    quantityInput.id = `producto-${id}`;

    quantityInput.onchange = function () {
      const cantidad = parseInt(quantityInput.value, 10);
      updateOrder({...saucer, cantidad});
    };

    const quantityDIV = document.createElement('DIV');
    quantityDIV.classList.add('col-md-2');
    quantityDIV.appendChild(quantityInput);
    row.appendChild(quantityDIV);

    content.appendChild(row);
  });
}

function updateOrder(addOrder) {
  let { orden } = costumer;

  if (addOrder.cantidad > 0) {
    if (orden.some(saucer => saucer.id === addOrder.id)) {
      const orderUpdated = orden.map(saucer => {
        if (saucer.id === addOrder.id) {
          saucer.cantidad = addOrder.cantidad;
        }
        return saucer;
      });
      costumer.orden = [ ...orderUpdated ];
    } else {
      costumer.orden = [ ...orden, addOrder ];
    }

  } else {
    console.log('Orden en 0');
  }

  console.log(costumer.orden);
}
