package pl.banalna.media;

import java.net.URI;
import java.util.Collection;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ImageCardCropService {

    private final ImageCardCropRepository imageCardCropRepository;
    private final ImageStorageService imageStorageService;

    public ImageCardCropService(
            ImageCardCropRepository imageCardCropRepository,
            ImageStorageService imageStorageService) {
        this.imageCardCropRepository = imageCardCropRepository;
        this.imageStorageService = imageStorageService;
    }

    public ImageCardCropResponse findByFileName(String fileName) {
        requireImage(fileName);
        return imageCardCropRepository.findById(fileName)
                .map(ImageCardCrop::toResponse)
                .orElseGet(() -> new ImageCardCropResponse(
                        fileName,
                        CardCropSettings.centered(),
                        CardCropSettings.centered()));
    }

    public ImageCardCropResponse save(String fileName, ImageCardCropRequest request) {
        requireImage(fileName);
        ImageCardCrop crop = imageCardCropRepository.findById(fileName)
                .orElseGet(() -> new ImageCardCrop(fileName, request));
        crop.update(request);
        return imageCardCropRepository.save(crop).toResponse();
    }

    public void delete(String fileName) {
        imageCardCropRepository.deleteById(fileName);
    }

    public Map<String, ImageCardCropResponse> findForImageUrls(Collection<String> imageUrls) {
        var fileNames = imageUrls.stream()
                .map(ImageCardCropService::fileNameFromImageUrl)
                .filter(fileName -> fileName != null)
                .distinct()
                .toList();

        return imageCardCropRepository.findAllById(fileNames).stream()
                .map(ImageCardCrop::toResponse)
                .collect(Collectors.toMap(ImageCardCropResponse::fileName, Function.identity()));
    }

    public static String fileNameFromImageUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) return null;

        try {
            String path = URI.create(imageUrl).getPath();
            if (path == null || !path.startsWith("/uploads/")) return null;
            String fileName = path.substring("/uploads/".length());
            return fileName.isBlank() || fileName.contains("/") ? null : fileName;
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }

    private void requireImage(String fileName) {
        if (!imageStorageService.exists(fileName)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Uploaded image was not found.");
        }
    }
}
