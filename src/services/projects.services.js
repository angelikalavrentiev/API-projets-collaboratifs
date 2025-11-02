// On importe fs pour la gestion des fichiers 
const fs = require("fs");
const path = require("path");


const data_file = path.join(__dirname, '..', 'data', 'memory.store.json'); 

// On simule une base de données avec un tableau en mémoire
// On utilise let car on va modifier ce tableau dans les opérations CRUD 
// Charger les projets depuis memory.store.json si le fichier existe
// ---------------------- STOCKAGE EN MEMOIRE -------------------- //
let projects = [];
let users = []; // { normalizedUsername, userId, role: ["Organizer", "Member"] }

// Normalisation : minuscule, point à la place d'espace
const normalize = str => str?.trim().toLowerCase().replace(/\s+/g, '.');

// Sauvegarde des projets
const saveProjectsToFile = () => {
    const dir = path.dirname(data_file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(data_file, JSON.stringify({ projects, users }, null, 2));
}

// Chargement initial
try {
    const rawData = fs.readFileSync(data_file, 'utf-8');
    const parsed = JSON.parse(rawData);
    projects = parsed.projects || [];
    users = parsed.users || [];
} catch(err) {
    console.log("Initialisation des projets par défaut");
    projects = [
        {
            id: 1,
            name: "Neptune CRM Revamp",
            description: "Refonte front + API",
            organizer: "alice.smith",
            specFile: "neptune-crm-spec.pdf",
            members: [
                { id: 101, name: "John Doe", role: "Developer", projectId: 1 },
                { id: 102, name: "Nadia Ben", role: "QA", projectId: 1 },
                { id: 103, name: "Léo Tran", role: "ProductOwner", projectId: 1 }
            ]
        },
        {
            id: 2,
            name: "Atlas Mobile v2",
            description: "Refonte UX, offline-first",
            organizer: "marco.polo",
            specFile: "atlas-mobile-spec.pdf",
            members: [
                { id: 201, name: "Sara Kim", role: "Designer", projectId: 2 }
            ]
        }
    ];
    users = [
        { normalizedUsername: "alice.smith", userId: 1, role: ["Organizer"] },
        { normalizedUsername: "marco.polo", userId: 2, role: ["Organizer"] },
        { normalizedUsername: "bob.jones", userId: 3, role: ["Visitor"] },
        { normalizedUsername: "john.doe", userId: 4, role: ["Member"] }
    ];
    saveProjectsToFile();
}

// ---------------------- UTILITAIRES ---------------------- //
const getOrCreateUser = (username, role) => {
    const normalizedUsername = normalize(username);
    let user = users.find(u => u.normalizedUsername === normalizedUsername);
    if (!user) {
        user = {
            normalizedUsername,
            userId: Date.now() + Math.floor(Math.random() * 1000),
            role: [role]
        };
        users.push(user);
    } else if (!user.role.includes(role)) {
        user.role.push(role);
    }
    saveProjectsToFile();
    return user;
}


// Validation complète du projet avec la gestion des erreurs comme dans la consigne
const validateProjects = (projectData, currentUser) => {
    const errors = [];

    // Vérifie que projectData est un objet et si on a pas un objet, pas besoin de continuer
    if (!projectData || typeof projectData !== 'object') {
        errors.push({ path: 'body', message: 'Données invalides' });
        return errors;
    }

    // le champs name est requis avec une longueur entre 3 et 100 caractères
    if (!projectData.name || !projectData.name.toString().trim()) {
      errors.push({ path: 'name', message: 'Le nom du projet est requis' });
    } else if (projectData.name.trim().length < 5 || projectData.name.trim().length > 100) {
        errors.push({ path: 'name', message: 'Le nom du projet doit contenir entre 5 et 100 caractères' });
    }

    // Le champ organizer est requis et doit correspondre à l’utilisateur connecté pour éviter certains conflits
    if (!projectData.organizer || String(projectData.organizer).trim() === '') {
        errors.push({ path: 'organizer', message: 'L’organizer est requis' });
    } else if (normalize(projectData.organizer) !== normalize(currentUser.normalizedUsername)) {
    errors.push({ path: 'organizer', message: 'L’organizer doit correspondre à l’utilisateur connecté' });
    }


    // specFile obligatoire et doit être un PDF
    if (!projectData.specFile || String(projectData.specFile).trim() === '') {
        errors.push({ path: 'spec', message: 'Un fichier PDF est requis' });
    } else if (!projectData.specFile.toLowerCase().endsWith('.pdf')) {
        errors.push({ path: 'spec', message: 'Le fichier doit être un PDF valide' });
    }

    // Et enfin on retourne toutes les erreurs détectées
    return errors; 
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


// Lister les projets avec filtres et pagination
const getProjectsWithPagination = (req, res) => {
  try {
    // Récupération des paramètres de requête depuis l'URL
    // Exemple d'URL comme dans la consigne: /projects?q=crm&role=Developer&page=2&size=10
    const { q, role, page = 1, size = 10 } = req.query;
    const user = req.user;
    let projects = getAllProjects();

    // --- Filtrage selon rôle ---
    if (user.role.includes("Visitor")) {
      // Visitor : voit tous les projets mais sans détails membres
      const total = projects.length;
      const start = (page - 1) * Number(size);
      const end = start + Number(size);
      const projectData = projects.slice(start, end).map(p => ({
        id: p.id,
        name: p.name,
        organizer: p.organizer,
        membersCount: Array.isArray(p.members) ? p.members.length : 0
      }));
      return res.status(200).json({ projectData, page: Number(page), size: Number(size), total });
    } else if (user.role.includes("Member")) {
      const normalizedUser = normalize(user.normalizedUsername);
      projects = projects.filter(p =>
        Array.isArray(p.members) && p.members.some(m => normalize(m.name) === normalizedUser)
      );
      if (projects.length === 0) return res.status(200).json({ message: "Aucun projet trouvé pour ce membre", projectData: [] });
    }
    // Organizer voit tout => pas besoin de filtrer

    // --- Filtrage par q et role ---
    if (q) projects = projects.filter(p => String(p.name).toLowerCase().includes(String(q).toLowerCase()));
    if (role) projects = projects.filter(p =>
      Array.isArray(p.members) && p.members.some(m => m.role && m.role.toLowerCase() === String(role).toLowerCase())
    );

    // --- Pagination ---
    // Calculer les indices pour slice()
    const total = projects.length;
    const start = (page - 1) * Number(size); // Index du premier projet à afficher
    const end = start + Number(size); // Index du dernier
    // Slice prendra les éléments de startIndex inclus à endIndex exclus 
    const projectData = projects.slice(start, end).map(p => ({
      id: p.id,
      name: p.name,
      organizer: p.organizer,
      membersCount: Array.isArray(p.members) ? p.members.length : 0
    }));

    // --- Retour JSON ---
    res.status(200).json({ projectData, page: Number(page), size: Number(size), total });
  } catch (err) {
    console.error("Erreur getProjectsWithPagination:", err);
    res.status(500).json({ message: "Erreur interne serveur" });
  }
};




// Ajouter un projet
const addProject = (projectData, currentUser) => {
    // Validation des données
    const errors = validateProjects(projectData, currentUser);
    if (errors.length) throw new Error(errors.map(e => e.message).join(', '));

    // Génération d'un nouvel ID unique
    const newId = projects.length ? Math.max(...projects.map(p => p.id)) + 1 : 1;

    // Création du nouvel objet "project"
    const newProject = { 
        id: newId, 
        name: String(projectData.name).trim(), 
        description: String(projectData.description || ""), 
        organizer: String(projectData.organizer).trim(), 
        specFile: String(projectData.specFile),
        members: []
    };

    // Vérifie si le projet existe déjà
    const exists = projects.some(p => 
      p.name.toLowerCase() === projectData.name.toLowerCase()
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
        specFile: projectData.specFile ? String(projectData.specFile) : projects[i].specFile,
        members: projects[i].members // on garde les membres existants
    };

    // Vérifie si un autre projet avec le même nom & organisateur existe 
    const updatedName = updatedProject.name.trim().toLowerCase();

    const exists = projects.some((p, index) => {
        if (index === i) return false; // ignore le projet actuel
        return p.name.trim().toLowerCase() === updatedName;
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
module.exports = { getAllProjects, getProjectById, getProjectsWithPagination,  addProject, updateProject, deleteProject, validateProjects, normalize };
