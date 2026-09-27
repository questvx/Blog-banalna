package pl.banalna;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
        "app.author.username=test-author",
        "app.author.password=test-password"
})
class BackendApplicationTests {

    @Test
    void contextLoads() {
    }
}
