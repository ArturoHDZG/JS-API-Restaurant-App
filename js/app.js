//* Selectors
const content = document.querySelector('#resumen .contenido');
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

//* Constants
const TEXT_CENTER = 'text-center';

//* Event Listeners
newOrder.addEventListener('click', saveOrder);

//* Functions
/**
 * Handles the process of saving a new order.
 * Validates the form fields, creates a new order object, and displays the order sections.
 * @returns {void}
 */
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
    alert.classList.add('invalid-feedback', 'd-block', TEXT_CENTER);
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

/**
 * Displays the sections that were previously hidden.
 * This function is used to show the sections of the order form after a new order is saved.
 * @returns {void}
 * @example
 // Before calling the function
 //
 <div class="d-none">
 Section 1
 </div>
 //
 <div class="d-none">
 Section 2
 </div>
 displaySections();
 // After calling the function
 //
 <div>
 Section 1
 </div>
 //
 <div>
 Section 2
 </div>
 */
function displaySections() {
  const hideSections = document.querySelectorAll('.d-none');
  hideSections.forEach(section => section.classList.remove('d-none'));
}

/**
 * Fetches the list of saucers from a JSON file and displays them in the order form.
 * @function getSaucers
 * @returns {void}
 * @example
 * getSaucers();
 // This will fetch the saucers from the specified URL, parse the JSON response,
 // and then call the displaySaucers function with the parsed data.
 */
function getSaucers() {
  const URL = './js/db.json';

  fetch(URL)
    .then(response => response.json())
    .then(data => displaySaucers(data));
}

/**
 * Displays the fetched saucers in the order form.
 * This function creates HTML elements for each saucer and appends them to the saucer content section.
 * It also adds an event listener to the quantity input fields to update the order when the value changes.
 * @param {Object[]} saucers - An array of saucer objects. Each saucer object has properties: id, nombre, precio, and categoria.
 * @returns {void}
 * @example
 const saucers = [
 { id: 1, nombre: 'Pizza', precio: 10, categoria: 1 },
 { id: 2, nombre: 'Hamburguesa', precio: 5, categoria: 1 },
 { id: 3, nombre: 'Coca-Cola', precio: 3, categoria: 2 }
 ];
 displaySaucers(saucers);
 */
function displaySaucers(saucers) {
  const saucerContent = document.querySelector('#platillos .contenido');

  saucers.platillos.forEach(saucer => {
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

    saucerContent.appendChild(row);
  });
}

/**
 * Updates the current order with the provided saucer.
 * If the saucer already exists in the order, it updates the quantity.
 * If the quantity is zero, it removes the saucer from the order.
 * @param {Object} addOrder - The saucer to add or update in the order.
 * @param {number} addOrder.id - The unique identifier of the saucer.
 * @param {string} addOrder.nombre - The name of the saucer.
 * @param {number} addOrder.precio - The price of the saucer.
 * @param {number} addOrder.categoria - The category of the saucer.
 * @param {number} addOrder.cantidad - The quantity of the saucer in the order.
 * @returns {void}
 */
function updateOrder(addOrder) {
  const { orden } = costumer;

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

  if (costumer.orden.length) {
    displayResume();
  } else {
    emptyOrderMsg();
  }
}

/**
 * Displays the current order summary in the HTML content section.
 * It creates HTML elements for the mesa number, order time, and each saucer in the order.
 * It also adds a delete button for each saucer to remove it from the order.
 *
 * @function displayResume
 * @returns {void}
 */
