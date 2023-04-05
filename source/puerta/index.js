import { request } from "/_scripts/request.js"

// elements

const $results = document.querySelector('#results')
const $input = document.querySelector('#nombre')

// state

let results = []

// fetch

async function find_results () {
  return request({ method: 'GET', url: '/tickets' })
}

// creators

function create_results (tickets) {
  return tickets.map(ticket => `
      <li>
          <button class="text-left">
              ${ticket.person.name}
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
  const html = create_results(results.tickets)
  $results.innerHTML = html
}

// init

$input.addEventListener('input', on_input)
document.addEventListener('click', on_click)

on_init().catch(on_error)