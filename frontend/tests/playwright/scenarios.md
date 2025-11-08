# E2E UI tests scenarios

## Auth - register, login, logout

1. Wejdź na http://localhost:4321
2. Kliknij na link "Create one now" żeby utworzyć nowe konto
3. Podaj "user1@example.com" jako Email
4. Podaj "password123" jako hasło
5. Kliknij "Create account"
6. Wykonaj "Login" z "Common steps"
7. Z sidebar kliknij "Sign out"
8. User powinine być wylogowany - powinna być widoczna strona logowania

## Upload single log

1. Wykonaj "Login" z "Common steps"
2. Z sidebar kliknij "Upload new log"
3. Do sekcji "Drag and drop your log file" dodaj plik: "DCM62v2_20250203.csv"
4. Kliknij "Upload file"
5. Powinieneś być automatycznie przekierowany na stronę "Log history", powinna ona zawierać element z nazwą "DCM62v2_20250203.csv"
6. Z sidebar kliknij "Sign out"

## Upload multiple logs (zip)

1. Wykonaj "Login" z "Common steps"
2. Z sidebar kliknij "Upload new log"
3. Do sekcji "Drag and drop your log file" dodaj plik: "multiple_logs.zip"
4. Kliknij "Upload file"
5. Powinieneś być automatycznie przekierowany na stronę "Log history", powinna ona zawierać element z nazwą "DCM62v2_20250204.csv", "DCM62v2_20250205.csv" (mogą być też inne nazwy)
6. Z sidebar kliknij "Sign out"

## Check single analysis

1. Wykonaj "Login" z "Common steps"
2. Z histori logów sprawdź "DCM62v2_20250203.csv" - powinien mieć status "Success" i notkę "No FAP regeneration flag"
3. Z histori logów kliknij na element "DCM62v2_20250203.csv"
4. Powinna się wyświetlić detaliczna analiza loga, powinna ona zawierać sekcje "FAP filter", "Engine", "Driving", "Overall metrics"
5. Z sidebar kliknij "Sign out"

## Check summary analysis

1. Wykonaj "Login" z "Common steps"
2. Z sidebar kliknij "Summary"
3. Powinna się wyświetlić detaliczna analiza śrenich parametrów, powinna ona zawierać sekcje "FAP filter", "Engine", "Driving", "Overall averages"
4. Z sidebar kliknij "Sign out"

## Common steps

### Login

1. Wejdź na http://localhost:4321
2. Podaj "user1@example.com" jako Email
3. Podaj "password123" jako hasło
4. Kliknij "Sign in"
