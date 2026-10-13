package pl.banalna.setting;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record HeroMessageRequest(@NotBlank @Size(max = 1000) String message) {
}
