export const DIRECTORIES = {
    ARTESS999: '../Modules/Languages/RussianByArtess999/ModuleData/Languages/',
    DOG729: '../Modules/Languages/Russian/ModuleData/Languages/',
    COMMANDO: '../Modules/Languages/RussianByCommando.com.ua/ModuleData/Languages/',
    EN: '../Obects/Languages/en/ModuleData/Languages/',
}

export const convertToJsOptions = {
    compact: false,
    alwaysArray: true,
    attributeValueFn: (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '&#10;'),
}

export const convertToXmlOptions = {
    compact: false,
    spaces: 2,
}

export const folders = ['Native', 'SandBox', 'SandBoxCore', 'StoryMode'];
