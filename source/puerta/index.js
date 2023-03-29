// library
    
async function request({ method, url }) {
  return fetch(`http://localhost:3333${url}`, { method })
      .then(res => res.json())
}

// elements

const $results = document.querySelector('#results')
const $input = document.querySelector('#nombre')

// state

let results = []

// fetch

async function find_results () {
  return request({ method: 'GET', url: '/puerta' })
}

// creators

function create_results (items) {
  return items.map(item => `
      <li>
          <button class="text-left">
              ${item.name}
          </button>
      </li>
  `).join('')
}

// filters

function filter_results (name) {
  return results.filter(result => result.name.toLowerCase().includes(name.toLowerCase()))
}

// events

function on_error(error) {
  alert(error)
}

function on_input(event) {
  const input = event.target.value
  const rows = filter_results(input)
  const html = create_results(rows)
  $results.innerHTML = html
}


function on_click(event) {
  if(event.target.id === 'comprobante') return on_comprobante_click(event)
  if(event.target.id === 'transferencia') return on_transferencia_click(event)
  if(event.target.id === 'efectivo') return on_efectivo_click(event)
  if(event.target.className === 'result') return on_raver_click(event)
}

async function on_init() {
  results = await find_results()
  const html = create_results(results)
  $results.innerHTML = html
}

// init

$input.addEventListener('input', on_input)
document.addEventListener('click', on_click)

on_init().catch(on_error)