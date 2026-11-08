package pl.banalna.api;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import pl.banalna.curiosity.CuriosityResponse;
import pl.banalna.curiosity.CuriosityService;

@RestController
@RequestMapping("/api/curiosities")
public class CuriosityController {

    private final CuriosityService curiosityService;

    public CuriosityController(CuriosityService curiosityService) {
        this.curiosityService = curiosityService;
    }

    @GetMapping
    public List<CuriosityResponse> findPublished() {
        return curiosityService.findPublished();
    }
}
