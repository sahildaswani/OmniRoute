# Docker Compose deployment

# Dokploy deployment compose (tracked in this repo as docker-compose.dokploy.yml).
# Dokploy only needs the compose file plus a HEAD commit on the branch; it builds
# and runs the stack itself from the repo checkout on the VPS.

# Auto-deploy webhook (Dokploy → GitHub) is configured server-side; pushing a
# commit to this branch is enough to trigger a deployment.