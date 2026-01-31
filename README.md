# not-th.re

[![license GNU AGPLv3](https://img.shields.io/badge/license-GNU%20AGPLv3-blue)](https://github.com/not-three/main/blob/main/LICENSE)
[![gitHub issues](https://img.shields.io/github/issues/not-three/main)](https://github.com/not-three/main/issues)

[![ui releases](https://img.shields.io/github/v/release/not-three/ui?label=ui%20version)](https://github.com/not-three/ui/releases)
[![build ui Nightly](https://img.shields.io/github/actions/workflow/status/not-three/ui/nightly.yml?label=build%20ui%20nightly)](https://github.com/not-three/ui/actions/workflows/nightly.yml)
[![ui commits](https://img.shields.io/github/last-commit/not-three/ui?label=last%20ui%20commit)](https://github.com/not-three/ui/commits/main)

[![api releases](https://img.shields.io/github/v/release/not-three/api?label=api%20version)](https://github.com/not-three/api/releases)
[![build api Nightly](https://img.shields.io/github/actions/workflow/status/not-three/api/nightly.yml?label=build%20api%20nightly)](https://github.com/not-three/api/actions/workflows/nightly.yml)
[![api commits](https://img.shields.io/github/last-commit/not-three/api?label=last%20api%20commit)](https://github.com/not-three/api/commits/main)

[![cli releases](https://img.shields.io/github/v/release/not-three/cli?label=cli%20version)](https://github.com/not-three/cli/releases)
[![cli npm package](https://img.shields.io/npm/v/%40not3%2Fcli)](https://www.npmjs.com/package/@not3/cli)
[![build cli Nightly](https://img.shields.io/github/actions/workflow/status/not-three/cli/nightly.yml?label=build%20cli%20nightly)](https://github.com/not-three/cli/actions/workflows/nightly.yml)
[![cli commits](https://img.shields.io/github/last-commit/not-three/cli?label=last%20cli%20commit)](https://github.com/not-three/cli/commits/main)

[![sdk releases](https://img.shields.io/github/v/release/not-three/sdk?label=sdk%20version)](https://github.com/not-three/sdk/releases)
[![sdk npm package](https://img.shields.io/npm/v/%40not3%2Fsdk)](https://www.npmjs.com/package/@not3/sdk)
[![build sdk Nightly](https://img.shields.io/github/actions/workflow/status/not-three/sdk/nightly.yml?label=build%20sdk%20nightly)](https://github.com/not-three/sdk/actions/workflows/nightly.yml)
[![sdk commits](https://img.shields.io/github/last-commit/not-three/sdk?label=last%20sdk%20commit)](https://github.com/not-three/sdk/commits/main)

[![draw releases](https://img.shields.io/github/v/release/not-three/draw?label=draw%20version)](https://github.com/not-three/draw/releases)
[![build draw Nightly](https://img.shields.io/github/actions/workflow/status/not-three/draw/nightly.yml?label=build%20draw%20nightly)](https://github.com/not-three/draw/actions/workflows/nightly.yml)
[![draw commits](https://img.shields.io/github/last-commit/not-three/draw?label=last%20draw%20commit)](https://github.com/not-three/draw/commits/main)

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
- File transfers
- Connect your private instance with the public UI
- **_New_**: **Excalidraw integration**
- **_Planned_**: **Peer 2 Peer sessions**
- **_Planned_**: **Note Bundles**
- **_Planned_**: **HTML Previewer**
- **_Planned_**: **JavaScript Console**
- No cookies
- No tracking
- No ads

## Cli

We also provide a cli tool to interact with the API.

```bash
npm install -g @not3/cli
```

```log
$ not3 --help
Usage: not3 [options] [command]

Options:
  -V, --version                              output the version number
  -h, --help                                 display help for command

Commands:
  license                                    Show information about the license of the software
  decrypt [options] <seed>                   Decrypt something
  encrypt [options] [input...]               Encrypt something, if no input is provided, will read from stdin
  download|d [options] <id> <seed> <output>  Download a file and decrypt it
  upload|u [options] <input>                 Upload a file and encrypt it
  query|q [options] <id> <seed>              Decrypt and show a note from the server
  save|s [options] [content...]              Encrypt and save a note on the server
  seed                                       Generate a new encryption seed
  info [options]                             Show meta information about the api
  stats [options]                            Show usage statistics of the server
  help [command]                             display help for command
```

Or use it with docker:

```bash
docker run --rm -it -v "$(pwd):/data" ghcr.io/not-three/cli --help
```

## Deployment

The simplest way to use !3 is to visit our hosted instance at [https://not-th.re](https://not-th.re).

### ⚠️ Security & SSL Requirement

Because this project relies on the Web Crypto API (`crypto.subtle`) for client-side encryption, the **UI MUST be deployed using SSL/HTTPS**. Browsers do not provide access to the `crypto.subtle` interface if the site is not served in a secure context.

* **UI:** HTTPS is mandatory; the application will not function without it.
* **API:** While the API can theoretically be deployed without SSL, it is **strongly disadvised**.
* **Configuration:** The deployment examples provided in this documentation do not include SSL configuration. Users are expected to configure this on their own.

For those using Traefik as a reverse proxy, we recommend referring to the [Traefik Let's Encrypt documentation](https://doc.traefik.io/traefik/https/acme/) for automated certificate management.

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
      - 4000:4000
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
    "url": "http://<ip-of-the-server>:4000/",
    "password": "MySecretPassword"
  }
}
```

Dont forget to save the settings, by clicking on `File` -> `Save` (or by pressing `ctrl` + `s`).

> 💡 Note: If you're using your own private instance and share a URL, the encrypted link will
> include both the encryption key and the address of your private server. When someone opens
> the link and they haven't set your server as their primary one, they'll be notified and asked
> to confirm access to data from an external server. If they agree, the data will then be loaded
> securely from your instance.

### Minimal

The minimal deployment includes the API and the UIs.
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

  draw:
    image: ghcr.io/not-three/draw:latest
    <<: *restart

  ui:
    image: ghcr.io/not-three/ui:latest
    <<: *restart
    ports:
      - 4000:4000
    depends_on:
      - api
      - draw
    environment:
      PROXY_URL: http://api:3000
      DRAW_PROXY_URL: http://draw:80

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

  draw:
    image: ghcr.io/not-three/draw:latest
    <<: *restart
    ports:
      - 4500:80

  ui:
    image: ghcr.io/not-three/ui:latest
    <<: *restart
    ports:
      - 4000:4000
    environment:
      API_URL: http://localhost:3000
      DRAW_URL: http://localhost:4500
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
{ "baseURL": "https://api.not-th.re/", "drawURL": "https://draw.not-th.re/", "termsURL": "https://scolasti.co/go/privacy" }
```

You can download the client bundle from one of the following sources:

### Github Releases

All stable versions of the client are available as a github release artifact.

[![download ui stable gh releases artifacts](https://img.shields.io/badge/download-UI_stable_gh_releases_artifacts-blue)](https://github.com/not-three/ui/releases)

[![download draw stable gh releases artifacts](https://img.shields.io/badge/download-DRAW_stable_gh_releases_artifacts-blue)](https://github.com/not-three/draw/releases)

### Docker

```bash
docker run --rm --entrypoint /bin/sh -v $(pwd):/mnt ghcr.io/not-three/ui:latest -c "cp -r /app/public/ /mnt/ui/"

docker run --rm --entrypoint /bin/sh -v $(pwd):/mnt ghcr.io/not-three/draw:latest -c "cp -r /usr/local/apache2/htdocs/ /mnt/draw/"
```

This will copy the public folder to your current working directory.

### Github Actions

The nightly (unstable) versions of the client are also available as a github action artifacts.

[![download ui nightly gh actions artifacts](https://img.shields.io/badge/download-UI_nightly_gh_actions_artifacts-red)](https://nightly.link/not-three/ui/workflows/nightly/main/client-bundle)

[![download draw nightly gh actions artifacts](https://img.shields.io/badge/download-DRAW_nightly_gh_actions_artifacts-red)](https://nightly.link/not-three/draw/workflows/nightly/main/client-bundle)

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

## Contributing

The !3 project is open source and welcomes contributions. It is structured across multiple repositories, each serving a specific purpose:

- [main](https://github.com/not-three/main) - Contains deployment documentation, shell scripts, and overall project setup.
- [ui](https://github.com/not-three/ui) - The web interface for !3, built with Nuxt (Vue) and TypeScript.
- [api](https://github.com/not-three/api) - The backend API, written in TypeScript using the NestJS framework.
- [cli](https://github.com/not-three/cli) - Command-line interface for !3, built with TypeScript and the NestJS commander framework.
- [sdk](https://github.com/not-three/sdk) - A TypeScript SDK usable in both browser and Node.js environments.
- [draw](https://github.com/not-three/draw) - A wrapper for Excalidraw using React and TypeScript, used for visual/paste sharing.

> Note: The main repository is the central place for reporting bugs, submitting suggestions, and discussing ideas.
> It is the only repository in the organization with issues enabled.

### Legal Notice for Contributors

The project is licensed under the GNU Affero General Public License (AGPL). If you contribute to this project:

- Your contributions will be automatically licensed under the AGPL.
- If you later reuse your contributions in another project or deploy a modified version of the software, you are responsible for complying with the AGPL's terms.
- In particular, if you make the software available over a network (e.g., by hosting it), you are legally required to provide the corresponding source code to users of your deployment.

By contributing, you acknowledge and accept these terms. If in doubt, seek legal advice before submitting a contribution.
