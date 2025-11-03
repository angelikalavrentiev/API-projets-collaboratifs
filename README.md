# TP — API REST (Projets collaboratifs + JWT + Upload PDF)

- Prérequis
 Node.js ≥ 18
 NPM installé
 Port libre : 5000 (API + SSR)

# Installer les dépendances
 npm install
 npm i express multer jsonwebtoken morgan cookie-parser nodemon dotenv

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
|   ├── members.auth.middleware.js   # Vérification auth members
│   ├── projects.auth.middleware.js  # Vérification auth projets
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

- Auth
![Test login](/images/auth-login.png)
![Test logout](/images/auth-logout-res.png)
![Test login role](/images/auth-login-data.png)
![Test login role member](/images/auth-login-MEMBER-res.png)
![erreur API](/images/API-errors.png)
![Test token vérifié](/images/auth-verifyToken.png)

- Members
![Test delete org](/images/DELETE-member-byOrganizer.png)
![Test delete nonorg](/images/DELETE-member-byNONOrganizer.png)
![Test members](/images/GET-members.png)
![Test members hors projet](/images/GET-membersBYNONMEMBER.png)
![Test members du projet](/images/GETMEMBER-byProjet-Member.png)
![Test member by org](/images/PUT-memberByProjetOrganizer-data.png)
![Test member modif by org](/images/PUT-BYMEMBER.png)
![Test member exist](/images/if-member-exists.png)
![Test créé member](/images/POST-memberByNONOrganizer.png)

- Projets
![Test delete org](/images/DELETE-projectbyOrganizer.png)
![Test delete nonorg](/images/DELETE-projectbyNONOrganizer.png)
![Test projet non member](/images/GET-project-BYNONMEMBER.png)
![Test projet member](/images/GET-project-if-ISmember.png)
![Test projects](/images/GET-projects.png)
![Test projet exist](/images/if-project-exists-already.png)
![Test project](/images/POST-project-data.png)
![Test project by non member](/images/PUT-projectByNONOrganizer.png)