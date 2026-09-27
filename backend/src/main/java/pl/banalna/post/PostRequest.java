package pl.banalna.post;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PostRequest(
        @NotBlank @Size(max = 255) String title,
        @NotBlank String excerpt,
        @NotEmpty List<@NotBlank String> content,
        @NotNull LocalDate date,
        @NotBlank @Size(max = 100) String category,
        @NotBlank @Size(max = 500) String image,
        boolean featured,
        @NotNull PostStatus status) {
}