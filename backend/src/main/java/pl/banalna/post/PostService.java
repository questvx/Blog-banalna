package pl.banalna.post;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import pl.banalna.media.ImageCardCropResponse;
import pl.banalna.media.ImageCardCropService;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final ImageCardCropService imageCardCropService;

    public PostService(PostRepository postRepository, ImageCardCropService imageCardCropService) {
        this.postRepository = postRepository;
        this.imageCardCropService = imageCardCropService;
    }

    public List<PostResponse> findPublished() {
        return toResponses(postRepository.findAllByStatusOrderByPublishedDateDesc(PostStatus.PUBLISHED));
    }

    public PostResponse findPublishedById(Long id) {
        return postRepository.findByIdAndStatus(id, PostStatus.PUBLISHED)
                .map(this::toResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
    }

    public List<PostResponse> findAllForAuthor() {
        return toResponses(postRepository.findAll());
    }

    public PostResponse findByIdForAuthor(Long id) {
        return postRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
    }

    public PostResponse create(PostRequest request) {
        return toResponse(postRepository.save(new Post(request)));
    }

    public PostResponse update(Long id, PostRequest request) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        post.update(request);
        return toResponse(postRepository.save(post));
    }

    public void delete(Long id) {
        if (!postRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found");
        }
        postRepository.deleteById(id);
    }

    private List<PostResponse> toResponses(List<Post> posts) {
        Map<String, ImageCardCropResponse> cardCrops = imageCardCropService.findForImageUrls(
                posts.stream().map(Post::getImageUrl).toList());
        return posts.stream()
                .map(post -> PostResponse.from(
                        post,
                        cardCrops.get(ImageCardCropService.fileNameFromImageUrl(post.getImageUrl()))))
                .toList();
    }

    private PostResponse toResponse(Post post) {
        String fileName = ImageCardCropService.fileNameFromImageUrl(post.getImageUrl());
        ImageCardCropResponse cardCrops = fileName == null
                ? null
                : imageCardCropService.findForImageUrls(List.of(post.getImageUrl())).get(fileName);
        return PostResponse.from(post, cardCrops);
    }
}