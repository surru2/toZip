const fetch = require('node-fetch');
const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const archiver = require('archiver');
const fs = require('fs');
const { PassThrough } = require('stream')

const getLinks = async () => {
    const body = await fetch(`https://yandex.ru/images/`).then(x => x.text())
    const dom = new JSDOM(body);
    return Array.from(dom.window.document.getElementsByTagName('img'))
        .map(t => t.src)
        .filter(t => ~t.indexOf('http'))
}

const toZip = (links) => {
    const output = fs.createWriteStream(__dirname + '/files.zip')
        .on('close',()=>console.log('Done'))
    const archive = archiver('zip');
    archive.pipe(output)
    links.reduce((prom, link) => {
        return prom.then(() => {
            return new Promise(resolve => {
                fetch(link)
                    .then(x => {
                        const body = x.body.pipe(new PassThrough()
                            .on('end',()=>console.log(`link ${link}`)))
                        archive.append(body,{name: `${Math.random()}.jpg`.replace('.', '')})
                        resolve()
                    })
            });
        });
    }, Promise.resolve()).then(() => {
        archive.finalize()
    });
}

const myTest = async () => {
    let links = [];
    for (let i = 0; i < 4; i++) {
        await getLinks()
            .then(arr => links = [...links, ...arr]);
    }
    console.log(`Fetched ${links.length} images from https://yandex.ru/images/`)
    toZip(links)
}

myTest()