package pl.banalna.horoscope;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface HoroscopeWeekRepository extends JpaRepository<HoroscopeWeek, Long> {
    List<HoroscopeWeek> findAllByOrderByWeekStartAsc();

    Optional<HoroscopeWeek> findByWeekStart(LocalDate weekStart);
}
