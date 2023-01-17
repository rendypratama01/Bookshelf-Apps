let books = [];
const RENDER_EVENT = "render-book";
const STORAGE_KEY = "BOOKSHELF_APPS";
const BOOK_ITEMID = "itemId";

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBooks();
    submitForm.reset();
  });

  const searchForm = document.getElementById("searchBook");
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    searchBooks();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
    console.log(books);
  }
});

function addBooks() {
  const title = document.getElementById("inputBookTitle").value;
  const author = document.getElementById("inputBookAuthor").value;
  const year = document.getElementById("inputBookYear").value;
  const isComplete = document.getElementById("inputBookIsComplete").checked;
  const id = generateId();

  const bookObject = generateBookObject(
    id,
    title,
    author,
    year,
    isComplete
  );
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return + new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBookList = document.getElementById(
    "incompleteBookshelfList"
  );
  uncompletedBookList.innerHTML = "";

  const completedBookList = document.getElementById("completeBookshelfList");
  completedBookList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    bookElement[BOOK_ITEMID] = bookItem.id;

    if (bookItem.isComplete) {
      completedBookList.append(bookElement);
    } else {
      uncompletedBookList.append(bookElement);
    }
  }
});

function makeBook(book) {
  const bookTitle = document.createElement("h2");
  bookTitle.innerText = book.title;

  const bookAuthor = document.createElement("p");
  bookAuthor.innerText = book.author;

  const bookYear = document.createElement("p");
  bookYear.innerText = book.year;

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("action");

  const bookContainer = document.createElement("article");
  bookContainer.setAttribute("id", book.id);
  bookContainer.classList.add("book_item");
  bookContainer.append(bookTitle, bookAuthor, bookYear, buttonContainer);

  if (book.isComplete) {
    buttonContainer.append(UndoButton(), TrashButton());
  } else {
    buttonContainer.append(CheckButton(), TrashButton());
  }

  return bookContainer;
}

function CheckButton() {
  return createButton(
    "green",
    function (event) {
      addBookToCompleted(event.target.parentElement.parentElement);
      const searchForm = document.getElementById("searchBook");
      searchForm.reset();
    },
    "Check"
  );
}

function UndoButton() {
  return createButton(
    "green",
    function (event) {
      undoBookFromCompleted(event.target.parentElement.parentElement);
      const searchForm = document.getElementById("searchBook");
      searchForm.reset();
    },
    "Undo"
  );
}

function TrashButton() {
  return createButton(
    "red",
    function (event) {
      removeBookFromCompleted(event.target.parentElement.parentElement);
      const searchForm = document.getElementById("searchBook");
      searchForm.reset();
    },
    "Trash"
  );
}

function createButton(buttonTypeClass, eventListener, text) {
  const button = document.createElement("button");
  button.classList.add(buttonTypeClass);
  button.innerText = text;
  button.addEventListener("click", function (event) {
    eventListener(event);
    event.stopPropagation();
  });
  return button;
}

function addBookToCompleted(bookElement) {
  const book = findBook(bookElement[BOOK_ITEMID]);
  book.isComplete = true;
  bookElement.remove();
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromCompleted(bookElement) {
  const book = findBook(bookElement[BOOK_ITEMID]);
  book.isComplete = false;
  bookElement.remove();
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBookFromCompleted(bookElement) {
  const bookPosition = findBookIndex(bookElement);
  books.splice(bookPosition, 1);
  bookElement.remove();
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const book of books) {
    if (book.id === bookId) {
      return book;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  let index = 0;
  for (const book of books) {
    if (book.id === bookId) 
      return index;
      index++;
    
  }
  return -1;
}

function saveData() {
  const parsed = JSON.stringify(books);
  localStorage.setItem(STORAGE_KEY, parsed);
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);

  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser Tidak Mendukung Local Storage");
    return false;
  }
  return true;
}

function searchBooks() {
  const searchTitle = document.getElementById("searchBookTitle").value;

  const uncompletedBookList = document.getElementById(
    "incompleteBookshelfList"
  );
  uncompletedBookList.innerHTML = "";

  const completedBookList = document.getElementById("completeBookshelfList");
  completedBookList.innerHTML = "";

  if (searchTitle === "") {
    uncompletedBookList.innerHTML = "";
    completedBookList.innerHTML = "";
    books = [];
    console.log(books);
    if (isStorageExist()) {
      loadDataFromStorage();
    }
  } else {
    const filteredBooks = books.filter((book) => {
      return book.title.toLowerCase().includes(searchTitle.toLowerCase());
    });
    console.log(filteredBooks);
    for (const bookItem of filteredBooks) {
      const bookElement = makeBook(bookItem);
      bookElement[BOOK_ITEMID] = bookItem.id;
      if (bookItem.isComplete) {
        completedBookList.append(bookElement);
      } else {
        uncompletedBookList.append(bookElement);
      }
    }
  }
}