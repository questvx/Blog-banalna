package pl.banalna;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import pl.banalna.config.DotenvInitializer;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication application = new SpringApplication(BackendApplication.class);
        application.addInitializers(new DotenvInitializer());
        application.run(args);
    }
}
