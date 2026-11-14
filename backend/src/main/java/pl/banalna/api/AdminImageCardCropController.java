package pl.banalna.api;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.banalna.media.ImageCardCropRequest;
import pl.banalna.media.ImageCardCropResponse;
import pl.banalna.media.ImageCardCropService;

@RestController
@RequestMapping("/api/admin/image-card-crops")
public class AdminImageCardCropController {

    private final ImageCardCropService imageCardCropService;

    public AdminImageCardCropController(ImageCardCropService imageCardCropService) {
        this.imageCardCropService = imageCardCropService;
    }

    @GetMapping("/{fileName}")
    public ImageCardCropResponse find(@PathVariable String fileName) {
        return imageCardCropService.findByFileName(fileName);
    }

    @PutMapping("/{fileName}")
    public ImageCardCropResponse save(
            @PathVariable String fileName,
            @Valid @RequestBody ImageCardCropRequest request) {
        return imageCardCropService.save(fileName, request);
    }
}
