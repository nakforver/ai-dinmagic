const responseText = "```json\n[\n  {\n    \"id\": \"0\",\n    \"text\": \"Hello\"\n  },\n  {\n    \"id\": \"1\",\n    \"text\": \"\n";
let txt = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
try {
  console.log(JSON.parse(txt));
} catch(e) {
  const m = txt.match(/\[\s*\{[\s\S]*/);
  if (m) {
    let f = m[0];
    const lc = f.lastIndexOf('}');
    if (lc !== -1) {
      f = f.substring(0, lc + 1) + ']';
      console.log(JSON.parse(f));
    }
  }
}
