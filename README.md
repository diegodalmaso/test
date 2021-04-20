## Carousel demo page

## Installation

```bash
git clone https://github.com/diegodalmaso/test.git
```

```bash
npm install
```

## Usage

There are two scripts in the project: start and build.

### Build

This script builds the application in production mode.

```bash
npm run build
```

### Start

This script uses a webpack web server to run and serve the application locally in the browser.

```bash
npm run start
```

## Functionality

* Multiple instances of the carousel inside the same page
* Scrolling enabled also by swiping with the mouse and with the touch over the cards
* While waiting for the next chunk to be ready, the card placeholders are displayed
* The chunk size is static and hardcoded
* The number of chunks returned by the “fake REST API”
* No use of framework and third party library