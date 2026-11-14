package pl.banalna.post;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import pl.banalna.media.ImageCardCropResponse;

public record PostResponse(
        Long id,
        String title,
        String excerpt,
        List<String> content,
        LocalDate date,
        String category,
        String image,
        boolean featured,
        PostStatus status,
        ImageCardCropResponse cardCrops) {

    public static PostResponse from(Post post) {
        return from(post, null);
    }

    public static PostResponse from(Post post, ImageCardCropResponse cardCrops) {
        List<String> paragraphs = Arrays.stream(post.getContent().split("\\R\\s*\\R"))
                .map(String::trim)
                .filter(paragraph -> !paragraph.isEmpty())
                .toList();

        return new PostResponse(
                post.getId(),
                post.getTitle(),
                post.getExcerpt(),
                paragraphs,
                post.getPublishedDate(),
                post.getCategory(),
                post.getImageUrl(),
                post.isFeatured(),
                post.getStatus(),
                cardCrops);
    }
}