# download-repos

A Node.js application to download repositories from GitHub.

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
    - [Linux](#linux)
    - [macOS](#macos)
    - [Windows](#windows)
- [Scripts](#scripts)
- [Author](#author)
- [License](#license)

## Installation

To install and use this application, follow these steps:

1. Clone the repository:
    ```sh
    git clone https://github.com/tuanductran/download-repos.git
    ```

2. Navigate to the project directory:
    ```sh
    cd download-repos
    ```

3. Install the dependencies:
    ```sh
    pnpm install
    ```

Before running the application, you need to configure it by setting up the environment variables. Create a `.env` file in the project directory and add the following variables:

- `GITHUB_TOKEN`: Your GitHub personal access token.
- `GITHUB_USERNAME`: Your GitHub username.
- `GITHUB_LAST_PAGE`: The last page number of your starred repositories to download.

You can use the provided `.env.example` file as a template:

```env
GITHUB_TOKEN=your_github_token
GITHUB_USERNAME=your_github_username
GITHUB_LAST_PAGE=last_page_number
```

Copy the contents of .env.example to .env and replace the placeholders with your actual values.

## Usage

This is a CLI application. You can run the application using the following command:

```sh
node index.js
```

Alternatively, if you have built the application using pkg, you can run the built executable:

### Linux

```sh
./build/download-repos-linux
```

### macOS

```sh
./build/download-repos-macos
```

### Windows

```sh
./build/download-repos-windows
```

**Note: The actual executable name may vary based on your target platform (Linux, macOS, Windows).**

## Scripts

The following scripts are available in this project:

- build: Builds the application using [pkg](https://github.com/vercel/pkg). The output files are placed in the build directory.
- clear: Clears the build directory.

You can run these scripts using pnpm:

```sh
pnpm build
pnpm clear
```

## Author

This project is authored by Tuan Duc Tran.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more details.
