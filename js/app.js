//* Selectors
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
    const noSaucer = orden.filter(saucer => saucer.id !== addOrder.id);
    costumer.orden = [ ...noSaucer ];
  }

  clearHTML();
  displayResume();
}

function displayResume() {
  const { mesa, hora, orden } = costumer;
  const content = document.querySelector('#resumen .contenido');

  const resume = document.createElement('DIV');
  resume.classList.add('col-md-6', 'card', 'py-5', 'px-3', 'shadow');

  const table = document.createElement('P');
  table.classList.add('fw-bold');
  table.textContent = 'Mesa: ';

  const tableSpan = document.createElement('SPAN');
  tableSpan.classList.add('fw-normal');
  tableSpan.textContent = mesa;

  const time = document.createElement('P');
  time.classList.add('fw-bold');
  time.textContent = 'Hora: ';

  const timeSpan = document.createElement('SPAN');
  timeSpan.classList.add('fw-normal');
  timeSpan.textContent = hora;

  const orderH3 = document.createElement('H3');
  orderH3.classList.add('my-4', 'text-center');
  orderH3.textContent = 'Orden:';

  table.appendChild(tableSpan);
  time.appendChild(timeSpan);

  const saucerGroup = document.createElement('UL');
  saucerGroup.classList.add('list-group');

  orden.forEach(saucer => {
    const { id, nombre, precio, cantidad } = saucer;

    const list = document.createElement('LI');
    list.classList.add('list-group-item');

    const name = document.createElement('H4');
    name.classList.add('my-4');
    name.textContent = nombre;

    const quantity = document.createElement('P');
    quantity.classList.add('fw-bold');
    quantity.textContent = 'Cantidad: ';

    const quantitySpan = document.createElement('SPAN');
    quantitySpan.classList.add('fw-normal');
    quantitySpan.textContent = cantidad;

    const price = document.createElement('P');
    price.classList.add('fw-bold');
    price.textContent = 'Precio: ';

    const priceSpan = document.createElement('SPAN');
    priceSpan.classList.add('fw-normal');
    priceSpan.textContent = '$'+precio;

    const subTotal = document.createElement('P');
    subTotal.classList.add('fw-bold');
    subTotal.textContent = 'Subtotal: ';

    const subTotalSpan = document.createElement('SPAN');
    subTotalSpan.classList.add('fw-normal');
    subTotalSpan.textContent = calculateSubtotal(precio, cantidad);

    quantity.appendChild(quantitySpan);
    price.appendChild(priceSpan);
    subTotal.appendChild(subTotalSpan);

    list.appendChild(name);
    list.appendChild(quantity);
    list.appendChild(price);
    list.appendChild(subTotal);

    saucerGroup.appendChild(list);
  });

  resume.appendChild(table);
  resume.appendChild(time);
  resume.appendChild(orderH3);
  resume.appendChild(saucerGroup);

  content.appendChild(resume);
}

function clearHTML() {
  const content = document.querySelector('#resumen .contenido');

  while (content.firstChild) {
    content.removeChild(content.firstChild);
  }
}

function calculateSubtotal(price, quantity) {
  return `$${price * quantity}`;
}
