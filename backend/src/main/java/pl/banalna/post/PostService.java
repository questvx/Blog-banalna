package pl.banalna.post;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PostService {

    private final PostRepository postRepository;

    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    public List<PostResponse> findPublished() {
        return postRepository.findAllByStatusOrderByPublishedDateDesc(PostStatus.PUBLISHED).stream()
                .map(PostResponse::from)
                .toList();
    }

    public PostResponse findPublishedById(Long id) {
        return postRepository.findByIdAndStatus(id, PostStatus.PUBLISHED)
                .map(PostResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
    }

    public List<PostResponse> findAllForAuthor() {
        return postRepository.findAll().stream()
                .map(PostResponse::from)
                .toList();
    }

    public PostResponse findByIdForAuthor(Long id) {
        return postRepository.findById(id)
                .map(PostResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
    }
}