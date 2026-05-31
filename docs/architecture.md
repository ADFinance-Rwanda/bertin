# Architecture

## Overview

The Task Manager is a Dockerized full-stack application composed of 5 services communicating over an internal Docker bridge network (`tm_net`).

## Architecture Diagram
![alt](/docs/img/tm_structure.png)

## Authentication Flow
![Sequence](/docs/img/tm_009.png)


## Service Responsibilities

| Service | Responsibility |
|---|---|
| **Angular (nginx)** | SPA UI, Keycloak OIDC client, proxies `/api` to backend |
| **NestJS** | REST API, JWT validation, business logic, data isolation |
| **PostgreSQL** | Persistent task storage, UUID PKs, enum types |
| **Redis** | Analytics cache per user (cache-aside, 5-min TTL) |
| **Keycloak** | OIDC identity provider, user management, JWT issuer |

## Security Design Decisions

1. **JWT never touches localStorage** — Keycloak JS adapter stores tokens in memory and session storage
2. **Per-user data isolation** — every query uses `WHERE owner_id = ?` enforced in `TasksService`
3. **Guessing UUIDs → 404** — single task lookup uses `WHERE id = ? AND owner_id = ?`; unauthorized access returns not-found, not forbidden
4. **JWKS caching** — `jwks-rsa` caches public keys for 10 minutes; reduces load on Keycloak
5. **Redis failure safe** — all `RedisService` methods catch errors; a Redis outage degrades to uncached responses, not service failure
6. **No synchronize:true** — TypeORM uses explicit migrations, never auto-alters schema

## Port Allocation

| Service | External Port | Internal Port |
|---|---|---|
| Frontend (nginx) | 4200 | 80 |
| Backend (NestJS) | 6354 | 6354 |
| Keycloak | 6353 | 6353 |
| PostgreSQL | 5432 | 5432 |
| Redis | 6351 | 6351 |
