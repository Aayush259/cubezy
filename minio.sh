set -euo pipefail

# Load environment variables from .env if it exists
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Configuration
MINIO_ALIAS="local"
MINIO_URL="http://localhost:9000"
MINIO_USER="${MINIO_ROOT_USER:-minioadmin}"
MINIO_PASS="${MINIO_ROOT_PASSWORD:-minioadmin}"
BUCKET_NAME="${MINIO_BUCKET:-uploads}"

# Check if mc exists
if ! command -v mc &> /dev/null; then
    echo "mc not found. Downloading..."
    wget https://dl.min.io/client/mc/release/linux-amd64/mc -O mc
    chmod +x mc
    MC="./mc"
else
    MC="mc"
fi

# Check if alias exists
if ! $MC alias list | grep -q "^$MINIO_ALIAS "; then
    echo "Setting MinIO alias..."
    $MC alias set $MINIO_ALIAS $MINIO_URL $MINIO_USER $MINIO_PASS
else
    echo "Alias '$MINIO_ALIAS' already exists."
fi

# Check current bucket policy
CURRENT_POLICY=$($MC anonymous list $MINIO_ALIAS/$BUCKET_NAME | grep -q . && echo "public" || echo "none")

if [[ "$CURRENT_POLICY" != "public" ]]; then
    echo "Setting bucket policy to public..."
    $MC anonymous set download $MINIO_ALIAS/$BUCKET_NAME
else
    echo "Bucket '$BUCKET_NAME' is already public."
fi

echo "Done."
