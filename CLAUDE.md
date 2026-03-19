# FrogMoker

## Project Overview

FrogMoker is a developer utility for composing, templating, and firing protocol messages (HTTP, WebSocket, etc.) with dynamic variable support — similar in spirit to Postman but focused on structured message moking/testing.

## Tech Stack

### Backend
- **Language**: Java 8
- **Framework**: Spring Boot 2.7.18
- **ORM**: MyBatis-Plus 3.5.5
- **Database**: SQLite (file: `data/db/frogmoker.db`)
- **HTTP Client**: Apache HttpClient (with connection pooling)
- **WebSocket**: Spring WebSocket
- **Mock Server**: Eclipse Jetty 9.4 (embedded)
- **API Docs**: Springdoc OpenAPI + Knife4j (Swagger UI)
- **Utilities**: Lombok, Jackson

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui (Radix UI + Tailwind CSS)
- **Entry**: `frontend/src/main.tsx`

## Project Structure

```
FrogMoker/
├── pom.xml                          # Maven build config
├── data/db/                         # SQLite database (runtime, gitignored)
├── frontend/                        # React/TypeScript SPA
│   ├── src/
│   │   ├── components/ui/           # shadcn/ui components
│   │   └── main.tsx                 # App entry point
│   └── package.json
└── src/main/java/com/hxuanyu/frogmoker/
    ├── common/                      # Result wrapper, exception handling
    ├── config/                      # CORS, MyBatis-Plus, OpenAPI config
    ├── controller/                  # REST controllers (sender, template, SPA)
    ├── dto/                         # Request/response DTOs
    ├── entity/                      # DB entities (MessageTemplate, TemplateVariable, SequenceState)
    ├── mapper/                      # MyBatis-Plus mappers
    └── service/
        ├── client/                  # Protocol client abstraction (HTTP, WS, etc.)
        ├── generator/               # Variable generators (UUID, timestamp, sequence, random, fixed)
        └── processor/               # Message content processors (JSON, XML)
```

## Build & Run

### Backend
```bash
mvn clean package -DskipTests
java -jar target/frogmoker-*.jar
```

### Frontend (development)
```bash
cd frontend
npm install
npm run dev
```

### Frontend (production build)
```bash
cd frontend
npm run build
# Output goes to src/main/resources/static (served by Spring Boot)
```

## Key Features

1. **Message Templates** — Store/retrieve reusable JSON/XML message templates in SQLite
2. **Variable Substitution** — Dynamic value injection via pluggable generators:
   - UUID, Timestamp, Sequential number, Random number, Fixed value
3. **Multi-Protocol Sending** — HTTP (with connection pooling), WebSocket
4. **Mock Server** — Embedded Jetty for mocking HTTP request/response behavior
5. **Matching Rules** — Configurable rules to match and route incoming requests
6. **Web UI** — React SPA served by Spring Boot (`SpaController`) for managing everything interactively

## API Documentation

Available at runtime: `http://localhost:8080/doc.html` (Knife4j Swagger UI)
