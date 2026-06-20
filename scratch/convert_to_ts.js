const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'components', 'worldMapData.json');
const tsPath = path.join(__dirname, '..', 'components', 'worldMapData.ts');

const data = fs.readFileSync(jsonPath, 'utf8');
fs.writeFileSync(tsPath, `export interface MapPath {
  id: string;
  d: string;
}

export const worldMapData: MapPath[] = ${data};
`);

console.log("Converted JSON to components/worldMapData.ts");
// Clean up the temp JSON and SVG
fs.unlinkSync(jsonPath);
fs.unlinkSync(path.join(__dirname, '..', 'world-map.svg'));
console.log("Cleaned up temporary world-map.svg and worldMapData.json");
