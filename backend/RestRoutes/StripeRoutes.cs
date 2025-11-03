using Stripe.Checkout;
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
        //Vi kommer behöva ändra detta till själva sidorna i react appen när vi har dem
        SuccessUrl = "http://localhost:5173/order",
        CancelUrl = "http://localhost:5173"
      };

      var service = new SessionService();
      var session = service.Create(options);

      return Results.Json(new { url = session.Url }, statusCode: 200);
    });
  }
}
