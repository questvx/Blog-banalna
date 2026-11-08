package pl.banalna.curiosity;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import pl.banalna.post.PostStatus;

@Service
public class CuriosityService {

    private final CuriosityRepository curiosityRepository;

    public CuriosityService(CuriosityRepository curiosityRepository) {
        this.curiosityRepository = curiosityRepository;
    }

    public CuriosityResponse create(CuriosityRequest request) {
        return CuriosityResponse.from(curiosityRepository.save(new Curiosity(request)));
    }

    public List<CuriosityResponse> findAll() {
        return curiosityRepository.findAllByOrderByIdDesc().stream()
                .map(CuriosityResponse::from)
                .toList();
    }

    public List<CuriosityResponse> findPublished() {
        return curiosityRepository.findAllByStatusOrderByCreatedAtDesc(PostStatus.PUBLISHED).stream()
                .map(CuriosityResponse::from)
                .toList();
    }

    public CuriosityResponse update(Long id, CuriosityRequest request) {
        Curiosity curiosity = curiosityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curiosity not found"));
        curiosity.update(request);
        return CuriosityResponse.from(curiosityRepository.save(curiosity));
    }

    public void delete(Long id) {
        if (!curiosityRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Curiosity not found");
        }
        curiosityRepository.deleteById(id);
    }
}
