class MockForm extends HTMLElement {
  constructor() {
    super();

    this.methodFormId = 0;

    this.innerHTML = /*html*/`<div class="flex items-center justify-center p-12">
        <div class="mx-auto w-full max-w-[550px]">
          <form action="/createElement" method="POST">
            <div id="methodForm"></div>

            <div>
              <button
                class="hover:shadow-form rounded-md bg-[#6A64F1] py-3 px-8 text-center text-base font-semibold text-white outline-none"
                id="buttonPost"
              >
                Submit
              </button>
            </div>
          </form>
          <button
                class="hover:shadow-form rounded-md bg-green-400 py-3 px-8 text-center text-base font-semibold text-white outline-none mt-3"
                id="addMethodForm"
              >
                Add Method Form
              </button>
          <p class="mt-3 block text-base font-medium text-[#07074D]" id="urlForm" ></p>
        </div>
      </div>`;


  }

  connectedCallback() {
    this.insertMethodForm();

    const addMethodForm = document.getElementById('addMethodForm');
    addMethodForm.addEventListener('click', this.insertMethodForm.bind(this));

    const button = document.getElementById('buttonPost');
    button.addEventListener('click', this.callApi.bind(this));
  }

  getAllMethodChoices() {
    return ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }

  getFirstFreeChoice() {
    const allSelects = Array.from(document.getElementsByTagName('select'));
    const allSelectsValues = allSelects.map(select => select.value);
    const allChoices = this.getAllMethodChoices();
    return allChoices.find(choice => !allSelectsValues.includes(choice));
  }

  getFreeChoices() {
    const choises = this.getAllMethodChoices();
    const allSelects = Array.from(document.getElementsByTagName('select'));
    const allSelectsValues = allSelects.map(select => select.value);
    const filteredChoises = choises.filter(choise => !allSelectsValues.includes(choise));
    return filteredChoises;
  }

  getMethodForm() {
    this.methodFormId++;
    const firstChoice = this.getFirstFreeChoice();
    const choices = this.getAllMethodChoices().map(choice => {
      const selected = choice === firstChoice ? 'selected' : '';
      return /*html*/`<option value="${choice}" ${selected}>${choice}</option>`
    }).join('');

    return /*html*/`
<div class="-mx-3 flex flex-wrap">
  <div class="w-full px-3 sm:w-1/2">
    <div class="mb-5">
      <button type="button" id="remove_methodForm_${this.methodFormId}" class="bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-4 border-b-4 border-red-700 hover:border-red-500 rounded">
      Remove
      </button>
      <label
        for="method"
        class="mb-3 block text-base font-medium text-[#07074D]"
      >
        Método
      </label>
      <select
        type="text"
        name="method"
        id="method_${this.methodFormId}"
        value="${firstChoice}"
        class="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md">
        ${choices}
      </select>
    </div>
  </div>
</div>
<div class="mb-5">
  <label
    for="guest"
    class="mb-3 block text-base font-medium text-[#07074D]"
  >
    Respuesta esperada. (JSON)
  </label>
  <textarea
  maxlength="200"
  rows="4"
  name="message"
  id="message_${this.methodFormId}"
  placeholder="Type a valid JSON"
  class="w-full resize-none rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
  ></textarea>
</div>`
  }

  insertMethodForm() {
    const form = document.getElementById('methodForm');
    const methodString = this.getMethodForm();
    const methodForm = document.createElement('div');
    methodForm.id = `methodForm_${this.methodFormId}`;
    methodForm.className = 'methodForm_fields'
    methodForm.innerHTML = methodString;
    form.appendChild(methodForm);

    const removeButton = document.getElementById(`remove_methodForm_${this.methodFormId}`);
    removeButton.addEventListener('click', () => this.removeMethodForm.bind(this)(this.methodFormId));

    const textArea = document.getElementById(`message_${this.methodFormId}`)
    textArea.addEventListener('input', this.checkTextArea.bind(this))

    const select = document.getElementById(`method_${this.methodFormId}`)
    select.addEventListener('change', this.setAllSelectsOptions.bind(this))
    this.setAllSelectsOptions()
  }

  removeMethodForm(id) {
    const form = document.getElementById('methodForm');
    const methodForm = document.getElementById(`methodForm_${id}`);
    form.removeChild(methodForm);
    this.setAllSelectsOptions()
  }

  setAllSelectsOptions() {
    const freeOptions = this.getFreeChoices();
    const allSelects = Array.from(document.getElementsByTagName('select'));
    allSelects.forEach(select => {
      const options = Array.from(select.children)
      options.forEach(option => {
        if (option.value === select.value) {
          return
        }

        if (freeOptions.includes(option.value)) {
          option.disabled = false
          option.textContent = option.value
        } else {
          option.disabled = true
          option.textContent = `${option.value} (used)`
        }
      })
    })
  }

  getDataForm() {
    const methodsForm = document.getElementsByClassName('methodForm_fields');
    const jsonToSend = { items: [] }

    Array.from(methodsForm).forEach(methodForm => {
      const method = methodForm.querySelector('select').value;
      const message = methodForm.querySelector('textarea').value;
      jsonToSend.items.push({ method, response: JSON.parse(message) })
    })

    return jsonToSend
  }

  async callApi(event) {
    event.preventDefault();

    const jsonToSend = this.getDataForm();
    const url = document.getElementById('urlForm');
    url.innerHTML = '';

    const body = JSON.stringify(jsonToSend)
    const response = await fetch('/createElement', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body
    });
    const data = await response.json();
    if (data.uuid) {
      url.innerHTML = `Your URL is: /mock?uuid=${data.uuid}`;
    } else {
      url.innerHTML = `Something went wrong ${data.error}`;
    }
  }

  checkTextArea(event) {
    try {
      JSON.parse(event.target.value)
      event.target.classList.remove('border-red-500')
      event.target.classList.remove('focus:border-red-500')
    } catch {
      event.target.classList.add('border-red-500')
      event.target.classList.add('focus:border-red-500')
    }
  }
}

if ('customElements' in window) {
  customElements.define('mock-form', MockForm);
}