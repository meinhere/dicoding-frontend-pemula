let books = [];

const STORAGE_KEY = "BOOKS_LIST";
const SAVED_EVENT = "save-book";
const RENDER_EVENT = "render-book";

const inputForm = document.getElementById("inputBook");
const textHeader = document.querySelector(".input_section h2");
const textTitle = document.getElementById("inputBookTitle");
const textAuthor = document.getElementById("inputBookAuthor");
const textYear = document.getElementById("inputBookYear");
const btnSubmit = document.getElementById("bookSubmit");
let TextIsComplete = document.getElementById("inputBookIsComplete");

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function addBook() {
  const generatedID = +new Date();
  const booksObject = {
    id: generatedID,
    title: textTitle.value,
    author: textAuthor.value,
    year: Number(textYear.value),
    isComplete: TextIsComplete.checked,
  };
  books.push(booksObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData("add");
}

function makeBook(bookObject) {
  const textTitle = document.createElement("h3");
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = `Penulis: ${bookObject.author}`;

  const textYear = document.createElement("p");
  textYear.innerText = `Tahun: ${bookObject.year}`;

  const btnFinish = document.createElement("button");
  btnFinish.classList.add("green");

  const btnUpdate = document.createElement("button");
  btnUpdate.innerText = "Edit buku";
  btnUpdate.classList.add("yellow");

  const btnDelete = document.createElement("button");
  btnDelete.innerText = "Hapus buku";
  btnDelete.classList.add("red");

  btnFinish.innerText = bookObject.isComplete
    ? "Belum selesai dibaca"
    : "Selesai dibaca";

  btnFinish.addEventListener("click", function () {
    toggleBookIsComplete(bookObject.id);
  });

  btnUpdate.addEventListener("click", function () {
    editBook(bookObject.id);
  });

  btnDelete.addEventListener("click", function () {
    removeBook(bookObject.id);
  });

  const actionContainer = document.createElement("div");
  actionContainer.classList.add("action");
  actionContainer.append(btnFinish, btnUpdate, btnDelete);

  const container = document.createElement("article");
  container.classList.add("book_item");
  container.append(textTitle, textAuthor, textYear, actionContainer);
  container.setAttribute("id", `book-${bookObject.id}`);

  return container;
}

function editBook(bookId) {
  const bookTarget = books.find((book) => book.id === bookId);

  inputForm.classList.add("update");
  inputForm.setAttribute("data-id", bookTarget.id);
  textHeader.innerText = "Ubah Data Buku";
  textTitle.value = bookTarget.title;
  textAuthor.value = bookTarget.author;
  textYear.value = bookTarget.year;
  TextIsComplete.checked = bookTarget.isComplete;
  btnSubmit.innerHTML = `Masukkan perubahan data ke rak <span>${
    !bookTarget.isComplete ? "Belum" : ""
  } selesai dibaca</span>`;
}

function toggleBookIsComplete(bookId) {
  const bookTarget = books.find((book) => book.id === bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = !bookTarget.isComplete;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData("change");
}

function removeBook(bookId) {
  const bookTarget = books.findIndex((book) => book.id === bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData("delete");
}

function updateBook(bookId) {
  const bookTarget = books.find((book) => book.id == bookId);

  if (!bookTarget) return;

  bookTarget.title = textTitle.value;
  bookTarget.author = textAuthor.value;
  bookTarget.year = Number(textYear.value);
  bookTarget.isComplete = TextIsComplete.checked;

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData("update");
}

function resetForm() {
  inputForm.classList.remove("update");
  inputForm.removeAttribute("data-id");
  textHeader.innerText = "Masukkan Buku Baru";
  textTitle.value = "";
  textAuthor.value = "";
  textYear.value = "";
  TextIsComplete.checked = false;
  btnSubmit.innerHTML =
    "Masukkan buku ke rak <span>Belum selesai dibaca</span>";
}

function saveData(action) {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new CustomEvent(SAVED_EVENT, { detail: action }));
  }
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

document.addEventListener(SAVED_EVENT, function (e) {
  resetForm();

  const action = e.detail;
  let message = "Buku berhasil ditambahkan";

  if (action === "change") {
    message = "Status buku berhasil diubah";
  } else if (action === "delete") {
    message = "Buku berhasil dihapus";
  } else if (action === "update") {
    message = "Data buku berhasil diubah";
  }

  alert(message);
});

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBOOKList = document.getElementById(
    "incompleteBookshelfList"
  );
  const completedBOOKList = document.getElementById("completeBookshelfList");
  uncompletedBOOKList.innerHTML = "";
  completedBOOKList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    bookItem.isComplete
      ? completedBOOKList.append(bookElement)
      : uncompletedBOOKList.append(bookElement);
  }
});

TextIsComplete.addEventListener("click", function (e) {
  document.querySelector("#bookSubmit > span").innerText = e.target.checked
    ? "Selesai dibaca"
    : "Belum selesai dibaca";
});

document.addEventListener("DOMContentLoaded", function () {
  const inputForm = document.getElementById("inputBook");

  inputForm.addEventListener("submit", function (event) {
    event.preventDefault();

    event.target.classList.contains("update")
      ? updateBook(event.target.dataset.id)
      : addBook();
  });

  const searchForm = document.getElementById("searchBook");
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const searchQuery = document.getElementById("searchBookTitle").value;
    let filteredBooks = books.filter((book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    [books, filteredBooks] = [filteredBooks, books];
    document.dispatchEvent(new Event(RENDER_EVENT));
    [books, filteredBooks] = [filteredBooks, books];
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});
