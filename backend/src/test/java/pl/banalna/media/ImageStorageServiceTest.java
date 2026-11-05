package pl.banalna.media;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
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
import org.springframework.mock.web.MockMultipartFile;
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
    void replacesUploadedImageWithoutChangingItsUrl() throws IOException {
        String fileName = "00000000-0000-0000-0000-000000000001.png";
        Path image = Files.write(uploadDirectory.resolve(fileName), new byte[] {1});
        byte[] replacement = new byte[] {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A};
        MockMultipartFile file = new MockMultipartFile("file", fileName, "image/png", replacement);

        String url = new ImageStorageService(uploadDirectory.toString()).replace(fileName, file);

        assertEquals("/uploads/" + fileName, url);
        assertArrayEquals(replacement, Files.readAllBytes(image));
    }

    @Test
    void rejectsReplacementWithDifferentImageFormatWithoutChangingTheOriginal() throws IOException {
        String fileName = "00000000-0000-0000-0000-000000000001.jpg";
        byte[] original = new byte[] {1, 2, 3};
        Files.write(uploadDirectory.resolve(fileName), original);
        byte[] png = new byte[] {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A};
        MockMultipartFile file = new MockMultipartFile("file", fileName, "image/png", png);
        ImageStorageService service = new ImageStorageService(uploadDirectory.toString());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.replace(fileName, file));

        assertEquals(HttpStatus.UNSUPPORTED_MEDIA_TYPE, exception.getStatusCode());
        assertArrayEquals(original, Files.readAllBytes(uploadDirectory.resolve(fileName)));
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
