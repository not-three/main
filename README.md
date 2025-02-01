# not-th.re

[![license GNU AGPLv3](https://img.shields.io/badge/license-GNU%20AGPLv3-blue)](https://github.com/not-three/main/blob/main/LICENSE)
[![gitHub issues](https://img.shields.io/github/issues/not-three/main)](https://github.com/not-three/main/issues)

[![ui releases](https://img.shields.io/github/v/release/not-three/ui?label=ui%20version)](https://github.com/not-three/ui/releases)
[![build ui Nightly](https://img.shields.io/github/actions/workflow/status/not-three/ui/nightly.yml?label=build%20ui%20nightly)](https://github.com/not-three/ui/actions/workflows/nightly.yml)
[![ui commits](https://img.shields.io/github/last-commit/not-three/ui?label=last%20ui%20commit)](https://github.com/not-three/ui/commits/main)

[![api releases](https://img.shields.io/github/v/release/not-three/api?label=api%20version)](https://github.com/not-three/api/releases)
[![build api Nightly](https://img.shields.io/github/actions/workflow/status/not-three/api/nightly.yml?label=build%20api%20nightly)](https://github.com/not-three/api/actions/workflows/nightly.yml)
[![api commits](https://img.shields.io/github/last-commit/not-three/api?label=last%20api%20commit)](https://github.com/not-three/api/commits/main)

!3 (spoken not three, derived from the leet speak word not3) is a simple
paste sharing platform similar to other solutions like hastebin or pastebin.

!3 is focused on simplicity, security by client side encryption
and usage of the monaco editor.

## Features

- Simple paste sharing
- Client side encryption
- Monaco editor
- Syntax highlighting
- Dark mode
- **_New_**: **File transfers**
- **_New_**: **Connect your private instance with the public UI**
- **_Planned_**: **Excalidraw integration**
- **_Planned_**: **Peer 2 Peer sessions**
- **_Planned_**: **Note Bundles**
- **_Planned_**: **HTML Previewer**
- **_Planned_**: **JavaScript Console**
- No cookies
- No tracking
- No ads

## Deployment

The simplest way to use !3 is to visit our hosted instance at [https://not-th.re](https://not-th.re).

### Micro

The micro deployment does not bring its own UI, but you can use the public UI.

```yml
services:
  api:
    image: ghcr.io/not-three/api:latest
    restart: unless-stopped
    environment:
      CORS_ENABLED: true
      LIMITS_DISABLED: true
      INSTANCE_PASSWORD: MySecretPassword
    ports:
      - 3000:3000
    volumes:
      - db:/data/db

volumes:
  db:
```

After you have deployed the API, visit the [public UI](https://not-th.re)
go to `Tools` -> `Edit Settings` and update these values:

```json
{
  "customServer": {
    "url": "http://<ip-of-the-server>:3000/",
    "password": "MySecretPassword"
  }
}
```

Dont forget to save the settings, by clicking on `File` -> `Save` (or by pressing `ctrl` + `s`).

### Minimal

The minimal deployment includes both the API and the UI.
The UI has the proxy mode enabled, so you only need a single port.

```yml
x-restart: &restart
  restart: unless-stopped

services:
  api:
    image: ghcr.io/not-three/api:latest
    <<: *restart
    volumes:
      - db:/data/db

  ui:
    image: ghcr.io/not-three/ui:latest
    <<: *restart
    ports:
      - 4000:4000
    depends_on:
      - api
    environment:
      PROXY_URL: http://api:3000

volumes:
  db:
```

### Simple

An simple deployment, including a postgres database instead of sqlite.
Recommended if you want to store more than a few pastes.

```yml
x-restart: &restart
  restart: unless-stopped

services:
  api:
    image: ghcr.io/not-three/api:latest
    <<: *restart
    depends_on:
      - db
    ports:
      - 3000:3000
    environment:
      CORS_ENABLED: true
      CORS_ORIGIN: http://localhost:4000
      DATABASE_MODE: pg
      DATABASE_HOST: db
      DATABASE_USERNAME: db
      DATABASE_PASSWORD: db
      DATABASE_NAME: db

  ui:
    image: ghcr.io/not-three/ui:latest
    <<: *restart
    ports:
      - 4000:4000
    environment:
      API_URL: http://localhost:3000
      TERMS_OF_SERVICE_URL: https://example.com

  db:
    image: postgres:14.5
    <<: *restart
    environment:
      POSTGRES_PASSWORD: db
      POSTGRES_USER: db
      POSTGRES_DB: db
    volumes:
      - db:/var/lib/postgresql/data

volumes:
  db:
```

### Advanced

See one of the following files for a more detailed example:

- [docker-compose.yml](./docker-compose.yml)
- [docker-compose.swarm.yml](./docker-compose.swarm.yml)

These include horizontal scaling, health checks and traefik as a reverse proxy.

### Environment variables

For a full list, with detailed descriptions of all environment variables, see the [configuration documentation](https://docs.not-th.re).

### Helm

As of now, we do not have an official helm chart, if you want to contribute one, feel free to open a PR.

## Static site deployment

In some scenarios, you might want to deploy the static site without a backend,
for example [not-th.re](https://not-th.re) is deployed with Cloudflare Pages,
while the API is hosted on [api.not-th.re](https://api.not-th.re).

The static site can then be configured by editing the `config.json` file.

```json
{ "baseURL": "https://api.not-th.re/", "termsURL": "https://scolasti.co/go/privacy" }
```

You can download the client bundle from one of the following sources:

### Github Releases

All stable versions of the client are available as a github release artifact.

[![download stable gh releases artifacts](https://img.shields.io/badge/download-stable_gh_releases_artifacts-blue)](https://github.com/not-three/ui/releases)

### Docker

```bash
docker run --rm --entrypoint /bin/sh -v $(pwd):/mnt ghcr.io/not-three/ui:latest -c "cp -r /app/public/ /mnt/public/"
```

This will copy the public folder to your current working directory.

### Github Actions

The nightly (unstable) versions of the client are also available as a github action artifacts.

[![download nightly gh actions artifacts](https://img.shields.io/badge/download-nightly_gh_actions_artifacts-red)](https://nightly.link/not-three/ui/workflows/nightly/main/client-bundle)

## License

This project is licensed under the **GNU Affero General Public License v3.0**.

### About

GNU AGPLv3

Permissions of this strongest copyleft license are conditioned on making available complete source code of licensed works and modifications, which include larger works using a licensed work, under the same license. Copyright and license notices must be preserved. Contributors provide an express grant of patent rights. When a modified version is used to provide a service over a network, the complete source code of the modified version must be made available.

### What you can do

| Permissions                                                                                                                       | Conditions                                                                                                                                                                                                  | Limitations                                                                                                            |
|-----------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------|
| <details><summary>🟢 Commercial use</summary>The licensed material and derivatives may be used for commercial purposes.</details> | <details><summary>🔵 Disclose source</summary>Source code must be made available when the licensed material is distributed.</details>                                                                       | <details><summary>🔴 Liability</summary>This license includes a limitation of liability.</details>                     |
| <details><summary>🟢 Distribution</summary>The licensed material may be distributed.</details>                                    | <details><summary>🔵 License and copyright notice</summary>A copy of the license and copyright notice must be included with the licensed material.</details>                                                | <details><summary>🔴 Warranty</summary>This license explicitly states that it does NOT provide any warranty.</details> |
| <details><summary>🟢 Modification</summary>The licensed material may be modified.</details>                                       | <details><summary>🔵 Network use is distribution</summary>Users who interact with the licensed material via network are given the right to receive a copy of the source code.</details>                     |                                                                                                                        |
| <details><summary>🟢 Patent use</summary>This license provides an express grant of patent rights from contributors.</details>     | <details><summary>🔵 Same license</summary>Modifications must be released under the same license when distributing the licensed material. In some cases a similar or related license may be used.</details> |                                                                                                                        |
| <details><summary>🟢 Private use</summary>The licensed material may be used and modified in private.</details>                    | <details><summary>🔵 State changes</summary>Changes made to the licensed material must be documented.</details>                                                                                             |                                                                                                                        |

*Information provided by [https://choosealicense.com/licenses/agpl-3.0/](https://choosealicense.com/licenses/agpl-3.0/)*

**This information is provided for general understanding and is not legal advice.**
