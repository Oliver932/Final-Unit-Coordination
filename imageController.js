
imageClasses = ['L', 'R'];

export function createImages(unitNames){
    var images = {};

    for (let index = 0; index < unitNames.length; index++) {
        const name = unitNames[index];
        images[name] = {};

        for (let i = 0; i < imageClasses.length; i++) {
            const imageClass = imageClasses[i];

            images[name][imageClass] = new Image();
            images[name][imageClass].src = name + '-' + imageClass + '.png';
            
        }
    }
    return images;
}