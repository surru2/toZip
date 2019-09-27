const fetch = require('node-fetch');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const getLinks = async () => { //получаем массив ссылок на изображения с https://yandex.ru/images/
    const body = await fetch(`https://yandex.ru/images/`).then(x=>x.text())
    const dom = new JSDOM(body);
    return Array.from(dom.window.document.getElementsByTagName('img')) //фильтруем возвращаемые url изображений только с абсолюными путями
        .map(t => t.src)
        .filter(t=>t.indexOf('http')>-1)
}

const toZip = (links) =>{
    const AdmZip = require('adm-zip');
    const zip = new AdmZip();
    zip.writeZip('files.zip'); //создаём zip-архив
    links.map((img, i) => {                 //проходимся по архиву ссылок на изображения
        fetch(img)
            .then(x => x.arrayBuffer())     //Преобразуем ответ в буффер и далее добавляем данные в архив
            .then(x => {
                zip.addFile(i + '.jpg', Buffer.from(x)); //во время каждой итерации открываем файл добавляем новые данные и сразу пишем его
                zip.writeZip('files.zip');            //чтобы не держать в памяти архив со всеми изображениями
            });
    })
}

getLinks()
    .then(links => toZip(links));
