package pl.banalna.media;

public record ImageCardCropResponse(
        String fileName,
        CardCropSettings large,
        CardCropSettings small) {
}
