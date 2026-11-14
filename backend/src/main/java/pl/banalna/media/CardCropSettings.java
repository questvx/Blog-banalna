package pl.banalna.media;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CardCropSettings(
        @NotNull @Min(100) @Max(300) Integer zoomPercent,
        @NotNull @Min(0) @Max(100) Integer positionX,
        @NotNull @Min(0) @Max(100) Integer positionY) {

    public static CardCropSettings centered() {
        return new CardCropSettings(100, 50, 50);
    }
}
