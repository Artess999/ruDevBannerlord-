import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import convert from 'xml-js';
import cloneDeep from 'lodash.clonedeep';

import { DIRECTORIES, folders, convertToJsOptions, convertToXmlOptions } from "./constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prevVersion = '1.5.6';

const CURRENT_EN_PATH = path.resolve(__dirname, DIRECTORIES.EN);
const PREV_EN_PATH = path.resolve(__dirname, `../Obects/Languages/prev-versions/${prevVersion}`);
const RESULTS_PATH = path.resolve(__dirname, './results/diff');

folders.forEach((folder) => {
    const resultsPath = path.resolve(RESULTS_PATH);
    const resultsDiffPath = path.resolve(RESULTS_PATH, prevVersion);

    const currentEnFolderPath = path.resolve(CURRENT_EN_PATH , folder);
    const prevEnFolderPath = path.resolve(PREV_EN_PATH , folder);

    fs.readdirSync(currentEnFolderPath).forEach(file => {
        const currentEnFilePath = path.resolve(currentEnFolderPath, file);
        const prevEnFilePath = path.resolve(prevEnFolderPath, file);

        if (fs.existsSync(prevEnFilePath)) {
            const currentEnXml = fs.readFileSync(currentEnFilePath, 'utf8');
            const currentEnJs = convert.xml2js(currentEnXml, convertToJsOptions);

            if (currentEnJs.elements[0].elements[1].elements) {
                const prevEnXml = fs.readFileSync(prevEnFilePath, 'utf8');
                const prevEnJs = convert.xml2js(prevEnXml, convertToJsOptions);

                const currentEnElements = (currentEnJs.elements[0].elements[1].elements);
                const prevEnElements = (prevEnJs.elements[0].elements[1].elements);

                if (prevEnElements) {
                    const diff = prevEnElements.filter(({name, attributes}) => {
                        if (name === 'string') {
                            const {id, text} = attributes;

                            const isDiff = !!currentEnElements.find(({attributes}) => {
                                if (attributes) {
                                    const {id: currentEnId, text: currentText} = attributes;

                                    return currentEnId === id && text !== currentText;
                                }
                            });

                            return isDiff;
                        }

                        return false;
                    });

                    if (!fs.existsSync(resultsPath)) {
                        fs.mkdirSync(resultsPath);
                    }

                    if (!fs.existsSync(resultsDiffPath)) {
                        fs.mkdirSync(resultsDiffPath);
                    }

                    if (diff.length > 0) {
                        const resultsFolderPath = path.resolve(resultsDiffPath, folder);

                        if (!fs.existsSync(resultsFolderPath)) {
                            fs.mkdirSync(resultsFolderPath);
                        }

                        const diffJs = cloneDeep(currentEnJs);
                        diffJs.elements[0].elements[1].elements = diff;

                        const diffXml = convert.js2xml(diffJs, convertToXmlOptions);

                        fs.writeFile(path.resolve(resultsFolderPath, file), diffXml, function (err, data) {
                            if (err) {
                                return console.log(err);
                            }
                        });
                    }
                }
            }
        }
    });
})
