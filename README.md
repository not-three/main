# not-th.re

[![License NPOSL-3.0](https://img.shields.io/badge/license-NPOSL--3.0-blue)](https://github.com/not-three/main/blob/main/LICENSE)
[![GitHub Issues](https://img.shields.io/github/issues/not-three/main)](https://github.com/not-three/main/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/not-three/main)](https://github.com/not-three/main/pulls)
[![Build and Publish Nightly](https://github.com/not-three/main/actions/workflows/nightly.yml/badge.svg)](https://github.com/not-three/main/actions/workflows/nightly.yml)
[![Build and Publish Release](https://github.com/not-three/main/actions/workflows/build.yml/badge.svg)](https://github.com/not-three/main/actions/workflows/build.yml)

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
- No cookies
- No tracking
- No ads

## Usage

The simplest way to use !3 is to visit our hosted instance at [https://not-th.re](https://not-th.re).

If you want to host your own instance, you can use this minimal docker compose example:

```yml
version: '3'

services:
  postgres:
    image: postgres:14.5
    environment:
      POSTGRES_PASSWORD: db
      POSTGRES_USER: db
      POSTGRES_DB: db
    volumes:
      - db:/var/lib/postgresql/data
  
  app:
    image: ghcr.io/not-three/main:latest
    # image: ghcr.io/not-three/main:nightly
    depends_on:
      - postgres
    ports:
      - 3000:3000
    environment:
      DB_HOST: postgres

volumes:
  db:
```

If you plan on only using it alone or with a very small group of people, you can also use sqlite:


```yml
version: '3'

services:
  app:
    image: ghcr.io/not-three/main:latest
    depends_on:
      - postgres
    ports:
      - 3000:3000
    environment:
      USE_SQLITE: "true"
      SQLITE_FILENAME: /data/db.sqlite
    volumes:
      - db:/data

volumes:
  db:
```

The sqlite mode is not recommended but is useful for development,
or deployments to raspberry pi's or other small devices (we do support arm64).

For a more advanced deployment, see the [docker-compose.yml](./docker-compose.yml) file.

## Static site deployment

In some scenarios, you might want to deploy the static site without a backend,
for example [not-th.re](https://not-th.re) is deployed with Cloudflare Pages,
while the API is hosted on [api.not-th.re](https://api.not-th.re).

The static site can then be configured by editing the `config.json` file.

```json
{ "baseURL": "https://api.not-th.re/", "terms": "https://scolasti.co/go/privacy" }
```

This is possible by getting the static fils by one of the following ways.

### Docker way

The docker way does ensure you get the exact same files as for the api deployment.

```bash
docker run --rm --entrypoint /bin/sh -v $(pwd):/mnt ghcr.io/not-three/main:latest -c "cp -r /app/client/ /mnt/client/"
```

This will copy the client folder to your current working directory.
If you use a specific api version, you can replace `latest` with the version you want to use.

### Github Actions

The latest version of the client is also available as a zip file in the workflow section of this repository.

[![download latest gh actions artifacts](https://img.shields.io/badge/download-latest_gh_actions_artifacts-blue)](https://nightly.link/not-three/main/workflows/build/main)
[![download nightly gh actions artifacts](https://img.shields.io/badge/download-nightly_gh_actions_artifacts-red)](https://nightly.link/not-three/main/workflows/nightly/main/client-bundle)

## Development

To start developing !3, clone the repository, install pnpm, then run

```bash
pnpm install # to install the dependencies
pnpm dev # to start the development server
```

## License

This project is licensed under the **Non-Profit Open Software License 3.0**.

### About

NPOSL-3.0

This license, a modified version of the Open Software License 3.0, mandates that any utilizing organization must be a non-profit entity and must not generate any income from selling the software, providing support, or offering services.


### Permissions and Limitations

| Permitted Actions                                                                                                                    | Prohibited Actions                                                                                                                                                        | Required Actions                                                                                                                                                |
|--------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| <details><summary>🟢 Granting Further Permissions</summary>Allows you to provide additional permissions for the software.</details>  | <details><summary>🔴 Utilizing Trademarks</summary>Restricts the use of trademarks or logos of contributors.</details>                                                    | <details><summary>🔵 Disclosing Source Code</summary>Requires revealing your source code when distributing the software.</details>                              |
| <details><summary>🟢 Modifications</summary>Permits altering the software and creating derivative works.</details>                   | <details><summary>🔴 Incurring Liability</summary>Limits legal accountability for damages related to the software.</details>                                              | <details><summary>🔵 Retaining Notices</summary>Requires maintaining original notices within the software.</details>                                            |
| <details><summary>🟢 Sharing</summary>Allows the distribution of the original or modified software.</details>                        | <details><summary>🔴 Commercial Use</summary>Prohibits the use of the software for commercial purposes, including sales, licensing, or distribution for profit.</details> | <details><summary>🔵 Including the Permission</summary>Requires including the text of this permission framework in modified versions of the software.</details> |

**This information is provided for general understanding and is not legal advice.**

### Commercial Use Clarification

While the core NPOSL-3.0 doesn't permit usage by for-profit entities, we're extending some extra allowances for commercial use of our software, as outlined below:

- Sending Code: Totally fine to use our page for sending code or chatting between folks.
- Your Own Instance: If you're a business, feel free to set up the software internally. Just make sure you're not making money off it directly.
- No Go for Hosting Providers: If you're thinking of hosting the software as a service for others, that's a no-go. But, hosting it internally for your own use? All good.

In a nutshell, keep the software's use within your company cool and non-profit, and you're all set.
