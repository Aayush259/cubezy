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

# Track if mc was installed temporarily
TEMP_MC=false

# Check if mc exists
if ! command -v mc &> /dev/null; then
    echo "mc not found. Downloading..."
    wget https://dl.min.io/client/mc/release/linux-amd64/mc -O mc
    chmod +x mc
    MC="./mc"
    TEMP_MC=true
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
# CURRENT_POLICY=$($MC anonymous list $MINIO_ALIAS/$BUCKET_NAME | grep -q . && echo "public" || echo "none")

# if [[ "$CURRENT_POLICY" != "public" ]]; then
#     echo "Setting bucket policy to public..."
#     $MC anonymous set download $MINIO_ALIAS/$BUCKET_NAME
# else
#     echo "Bucket '$BUCKET_NAME' is already public."
# fi

# # Cleanup if mc was installed locally
# if [ "$TEMP_MC" = true ]; then
#     echo "Cleaning up temporary mc binary..."
#     rm -f ./mc
# fi

# Apply a custom bucket policy: allow GetObject but deny ListBucket
POLICY_JSON=$(mktemp)
cat > "$POLICY_JSON" <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::${BUCKET_NAME}/*"]
    }
  ]
}
EOF

echo "Applying custom policy to bucket '$BUCKET_NAME'..."
$MC alias set $MINIO_ALIAS $MINIO_URL $MINIO_USER $MINIO_PASS >/dev/null 2>&1
# $MC admin policy add $MINIO_ALIAS ${BUCKET_NAME}-readonly "$POLICY_JSON"
# $MC anonymous set-json "$POLICY_JSON" $MINIO_ALIAS/$BUCKET_NAME

# Create a named policy from our JSON
# $MC admin policy create $MINIO_ALIAS ${BUCKET_NAME}-readonly "$POLICY_JSON"

# Attach policy to the bucket anonymously (public read-only objects)
# $MC anonymous set ${BUCKET_NAME}-readonly $MINIO_ALIAS/$BUCKET_NAME

# Apply the JSON policy directly to the bucket for anonymous access
$MC anonymous set-json "$POLICY_JSON" $MINIO_ALIAS/$BUCKET_NAME

rm -f "$POLICY_JSON"

echo "Done."
