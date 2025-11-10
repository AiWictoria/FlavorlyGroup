# Cart - POST och PUT Exempel

## POST Request - Skapa ny Cart

### Minimal Cart (utan items)
```json
POST /api/Cart
Content-Type: application/json

{
  "user": [
    {
      "id": "41pa0n8vr1wqnz3wbk75nnte4b",
      "username": "john"
    }
  ]
}
```

### Cart med CartItems
```json
POST /api/Cart
Content-Type: application/json

{
  "user": [
    {
      "id": "41pa0n8vr1wqnz3wbk75nnte4b",
      "username": "john"
    }
  ],
  "items": [
    {
      "contentType": "CartItem",
      "productId": "4w2tk68s3wspr7vjv4vngtmyd7",
      "quanitity": 1,
      "unitId": "43zfyeqm8fyhfwgya2m2nf9m5y"
    },
    {
      "contentType": "CartItem",
      "productId": "4jd72mth5f88t5syt89wxgrf5q",
      "quanitity": 2,
      "unitId": "43zfyeqm8fyhfwgya2m2nf9m5y"
    }
  ]
}
```

**Viktigt:**
- `user` - Array med user-objekt (krävs) - använd UserPickerField-format med `id` och `username`
- `items` - Array med CartItem-objekt (valfritt)
- I CartItem: `quanitity` (stavfel i systemet, inte "quantity"!)
- I CartItem: `productId` och `unitId` är ContentItemIds (strings)

---

## PUT Request - Uppdatera befintlig Cart

### Uppdatera User
```json
PUT /api/Cart/{cartId}
Content-Type: application/json

{
  "user": [
    {
      "id": "49s26m4j039y53tkndhbcd0kx5",
      "username": "jane"
    }
  ]
}
```

### Uppdatera items (ersätter alla befintliga items)
```json
PUT /api/Cart/{cartId}
Content-Type: application/json

{
  "user": [
    {
      "id": "41pa0n8vr1wqnz3wbk75nnte4b",
      "username": "john"
    }
  ],
  "items": [
    {
      "contentType": "CartItem",
      "productId": "45c7b168rs24jx4fm3ympzy74m",
      "quanitity": 3,
      "unitId": "43zfyeqm8fyhfwgya2m2nf9m5y"
    }
  ]
}
```

### Uppdatera både User och items
```json
PUT /api/Cart/{cartId}
Content-Type: application/json

{
  "user": [
    {
      "id": "49s26m4j039y53tkndhbcd0kx5",
      "username": "jane"
    }
  ],
  "items": [
    {
      "contentType": "CartItem",
      "productId": "4w2tk68s3wspr7vjv4vngtmyd7",
      "quanitity": 5,
      "unitId": "43zfyeqm8fyhfwgya2m2nf9m5y"
    },
    {
      "contentType": "CartItem",
      "productId": "4dzs5dnwmgzxay9gtnde1gdy5y",
      "quanitity": 1,
      "unitId": "43zfyeqm8fyhfwgya2m2nf9m5y"
    }
  ]
}
```

---

## Fältbeskrivning

### Cart-fält
- `user` (array, **krävs**) - UserPickerField med user-objekt som innehåller `id` och `username`
- `items` (array, valfritt) - Array med CartItem-objekt

### CartItem-fält (i items-arrayen)
- `contentType` (string, **krävs**) - Måste vara `"CartItem"`
- `productId` (string, **krävs**) - ContentItemId för produkten
- `quanitity` (number, **krävs**) - **OBS: Stavfel i systemet!** Använd `quanitity`, inte `quantity`
- `unitId` (string, **krävs**) - ContentItemId för enheten

---

## Exempel med curl

### POST - Skapa Cart med items
```bash
curl -X POST http://localhost:5001/api/Cart \
  -H "Content-Type: application/json" \
  -d '{
    "user": [
      {
        "id": "41pa0n8vr1wqnz3wbk75nnte4b",
        "username": "john"
      }
    ],
    "items": [
      {
        "contentType": "CartItem",
        "productId": "4w2tk68s3wspr7vjv4vngtmyd7",
        "quanitity": 1,
        "unitId": "43zfyeqm8fyhfwgya2m2nf9m5y"
      }
    ]
  }'
```

### PUT - Uppdatera Cart
```bash
curl -X PUT http://localhost:5001/api/Cart/{cartId} \
  -H "Content-Type: application/json" \
  -d '{
    "user": [
      {
        "id": "41pa0n8vr1wqnz3wbk75nnte4b",
        "username": "john"
      }
    ],
    "items": [
      {
        "contentType": "CartItem",
        "productId": "4w2tk68s3wspr7vjv4vngtmyd7",
        "quanitity": 2,
        "unitId": "43zfyeqm8fyhfwgya2m2nf9m5y"
      }
    ]
  }'
```

---

## Response-exempel

### POST Response (201 Created)
```json
{
  "id": "44dqy420qcx5tv5g9s2jnd6r5y",
  "user": {
    "id": "41pa0n8vr1wqnz3wbk75nnte4b",
    "username": "john"
  },
  "items": [
    {
      "id": "44zbryepvtwc73rd2b5nsn0rmx",
      "contentType": "CartItem",
      "product": {
        "id": "4w2tk68s3wspr7vjv4vngtmyd7",
        "title": "Ägg 10p Frigående Inomhus Large"
      },
      "quantity": 1,
      "unit": {
        "id": "43zfyeqm8fyhfwgya2m2nf9m5y",
        "title": "Paket",
        "unitCode": "pkt"
      }
    }
  ]
}
```

**OBS:** I response är fältet `quantity` (korrekt stavning), men i request måste du använda `quanitity` (stavfel)!

---

## Viktiga noteringar

1. **UserPickerField-format:** Använd `user` (array) med objekt som har `id` och `username`, inte `userId` (string)
2. **Stavfel i systemet:** Använd `quanitity` i POST/PUT requests, inte `quantity`
3. **User krävs:** Du måste ha ett giltigt User-objekt med `id` och `username` för att skapa/uppdatera Cart
4. **Items ersätts:** När du gör PUT med `items`-arrayen, ersätts alla befintliga items
5. **ContentItemIds:** `productId` och `unitId` måste vara giltiga ContentItemIds som finns i systemet

