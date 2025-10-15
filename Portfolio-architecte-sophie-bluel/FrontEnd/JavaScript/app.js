let allProjets = []; // Stocke tous les projets pour ne pas rappeler l'API
let modal = null;
const focusableSelector = 'button, a, input, textarea';
let focusables = [];
let previouslyFocusedElement = null;

// ------------------- Chargement des projets -------------------
async function fetchProjets() {
    try {
        const response = await fetch("http://localhost:5678/api/works");
        if (!response.ok) throw new Error(`Erreur ${response.status}`);
        allProjets = await response.json();
    } catch (error) {
        console.error(error.message);
    }
}

// Affiche les projets filtrés en mémoire
function loadProjets(filter) {
    document.querySelector(".gallery").innerHTML = "";

    const projetsFiltres =
        filter && filter !== "all"
            ? allProjets.filter(p => p.categoryId === Number(filter))
            : allProjets;

    projetsFiltres.forEach(setFigure);
}

// Crée chaque figure HTML pour un projet
function setFigure(projet) {
    const figure = document.createElement("figure");
    figure.innerHTML = `
        <img src="${projet.imageUrl}" alt="${projet.title}">
        <figcaption>${projet.title}</figcaption>
    `;
    document.querySelector(".gallery").append(figure);

}

// ------------------- Chargement des catégories -------------------
async function loadCategories() {
    try {
        const response = await fetch("http://localhost:5678/api/categories");
        if (!response.ok) throw new Error(`Erreur ${response.status}`);
        const categories = await response.json();

        categories.forEach(setFilter);

        // Ajouter le filtre "Tous"
        const tous = document.createElement("div");
        tous.textContent = "Tous";
        tous.className = "btn-tous";
        tous.addEventListener("click", () => loadProjets("all"));
        document.querySelector(".categories").append(tous);

    } catch (error) {
        console.error(error.message);
    }
}

// Crée chaque bouton filtre
function setFilter(category) {
    const div = document.createElement("div");
    div.textContent = category.name;
    div.className = "btn-category";
    div.addEventListener("click", () => loadProjets(category.id)); // filtrage en mémoire
    document.querySelector(".categories").append(div);
}

// ------------------- Mode admin -------------------
function adminMode() {
    const token = localStorage.getItem("authToken");

    if (token) {
        const editBanner = document.createElement("div");
        editBanner.className = "edit"; 
        editBanner.innerHTML = `<p><a href="#modal1" class="js-modal"><i class="fa-regular fa-pen-to-square"></i> Mode édition</a></p>`;

        document.body.prepend(editBanner);
        document.querySelector(".categories").style.display = "none";
    }
}

// ------------------- Modale -------------------
const openModal = function (e) {
  e.preventDefault();
  modal = document.querySelector(e.currentTarget.getAttribute("href"));
  modal.style.display = null;
  modal.removeAttribute("aria-hidden");
  modal.setAttribute("aria-modal", "true");

  loadModalGallery();

  focusables = Array.from(modal.querySelectorAll(focusableSelector));
  previouslyFocusedElement = document.querySelector(':focus');
  focusables[0].focus();
  modal.addEventListener('click', closeModal);
  modal.querySelector('.js-modal-close').addEventListener('click', closeModal);
  modal.querySelector('.js-modal-stop').addEventListener('click', stopPropagation);
};

const closeModal = function (e) {
    if (!modal) return;
    if (previouslyFocusedElement) previouslyFocusedElement.focus();
    e.preventDefault();
    modal.style.display = 'none';
    modal.setAttribute("aria-hidden", 'true');
    modal.removeAttribute("aria-modal");
    modal.removeEventListener('click', closeModal);
    modal.querySelector('.js-modal-close').removeEventListener('click', closeModal);
    modal.querySelector('.js-modal-stop').removeEventListener('click', stopPropagation);
    modal = null;
};

const stopPropagation = function (e) {
    e.stopPropagation();
};

const focusInModal = function (e) {
    e.preventDefault();
    let index = focusables.findIndex(f => f === modal.querySelector(':focus'));
    if (e.shiftKey) index--;
    else index++;
    if (index >= focusables.length) index = 0;
    if (index < 0) index = focusables.length - 1;
    focusables[index].focus();
};

document.addEventListener("DOMContentLoaded", async () => {
    await loadCategories();
    await fetchProjets();
    loadProjets("all"); // affiche tous les projets au départ
    adminMode();

    document.querySelectorAll(".js-modal").forEach(a => {
        a.addEventListener("click", openModal);
    });

    window.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' || e.key === 'Esc') closeModal(e);
        if (e.key === 'Tab' && modal !== null) focusInModal(e);
    });
});

// --- GESTION DE LA GALERIE DANS LA MODALE ---
async function loadModalGallery() {
  // Sélection à l'intérieur de la fonction, après que le DOM est prêt
  const modalGallery = document.querySelector(".gallery-modal");
  if (!modalGallery) {
    console.error("gallery-modal introuvable !");
    return;
  }
  
  modalGallery.innerHTML = ""; 

   const projets = allProjets;

    projets.forEach((projet) => {
      const figure = document.createElement("figure");
      figure.classList.add("modal-figure");

      // Image + icône poubelle en overlay
      figure.innerHTML = `
        <div class="image-container">
          <img src="${projet.imageUrl}" alt="${projet.title}">
          <i class="fa-solid fa-trash-can overlay-icon delete-btn" data-id="${projet.id}"></i>
        </div>
        <figcaption>${projet.title}</figcaption>
      `;

      modalGallery.appendChild(figure);
    });

  // Ajout des écouteurs sur les icônes de suppression
  modalGallery.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.currentTarget.dataset.id;
      const confirmed = confirm("Supprimer ce projet ?");
      if (!confirmed) return;

      const success = await deleteProject(id);
      if (success) {
        // Supprimer le projet de allProjets pour ne pas refaire un fetch
        allProjets = allProjets.filter(projet => projet.id !== Number(id));

        // Recharge la galerie dans la modale et la galerie principale
        loadModalGallery();
        loadProjets("all");
      }
    });
  });
}

  


