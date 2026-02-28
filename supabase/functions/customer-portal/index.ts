import Stripe from "https://esm.sh/stripe@14.25.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2026-02-25.clover",
});

Deno.serve(async (req) => {
  const { customerId } = await req.json();

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: "https://taplabs.app",
  });

  return new Response(
    JSON.stringify({ url: session.url }),
    { headers: { "Content-Type": "application/json" } }
  );
});