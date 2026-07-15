const crypto = require("node:crypto");

const PAYFAST_VALIDATE_URL = process.env.PAYFAST_VALIDATE_URL || "https://www.payfast.co.za/eng/query/validate";

function normalizeBody(body) {
  if (!body) return {};
  if (typeof body === "object") return body;
  return Object.fromEntries(new URLSearchParams(body));
}

function encodePayFastValue(value) {
  return encodeURIComponent(String(value).trim()).replace(/%20/g, "+");
}

function buildSignatureData(fields, passphrase) {
  const signatureFields = { ...fields };
  delete signatureFields.signature;

  let output = Object.entries(signatureFields)
    .filter(([, value]) => value !== undefined && value !== null && String(value) !== "")
    .map(([key, value]) => `${key}=${encodePayFastValue(value)}`)
    .join("&");

  if (passphrase) output += `&passphrase=${encodePayFastValue(passphrase)}`;
  return output;
}

function isSignatureValid(fields) {
  if (!fields.signature) return false;

  const passphrase = process.env.PAYFAST_PASSPHRASE || "";
  const signatureData = buildSignatureData(fields, passphrase);
  const expectedSignature = crypto.createHash("md5").update(signatureData).digest("hex");
  return expectedSignature === fields.signature;
}

function hasExpectedMerchant(fields) {
  if (process.env.PAYFAST_MERCHANT_ID && fields.merchant_id !== process.env.PAYFAST_MERCHANT_ID) return false;
  if (process.env.PAYFAST_MERCHANT_KEY && fields.merchant_key !== process.env.PAYFAST_MERCHANT_KEY) return false;
  return true;
}

function hasExpectedAmount(fields) {
  if (!process.env.PAYFAST_AMOUNT) return true;

  const expectedAmount = Number(process.env.PAYFAST_AMOUNT).toFixed(2);
  const receivedAmount = Number(fields.amount_gross).toFixed(2);
  return expectedAmount === receivedAmount;
}

async function validateWithPayFast(fields) {
  const response = await fetch(PAYFAST_VALIDATE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams(fields).toString()
  });

  const result = await response.text();
  return result.trim() === "VALID";
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method Not Allowed");
  }

  const fields = normalizeBody(req.body);

  if (!hasExpectedMerchant(fields)) {
    return res.status(400).send("Unexpected merchant");
  }

  if (!hasExpectedAmount(fields)) {
    return res.status(400).send("Unexpected amount");
  }

  if (!isSignatureValid(fields)) {
    return res.status(400).send("Invalid signature");
  }

  try {
    const isValidPayment = await validateWithPayFast(fields);
    if (!isValidPayment) return res.status(400).send("Invalid payment notification");

    console.log("PayFast payment notification received", {
      paymentStatus: fields.payment_status,
      paymentId: fields.pf_payment_id,
      itemName: fields.item_name,
      amountGross: fields.amount_gross,
      email: fields.email_address
    });

    return res.status(200).send("OK");
  } catch (error) {
    console.error("PayFast notify validation failed", error);
    return res.status(500).send("Validation failed");
  }
};
