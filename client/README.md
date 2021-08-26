# EZPUG Client

## How to install

### Using Git (recommended)

1.  Clone the project from github. Change "myproject" to your project name.

```bash
git clone https://github.com/davellanedam/vue-skeleton-mvp.git ./myproject
```

### Using manual download ZIP

1.  Download repository
2.  Uncompress to your desired directory

### Install npm dependencies after installing (Git or manual download)

```bash
cd myproject
npm install
npm update
```

## VERY IMPORTANT

This project uses Vue Router HTML5 History Mode, this means when you are in development mode you can hit Cmd+R (mac) or F5 (Windows) to reload the page and it will work, but when the project is built you will have problems, so will need to do a small change in your web server to make that work. Please read the official Vue Router documentation here: <https://router.vuejs.org/guide/essentials/history-mode.html#example-server-configurations>

### Compiles and hot-reloads for development

```bash
npm run serve
```

### Compiles and minifies for production

```bash
npm run build
```

### Lints and fixes files

```bash
npm run lint
```

### Formatting markdown files

```bash
npm run remark
```
