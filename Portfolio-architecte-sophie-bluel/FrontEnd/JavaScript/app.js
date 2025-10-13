async function loadProjets(filter) {
    document.querySelector(".gallery").innerHTML = "";
    const url = "http://localhost:5678/api/works";

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erreur ${response.status} : impossible de récupérer les projets`);
        }

        const projets = await response.json();

        const projetsFiltres =
            filter && filter !== "all"
                ? projets.filter((projet) => projet.categoryId === Number(filter))
                : projets; 

        for (let i = 0; i < projetsFiltres.length; i++) {
            setFigure(projetsFiltres[i]);
        }

    } catch (error) {
        console.error(error.message);
    }
}

function setFigure(projet) {
    const figure = document.createElement("figure");
    figure.innerHTML = `
        <img src="${projet.imageUrl}" alt="${projet.title}">
        <figcaption>${projet.title}</figcaption>
    `;
    document.querySelector(".gallery").append(figure);
}

async function loadCategories() {
    const url = "http://localhost:5678/api/categories";

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erreur ${response.status} : impossible de récupérer les catégories`);
        }

        const categories = await response.json();
        for (let i = 0; i < categories.length; i++) {
            setFilter(categories[i]);
        }
    } catch (error) {
        console.error(error.message);
    }
}

function setFilter(category) {
    const div = document.createElement("div");
    div.textContent = category.name;
    div.className = "btn-category";
    div.addEventListener("click", () => loadProjets(category.id));
    document.querySelector(".categories").append(div);
}

async function init() {
    await loadCategories();

    const tous = document.createElement("div");
    tous.textContent = "Tous";
    tous.className = "btn-tous";
    tous.addEventListener("click", () => loadProjets("all"));
    document.querySelector(".categories").append(tous);

    loadProjets();
}

init();
adminMode();

function adminMode() {
  if (localStorage.authToken) {

    const editBanner = document.createElement("div");
    editBanner.className = "edit"; 
    editBanner.innerHTML = `<p><a href="#modal1" class="js-modal"><i class="fa-regular fa-pen-to-square"></i> Mode édition</a></p>`;

      document.body.prepend(editBanner);
      document.querySelector(".categories").style.display = "none"
  }
}

let modal = null
const focusableSelector = 'button, a, input, textarea'
let focusables = []
let previouslyFocusedElement = null

const openModal = function (e) {
    e.preventDefault()
    modal = document.querySelector(e.currentTarget.getAttribute("href"))
    focusables = Array.from(modal.querySelectorAll(focusableSelector))
    previouslyFocusedElement = document.querySelector(':focus')
    focusables[0].focus()
    modal.style.display = null
    modal.removeAttribute("aria-hidden");
    modal.setAttribute("aria-modal", "true");
    modal.addEventListener('click', closeModal)
    modal.querySelector('.js-modal-close').addEventListener('click', closeModal)
    modal.querySelector('.js-modal-stop').addEventListener('click', stopPropagation)
};

const closeModal = function (e) {
    if (modal === null) return
    if (previouslyFocusedElement !== null) previouslyFocusedElement.focus()
    e.preventDefault();
    modal.style.display = 'none';
    modal.setAttribute("aria-hidden", 'true');
    modal.removeAttribute("aria-modal");
    modal.removeEventListener('click', closeModal);
    modal.querySelector('.js-modal-close').removeEventListener('click', closeModal)
    modal.querySelector('.js-modal-stop').removeEventListener('click', stopPropagation)
    modal = null
};

const stopPropagation = function (e) {
    e.stopPropagation();
}

const focusInModal = function (e) {
    e.preventDefault();
    let index = focusables.findIndex(f => f === modal.querySelector(':focus'));
    if (e.shiftKey === true) {
        index--
    } else {
        index++
    }
    if (index >= focusables.length) {
        index = 0
    }
    if (index < 0) {
        index = focusables.length - 1
    }
    focusables[index].focus()
}

document.querySelectorAll(".js-modal").forEach((a) => {
    a.addEventListener("click", openModal);
});

window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
        closeModal(e);
    }
    if (e.key === 'Tab' && modal !== null) {
        focusInModal(e);
    }
})