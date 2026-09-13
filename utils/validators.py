from django.core.exceptions import ValidationError

ALLOWED_TYPES = {
    "application/pdf", "image/jpeg", "image/png",
    "image/gif", "video/mp4", "video/quicktime",
}
MAX_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB


def validate_file_type(file):
    if hasattr(file, "content_type") and file.content_type not in ALLOWED_TYPES:
        raise ValidationError(f"Unsupported file type: {file.content_type}. Allowed: PDF, JPEG, PNG, GIF, MP4.")


def validate_file_size(file):
    if file.size > MAX_SIZE_BYTES:
        raise ValidationError("File size must not exceed 50 MB.")

