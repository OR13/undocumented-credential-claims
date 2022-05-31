const contexts = require("../contexts");

const documentLoader = (iri) => {
  if (contexts[iri]) {
    return { document: contexts[iri] };
  }
  const message = "Unable to resolve iri: " + iri;
  throw new Error(message);
};

module.exports = documentLoader;
