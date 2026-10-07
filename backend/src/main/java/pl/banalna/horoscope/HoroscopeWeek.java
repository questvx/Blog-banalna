package pl.banalna.horoscope;

import java.time.LocalDate;
import java.util.EnumMap;
import java.util.Map;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapKeyColumn;
import jakarta.persistence.MapKeyEnumerated;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "horoscope_weeks", uniqueConstraints = {
        @UniqueConstraint(name = "uk_horoscope_weeks_week_start", columnNames = "week_start")
})
public class HoroscopeWeek {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "week_start", nullable = false)
    private LocalDate weekStart;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "horoscope_entries",
            joinColumns = @JoinColumn(name = "week_id", nullable = false),
            uniqueConstraints = @UniqueConstraint(
                    name = "uk_horoscope_entries_week_sign",
                    columnNames = { "week_id", "zodiac_sign" }))
    @MapKeyColumn(name = "zodiac_sign", nullable = false, length = 20)
    @MapKeyEnumerated(EnumType.STRING)
    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private Map<HoroscopeSign, String> signs = new EnumMap<>(HoroscopeSign.class);

    protected HoroscopeWeek() {
    }

    public HoroscopeWeek(LocalDate weekStart) {
        this.weekStart = weekStart;
    }

    public void replaceSigns(Map<HoroscopeSign, String> signs) {
        this.signs.clear();
        this.signs.putAll(signs);
    }

    public LocalDate getWeekStart() {
        return weekStart;
    }

    public Map<HoroscopeSign, String> getSigns() {
        return signs;
    }
}
