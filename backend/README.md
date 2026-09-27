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
$env:ADMIN_USERNAME = 'autorka'
$env:ADMIN_PASSWORD = 'ustaw_tutaj_silne_haslo'
$env:SESSION_COOKIE_SECURE = 'false'
```

`ADMIN_USERNAME` i `ADMIN_PASSWORD` są wymagane do uruchomienia aplikacji. W produkcji ustaw `SESSION_COOKIE_SECURE=true` i udostępniaj frontend oraz API przez HTTPS.

Logowanie używa sesji i ochrony CSRF. Przed każdym żądaniem `POST` pobierz token z `GET /api/auth/csrf` i dołącz go w nagłówku zwróconym przez endpoint (zwykle `X-XSRF-TOKEN`). Logowanie wyślij jako formularz z polami `username` i `password`. Po zalogowaniu pobierz nowy token przed wylogowaniem lub innym żądaniem zmieniającym dane, ponieważ Spring obraca token po uwierzytelnieniu. Sesja jest utrzymywana w ciasteczku.

Publiczne `GET /api/posts` i `GET /api/posts/{id}` zwracają tylko opublikowane wpisy. Po zalogowaniu autorka może odczytać wszystkie wpisy przez `GET /api/admin/posts` i `GET /api/admin/posts/{id}`.

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
