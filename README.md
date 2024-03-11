# not-th.re

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
    depends_on:
      - postgres
    ports:
      - 3000:3000
    environment:
      DB_HOST: postgres

volumes:
  db:
```

For a more advanced deployment, see the [docker-compose.yml](./docker-compose.yml) file.

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

| Permitted Actions                                                                                                 | Prohibited Actions                                                                                                         | Required Actions                                                                                                                        |
|-------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| <details><summary>🟢 Granting Further Permissions</summary>Allows you to provide additional permissions for the software.</details>  | <details><summary>🔴 Utilizing Trademarks</summary>Restricts the use of trademarks or logos of contributors.</details>   | <details><summary>🔵 Disclosing Source Code</summary>Requires revealing your source code when distributing the software.</details>     |
| <details><summary>🟢 Modifications</summary>Permits altering the software and creating derivative works.</details>                | <details><summary>🔴 Incurring Liability</summary>Limits legal accountability for damages related to the software.</details> | <details><summary>🔵 Retaining Notices</summary>Requires maintaining original notices within the software.</details>                   |
| <details><summary>🟢 Sharing</summary>Allows the distribution of the original or modified software.</details>                     | <details><summary>🔴 Commercial Use</summary>Prohibits the use of the software for commercial purposes, including sales, licensing, or distribution for profit.</details> | <details><summary>🔵 Including the Permission</summary>Requires including the text of this permission framework in modified versions of the software.</details>|

**This information is provided for general understanding and is not legal advice.**
