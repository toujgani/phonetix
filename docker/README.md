# PHONETIX Docker

Le projet complet se démarre comme une seule application nommée `phonetix` dans Docker Desktop.
Compose orchestre l'interface web, l'API Laravel, PostgreSQL, Redis et le worker depuis ce dossier.

Pour utiliser Supabase, copie `.env.example` vers `.env` dans ce dossier, renseigne l'hôte du Session pooler, le mot de passe PostgreSQL, une clé Laravel unique et les mots de passe locaux, puis lance depuis la racine du projet :

```powershell
Copy-Item docker/.env.example docker/.env
# Remplace les valeurs fictives dans docker/.env. Ne publie jamais ce fichier.
docker compose --env-file docker/.env -f docker/docker-compose.yml up -d --build
```

Pour la configuration locale avec PostgreSQL dans Docker, lance `docker compose -f docker/docker-compose.yml up -d --build` sans fichier `docker/.env`.

Ouvrir <http://localhost:8080>.

Pour afficher les services : `docker compose ps`.
Pour arrêter l'application : `docker compose down`.
