// Simulate Meta delivering an inbound "hi" to the PRODUCTION webhook.
// Usage: node scripts/wa-webhook-test.mjs <url> <from-number>
// If Vercel is healthy + token valid, you'll get a real reply on WhatsApp.

const url = process.argv[2] || "https://feruai.com/api/whatsapp/webhook";
const from = (process.argv[3] || "919361092458").replace(/\D/g, "");

const payload = {
  object: "whatsapp_business_account",
  entry: [
    {
      id: "WABA_TEST",
      changes: [
        {
          field: "messages",
          value: {
            messaging_product: "whatsapp",
            metadata: {
              display_phone_number: "15556560927",
              phone_number_id: "1136580816211663",
            },
            contacts: [{ profile: { name: "Test" }, wa_id: from }],
            messages: [
              {
                from,
                id: "wamid.TEST" + Date.now(),
                timestamp: String(Math.floor(Date.now() / 1000)),
                type: "text",
                text: { body: "hi" },
              },
            ],
          },
        },
      ],
    },
  ],
};

console.log("POST", url, "\nsimulating inbound 'hi' from", from, "\n");
const res = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});
console.log("HTTP status:", res.status);
console.log("Response:", await res.text());
