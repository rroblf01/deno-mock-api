class MockForm extends HTMLElement {
  constructor() {
    super();

    this.methodFormId = 0;
    this.methodsUsedPath = {
      GET: {},
      POST: {},
      PUT: {},
      DELETE: {},
      PATCH: {}
    }

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
<label for="guest" class="mb-3 block text-base font-medium text-[#07074D]">Path</label>
<input type="text" name="path" id="path_${this.methodFormId}" value="/" class="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md">
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
    const methodFormId = this.methodFormId;

    const methodForm = document.createElement('div');
    methodForm.id = `methodForm_${methodFormId}`;
    methodForm.className = 'methodForm_fields'
    methodForm.innerHTML = methodString;
    form.appendChild(methodForm);

    const removeButton = document.getElementById(`remove_methodForm_${methodFormId}`);
    removeButton.addEventListener('click', () => this.removeMethodForm.bind(this)(methodFormId));

    const textArea = document.getElementById(`message_${methodFormId}`)
    textArea.addEventListener('input', this.checkTextArea.bind(this))

    const path = document.getElementById(`path_${methodFormId}`)
    path.addEventListener('input', this.inputController.bind(this))

    const select = document.getElementById(`method_${methodFormId}`)
    this.methodsUsedPath[select.value][methodFormId] = '/'
    select.addEventListener('change', this.setAllSelectsOptions.bind(this))
    this.setAllSelectsOptions()
  }

  inputController(event) {
    const id = event.target.id.split('_')[1]
    const method = document.getElementById(`method_${id}`).value
    const path = document.getElementById(`path_${id}`).value
    this.fillPath(id, method, path)
  }

  fillPath(id, method, path) {
    this.getAllMethodChoices().forEach(choice => {
      this.methodsUsedPath[choice][id] = method === choice ? path : undefined
    })

    const childrenArray = Array.from(document.getElementById(`method_${id}`).children)
    this.setUsedOptions(childrenArray, id)
  }


  removeMethodForm(id) {
    const form = document.getElementById('methodForm');
    const methodForm = document.getElementById(`methodForm_${id}`);
    form.removeChild(methodForm);
    this.setAllSelectsOptions()
  }

  setAllSelectsOptions() {
    const allSelects = Array.from(document.getElementsByTagName('select'));

    allSelects.forEach(select => {
      const selectId = select.id.split('_')[1]
      const selectMethod = select.value
      const selectPath = document.getElementById(`path_${selectId}`).value
      this.fillPath(selectId, selectMethod, selectPath)
    })
  }

  setUsedOptions(childrensArray, selectId) {
    childrensArray.forEach(option => {
      const optionPath = document.getElementById(`path_${selectId}`).value
      const someWithSamePath = Object.values(this.methodsUsedPath[option.value]).some(path => path === optionPath)

      option.disabled = someWithSamePath ? true : false
      option.textContent = someWithSamePath ? `${option.value} (used)` : option.value
    })
  }

  getDataForm() {
    const methodsForm = document.getElementsByClassName('methodForm_fields');
    const jsonToSend = { items: [] }

    Array.from(methodsForm).forEach(methodForm => {
      const method = methodForm.querySelector('select').value;
      const message = methodForm.querySelector('textarea').value;
      const path = methodForm.querySelector('input').value;
      jsonToSend.items.push({ path, method, response: JSON.parse(message) })
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
      url.innerHTML = `Your URL is: /mock?uuid=${data.uuid}&path=(your_path)`;
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