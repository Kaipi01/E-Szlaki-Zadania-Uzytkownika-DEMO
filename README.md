# Moduł Zadania-Użytkownika

Moduł jest narzędziem do organizowania i zarządzania prywatnymi zadaniami użytkownika. Umożliwia łatwe planowanie i śledzenie postępów w realizacji codziennych oraz długoterminowych zadań.

## Jak działa?

### Dodawanie zadań

* Użytkownik może tworzyć nowe zadania, podając:

  * nazwę,
  * priorytet,
  * daty rozpoczęcia i zakończenia,
  * typ zadania (główne lub codzienne),
  * kategorię,
  * opis.
* Zadania mogą zawierać dowolną liczbę podzadań.

  * Podzadania mogą mieć ustawione daty (dla zadań głównych) lub godziny (dla zadań codziennych).
  * Dodawanie i edycja podzadań możliwe tylko w trybie edycji zadania.

### Podgląd zadań

* Można wyświetlić szczegóły zadania oraz:

  * usuwać zadanie,
  * archiwizować,
  * oznaczać jako zakończone.
* Podzadania można oznaczać jako wykonane tylko z poziomu podglądu zadania.
* Zadania zarchiwizowane mają zablokowane opcje edycji, zakończenia i zarządzania podzadaniami.

### Wyświetlanie zadań

* Zadania wyświetlane są w panelu głównym i panelu z zadaniami w formie listy.
* Listę można sortować i filtrować według:

  * priorytetu,
  * statusu (np. w trakcie, ukończone),
  * nazwy.

### Zarządzanie zadaniami

* Użytkownik może edytować, usuwać i archiwizować zadania.
* Archiwalne zadania są ukrywane z widoku i znajdują się w panelu Archiwum.
* Zadania można oznaczać jako wykonane, co odświeża statystyki zadań głównych.

### Archiwizacja zadań

* Możliwa tylko dla zadań głównych.
* Po upływie terminu ukończenia, zadanie oznaczane jest jako „Porzucone” i przenoszone do archiwum.
* Archiwizacja blokuje:

  * licznik czasu do wykonania zadania,
  * inne opcje dostępne w podglądzie.
* Archiwizowane zadania są wliczane w statystyki wykresu kołowego.

### Kategorie

* Użytkownik może tworzyć, edytować i usuwać własne kategorie.
* Każda kategoria może mieć przypisaną ikonę z dostępnej listy.
* Kategorie ułatwiają organizację i szybkie wyszukiwanie zadań.

### Wyszukiwanie

* Aplikacja pozwala wyszukiwać zadania i kategorie.

### Statystyki

* Moduł śledzi liczbę aktywnych zadań (główne i codzienne).
* Wykres kołowy pokazuje proporcje:

  * ukończonych,
  * porzuconych,
  * w trakcie zadań głównych,
  * uwzględnia również zadania w archiwum.
* Wykres jest dynamicznie aktualizowany.

### Dynamiczne aktualizacje

* Wszystkie zmiany (dodawanie, usuwanie, zmiana statusu) są od razu odzwierciedlane w liście i statystykach.

### Responsywny interfejs

* Moduł działa równie dobrze na komputerach, tabletach i smartfonach.




# Dokumentacja Modułu Zarządzania Zadaniami

## Ogólny Opis

Moduł jest systemem zarządzania zadaniami i kategoriami, umożliwiającym użytkownikowi:

* tworzenie, edytowanie, usuwanie i archiwizowanie zadań,
* organizowanie zadań w kategorie.

Więcej szczegółów znajduje się w pliku `działanie-modułu.odt`. Moduł korzysta z **Web Components**.

Stan aplikacji przechowywany jest w `localStorage`, a komunikacja między modułami odbywa się poprzez nasłuchiwanie **CustomEvent**.

## Kluczowe Moduły Aplikacji

### 1. UPTPanel

* **Opis:** Główny panel aplikacji wyświetlający kategorie, zadania i statystyki.
* **Funkcjonalności:**

  * Dodawanie nowych zadań i kategorii
  * Aktualizacja i usuwanie istniejących elementów
  * Wyświetlanie listy kategorii i zadań
  * Komunikacja z serwisem `UPTApiService` w celu pobierania danych i zapisywania zmian

### 2. UPTArchivePanel

* **Opis:** Panel zarządzania zadaniami archiwalnymi.
* **Funkcjonalności:**

  * Przywracanie zarchiwizowanych zadań
  * Usuwanie zarchiwizowanych zadań
  * Filtrowanie i sortowanie według daty, kategorii itp.

### 3. UPTCategoryPanel

* **Opis:** Panel zarządzania kategoriami.
* **Funkcjonalności:**

  * Tworzenie, edytowanie i usuwanie kategorii
  * Wyświetlanie wszystkich kategorii
  * Obsługa zadań przypisanych do kategorii

### 4. UPTTasksPanel

* **Opis:** Panel do zarządzania zadaniami.
* **Funkcjonalności:**

  * Tworzenie nowych zadań
  * Edycja, usuwanie i archiwizacja zadań
  * Filtrowanie zadań według statusu, kategorii lub daty
  * Przypisanie zadań do kategorii

## Komunikacja Pomiędzy Modułami

* Moduły komunikują się przez nasłuchiwanie **CustomEvent**.
* Zmiany w jednym module automatycznie aktualizują inne moduły.
* Przykłady zdarzeń:

  * Dodanie nowego zadania – powiadamia inne panele o aktualizacji listy.
  * Edycja zadania lub kategorii – zmodyfikowane dane przekazywane są do komponentów.
  * Archiwizowanie zadania – zadanie przenoszone do archiwum, inne panele aktualizują widok aktywnych zadań.
* Komunikacja odbywa się asynchronicznie, zapewniając responsywność aplikacji.

## Stan Aplikacji w LocalStorage

* Dane aplikacji przechowywane są w `localStorage`, zapewniając trwałość między sesjami.
* Każda zmiana (dodanie kategorii lub zadania) jest zapisywana lokalnie.
* Moduły korzystają z centralnego serwisu `UPTApiService` do odczytu i zapisu danych.
* Serwis zapewnia synchronizację między lokalnym magazynem a potencjalnym backendem.

## Web Components

* Moduł wykorzystuje **Web Components** do tworzenia odseparowanych, samodzielnych komponentów UI.
* Ułatwia to wielokrotne użycie komponentów i redukcję ilości kodu.
* Niektóre panele modułu używają Web Components do poprawy struktury i organizacji kodu.









* Moduł działa płynnie na komputerach, tabletach i smartfonach.
