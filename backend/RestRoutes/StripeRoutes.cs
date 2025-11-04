using Stripe.Checkout;
using Stripe;
using Microsoft.AspNetCore.Mvc;

namespace RestRoutes;

// Egna notes:Kommer behöva skapa stripe session dynamiskt med produkterna från orchard
public static class StripeRoutes
{
  public static void MapStripeRoutes(this WebApplication app)
  {
    app.MapPost("api/stripe/create-checkout-session", async () =>
    {
      // Vi använder StripeConfiguration.ApiKey som vi sätter i Program.cs
      var options = new SessionCreateOptions
      {
        PaymentMethodTypes = new List<string> { "card" },
        Mode = "payment",
        LineItems = new List<SessionLineItemOptions>
            {
                    new SessionLineItemOptions
                    {
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            Currency = "sek",
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = "Simulerad produkt"
                            },
                            UnitAmount = 49900 // 499 kr i öre
                        },
                        Quantity = 1
                    }
            },
        ShippingAddressCollection = new SessionShippingAddressCollectionOptions
        {
          AllowedCountries = new List<string> { "SE", "NO", "DK" } // t.ex. bara nordiska länder
        },
        //Vi kommer behöva ändra detta till själva sidorna i react appen när vi har dem
        SuccessUrl = "http://localhost:5173/order?status=success&step=confirmation",
        CancelUrl = "http://localhost:5173/order?status=cancelled&step=payment"
      };

      var service = new SessionService();
      var session = service.Create(options);

      return Results.Json(new { url = session.Url }, statusCode: 200);
    });
    app.MapPost("api/stripe/webhook", async (HttpRequest request) =>
       {
         var json = await new StreamReader(request.Body).ReadToEndAsync();
         var stripeSignature = request.Headers["Stripe-Signature"];
         var webhookSecret = Environment.GetEnvironmentVariable("STRIPE_WEBHOOK_SECRET");

         Console.WriteLine("[WEBHOOK] Inkommande webhook mottagen");

         Event stripeEvent;

         try
         {
           stripeEvent = EventUtility.ConstructEvent(
                json,
                stripeSignature,
                webhookSecret
            );
           Console.WriteLine($"[WEBHOOK] Event verifierad: {stripeEvent.Type}");

         }
         catch (StripeException e)
         {
           Console.WriteLine($"[WEBHOOK] Ogiltig webhook: {e.Message}");
           Console.WriteLine($"[WEBHOOK] Stripe signature header: {stripeSignature}");
           Console.WriteLine($"[WEBHOOK] Payload: {json}");
           return Results.BadRequest(); // Ogiltig webhook
         }

         // Hantera olika typer av events
         if (stripeEvent.Type == "checkout.session.completed")
         {
           var session = stripeEvent.Data.Object as Session;
           Console.WriteLine($"Betalning klar för session: {session.Id}, belopp: {session.AmountTotal}");
           // Här kan du t.ex. spara order i databasen
         }

         return Results.Ok();
       });
  }
}
