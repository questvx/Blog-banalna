package pl.banalna.media;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class ImageStorageServiceTest {

    @TempDir
    Path uploadDirectory;

    @Test
    void listsOnlyRegularFilesWithSupportedImageExtensions() throws IOException {
        Files.write(uploadDirectory.resolve("00000000-0000-0000-0000-000000000002.webp"), new byte[] {1});
        Files.write(uploadDirectory.resolve("00000000-0000-0000-0000-000000000001.jpg"), new byte[] {1});
        Files.write(uploadDirectory.resolve("notes.txt"), new byte[] {1});
        Files.createDirectory(uploadDirectory.resolve("folder.png"));

        ImageStorageService service = new ImageStorageService(uploadDirectory.toString());

        assertEquals(List.of(
                "/uploads/00000000-0000-0000-0000-000000000001.jpg",
                "/uploads/00000000-0000-0000-0000-000000000002.webp"), service.list());
    }

    @Test
    void returnsEmptyListWhenUploadDirectoryDoesNotExist() {
        ImageStorageService service = new ImageStorageService(uploadDirectory.resolve("missing").toString());

        assertTrue(service.list().isEmpty());
    }

    @Test
    void deletesUploadedImage() throws IOException {
        String fileName = "00000000-0000-0000-0000-000000000001.jpg";
        Path image = Files.write(uploadDirectory.resolve(fileName), new byte[] {1});

        new ImageStorageService(uploadDirectory.toString()).delete(fileName);

        assertFalse(Files.exists(image));
    }

    @Test
    void rejectsPathsOutsideTheUploadDirectory() {
        ImageStorageService service = new ImageStorageService(uploadDirectory.toString());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.delete("../00000000-0000-0000-0000-000000000001.jpg"));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }
}
