async function loadProjets() {
   const url = "http://localhost:5678/api/works";

   try {
      const response = await fetch(url);
      if (!response.ok) {
         throw new Error(`Erreur ${response.status} : impossible de récupérer les projets`);
      }

      const projets = await response.json();
      console.log(projets);

      for (let i = 0; i < projets.length; i++) {
         setFigure(projets[i]);
      }
   } catch (error) {
      console.error(error.message);
   }
}
loadProjets();

function setFigure(projet) {
   const figure = document.createElement("figure");
   figure.innerHTML = `
      <img src="${projet.imageUrl}" alt="${projet.title}">
      <figcaption>${projet.title}</figcaption>
   `;
   document.querySelector(".gallery").append(figure);
}
