package pl.banalna.curiosity;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.banalna.post.PostStatus;

public interface CuriosityRepository extends JpaRepository<Curiosity, Long> {
    List<Curiosity> findAllByOrderByIdDesc();

    List<Curiosity> findAllByStatusOrderByCreatedAtDesc(PostStatus status);
}
