package pl.banalna.media;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public record ImageCardCropRequest(
        @NotNull @Valid CardCropSettings large,
        @NotNull @Valid CardCropSettings small) {
}
