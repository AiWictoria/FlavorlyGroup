using Stripe.Checkout;
using Stripe;
using Microsoft.AspNetCore.Mvc;

namespace RestRoutes;

// Egna notes:Kommer behöva skapa stripe session dynamiskt med produkterna från orchard
public static class StripeRoutes
{
  public static void MapStripeRoutes(this WebApplication app)
  {
    app.MapPost("api/stripe/create-checkout-session", async ([FromBody] CheckoutRequest request) =>
    {
      // Bygger line items baserat på produkterna som skickats från React
      var lineItems = request.Products.Select(p => new SessionLineItemOptions
      {
        PriceData = new SessionLineItemPriceDataOptions
        {
          Currency = "sek",
          ProductData = new SessionLineItemPriceDataProductDataOptions
          {
            Name = p.Name
          },
          UnitAmount = (long)(p.Price * 100) // öre
        },
        Quantity = p.Quantity
      }).ToList();

      // For delivery we use Stripe's shipping options instead of a line item
      // so the checkout UI shows it as shipping (no quantity field).
      var hasDelivery = request.DeliveryPrice.HasValue && request.DeliveryPrice.Value > 0;

      var options = new SessionCreateOptions
      {
        PaymentMethodTypes = new List<string> { "card" },
        Mode = "payment",
        LineItems = lineItems,
        SuccessUrl = "http://localhost:5173/order?status=success&step=confirmation",
        CancelUrl = "http://localhost:5173/order?status=cancelled&step=payment",
        Locale = "sv",

      };

      var service = new SessionService();
      try
      {
        // If we have a delivery price, add it as a shipping option (fixed amount)
        if (hasDelivery)
        {
          var deliveryAmount = (long)(request.DeliveryPrice!.Value * 100);
          options.ShippingOptions = new List<SessionShippingOptionOptions>
          {
            new SessionShippingOptionOptions
            {
              ShippingRateData = new SessionShippingOptionShippingRateDataOptions
              {
                DisplayName = "Leverans",
                Type = "fixed_amount",
                FixedAmount = new SessionShippingOptionShippingRateDataFixedAmountOptions
                {
                  Amount = deliveryAmount,
                  Currency = "sek"
                }
              }
            }
          };
        }

        var session = await service.CreateAsync(options);
        return Results.Json(new { url = session.Url }, statusCode: 200);
      }
      catch (StripeException ex)
      {
        // Return a clean JSON error to the client
        return Results.Json(new { error = ex.Message }, statusCode: 400);
      }
      catch (Exception ex)
      {
        return Results.Json(new { error = ex.Message }, statusCode: 500);
      }
    });
  }
}


public class CheckoutRequest
{
  public List<ProductDto> Products { get; set; } = new();
  public double? DeliveryPrice { get; set; }
}

public class ProductDto
{
  public string Name { get; set; } = string.Empty;
  public double Price { get; set; }
  public int Quantity { get; set; }
}
