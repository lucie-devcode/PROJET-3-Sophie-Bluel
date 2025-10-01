// ---------------------------
// Fonction pour afficher un projet dans la galerie
// ---------------------------
function setFigure(projet) {
    const figure = document.createElement("figure");
    figure.innerHTML = `
        <img src="${projet.imageUrl}" alt="${projet.title}">
        <figcaption>${projet.title}</figcaption>
    `;
    document.querySelector(".gallery").append(figure);
}

// ---------------------------
// Fonction pour charger les projets (avec filtrage)
// ---------------------------
async function loadProjets(categoryId = "all") {
    const url = "http://localhost:5678/api/works";

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erreur ${response.status} : impossible de récupérer les projets`);
        }

        const projets = await response.json();

        // Vider la galerie avant d'afficher les projets
        const gallery = document.querySelector(".gallery");
        gallery.innerHTML = "";

       // Filtrer les projets selon la catégorie
        const projetsFiltres = projets.filter(projet => 
            categoryId === "all" || projet.categoryId === categoryId
        );

        // Afficher les projets filtrés
        projetsFiltres.forEach(projet => setFigure(projet));

    } catch (error) {
        console.error(error.message);
    }
}

// ---------------------------
// Créer les boutons pour chaque catégorie
// ---------------------------
function setFilter(category) {
    const div = document.createElement("div");
    div.innerHTML = category.name;
    div.className = "btn-category"; // pour le style si besoin

    div.addEventListener("click", () => {
        loadProjets(category.id); // filtre la galerie par catégorie
        setActiveButton(div); // met à jour le style du bouton actif
    });

    document.querySelector(".categories").append(div);
}

// ---------------------------
// Bouton "Tous"
// ---------------------------
function createBtnTous() {
    const tous = document.createElement("div");
    tous.innerHTML = "Tous";
    tous.className = "btn-tous active"; // actif par défaut

    tous.addEventListener("click", () => {
        loadProjets("all");
        setActiveButton(tous);
    });

    document.querySelector(".categories").append(tous);
}

// ---------------------------
// Mettre en évidence le bouton actif
// ---------------------------
function setActiveButton(button) {
    const buttons = document.querySelectorAll(".categories div");
    buttons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
}

// ---------------------------
// Charger les catégories depuis l’API
// ---------------------------
async function loadCategories() {
    const url = "http://localhost:5678/api/categories";

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erreur ${response.status} : impossible de récupérer les catégories`);
        }

        const categories = await response.json();

        // Créer le bouton "Tous" en premier
        createBtnTous();

        // Créer les boutons pour chaque catégorie
        for (let i = 0; i < categories.length; i++) {
            setFilter(categories[i]);
        }

    } catch (error) {
        console.error(error.message);
    }
}

// ---------------------------
// Initialisation au chargement de la page
// ---------------------------
loadCategories();
loadProjets(); // affiche tous les projets par défaut