function displayResume() {
  const { mesa, hora, orden } = costumer;

  const resume = document.createElement('DIV');
  resume.classList.add('col-md-6', 'card', 'py-2', 'px-3', 'shadow');

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
  orderH3.classList.add('my-4', TEXT_CENTER);
  orderH3.textContent = 'Orden';

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

    const deleteBtn = document.createElement('BUTTON');
    deleteBtn.classList.add('btn', 'btn-danger');
    deleteBtn.textContent = 'Eliminar producto';
    deleteBtn.onclick = function () {
      deleteSaucer(id);
    };

    quantity.appendChild(quantitySpan);
    price.appendChild(priceSpan);
    subTotal.appendChild(subTotalSpan);

    list.appendChild(name);
    list.appendChild(quantity);
    list.appendChild(price);
    list.appendChild(subTotal);
    list.appendChild(deleteBtn);

    saucerGroup.appendChild(list);
  });

  resume.appendChild(orderH3);
  resume.appendChild(table);
  resume.appendChild(time);
  resume.appendChild(saucerGroup);

  content.appendChild(resume);

  tipsForm();
}

/**
 * Deletes a saucer from the current order.
 *
 * @param {number} id - The unique identifier of the saucer to delete.
 * @returns {void}
 */
function deleteSaucer(id) {
  const saucerToDelete = costumer.orden.findIndex(saucer => saucer.id === id);
  costumer.orden.splice(saucerToDelete, 1);

  clearHTML();

  if (costumer.orden.length) {
    displayResume();
  } else {
    emptyOrderMsg();
  }

  const deletedSaucer = `#producto-${id}`;
  const deletedInput = document.querySelector(deletedSaucer);
  deletedInput.value = 0;
}

/**
 * Creates and appends a form to the HTML content section for selecting a tip percentage.
 * The form includes radio buttons for 5%, 10%, and 15% tip options.
 * Each radio button triggers the `calculateTip` function when clicked.
 *
 * @function tipsForm
 * @returns {void}
 */
function tipsForm() {
  const FORM_CHECK = 'form-check';
  const CHECK_INPUT = 'form-check-input';
  const CHECK_LABEL = 'form-check-label';

  const form = document.createElement('DIV');
  form.classList.add('col-md-6', 'form');

  const formDIV = document.createElement('DIV');
  formDIV.classList.add('card', 'py-2', 'px-3', 'shadow');

  const formH3 = document.createElement('H3');
  formH3.classList.add('my-4', TEXT_CENTER);
  formH3.textContent = 'Propina';

  const radio5 = document.createElement('INPUT');
  radio5.classList.add(CHECK_INPUT);
  radio5.type = 'radio';
  radio5.name = 'propina';
  radio5.value = '5';
  radio5.onclick = calculateTip;

  const label5 = document.createElement('LABEL');
  label5.classList.add(CHECK_LABEL);
  label5.textContent = '5%';

  const div5 = document.createElement('DIV');
  div5.classList.add(FORM_CHECK);

  const radio10 = document.createElement('INPUT');
  radio10.classList.add(CHECK_INPUT);
  radio10.type = 'radio';
  radio10.name = 'propina';
  radio10.value = '10';
  radio10.onclick = calculateTip;

  const label10 = document.createElement('LABEL');
  label10.classList.add(CHECK_LABEL);
  label10.textContent = '10%';

  const div10 = document.createElement('DIV');
  div10.classList.add(FORM_CHECK);

  const radio15 = document.createElement('INPUT');
  radio15.classList.add(CHECK_INPUT);
  radio15.type = 'radio';
  radio15.name = 'propina';
  radio15.value = '15';
  radio15.onclick = calculateTip;

  const label15 = document.createElement('LABEL');
  label15.classList.add(CHECK_LABEL);
  label15.textContent = '15%';

  const div15 = document.createElement('DIV');
  div15.classList.add(FORM_CHECK);

  div5.appendChild(radio5);
  div5.appendChild(label5);
  div10.appendChild(radio10);
  div10.appendChild(label10);
  div15.appendChild(radio15);
  div15.appendChild(label15);

  formDIV.appendChild(formH3);
  formDIV.appendChild(div5);
  formDIV.appendChild(div10);
  formDIV.appendChild(div15);

  form.appendChild(formDIV);
  content.appendChild(form);
}

/**
 * Clears the HTML content section by removing all child nodes.
 *
 * @function clearHTML
 * @returns {void}
 */
function clearHTML() {
  while (content.firstChild) {
    content.removeChild(content.firstChild);
  }
}

