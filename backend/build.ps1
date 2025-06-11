# Variables
$DOCKER_USERNAME = "timiliris"
$DOCKER_REPOSITORY = "nocturne-backend"
$IMAGE_TAG = "latest"

ionic build -prod

# Build de l'image Docker
docker build -t "${DOCKER_USERNAME}/${DOCKER_REPOSITORY}:${IMAGE_TAG}" .

# Tag de l'image avec les informations Docker Hub
docker tag "${DOCKER_USERNAME}/${DOCKER_REPOSITORY}:${IMAGE_TAG}" "${DOCKER_USERNAME}/${DOCKER_REPOSITORY}:${IMAGE_TAG}"

# Push de l'image vers Docker Hub
docker push "${DOCKER_USERNAME}/${DOCKER_REPOSITORY}:${IMAGE_TAG}"

