package pl.banalna.api;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import pl.banalna.horoscope.HoroscopeService;
import pl.banalna.horoscope.HoroscopeWeekRequest;
import pl.banalna.horoscope.HoroscopeWeekResponse;

@RestController
@RequestMapping("/api/admin/horoscopes")
public class AdminHoroscopeController {

    private final HoroscopeService horoscopeService;

    public AdminHoroscopeController(HoroscopeService horoscopeService) {
        this.horoscopeService = horoscopeService;
    }

    @GetMapping
    public List<HoroscopeWeekResponse> findAll() {
        return horoscopeService.findAll();
    }

    @PutMapping("/{weekStart}")
    public HoroscopeWeekResponse save(
            @PathVariable LocalDate weekStart,
            @Valid @RequestBody HoroscopeWeekRequest request) {
        return horoscopeService.save(weekStart, request.signs());
    }
}
