// It might be a good idea to add event listener to make sure this file
// only runs after the DOM has finshed loading.
const quoteListElement = document.querySelector('#quote-list')
const newQuoteForm = document.querySelector('#new-quote-form')
const editQuoteForm = document.querySelector('#edit-quote-form')
const quoteInput = document.querySelector('#new-quote')
const authorInput = document.querySelector('#author')
const editQuoteInput = document.querySelector('#edit-quote')
const editAuthorInput = document.querySelector('#edit-author')
const editFormSubmitBtn = document.getElementById('edit-submit')
const sortButton = document.querySelector('.sort-alphabetically')
const baseUrl = 'http://localhost:3000/quotes'



// Holds the data the app may need
const state = {
  quotes: [],
  sort: false,
  currentQuote: null
}

// QUESTION: Sort doesn't seem to be working, when just have alphabetically it does but doesn't show them not
const updateSort = () => {
  sortButton.innerText = state.sort ? "Sort Authors Alphabetically: ON" : "Sort Authors Alphabetically: OFF"
}

const addSortListener = () => {
  sortButton.addEventListener('click', () => {
    state.sort = !state.sort
    updateSort()
    sortQuotes()
  })
}

const sortQuotes = () => {
  if (state.sort) {
    const alphabeticalAuthors = sortAlphabetically(state.quotes)
    renderQuotes(alphabeticalAuthors)
  } else {
    renderQuotes(state.quotes)
  }
}

const renderQuote = quote => {
  const liElement = document.createElement('li')
  liElement.className = 'quote-card'
  liElement.innerHTML = `
    <blockquote class="blockquote" data-id=${quote.id}>
      <p class="mb-0">${quote.quote}</p>
      <footer class="blockquote-footer">${quote.author}</footer>
      <br>
      <button class='btn-success'>Likes: <span>${quote.likes}</span></button>
      <button class='btn-edit'>Edit</button>
      <button class='btn-danger'>Delete</button>
      <hr>
    </blockquote>
  `
  const likeButton = liElement.querySelector('.btn-success')
  likeButton.addEventListener('click', () => onLikeClick(quote))

  const editButton = liElement.querySelector('.btn-edit')
  editButton.addEventListener('click', () => onEditClick(quote))

  const deleteButton = liElement.querySelector('.btn-danger')
  deleteButton.addEventListener('click', () => onDeleteClick(quote))

  quoteListElement.append(liElement)
}

const renderQuotes = quotes => {
  quoteListElement.innerHTML = ""
  quotes.forEach(quote => renderQuote(quote))
}

const updateQuoteList = () => {
  quoteListElement.innerHTML = ''
  renderQuotes(state.quotes)
}

const increaseLikes = id => {
  const quote = state.quotes.find(quote => quote.id === id)
  quote.likes++
  updateQuoteList()
}

const onLikeClick = quote => {
  event.preventDefault()
  increaseLikes(quote.id)
  const quoteToChange = state.quotes.find(storedQuote => storedQuote.id === quote.id)
  updateQuote(quoteToChange)
}

const onEditClick = quote => {
  document.getElementById('edit-quote').value = quote.quote
  document.getElementById('edit-author').value = quote.author
  document.getElementById('edit-quote-form').dataset.id = quote.id
  state.currentQuote = quote
}

const onDeleteClick = quote => {
  event.preventDefault()
  deleteQuote(quote).then(() => getQuotes().then(renderQuotes))

}

const initialize = () => {
  getQuotes()
  .then(quotes => {
    state.quotes = quotes
    renderQuotes(state.quotes)
  })
  updateSort()
  addSortListener()
}

// Get the form to add a new quote
newQuoteForm.addEventListener('submit', event => {
  event.preventDefault()

  const quote = {
    quote: quoteInput.value,
    author: authorInput.value,
    likes: 1
  }

  newQuoteForm.reset()

  createQuote(quote)
    .then(quote => {
      state.quotes.push(quote)
      renderQuote(quote)
    })
})

editQuoteForm.addEventListener('submit', event => {
  event.preventDefault()
  let formQuote = document.getElementById('edit-quote').value
  let formAuthor = document.getElementById('edit-author').value
  let formId = document.getElementById('edit-quote-form').dataset.id

  const quote = {
    id: formId,
    quote: formQuote,
    author: formAuthor
}
  editQuoteForm.reset()

  editQuote(quote).then(() => getQuotes().then(renderQuotes))
})

const sortAlphabetically = quotes => {
  return quotes.slice().sort(function (a, b) {
    return a.author.localeCompare(b.author)
  })
}

// const sortById = quotes => {
//   quotes.sort(function (a, b) {
//     return a.id - b.id
//   })
// }
// API STUFF //

// Creates a quote on the server
const createQuote = quote => {
  return fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(quote)
  }).then(response => response.json())
}

const updateQuote = quote => {
  return fetch(baseUrl + `/${quote.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(quote)
  }).then(response => response.json())
}

const editQuote = quote => {
  return fetch(baseUrl + `/${quote.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(quote)
  }).then(response => response.json())
}

const deleteQuote = quote => {
  return fetch(baseUrl + `/${quote.id}`, {
    method: 'DELETE'
  })
}

// Get quotes from server
const getQuotes = () => {
  return fetch(baseUrl)
    .then(response => response.json())
}


initialize()
