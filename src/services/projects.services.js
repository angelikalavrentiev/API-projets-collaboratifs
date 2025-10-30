// On importe fs pour la gestion des fichiers 
const fs = require("fs");
const path = require("path");
const EventEmitter = require("events");

const bookEmitter = new EventEmitter(); // EventEmitter si tu veux gérer des events plus tard
const data_file = path.join(__dirname, '..', 'data', 'memory.store.json'); // J'ai changé .js en .json pour persistance

// On simule une base de données avec un tableau en mémoire
// On utilise let car on va modifier ce tableau dans les opérations CRUD 
// Charger les projets depuis memory.store.json si le fichier existe
let projects = [];

// -------------------------- Persistance des données -------------------- //
// Sauvegarder le tableau de projets dans memory.store.json
const saveProjectsToFile = () => {
  const dir = path.dirname(data_file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(data_file, JSON.stringify(projects, null, 2));
}

// ----------------------- Chargement initial -----------------------//
try {
    // On lit le fichier memory.store.json
    const rawData = fs.readFileSync(data_file, 'utf-8');
    projects = JSON.parse(rawData); // Si le fichier existe, on parse les projets
} catch(err){
    // Si pas de fichier, on initialise avec valeurs par défaut
    console.log("Le fichier memory.store.json est introuvable, initialisation des projets par défaut");

    projects = [
        {id: 1, name: "Neptune CRM Revamp", description: "Refonte front + API", organizer: "Alice Smith", specFile: "dummy.pdf"},
        {id: 2, name: "Atlas Mobile v2", description: "Refonte UX, offline-first", organizer: "Marco Polo", specFile: "dummy.pdf"}
    ];

    // On tente d'écrire le fichier initial
    saveProjectsToFile();   
}

// Validation simple
const validateProjects = (projectData) => {
    if (!projectData || typeof projectData !== 'object') throw new Error('Données invalides');
    if (!projectData.name || String(projectData.name).trim() === '') throw new Error('Le champ name est requis');
    if (!projectData.organizer || String(projectData.organizer).trim() === '') throw new Error('Le champ organizer est requis');
    return true;
};

// --------------------------------- CRUD ----------------------------- //
// Récupérer tous les projets
const getAllProjects = () => {
    // On renvoie une copie
    return projects.slice();
};

// Récupérer un projet par son ID
const getProjectById = (id) => {
    // Convertir l'ID reçu en nombre pour être sûr de pouvoir le comparer correctement 
    const idNumber = Number(id);
    return projects.find(project => project.id === idNumber);
};

// Ajouter un projet
const addProject = (projectData) => {
    // Validation des données
    validateProjects(projectData);

    // Génération d'un nouvel ID unique
    const newId = projects.length ? Math.max(...projects.map(p => p.id)) + 1 : 1;

    // Création du nouvel objet "project"
    const newProject = { 
        id: newId, 
        name: String(projectData.name).trim(), 
        description: String(projectData.description || ""), 
        organizer: String(projectData.organizer).trim(), 
        specFile: String(projectData.specFile) 
    };

    // Vérifie si le projet existe déjà
    const exists = projects.some(p => 
        p.name.toLowerCase() === newProject.name.toLowerCase() && 
        p.organizer.toLowerCase() === newProject.organizer.toLowerCase()
    );

    if (exists) throw new Error("Ce projet existe déjà !");

    // Ajout du projet dans le tableau
    projects.push(newProject);

    // Persistance
    saveProjectsToFile();

    return newProject;
};

// Mettre à jour un projet
const updateProject = (id, projectData) => {
    // Convertir l'ID reçu en nombre et on cherche l’index du projet
    const i = projects.findIndex(p => p.id === Number(id));

    // Si le projet n’existe pas, on lève une erreur 
    if (i === -1) throw new Error(`Projet avec l'id ${id} introuvable`);

    // Création d'une nouvelle version de l’objet projet en conservant les anciennes données
    const updatedProject = {
        ...projects[i],
        name: projectData.name ? String(projectData.name).trim() : projects[i].name,
        description: projectData.description ? String(projectData.description) : projects[i].description,
        organizer: projectData.organizer ? String(projectData.organizer).trim() : projects[i].organizer,
        specFile: projectData.specFile ? String(projectData.specFile) : projects[i].specFile
    };

    // Vérifie si un autre projet avec le même nom & organisateur existe 
    const updatedName = updatedProject.name.trim().toLowerCase();
    const updatedOrganizer = updatedProject.organizer.trim().toLowerCase();

    const exists = projects.some((p, index) => {
        if (index === i) return false; // ignore le projet actuel
        return p.name.trim().toLowerCase() === updatedName &&
               p.organizer.trim().toLowerCase() === updatedOrganizer;
    });

    if (exists) throw new Error("Ce projet existe déjà !");

    // Remplace l’ancien projet par le nouveau
    projects[i] = updatedProject;

    // Sauvegarde
    saveProjectsToFile();

    return updatedProject;
};

// Supprimer un projet
const deleteProject = (id) => {
    // Cherche l'index du projet à supprimer
    const i = projects.findIndex(project => project.id === Number(id));

    // Si le projet n'existe pas, retourne null
    if(i === -1) return null;

    // Supprime le projet du tableau
    const deletedProject = projects.splice(i, 1)[0];

    // Sauvegarde
    saveProjectsToFile();

    return deletedProject;
};

// Export des fonctions
module.exports = { getAllProjects, getProjectById, addProject, updateProject, deleteProject };
