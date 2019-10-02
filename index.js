const fetch = require('node-fetch');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const archiver = require('archiver');
const fs = require('fs');

const getLinks = async () => {
    const body = await fetch(`https://yandex.ru/images/`).then(x => x.text())
    const dom = new JSDOM(body);
    return Array.from(dom.window.document.getElementsByTagName('img'))
        .map(t => t.src)
        .filter(t => ~t.indexOf('http'))
}

const toZip = (links) => {
    const output = fs.createWriteStream(__dirname + '/files.zip');
    const archive = archiver('zip');
    archive.pipe(output)
    links.reduce((prom, link) => {
        return prom.then(() => {
            return new Promise(resolve => {
                fetch(link)
                    .then(x => x.arrayBuffer())
                    .then(x => {
                        console.log(`Getted ${link}`)
                        archive
                            .append(Buffer.from(x), { name : `${Math.random()}.jpg`.replace('.','') })
                        resolve()
                    });
            });
        });
    }, Promise.resolve()).then(() => {
            archive.finalize()
            console.log('Done')
    });
}

const myTest = async () => {
    let links = [];
    for (let i = 0; i < 4; i++) {
        await getLinks()
            .then(arr => links=[...links,...arr]);
    }
    console.log(`Fetched ${links.length} images from https://yandex.ru/images/`)
    toZip(links)
}

myTest()
