package pl.banalna.curiosity;

import java.time.LocalDateTime;

import pl.banalna.post.PostStatus;

public record CuriosityResponse(
        Long id,
        String title,
        String content,
        PostStatus status,
        LocalDateTime createdAt) {

    public static CuriosityResponse from(Curiosity curiosity) {
        return new CuriosityResponse(
                curiosity.getId(),
                curiosity.getTitle(),
                curiosity.getContent(),
                curiosity.getStatus(),
                curiosity.getCreatedAt());
    }
}
