package pl.banalna.curiosity;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import pl.banalna.post.PostStatus;

public record CuriosityRequest(
        @NotBlank @Size(max = 255) String title,
        @NotBlank String content,
        @NotNull PostStatus status,
        @NotNull LocalDateTime createdAt) {
}
