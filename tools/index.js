import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import convert from 'xml-js';
import cloneDeep from 'lodash.clonedeep';

import { DIRECTORIES, folders, convertToJsOptions, convertToXmlOptions } from "./constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TRANSLATION_PATH = path.resolve(__dirname, DIRECTORIES.ARTESS999);
const SOURCE_PATH = path.resolve(__dirname, DIRECTORIES.EN);
const RESULTS_PATH = path.resolve(__dirname, './results');

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

        if (translationJs.elements[0].elements[1].elements) {
            const sourceXml = fs.readFileSync(sourceFilePath, 'utf8');
            const sourceJs = convert.xml2js(sourceXml, convertToJsOptions);

            const translationElements = (translationJs.elements[0].elements[1].elements);
            const sourceElements = (sourceJs.elements[0].elements[1].elements);

            const resultsElements = cloneDeep(translationElements);

            const rudiments = translationElements.filter(({name, attributes}) => {
                if (name === 'string') {
                    const { id } = attributes;

                    const isRudiment = !sourceElements.find(({attributes}) => {
                        if (attributes) {
                            const {id: sourceId} = attributes;
                            return sourceId === id;
                        }
                    });

                    return isRudiment;
                }

                return false;
            });

            const absents = sourceElements.filter(({name, attributes}) => {
                if (name === 'string') {
                    const { id } = attributes;

                    const isAbsent = !translationElements.find(({attributes}) => {
                        if (attributes) {
                            const { id: translationId } = attributes;
                            return translationId === id;
                        }
                    });

                    return isAbsent;
                }

                return false;
            });

            const results = resultsElements
                .filter(({name, attributes}) => {
                    if (name === 'string') {
                        const { id } = attributes;

                        const isRudiment = !!rudiments.find(({attributes}) => {
                            if (attributes) {
                                const {id: rudimentId} = attributes;
                                return rudimentId === id;
                            }
                        });

                        return !isRudiment;
                    }
                    return true;
                })
                .concat(absents);

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
                absentsJs.elements[0].elements[1].elements = absents;

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
                rudimentsJs.elements[0].elements[1].elements = rudiments;

                const rudimentsXml = convert.js2xml(rudimentsJs, convertToXmlOptions);

                fs.writeFile(path.resolve(resultsFolderPath, file), rudimentsXml, function (err,data) {
                    if (err) {
                        return console.log(err);
                    }
                });
            }

            if (results.length > 0) {
                const resultsFolderPath = path.resolve(resultsPath, folder);

                if (!fs.existsSync(resultsFolderPath)){
                    fs.mkdirSync(resultsFolderPath);
                }

                const resultsJs = cloneDeep(translationJs);
                resultsJs.elements[0].elements[1].elements = results;

                const resultsXml = convert.js2xml(resultsJs, convertToXmlOptions);

                fs.writeFile(path.resolve(resultsFolderPath, file), resultsXml, function (err,data) {
                    if (err) {
                        return console.log(err);
                    }
                });
            }
        }
    });
})
