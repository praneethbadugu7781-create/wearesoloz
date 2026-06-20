const fs = require('fs');
const path = require('path');

// A simple parser for our specific world-map.svg structure
function parseSvg() {
  const svgPath = path.join(__dirname, '..', 'world-map.svg');
  const svgContent = fs.readFileSync(svgPath, 'utf8');

  // We want to extract paths. Since it contains single paths like <path id="ae" d="..."/>
  // and groups like <g id="id"><path d="..."/><path d="..."/></g>
  const countries = [];

  // Let's use simple regex or split since the file is well-formatted.
  // The file has paths on separate lines, e.g.:
  // <path id="ae" d="M..." />
  // or inside groups:
  // <g id="id">
  //     <path d="..." />
  // </g>

  const lines = svgContent.split('\n');
  let currentGroup = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check group start
    const groupStartMatch = line.match(/<g\s+id="([^"]+)"/);
    if (groupStartMatch) {
      currentGroup = groupStartMatch[1];
      continue;
    }

    // Check group end
    if (line === '</g>') {
      currentGroup = null;
      continue;
    }

    // Check path
    const pathMatch = line.match(/<path\s+(?:class="[^"]+"\s+)?(?:id="([^"]+)"\s+)?d="([^"]+)"/);
    if (pathMatch) {
      const id = pathMatch[1] || currentGroup;
      const d = pathMatch[2];
      if (id) {
        // Let's add it
        countries.push({ id, d });
      }
    }
  }

  console.log(`Parsed ${countries.length} path segments.`);
  fs.writeFileSync(
    path.join(__dirname, '..', 'components', 'worldMapData.json'),
    JSON.stringify(countries, null, 2)
  );
  console.log("Saved to components/worldMapData.json");
}

parseSvg();
