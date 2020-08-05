[![Netlify Status](https://api.netlify.com/api/v1/badges/ab9dbb29-10eb-4bb8-8248-c774143daa1c/deploy-status)](https://app.netlify.com/sites/akvideo/deploys)

# akvideo_website
Re-Design der AK Video Münchberg Website

## Live Versions

**[View Live Preview on Github Pages](https://layaxx.github.io/akvideo_website/)**

**[View Production Deploy](https://arbeitskreis.video)**

The production version of this website is hosted by [Netlify](https://www.netlify.com/)

## TODO:
- Bilder:
  - change Thumbnails in 20 JAHRE AK VIDEO Section 
  
 - missing Content:
    - 20 Jahre AK (Text)
    - sites for most important projects (Images + Text)
      - completely missing
         - Stuhlgeschichten - Menschen auf Stühlen
      - missing some content:
         - Handycap (add text + images)
         - Zusammen durch die Zeit
         - Das Geheimnis des Waldsteins (add more text)
         - TRAUMhafte Unterwelt (add more text)
         - Die Probe (add more text)
         - Sackgasse (add text)
         - Lichtblick (rewrite text)
         - Clipped 
         - Geschichte
  
 - structure:
    - maybe show Awards as Slideshow?
    
    
This Website is based on the Agency Template by Start Bootstrap

## [Start Bootstrap - Agency](https://startbootstrap.com/themes/agency/)


## Download and Installation

To edit this website clone it first:

- Clone the repo: `git clone https://github.com/layaxx/akvideo_website.git`

Images are located in `src/assets/img` and its subdirectories 

To make changes to the html files, you will want to edit the [.pug](https://www.npmjs.com/package/pug) files in `src/pug` and respective subdirectories. 
You can convert [html to pug](https://html-to-pug.com/), but be sure to correctly indent pasted code.

For changes to global css, edit the [.scss](https://sass-lang.com/) (basically regular css syntax) files located in `src/scss` and subfolders. Note that if files are added, 
they need to be imported in `src/scss/styles.scss`

To preview your changes locally, you need to have npm installed. In the root directory of this repository, run `npm install` (only needed the very first time) and then `npm run-script build`. Website files are generated in the `dist` folder and can then be viewed with a browser.
Note that the contact form will not work locally, as it depends on a Netlify plugin.

Apart from `npm run-script build` there are other npm scripts available, which will only build parts of the website instead of everything. You can view all available scripts in `package.json`.

## Guidelines for Images

Thumbnails should be 400 by 300 pixels, named like site for the film and located in `src\assets\img\projects`

Headers should be 1900 by 1250 pixels, named header-NAME_OF_SITE.jpg and located in `src\assets\img\header`

Behind The Scenes Pictures for films should be 500 by 800 or 800 by 500 pixels, named imageCOUNTER.jpg and located in `src\assets\img\projects\NAME_OF_SITE`

All Images should be in JPEG format. They are converted to .webp format for every not-safari-based browser during the build process. Since most images (apart from headers) are quite small, sharpening can/should be applied after resizing.
All Images should be [tinyfied](https://tinyjpg.com/) before being comitted to the repository. 

#### npm Scripts

- `npm run build` builds the project - this builds assets, HTML, JS, and CSS into `dist` and minifies them
- `npm run build:assets` copies the files in the `src/assets/` directory into `dist`, converts images to .webp
- `npm run build:pug` compiles the Pug located in the `src/pug/` directory into `dist`
- `npm run build:scripts` copies JavaScript files from `src/js/` file into `dist`
- `npm run build:scss` compiles the SCSS files located in the `src/scss/` directory into `dist`
- `npm run clean` deletes the `dist` directory to prepare for rebuilding the project
- `npm run minify` minifies all .js/.css/.html files in the `dist` directory

#### publish changes to Github pages live-demo
- `git subtree push --prefix dist origin gh-pages`
