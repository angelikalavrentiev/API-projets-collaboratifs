// On importe fs pour la gestion des fichiers 
const fs = require("fs");
const path = require("path");

const data_file = path.join(__dirname, '..', 'data', 'memory.store.json'); 

// ---------------------- STOCKAGE EN MEMOIRE -------------------- //
// On simule une base de données avec un tableau en mémoire
// On utilise let car on va modifier ce tableau dans les opérations CRUD 
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
// Crée un utilisateur ou récupère un existant
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

// Validation complète du projet
const validateProjects = (projectData, currentUser) => {
    const errors = [];

    if (!projectData || typeof projectData !== 'object') {
        errors.push({ path: 'body', message: 'Données invalides' });
        return errors;
    }

    // Nom requis et longueur 5-100
    if (!projectData.name || !projectData.name.toString().trim()) {
      errors.push({ path: 'name', message: 'Le nom du projet est requis' });
    } else if (projectData.name.trim().length < 5 || projectData.name.trim().length > 100) {
        errors.push({ path: 'name', message: 'Le nom du projet doit contenir entre 5 et 100 caractères' });
    }

    // Organizer requis et doit correspondre à l'utilisateur connecté
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

    return errors; 
};

// --------------------------------- CRUD ----------------------------- //
// Récupérer tous les projets
const getAllProjects = () => projects.slice();

// Récupérer un projet par ID
const getProjectById = (id) => {
    const idNumber = Number(id);
    return projects.find(project => project.id === idNumber);
}


// Lister les projets avec filtres et pagination
const getProjectsWithPagination = (req, res) => {
    try {
        const { q, role, page = 1, size = 10 } = req.query;
        const user = req.user;
        const normalizedUser = normalize(user.normalizedUsername);
        const roles = Array.isArray(user.role) ? user.role.map(r => r.toLowerCase()) : [user.role.toLowerCase()];

        // --- Filtrage selon rôle ---
        let projectsList = getAllProjects();

        if (roles.includes("visitor")) {
            // Visitor = accès lecture publique, pas de membres détaillés
            projectsList = projectsList.map(p => ({
                id: p.id,
                name: p.name,
                description: p.description,
                organizer: p.organizer,
                specFile: p.specFile,
                membersCount: Array.isArray(p.members) ? p.members.length : 0
            }));
        } else if (roles.includes("member")) {
            // Member = seulement projets dont il est membre
            projectsList = projectsList.filter(p =>
                (p.members || []).some(m => normalize(m.name) === normalizedUser)
            );
        } else if (roles.includes("organizer")) {
            // Organizer = seulement ses projets
            projectsList = projectsList.filter(p =>
                normalize(p.organizer) === normalizedUser
            );
        }

        // --- Filtrage par q (deuxieme chaine dans nom du projet) ---
        if (q) {
            const query = q.toLowerCase();
            projectsList = projectsList.filter(p => p.name.toLowerCase().includes(query));
        }

        // --- Filtrage par role d'un membre ---
        if (role) {
            const roleQuery = role.toLowerCase();
            projectsList = projectsList.filter(p =>
                Array.isArray(p.members) &&
                p.members.some(m => m.role.toLowerCase() === roleQuery)
            );
        }

        // --- Pagination ---
        const total = projectsList.length;
        const start = (page - 1) * Number(size);
        const end = start + Number(size);
        const projectData = projectsList.slice(start, end);

        res.status(200).json({ projectData, page: Number(page), size: Number(size), total });
    } catch (err) {
        console.error("Erreur getProjectsWithPagination:", err);
        res.status(500).json({ message: "Erreur interne serveur" });
    }
};


// Ajouter un projet
const addProject = (projectData, currentUser) => {
    const errors = validateProjects(projectData, currentUser);
    if (errors.length) throw new Error(errors.map(e => e.message).join(', '));

    const newId = projects.length ? Math.max(...projects.map(p => p.id)) + 1 : 1;

    const newProject = { 
        id: newId, 
        name: projectData.name.trim(), 
        description: projectData.description || "", 
        organizer: projectData.organizer.trim(), 
        specFile: projectData.specFile,
        members: []
    };

    const exists = projects.some(p => p.name.toLowerCase() === projectData.name.toLowerCase());
    if (exists) throw new Error("Ce projet existe déjà !");

    projects.push(newProject);
    saveProjectsToFile();

    return newProject;
};

// Mettre à jour un projet
const updateProject = (id, projectData) => {
    const i = projects.findIndex(p => p.id === Number(id));
    if (i === -1) throw new Error(`Projet avec l'id ${id} introuvable`);

    const updatedProject = {
        ...projects[i],
        name: projectData.name ? projectData.name.trim() : projects[i].name,
        description: projectData.description || projects[i].description,
        specFile: projectData.specFile || projects[i].specFile,
        members: projects[i].members
    };

    const updatedName = updatedProject.name.trim().toLowerCase();
    const exists = projects.some((p, index) => index !== i && p.name.trim().toLowerCase() === updatedName);
    if (exists) throw new Error("Ce projet existe déjà !");

    projects[i] = updatedProject;
    saveProjectsToFile();
    return updatedProject;
};

// Supprimer un projet
const deleteProject = (id) => {
    const i = projects.findIndex(p => p.id === Number(id));
    if (i === -1) return null;

    const deletedProject = projects.splice(i, 1)[0];
    saveProjectsToFile();
    return deletedProject;
};

module.exports = { getAllProjects, getProjectById, getProjectsWithPagination, addProject, updateProject, deleteProject, validateProjects, normalize };
