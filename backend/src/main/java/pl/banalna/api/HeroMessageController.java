package pl.banalna.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import pl.banalna.setting.HeroMessageResponse;
import pl.banalna.setting.SiteSettingService;

@RestController
@RequestMapping("/api/hero-message")
public class HeroMessageController {

    private final SiteSettingService siteSettingService;

    public HeroMessageController(SiteSettingService siteSettingService) {
        this.siteSettingService = siteSettingService;
    }

    @GetMapping
    public HeroMessageResponse getHeroMessage() {
        return siteSettingService.getHeroMessage();
    }
}
