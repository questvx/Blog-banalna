package pl.banalna.api;

import java.util.List;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import pl.banalna.curiosity.CuriosityRequest;
import pl.banalna.curiosity.CuriosityResponse;
import pl.banalna.curiosity.CuriosityService;

@RestController
@RequestMapping("/api/admin/curiosities")
public class AdminCuriosityController {

    private final CuriosityService curiosityService;

    public AdminCuriosityController(CuriosityService curiosityService) {
        this.curiosityService = curiosityService;
    }

    @GetMapping
    public List<CuriosityResponse> findAll() {
        return curiosityService.findAll();
    }

    @PostMapping
    public ResponseEntity<CuriosityResponse> create(@Valid @RequestBody CuriosityRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(curiosityService.create(request));
    }

    @PutMapping("/{id}")
    public CuriosityResponse update(@PathVariable Long id, @Valid @RequestBody CuriosityRequest request) {
        return curiosityService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        curiosityService.delete(id);
    }
}
