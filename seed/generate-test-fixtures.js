// This file is auto-generated for testing scenarios logic
// It uses generateTestResults to fill the first 40 matches with balanced results

import { generateTestResults } from "../src/utils/helpers.js";
import fixtures from "./ipl-fixtures.json";

const testFixtures = generateTestResults(fixtures);

import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

writeFileSync(
  __dirname + "/ipl-fixtures-test.json",
  JSON.stringify(testFixtures, null, 2),
);

console.log("Test fixtures generated and saved to seed/ipl-fixtures-test.json");
