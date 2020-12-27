const fs = require('fs');
const path = require('path');
const convert = require('xml-js');
const cloneDeep = require('lodash.clonedeep');

const DIRECTORIES = {
    ARTESS999: '../Modules/Languages/RussianByArtess999/ModuleData/Languages/',
    DOG729: '../Modules/Languages/Russian/ModuleData/Languages/',
    COMMANDO: '../Modules/Languages/RussianByCommando.com.ua/ModuleData/Languages/',
    EN: '../Obects/Languages/en/ModuleData/Languages/',
}

const TRANSLATION_PATH = path.resolve(__dirname, DIRECTORIES.ARTESS999);
const SOURCE_PATH = path.resolve(__dirname, DIRECTORIES.COMMANDO);
const RESULTS_PATH = path.resolve(__dirname, './results/');

const convertToJsOptions = {
    compact: true,
    alwaysArray: true,
}

const convertToXmlOptions = {
    compact: true,
    spaces: 2,
}

const folders = ['Native', 'SandBox', 'SandBoxCore', 'StoryMode'];

folders.forEach((folder) => {
    const resultsPath = path.resolve(RESULTS_PATH);
    const resultsAbsentsPath = path.resolve(RESULTS_PATH, 'absents');
    const resultsRudimentsPath = path.resolve(RESULTS_PATH, 'rudiments');

    const translationFolderPath = path.resolve(TRANSLATION_PATH, folder);
    const sourceFolderPath = path.resolve(SOURCE_PATH, folder);

    fs.readdirSync(translationFolderPath).forEach(file => {
        const translationFilePath = path.resolve(translationFolderPath, file);
        const sourceFilePath = path.resolve(sourceFolderPath, file);

        const translationXml = fs.readFileSync(translationFilePath, 'utf8');
        const translationJs = convert.xml2js(translationXml, convertToJsOptions);

        if (translationJs.base[0].strings && translationJs.base[0].strings[0]) {
            const sourceXml = fs.readFileSync(sourceFilePath, 'utf8');
            const sourceJs = convert.xml2js(sourceXml, convertToJsOptions);

            const translationStrings = translationJs.base[0].strings[0].string;
            const sourceStrings = sourceJs.base[0].strings[0].string;

            const rudiments = translationStrings.filter(({_attributes}) => {
                const { id } = _attributes;

                const isRudiment = !sourceStrings.find(({_attributes}) => {
                    const { id: sourceId } = _attributes;
                    return sourceId === id;
                });

                return isRudiment;
            });

            const absents = sourceStrings.filter(({_attributes}) => {
                const { id } = _attributes;

                const isAbsent = !translationStrings.find(({_attributes}) => {
                    const { id: translationId } = _attributes;
                    return translationId === id;
                });

                return isAbsent;
            });

            if (!fs.existsSync(resultsPath)){
                fs.mkdirSync(resultsPath);
            }

            if (!fs.existsSync(resultsAbsentsPath)){
                fs.mkdirSync(resultsAbsentsPath);
            }

            if (!fs.existsSync(resultsRudimentsPath)){
                fs.mkdirSync(resultsRudimentsPath);
            }

            if (absents.length > 0) {
                const resultsFolderPath = path.resolve(resultsAbsentsPath, folder);

                if (!fs.existsSync(resultsFolderPath)){
                    fs.mkdirSync(resultsFolderPath);
                }

                const absentsJs = cloneDeep(translationJs);
                absentsJs.base[0].strings[0].string = absents;

                const absentsXml = convert.js2xml(absentsJs, convertToXmlOptions);

                fs.writeFile(path.resolve(resultsFolderPath, file), absentsXml, function (err,data) {
                    if (err) {
                        return console.log(err);
                    }
                });
            }

            if (rudiments.length > 0) {
                const resultsFolderPath = path.resolve(resultsRudimentsPath, folder);

                if (!fs.existsSync(resultsFolderPath)){
                    fs.mkdirSync(resultsFolderPath);
                }

                const rudimentsJs = cloneDeep(translationJs);
                rudimentsJs.base[0].strings[0].string = rudiments;

                const rudimentsXml = convert.js2xml(rudimentsJs, convertToXmlOptions);

                fs.writeFile(path.resolve(resultsFolderPath, file), rudimentsXml, function (err,data) {
                    if (err) {
                        return console.log(err);
                    }
                });
            }
        }
    });
})
