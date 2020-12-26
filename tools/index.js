const fs = require('fs');
const path = require('path');
const convert = require('xml-js');
const cloneDeep = require('lodash.clonedeep');

const TRANSLATION_PATH = path.resolve(__dirname, '../Modules/Languages/RussianByArtess999/ModuleData/Languages/');
const SOURCE_PATH = path.resolve(__dirname, '../Modules/Languages/RussianByCommando.com.ua/ModuleData/Languages/');
const RESULTS_PATH = path.resolve(__dirname, './results/');

const convertToJsOptions = {
    compact: true,
    alwaysArray: true,
}

const convertToXmlOptions = {
    compact: true,
    spaces: 4,
}

const folders = ['Native', 'SandBox', 'SandBoxCore', 'StoryMode'];

folders.forEach((folder) => {
    const resultsPath = path.resolve(RESULTS_PATH);
    const resultsFolderPath = path.resolve(RESULTS_PATH, folder);

    const translationFolderPath = path.resolve(TRANSLATION_PATH, folder);
    const sourceFolderPath = path.resolve(SOURCE_PATH, folder);

    fs.readdirSync(translationFolderPath).forEach(file => {
        const translationFilePath = path.resolve(translationFolderPath, file);
        const sourceFilePath = path.resolve(sourceFolderPath, file);
        const fileName = path.basename(file, '.xml');

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

            if (!fs.existsSync(resultsFolderPath)){
                fs.mkdirSync(resultsFolderPath);
            }

            if (absents.length > 0) {
                const absentsJs = cloneDeep(translationJs);
                absentsJs.base[0].strings[0].string = absents;

                const absentsXml = convert.js2xml(absentsJs, convertToXmlOptions);

                fs.writeFile(path.resolve(RESULTS_PATH, folder, file), absentsXml, function (err,data) {
                    if (err) {
                        return console.log(err);
                    }
                });
            }
        }
    });
})
