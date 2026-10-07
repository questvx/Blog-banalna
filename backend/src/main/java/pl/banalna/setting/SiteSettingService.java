package pl.banalna.setting;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SiteSettingService {

    private static final String HERO_MESSAGE_KEY = "hero-message";

    private final SiteSettingRepository siteSettingRepository;

    public SiteSettingService(SiteSettingRepository siteSettingRepository) {
        this.siteSettingRepository = siteSettingRepository;
    }

    @Transactional(readOnly = true)
    public HeroMessageResponse getHeroMessage() {
        String message = siteSettingRepository.findById(HERO_MESSAGE_KEY)
                .map(SiteSetting::getValue)
                .orElse("");
        return new HeroMessageResponse(message);
    }

    @Transactional
    public HeroMessageResponse saveHeroMessage(String message) {
        String normalizedMessage = message.trim();
        siteSettingRepository.save(new SiteSetting(HERO_MESSAGE_KEY, normalizedMessage));
        return new HeroMessageResponse(normalizedMessage);
    }
}
