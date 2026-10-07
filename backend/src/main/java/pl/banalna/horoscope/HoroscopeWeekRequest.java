package pl.banalna.horoscope;

import java.util.Map;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record HoroscopeWeekRequest(
        @NotEmpty Map<@NotNull HoroscopeSign, @NotBlank @Size(max = 5000) String> signs) {
}
