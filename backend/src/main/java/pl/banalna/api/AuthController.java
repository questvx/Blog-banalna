package pl.banalna.api;

import org.springframework.security.core.Authentication;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/csrf")
    public CsrfResponse csrf(CsrfToken csrfToken) {
        return new CsrfResponse(csrfToken.getToken(), csrfToken.getHeaderName());
    }

    @GetMapping("/me")
    public AuthorResponse currentAuthor(Authentication authentication) {
        return new AuthorResponse(authentication.getName());
    }

    public record CsrfResponse(String token, String headerName) {
    }

    public record AuthorResponse(String username) {
    }
}