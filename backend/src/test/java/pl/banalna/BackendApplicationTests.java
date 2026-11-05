package pl.banalna;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ContextConfiguration;

import static org.junit.jupiter.api.Assertions.assertTrue;

import pl.banalna.config.DotenvInitializer;

@ContextConfiguration(initializers = DotenvInitializer.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "app.author.username=test-author",
        "app.author.password=test-password"
})
class BackendApplicationTests {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void contextLoads() {
    }

    @Test
    void currentHoroscopeIsPublic() throws Exception {
        ResponseEntity<String> response = restTemplate.getForEntity("/api/horoscopes/current", String.class);
        int status = response.getStatusCode().value();

        assertTrue(status == 200 || status == 404, "Expected public horoscope response, got " + status);
    }
}
