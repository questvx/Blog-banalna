package pl.banalna.api;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import pl.banalna.media.ImageStorageService;

@RestController
@RequestMapping("/api/admin/uploads")
public class AdminImageController {

    private final ImageStorageService imageStorageService;

    public AdminImageController(ImageStorageService imageStorageService) {
        this.imageStorageService = imageStorageService;
    }

    @PostMapping(consumes = "multipart/form-data")
    @ResponseStatus(HttpStatus.CREATED)
    public ImageUploadResponse upload(@RequestParam("file") MultipartFile file) {
        return new ImageUploadResponse(imageStorageService.store(file));
    }

    public record ImageUploadResponse(String url) {
    }
}