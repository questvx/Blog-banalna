package pl.banalna.api;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import pl.banalna.setting.HeroMessageRequest;
import pl.banalna.setting.HeroMessageResponse;
import pl.banalna.setting.SiteSettingService;

@RestController
@RequestMapping("/api/admin/hero-message")
public class AdminHeroMessageController {

    private final SiteSettingService siteSettingService;

    public AdminHeroMessageController(SiteSettingService siteSettingService) {
        this.siteSettingService = siteSettingService;
    }

    @GetMapping
    public HeroMessageResponse getHeroMessage() {
        return siteSettingService.getHeroMessage();
    }

    @PutMapping
    public HeroMessageResponse saveHeroMessage(@Valid @RequestBody HeroMessageRequest request) {
        return siteSettingService.saveHeroMessage(request.message());
    }
}
