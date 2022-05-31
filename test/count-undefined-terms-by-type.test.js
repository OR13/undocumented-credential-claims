const fs = require("fs");

const TraceabilityService = require("../src/services/TraceabilityService");

const vocabBase = `https://w3id.org/traceability/#undefinedTerm`;

function countOcurrences(str, value) {
  var regExp = new RegExp(value, "gi");
  return (str.match(regExp) || []).length;
}

it("can get credential examples from OAS", async () => {
  const options = await TraceabilityService.getCerificateTypes();
  const examples = await Promise.all(
    options.map(async ({ type }) => {
      try {
        const { example } = await TraceabilityService.getExample(type);
        fs.writeFileSync(
          "./docs/data/" + type + ".json",
          JSON.stringify(example, null, 2)
        );
        return example;
      } catch (e) {
        console.error(e);
        console.error("Unable to resolve type: " + type);
      }
    })
  );
});

it("can get count of undefined terms by credential type", async () => {
  const credentials = await TraceabilityService.getAllCredentialsInDirectory(
    "./docs/data"
  );
  const credentialTypesWithUndefinedTerms = await Promise.all(
    credentials.map(async (credential) => {
      const framed = await TraceabilityService.frame(credential);
      const framedString = JSON.stringify(framed, null, 2);
      return {
        type: credential.type[credential.type.length - 1],
        count: countOcurrences(framedString, vocabBase),
      };
    })
  );
  // console.log(JSON.stringify(credentialTypesWithUndefinedTerms, null, 2));
  fs.writeFileSync(
    "./docs/undefined-count-by-type.json",
    JSON.stringify(credentialTypesWithUndefinedTerms, null, 2)
  );
});
