package pl.banalna.post;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {
	List<Post> findAllByStatusOrderByPublishedDateDesc(PostStatus status);

	Optional<Post> findByIdAndStatus(Long id, PostStatus status);
}