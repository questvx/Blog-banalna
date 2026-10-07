package pl.banalna.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import pl.banalna.horoscope.HoroscopeService;
import pl.banalna.horoscope.HoroscopeWeekResponse;

@RestController
@RequestMapping("/api/horoscopes")
public class HoroscopeController {

    private final HoroscopeService horoscopeService;

    public HoroscopeController(HoroscopeService horoscopeService) {
        this.horoscopeService = horoscopeService;
    }

    @GetMapping("/current")
    public HoroscopeWeekResponse findCurrent() {
        return horoscopeService.findCurrent();
    }
}
