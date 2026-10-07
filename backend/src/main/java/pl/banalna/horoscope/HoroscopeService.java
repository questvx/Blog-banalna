package pl.banalna.horoscope;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class HoroscopeService {

    private final HoroscopeWeekRepository horoscopeWeekRepository;

    public HoroscopeService(HoroscopeWeekRepository horoscopeWeekRepository) {
        this.horoscopeWeekRepository = horoscopeWeekRepository;
    }

    @Transactional(readOnly = true)
    public List<HoroscopeWeekResponse> findAll() {
        return horoscopeWeekRepository.findAllByOrderByWeekStartAsc().stream()
                .map(HoroscopeWeekResponse::from)
                .toList();
    }

    @Transactional
    public HoroscopeWeekResponse save(LocalDate weekStart, Map<HoroscopeSign, String> signs) {
        if (weekStart.getDayOfWeek() != DayOfWeek.MONDAY) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Horoscope weeks must start on a Monday.");
        }
        if (signs.size() != HoroscopeSign.values().length
                || !signs.keySet().containsAll(List.of(HoroscopeSign.values()))
                || signs.values().stream().anyMatch(content -> content == null || content.isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Provide a horoscope for every zodiac sign.");
        }

        HoroscopeWeek week = horoscopeWeekRepository.findByWeekStart(weekStart)
                .orElseGet(() -> new HoroscopeWeek(weekStart));
        week.replaceSigns(signs);
        return HoroscopeWeekResponse.from(horoscopeWeekRepository.save(week));
    }
}
