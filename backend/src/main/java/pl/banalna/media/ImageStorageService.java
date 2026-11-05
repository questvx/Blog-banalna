package pl.banalna.media;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.AtomicMoveNotSupportedException;
import java.nio.file.LinkOption;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.nio.file.StandardOpenOption;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Stream;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ImageStorageService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;
    private static final Pattern UPLOADED_IMAGE_FILENAME = Pattern.compile(
            "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.(?:jpg|png|gif|webp)");
    private static final Map<String, String> EXTENSIONS = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/gif", ".gif",
            "image/webp", ".webp");

    private final Path uploadDirectory;

    public ImageStorageService(@Value("${app.upload-dir:uploads}") String uploadDirectory) {
        this.uploadDirectory = Path.of(uploadDirectory).toAbsolutePath().normalize();
    }

    public String store(MultipartFile file) {
        ValidatedImage image = readAndValidateImage(file);

        try {
            Files.createDirectories(uploadDirectory);
            String fileName = UUID.randomUUID() + image.extension();
            Path destination = uploadDirectory.resolve(fileName).normalize();
            if (!destination.getParent().equals(uploadDirectory)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid upload path.");
            }
            Files.write(destination, image.bytes(), StandardOpenOption.CREATE_NEW, StandardOpenOption.WRITE);
            return "/uploads/" + fileName;
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not store uploaded image.", exception);
        }
    }

    public String replace(String fileName, MultipartFile file) {
        if (!isUploadedImageFileName(fileName)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid uploaded image name.");
        }

        Path destination = uploadDirectory.resolve(fileName).normalize();
        if (!destination.getParent().equals(uploadDirectory)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid upload path.");
        }
        if (!Files.isRegularFile(destination, LinkOption.NOFOLLOW_LINKS)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Uploaded image was not found.");
        }

        ValidatedImage image = readAndValidateImage(file);
        String existingExtension = fileName.substring(fileName.lastIndexOf('.'));
        if (!existingExtension.equals(image.extension())) {
            throw new ResponseStatusException(
                    HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                    "The replacement image must use the existing file format.");
        }

        try {
            Path temporaryFile = Files.createTempFile(uploadDirectory, "replace-", ".tmp");
            try {
                Files.write(
                        temporaryFile,
                        image.bytes(),
                        StandardOpenOption.TRUNCATE_EXISTING,
                        StandardOpenOption.WRITE);
                try {
                    Files.move(
                            temporaryFile,
                            destination,
                            StandardCopyOption.ATOMIC_MOVE,
                            StandardCopyOption.REPLACE_EXISTING);
                } catch (AtomicMoveNotSupportedException exception) {
                    Files.move(temporaryFile, destination, StandardCopyOption.REPLACE_EXISTING);
                }
            } finally {
                Files.deleteIfExists(temporaryFile);
            }
            return "/uploads/" + fileName;
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not replace uploaded image.", exception);
        }
    }

    private ValidatedImage readAndValidateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose an image to upload.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Image must be 5 MB or smaller.");
        }

        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        String extension = EXTENSIONS.get(contentType);
        if (extension == null) {
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Only JPEG, PNG, GIF, and WebP images are allowed.");
        }

        try {
            byte[] bytes = file.getBytes();
            if (bytes.length > MAX_FILE_SIZE) {
                throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Image must be 5 MB or smaller.");
            }
            if (!hasExpectedSignature(bytes, contentType)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The uploaded file is not a valid image of the declared type.");
            }
            return new ValidatedImage(extension, bytes);
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not read uploaded image.", exception);
        }
    }

    public List<String> list() {
        if (Files.notExists(uploadDirectory)) return List.of();

        try (Stream<Path> files = Files.list(uploadDirectory)) {
            return files
                    .filter(path -> Files.isRegularFile(path, LinkOption.NOFOLLOW_LINKS))
                    .filter(path -> isUploadedImageFileName(path.getFileName().toString()))
                    .sorted(Comparator.comparing(path -> path.getFileName().toString()))
                    .map(path -> "/uploads/" + path.getFileName())
                    .toList();
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not list uploaded images.", exception);
        }
    }

    public void delete(String fileName) {
        if (!isUploadedImageFileName(fileName)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid uploaded image name.");
        }

        Path image = uploadDirectory.resolve(fileName).normalize();
        if (!image.getParent().equals(uploadDirectory)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid upload path.");
        }

        try {
            if (!Files.isRegularFile(image, LinkOption.NOFOLLOW_LINKS)) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Uploaded image was not found.");
            }
            Files.delete(image);
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not delete uploaded image.", exception);
        }
    }

    public Path getUploadDirectory() {
        return uploadDirectory;
    }

    private boolean isUploadedImageFileName(String fileName) {
        return fileName != null && UPLOADED_IMAGE_FILENAME.matcher(fileName).matches();
    }

    private boolean hasExpectedSignature(byte[] bytes, String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> bytes.length >= 3
                    && unsigned(bytes[0]) == 0xFF && unsigned(bytes[1]) == 0xD8 && unsigned(bytes[2]) == 0xFF;
            case "image/png" -> startsWith(bytes, new byte[] {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A});
            case "image/gif" -> bytes.length >= 6
                    && (ascii(bytes, 0, 6).equals("GIF87a") || ascii(bytes, 0, 6).equals("GIF89a"));
            case "image/webp" -> bytes.length >= 12
                    && ascii(bytes, 0, 4).equals("RIFF") && ascii(bytes, 8, 4).equals("WEBP");
            default -> false;
        };
    }

    private boolean startsWith(byte[] bytes, byte[] signature) {
        if (bytes.length < signature.length) return false;
        for (int index = 0; index < signature.length; index++) {
            if (bytes[index] != signature[index]) return false;
        }
        return true;
    }

    private String ascii(byte[] bytes, int offset, int length) {
        return new String(bytes, offset, length, StandardCharsets.US_ASCII);
    }

    private int unsigned(byte value) {
        return value & 0xFF;
    }

    private record ValidatedImage(String extension, byte[] bytes) {
    }
}