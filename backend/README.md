# Banalna backend

Backend bloga `banalna`, przygotowany w Javie i Spring Boot.

## Stack

- Java 21
- Spring Boot
- Maven
- MySQL
- Spring Data JPA
- Flyway

## Uruchomienie

Wymagane są JDK 21, Maven i MySQL.

Ustaw zmienne środowiskowe:

```powershell
$env:DB_URL = 'jdbc:mysql://localhost:3306/banalna'
$env:DB_USERNAME = 'banalna'
$env:DB_PASSWORD = 'twoje_haslo'
```

Następnie uruchom:

```powershell
mvn spring-boot:run
```

Kontrola działania:

```text
http://localhost:8080/api/health
```

## Od czego zacząć

1. Zainstalować JDK 21, Maven i MySQL.
2. Utworzyć bazę `banalna` oraz użytkownika aplikacji.
3. Dodać encję `Post` odpowiadającą migracji `V1__create_posts_table.sql`.
4. Dodać repozytorium, serwis i kontroler `GET /api/posts`.
5. Podłączyć frontend do API zamiast statycznego `posts.ts`.

Dane dostępowe pozostają poza repozytorium i powinny być ustawiane przez zmienne środowiskowe.
