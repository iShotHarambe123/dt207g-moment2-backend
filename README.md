# Arbetserfarenheter API - REST API för arbetserfarenheter

Ett REST API för att hantera arbetserfarenheter med fullständig CRUD-funktionalitet, byggt med Node.js, Express och SQLite.

## Funktionalitet

API:et stöder alla CRUD-operationer:

- **CREATE** - Skapa nya arbetserfarenheter
- **READ** - Hämta alla eller specifika arbetserfarenheter
- **UPDATE** - Uppdatera befintliga arbetserfarenheter
- **DELETE** - Ta bort arbetserfarenheter

## Teknisk stack

- **Backend**: Node.js med Express framework
- **Databas**: SQLite (filbaserad relationsdatabas)
- **CORS**: Aktiverat för cross-origin requests
- **Validering**: Serversidesvalidering av all input

## Databasstruktur

```sql
CREATE TABLE workexperience (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    companyname TEXT NOT NULL,
    jobtitle TEXT NOT NULL,
    location TEXT NOT NULL,
    startdate TEXT NOT NULL,
    enddate TEXT,
    description TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Base URL

```
http://localhost:3001
```

### Endpoints

| Metod  | Endpoint                  | Beskrivning                     |
| ------ | ------------------------- | ------------------------------- |
| GET    | `/api/workexperience`     | Hämta alla arbetserfarenheter   |
| GET    | `/api/workexperience/:id` | Hämta specifik arbetserfarenhet |
| POST   | `/api/workexperience`     | Skapa ny arbetserfarenhet       |
| PUT    | `/api/workexperience/:id` | Uppdatera arbetserfarenhet      |
| DELETE | `/api/workexperience/:id` | Ta bort arbetserfarenhet        |

### Exempel på användning

#### Hämta alla arbetserfarenheter

```bash
GET http://localhost:3001/api/workexperience
```

**Svar:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "companyname": "Mittuniversitetet",
      "jobtitle": "Labbhandledare",
      "location": "Sundsvall",
      "startdate": "2019-01-01",
      "enddate": "2019-12-31",
      "description": "Handledning av studenter i kursen DT057G",
      "created_at": "2025-10-27 16:00:00"
    }
  ],
  "count": 1
}
```

#### Skapa ny arbetserfarenhet

```bash
POST http://localhost:3001/api/workexperience
Content-Type: application/json

{
  "companyname": "Företag AB",
  "jobtitle": "Utvecklare",
  "location": "Stockholm",
  "startdate": "2020-01-01",
  "enddate": "2021-12-31",
  "description": "Webbutveckling med JavaScript och Node.js"
}
```

#### Uppdatera arbetserfarenhet

```bash
PUT http://localhost:3001/api/workexperience/1
Content-Type: application/json

{
  "companyname": "Uppdaterat Företag",
  "jobtitle": "Senior Utvecklare",
  "location": "Göteborg",
  "startdate": "2020-01-01",
  "enddate": "2022-12-31",
  "description": "Uppdaterad beskrivning av arbetet"
}
```

#### Ta bort arbetserfarenhet

```bash
DELETE http://localhost:3001/api/workexperience/1
```

## Validering

API:et validerar all input och returnerar tydliga felmeddelanden:

- **companyname**: Obligatoriskt, får ej vara tomt
- **jobtitle**: Obligatoriskt, får ej vara tomt
- **location**: Obligatoriskt, får ej vara tomt
- **startdate**: Obligatoriskt, format YYYY-MM-DD
- **enddate**: Valfritt, format YYYY-MM-DD om angivet
- **description**: Obligatoriskt, får ej vara tomt

## Installation och körning

1. Installera dependencies:

```bash
npm install
```

2. Starta API:et:

```bash
npm start
```

3. API:et körs på `http://localhost:3001`

## Testning

Du kan testa API:et med:

- **Postman** eller **Insomnia** för GUI-baserad testning
- **curl** för kommandoradstestning
- **Frontend-applikation** (se Uppgift 2.2)

### Exempel med curl:

```bash
# Hämta alla
curl http://localhost:3001/api/workexperience

# Skapa ny
curl -X POST http://localhost:3001/api/workexperience \
  -H "Content-Type: application/json" \
  -d '{"companyname":"Test AB","jobtitle":"Testare","location":"Test","startdate":"2023-01-01","description":"Testarbete"}'
```

## Felhantering

API:et returnerar strukturerade felmeddelanden:

```json
{
  "error": "Valideringsfel",
  "message": "Vänligen rätta följande fel",
  "details": [
    "Företagsnamn måste fyllas i",
    "Startdatum måste vara i format YYYY-MM-DD"
  ]
}
```

## Utvecklad av

Hannes Wilson (hawi2401) - DT207G Backend-baserad webbutveckling, Mittuniversitetet
