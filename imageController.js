import {unitNames, imageClasses} from './unitData.js';

//loads all images with appropriate classes

export default function createImages(){

    var images = {};

    for (let index = 0; index < unitNames.length; index++) {
        const name = unitNames[index];
        images[name] = {};

        for (let i = 0; i < imageClasses.length; i++) {
            const imageClass = imageClasses[i];

            images[name][imageClass] = new Image();
            images[name][imageClass].src = 'images/' + name + '-' + imageClass + '.png';
            
        }
    }
    return images;
}