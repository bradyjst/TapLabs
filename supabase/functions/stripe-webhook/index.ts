import Stripe from "https://esm.sh/stripe@14.25.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2026-02-25.clover",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  const signature =
    req.headers.get("stripe-signature") ||
    req.headers.get("Stripe-Signature") ||
    req.headers.get("STRIPE-SIGNATURE");

  if (!signature) {
    return new Response("Missing stripe signature", { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    );
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Webhook Error", { status: 400 });
  }

  console.log("Stripe event received:", event.type);

  switch (event.type) {

    // USER COMPLETED CHECKOUT
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      const subscriptionId = session.subscription as string;

      if (!subscriptionId) {
        console.log("No subscription attached to session");
        break;
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      const customerId = subscription.customer as string;

      const userId = subscription.metadata?.userId;

      console.log("UserId resolved:", userId);
      console.log("CustomerId:", customerId);

      if (!userId) {
        console.log("Missing userId metadata");
        break;
      }

      const { data, error } = await supabase
        .from("profiles")
        .update({
          is_paid: true,
          stripe_customer_id: customerId,
        })
        .eq("id", userId)
        .select();

      if (error) {
        console.error("Supabase update failed:", error);
      } else {
        console.log("User upgraded:", data);
      }

      break;
    }

    // SUBSCRIPTION CANCELLED
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;

      const userId = subscription.metadata?.userId;

      console.log("Cancelled subscription user:", userId);

      if (!userId) {
        console.log("Missing userId metadata on cancelled subscription");
        break;
      }

      const { data, error } = await supabase
        .from("profiles")
        .update({ is_paid: false })
        .eq("id", userId)
        .select();

      if (error) {
        console.error("Supabase update failed:", error);
      } else {
        console.log("User subscription cancelled:", data);
      }

      break;
    }

    // PAYMENT FAILED
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;

      if (!invoice.subscription) {
        console.log("Invoice missing subscription");
        break;
      }

      const subscription = await stripe.subscriptions.retrieve(
        invoice.subscription as string
      );

      const userId =
        subscription.metadata?.userId ??
        (invoice as any).parent?.subscription_details?.metadata?.userId;

      console.log("Failed payment user:", userId);

      if (!userId) {
        console.log("Missing userId metadata on failed payment");
        break;
      }

      const { data, error } = await supabase
        .from("profiles")
        .update({ is_paid: false })
        .eq("id", userId)
        .select();

      if (error) {
        console.error("Supabase update failed:", error);
      } else {
        console.log("User payment failed:", data);
      }

      break;
    }
  }

  return new Response("ok", { status: 200 });
});