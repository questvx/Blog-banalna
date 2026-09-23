package pl.banalna.post;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

public record PostResponse(
        Long id,
        String title,
        String excerpt,
        List<String> content,
        LocalDate date,
        String category,
        String image,
        boolean featured) {

    public static PostResponse from(Post post) {
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
                post.isFeatured());
    }
}