exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method not allowed" }),
      };
    }

    const { email, amount } = JSON.parse(event.body || "{}");

    if (!email || !amount || Number(amount) <= 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Email and valid amount are required" }),
      };
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Paystack is not configured" }),
      };
    }

    const reference = `VELTARA-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`;

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: Math.round(Number(amount) * 100),
          currency: "NGN",
          reference,
          callback_url: "https://loquacious-scone-1ade76.netlify.app",
        }),
      }
    );

    const data = await response.json();

    return {
      statusCode: response.ok ? 200 : response.status,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Payment initialization failed",
      }),
    };
  }
};