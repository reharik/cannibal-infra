# Application layer

Use cases and application services live here. They orchestrate domain entities and repositories and must not contain persistence or HTTP details.

- Use case functions or services (e.g. `CreateAlbumUseCase`, `AddMemberToAlbumUseCase`)
- Application-level DTOs or commands if needed
- No framework IoC; dependency injection (e.g. Awilix) will wire this layer later
