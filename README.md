# TP — API REST (Projets collaboratifs + JWT + Upload PDF)

- Prérequis
 Node.js ≥ 18
 NPM installé
 Port libre : 5000 (API + SSR)

# Installer les dépendances
 npm install
 npm i express multer jsonwebtoken morgan nodemon

# Lancer le serveur
    node app.js

    L’API et le SSR sont disponibles sur : http://localhost:5000
 
# Organisation du projet

.
├── app.js                     # Point d’entrée principal
├── controllers/
│   ├── auth.controller.js      # Gestion JWT (login, vérification, logout)
│   ├── projects.controller.js  # CRUD des projets
│   └── members.controller.js   # Gestion des membres d’un projet
├── middlewares/
│   ├── auth.middleware.js      # Vérification du token JWT
│   ├── upload.middleware.js    # Vérification & gestion des fichiers PDF
│   └── member.middleware.js    # Vérification des champs (nom, rôle, etc.)
├── routes/
│   ├── auth.routes.js          # Définition de toutes les routes auth
│   ├── members.routes.js       # Définition de toutes les routes members
│   └── projects.routes.js      # Définition de toutes les routes projects
├── services/
│   └── projects.services.js    # Stockage en mémoire (projets + membres)
├── data/
│   └── memory.store.json       # Persistance projets + membres
├── uploads/
│   └── *.pdf                  # Cahiers des charges déposés
├── utils/
│   └── jwt.js                 # Génération & vérification de tokens JWT
└── README.md

# Routes

- Auth
| **POST** | `/auth/login`  | Authentification et génération du JWT |
| **GET**  | `/auth/verify` | Vérifie la validité du JWT            |
| **POST** | `/auth/logout` | Supprime le token côté client         |

- Projects
| **GET**    | `/projects`     | Liste tous les projets 
| **GET**    | `/projects/:id` | Récupère un projet spécifique                       
| **POST**   | `/projects`     | Crée un projet (avec PDF obligatoire)               
| **PUT**    | `/projects/:id` | Met à jour un projet                                
| **DELETE** | `/projects/:id` | Supprime un projet (organizer uniquement)           

- Members
| **GET**    | `/projects/:projectId/members` | Liste les membres d’un projet 
| **POST**   | `/projects/:projectId/members` | Ajoute un membre              
| **PUT**    | `/projects/:projectId/members/:memberId` | Met à jour un membre          
| **DELETE** | `/projects/:projectId/members/:memberId` | Supprime un membre            

# Fonctionnalitées

- Authentification JWT pour protéger les opérations sensibles

- Upload PDF obligatoire lors de la création d’un projet

- CRUD complet sur les projets et membres

- Validation des champs (nom, rôle, extension PDF, etc.)

- Autorisations basées sur le rôle (organizer vs member)

- Filtrage & pagination des projets (via query params)

- Gestion des statuts HTTP et messages d’erreur explicites

- Stockage en mémoire simulant une base de données

- Architecture claire et modulaire

# Données de départ

- Projets
ID	   Nom	                   Description	     Organizer	     PDF
1	Neptune CRM Revamp	Refonte front + API	    Alice Smith neptune-crm-spec.pdf
2	Atlas Mobile v2	  Refonte UX, offline-first Marco Polo atlas-mobile-spec.pdf

- Membres
ID	  Nom	       Rôle	      ProjectID
101	 John Doe	Developer	   1
102	 Nadia Ben	QA	           1
103	 Léo Tran	ProductOwner   1
201	 Sara Kim	Designer	   2

# Authentification

Toutes les routes métier nécessitent un JWT valide dans le header :

Authorization: Bearer <token>

# Tests PostMan

![Test login](/images/image.png)
