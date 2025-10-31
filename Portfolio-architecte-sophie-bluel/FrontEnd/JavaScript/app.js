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
        // Affiche la bannière visuelle seulement
        const editBanner = document.querySelector(".edit");
        if (editBanner) editBanner.style.display = "block";

        // Affiche le bouton Modifier à côté du titre
        const adminBtn = document.querySelector(".admin-edit-btn");
        if (adminBtn) adminBtn.style.display = "inline-flex";

        // Cache les filtres
        document.querySelector(".categories").style.display = "none";
    }
}

// ------------------- Modale -------------------
function showAddPhoto() {
    const galleryView = modal.querySelector(".modal-gallery-view");
    const addView = modal.querySelector(".modal-add");
    if (!galleryView || !addView) return;
    galleryView.style.display = "none";
    addView.style.display = "block";
}

function showGallery() {
    const galleryView = modal.querySelector(".modal-gallery-view");
    const addView = modal.querySelector(".modal-add");
    if (!galleryView || !addView) return;
    galleryView.style.display = "block";
    addView.style.display = "none";
}

const openModal = function (e) {
  e.preventDefault();
  modal = document.querySelector(e.currentTarget.getAttribute("href"));
  if(!modal) return;
  
  modal.style.display = null;
  modal.removeAttribute("aria-hidden");
  modal.setAttribute("aria-modal", "true");

   // Afficher la galerie, cacher ajout photo
  const galleryView = modal.querySelector(".modal-gallery-view");
  const addView = modal.querySelector(".modal-add");
  if (galleryView && addView) {
      galleryView.style.display = "block";
      addView.style.display = "none";
  }

  loadModalGallery();

  focusables = Array.from(modal.querySelectorAll(focusableSelector));
  previouslyFocusedElement = document.querySelector(':focus');
  if (focusables[0]) focusables[0].focus();

  modal.addEventListener('click', closeModal);
  modal.querySelectorAll('.js-modal-close').forEach(btn =>
    btn.addEventListener('click', closeModal));
  modal.querySelector('.js-modal-stop').addEventListener('click', stopPropagation);

  // --- GESTION SWITCH MODAL ---
  const addPhotoBtn = modal.querySelector(".add-photo-button");
  if (addPhotoBtn) addPhotoBtn.addEventListener("click", showAddPhoto);

  const backBtn = modal.querySelector(".js-modal-back");
  if (backBtn) backBtn.addEventListener("click", showGallery);
};

const closeModal = function (e) {
    if (!modal) return;
    if (previouslyFocusedElement) previouslyFocusedElement.focus();
    e.preventDefault();

    // --- Reset vues pour la prochaine ouverture ---
    const galleryView = modal.querySelector(".modal-gallery-view");
    const addView = modal.querySelector(".modal-add");
    if (galleryView && addView) {
        galleryView.style.display = "block";
        addView.style.display = "none";
    }

    modal.style.display = 'none';
    modal.setAttribute("aria-hidden", 'true');
    modal.removeAttribute("aria-modal");
    modal.removeEventListener('click', closeModal);
    modal.querySelectorAll('.js-modal-close').forEach(btn =>
        btn.removeEventListener('click', closeModal)
    );
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

// --- GESTION DE LA GALERIE DANS LA MODALE ---
async function loadModalGallery() {
  // Sélection à l'intérieur de la fonction, après que le DOM est prêt
  const modalGallery = document.querySelector(".modal-gallery-items");
  if (!modalGallery) {
    console.error("modal-gallery-items introuvable !");
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
  
  // --- Fonction pour supprimer un projet sur le serveur ---
async function deleteProject(id) {
  const token = localStorage.getItem("authToken");
  if (!token) {
    alert("Vous devez être connecté pour supprimer un projet.");
    return false;
  }

  try {
    const res = await fetch(`http://localhost:5678/api/works/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) {
      alert("Erreur lors de la suppression du projet.");
      return false;
    }

    return true; // Suppression réussie
  } catch (error) {
    console.error("Erreur réseau :", error);
    return false;
  }
}

  // Ajout des écouteurs sur les icônes de suppression
  modalGallery.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.currentTarget.dataset.id;
      const confirmed = confirm("Supprimer ce projet ?");
      if (!confirmed) return;

      const success = await deleteProject(id);
      if (success) {
      // ② Supprime le projet du tableau local
        allProjets = allProjets.filter(projet => projet.id !== Number(id));

        // Recharge la galerie dans la modale et la galerie principale
        loadModalGallery();
        loadProjets("all");
      }
    });
  });
}
document.addEventListener("DOMContentLoaded", async () => {

    const gallery = document.querySelector(".gallery");
    const categoriesContainer = document.querySelector(".categories");

    if (!gallery || !categoriesContainer) {
        console.log("App.js détecte que la page n'est pas index.html, pas de galerie ni de catégories.");
        return; // STOP, on est sur login.html
    }
    await loadCategories();
    await fetchProjets();
    loadProjets("all");

    adminMode();

    // Clic sur le **nouveau bouton Modifier**
    document.querySelectorAll(".js-modal").forEach(a => {
        a.addEventListener("click", openModal);
    });

    // Clavier
    window.addEventListener('keydown', e => {
        if ((e.key === 'Escape' || e.key === 'Esc') && modal) closeModal(e);
        if (e.key === 'Tab' && modal !== null) focusInModal(e);
    });
});
