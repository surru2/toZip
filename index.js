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
    const i =0;
    zip.writeZip('files.zip');
    const exec = (links,i) => { //рекурсивная функция последовательной загрузки изображения и добавления в архив
        if(i<links.length) {
            fetch(links[i])
                .then(x => x.arrayBuffer())//Преобразуем ответ в буффер и далее добавляем данные в архив
                .then(x => {
                    zip.addFile(i + '.jpg', Buffer.from(x));//во время каждой итерации открываем файл добавляем новые данные и сразу пишем его
                    zip.writeZip('files.zip');//чтобы не держать в памяти архив со всеми изображениями
                    i++;
                    exec(links, i);
                })
        }else{
            console.log('done')
        }
    }
    exec(links,i);
}

getLinks()
    .then(links => toZip(links));
