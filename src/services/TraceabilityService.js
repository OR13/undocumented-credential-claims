const yaml = require("js-yaml");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const jsonld = require("jsonld");
const documentLoader = require("./documentLoader");

/**
 * @description Read files synchronously from a folder, with natural sorting
 * @param {String} dir Absolute path to directory
 * @returns {Object[]} List of object, each object represent a file
 * structured like so: `{ filepath, name, ext, stat }`
 */
const readFilesSync = (dir) => {
  const files = [];

  fs.readdirSync(dir).forEach((filename) => {
    const name = path.parse(filename).name;
    const ext = path.parse(filename).ext;
    const filepath = path.resolve(dir, filename);
    const stat = fs.statSync(filepath);
    const isFile = stat.isFile();

    if (isFile)
      files.push({
        filepath,
        name,
        ext,
        stat,
        content: fs.readFileSync(filepath).toString(),
      });
  });

  files.sort((a, b) => {
    // natural sort alphanumeric strings
    // https://stackoverflow.com/a/38641281
    return a.name.localeCompare(b.name, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });

  return files;
};

const getAllCredentialsInDirectory = (relativePath) => {
  const files = readFilesSync(path.join(process.cwd(), relativePath));
  const onlyJson = files.filter((f) => {
    return f.ext === ".json";
  });
  const onlyCredentials = onlyJson
    .map((f) => {
      return JSON.parse(f.content);
    })
    .filter((data) => {
      return data.type && data.type.includes("VerifiableCredential");
    });
  return onlyCredentials;
};

const getCerificateTypes = async () => {
  const oas = "https://w3id.org/traceability/openapi/openapi.yml";
  const res = await axios.get(oas);
  const specYaml = await res.data;
  const openapi = yaml.load(specYaml);
  const options = Object.keys(openapi.paths)
    .map((p) => {
      const type = p.split("/").pop().replace(".yml", "");

      return { type };
    })
    .filter((opt) => {
      return opt.type.includes("Certificate");
    });

  return options;
};

const getExample = async (type) => {
  const schemaResponse = await axios.get(
    `https://w3id.org/traceability/openapi/components/schemas/credentials/${type}.yml`
  );
  const schema = yaml.load(schemaResponse.data);
  const example = JSON.parse(schema.example);
  delete example.proof;
  return { type, example };
};

const frame = async (document) => {
  return jsonld.frame(document, { documentLoader });
};

module.exports = {
  getCerificateTypes,
  getExample,
  getAllCredentialsInDirectory,
  frame,
};