/**
 * Calculates the subtotal of an order based on the price and quantity of each saucer.
 *
 * @function calculateSubtotal
 * @param {number} price - The price of a saucer.
 * @param {number} quantity - The quantity of a saucer in the order.
 * @returns {string} The subtotal of the order in the format '$[subtotal]'.
 *
 * @example
 // Calculate the subtotal for a saucer with price 10 and quantity 2.
 * const subtotal = calculateSubtotal(10, 2);
 * console.log(subtotal); // Output: '$20'
 */
function calculateSubtotal(price, quantity) {
  return `$${price * quantity}`;
}

/**
 * Calculates the tip amount based on the selected percentage and the order subtotal.
 *
 * @function calculateTip
 * @returns {void}
 *
 * @example
 // Before calling the function
 // costumer = { orden: [...] }
 // selectedTip = '10'
 * calculateTip();
 // After calling the function
 // subtotal = 100
 // tip = 10
 // total = 110
 // displayTotal(subtotal, total, tip);
 */
function calculateTip() {
  const { orden } = costumer;
  let subtotal = 0;

  orden.forEach(saucer => {
    subtotal += saucer.cantidad * saucer.precio;
  });

  const selectedTip = document.querySelector('[name="propina"]:checked').value;
  const tip = (subtotal * parseInt(selectedTip, 10)) / 100;
  const total = subtotal + tip;

  displayTotal(subtotal, total, tip);
}

/**
 * Displays the total of the order, including subtotal, tip, and total.
 *
 * @param {number} subtotal - The subtotal of the order.
 * @param {number} total - The total amount of the order, including subtotal and tip.
 * @param {number} tip - The tip amount calculated based on the selected percentage.
 * @returns {void}
 */
function displayTotal(subtotal, total, tip) {
  const CLASSES_P = ['fw-bold', 'fs-4', 'mt-2'];
  const CLASSES_SPAN = 'fw-normal';

  const totalDiv = document.createElement('DIV');
  totalDiv.classList.add('total-div', 'my-5');

  const subtotalP = document.createElement('P');
  subtotalP.classList.add(...CLASSES_P);
  subtotalP.textContent = 'Subtotal: ';

  const subtotalSpan = document.createElement('SPAN');
  subtotalSpan.classList.add(CLASSES_SPAN);
  subtotalSpan.textContent = `$${subtotal}`;

  subtotalP.appendChild(subtotalSpan);

  const tipsP = document.createElement('P');
  tipsP.classList.add(...CLASSES_P);
  tipsP.textContent = 'Propina: ';

  const tipsSpan = document.createElement('SPAN');
  tipsSpan.classList.add(CLASSES_SPAN);
  tipsSpan.textContent = `$${tip}`;

  tipsP.appendChild(tipsSpan);

  const totalP = document.createElement('P');
  totalP.classList.add(...CLASSES_P);
  totalP.textContent = 'Total: ';

  const totalSpan = document.createElement('SPAN');
  totalSpan.classList.add(CLASSES_SPAN);
  totalSpan.textContent = `$${total}`;

  totalP.appendChild(totalSpan);

  const clearDiv = document.querySelector('.total-div');
  if (clearDiv) {
    clearDiv.remove();
  }

  totalDiv.appendChild(subtotalP);
  totalDiv.appendChild(tipsP);
  totalDiv.appendChild(totalP);

  const form = document.querySelector('.form > div');
  form.appendChild(totalDiv);
}

/**
 * Displays a message in the HTML content section when the order is empty.
 *
 * @function emptyOrderMsg
 * @returns {void}
 *
 * @example
 // Before calling the function
 // content = <div id="content"></div>
 * emptyOrderMsg();
 // After calling the function
 // content = <div id="content">
 //   <p class="text-center">No hay productos en la orden</p>
 // </div>
 */
function emptyOrderMsg() {
  const emptyMsg = document.createElement('P');
  emptyMsg.classList.add(TEXT_CENTER);
  emptyMsg.textContent = 'No hay productos en la orden';

  content.appendChild(emptyMsg);
}
