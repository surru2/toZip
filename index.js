const fetch = require('node-fetch');
const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const archiver = require('archiver');
const fs = require('fs');
const { PassThrough } = require('stream');

const getLinks = async () => {
    const body = await fetch(`https://yandex.ru/images/`).then(x => x.text());
    const dom = new JSDOM(body);
    return Array.from(dom.window.document.getElementsByTagName('img'))
        .map(t => t.src)
        .filter(t => ~t.indexOf('http'))
}

const toZip = async (links) => {
    const output = fs.createWriteStream(__dirname + '/files.zip').on('close',()=>console.log('WriteStream close'));
    const archive = archiver('zip').on('end',()=>console.log('Zip done'));
    archive.pipe(output);
    await links.reduce((prom, link) => {
            return prom.then(() => {
                return new Promise(async(resolve) => {
                    const image = await fetch(link).then(x => x.body.pipe(new PassThrough().on('end', () => {console.log(`link ${link}`);resolve()})))
                    await archive.append(image, { name : `${Math.random()}.jpg`.replace('.', '') });
                });
            })
    }, Promise.resolve());
    await archive.finalize();
}

const myTest = async () => {
    let links = [];
    for (let i = 0; i < 1; i++) {
        await getLinks()
            .then(arr => links = [...links, ...arr]);
    }
    console.log(`Fetched ${links.length} images from https://yandex.ru/images/`);
    await toZip(links);
};

myTest();
