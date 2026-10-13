package pl.banalna.horoscope;

import java.time.LocalDate;
import java.util.EnumMap;
import java.util.Map;

public record HoroscopeWeekResponse(LocalDate weekStart, Map<HoroscopeSign, String> signs) {
    public static HoroscopeWeekResponse from(HoroscopeWeek week) {
        Map<HoroscopeSign, String> signs = new EnumMap<>(HoroscopeSign.class);
        signs.putAll(week.getSigns());
        return new HoroscopeWeekResponse(week.getWeekStart(), signs);
    }
}
