async function testKey() {
  const GEMINI_KEY = "AIzaSyBLFgFUo3SSFcMlm-xnRO-ceYiApo-2Pb0";
  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Hi" }] }],
      }),
    }
  );
  const data = await resp.json();
  console.log(JSON.stringify(data, null, 2));
}
testKey();
