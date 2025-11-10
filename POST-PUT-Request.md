# POST och PUT Request-struktur - Alla ContentTypes

Detta dokument beskriver hur request body ska struktureras för POST och PUT requests för alla ContentTypes i systemet.

**Endpoints:**
- `POST /api/{contentType}` - Skapa nytt content item
- `PUT /api/{contentType}/{id}` - Uppdatera befintligt content item

---

## Innehållsförteckning

1. [Product](#1-product)
2. [Recipe](#2-recipe)
3. [Ingredient](#3-ingredient)
4. [Cart](#4-cart)
5. [Order](#5-order)
6. [ShoppingList](#6-shoppinglist)
7. [Category](#7-category)
8. [ProductUnit](#8-productunit)
9. [RestPermissions](#9-restpermissions)
10. [BagPart Items](#10-bagpart-items)
    - [CartItem](#cartitem)
    - [OrderItem](#orderitem)
    - [ShoppingListItem](#shoppinglistitem)
    - [RecipeItem](#recipeitem)
    - [Instruction](#instruction)
    - [Comment](#comment)

---

## Allmän information

### Fälttyper och mappning

1. **String** → TextField: `{"Text": "value"}`
2. **Number** → NumericField: `{"Value": 123}`
3. **Boolean** → BooleanField: `{"Value": true}`
4. **Field ending with "Id"** → ContentItemIds: `{"ContentItemIds": ["id1", "id2"]}`
5. **User array** → UserPickerField: `{"UserIds": ["id"], "UserNames": ["username"]}`
6. **Media object** → MediaField: `{"Paths": ["path"], "MediaTexts": [""]}`
7. **Taxonomy object** → TaxonomyField: `{"TermContentItemIds": ["id"], "TaxonomyContentItemId": "taxId"}`
8. **Items array** → BagPart: `{"ContentItems": [...]}`

### Reserverade fält (hoppas över i requests)

Följande fält hoppas automatiskt över och kan inte användas i POST/PUT:
- `id`, `contentItemId`, `title`, `displayText`, `createdUtc`, `modifiedUtc`, `publishedUtc`, `contentType`, `published`, `latest`

**OBS:** `title` kan användas för att sätta `DisplayText`, men det är ett specialfall.

---

## 1. Product

### POST Request
```json
{
  "title": "Mjölk 1,5l",
  "price": 25.95,
  "description": "Lite brun mjölk",
  "stock": 10,
  "image": {
    "paths": ["default/rumandcoke.png"],
    "mediaTexts": [""]
  },
  "category": {
    "termContentItemIds": ["48vma1b2jd1fp5e0nz31zc95wx"],
    "taxonomyContentItemId": "4dh2zw1d3h9njrtvbn4kf70rc2"
  }
}
```

### PUT Request
```json
{
  "title": "Uppdaterad produkt",
  "price": 30.00,
  "stock": 5,
  "description": "Ny beskrivning"
}
```

### Fältbeskrivning
- `title` (string) - Produktnamn
- `price` (number) - Pris
- `description` (string) - Beskrivning (TextField)
- `stock` (number) - Lagerantal
- `image` (object) - MediaField med `paths` (array) och `mediaTexts` (array)
- `category` (object) - TaxonomyField med `termContentItemIds` (array) och `taxonomyContentItemId` (string)

---

## 2. Recipe

### POST Request
```json
{
  "title": "Lång Kaka",
  "description": "Väldigt lång kaka!",
  "recipeImage": {
    "paths": ["default/longcookie.jpg"],
    "mediaTexts": [""]
  },
  "prepTimeMinutes": 30,
  "cookTimeMinutes": 60,
  "servings": 5,
  "user": [
    {
      "id": "41pa0n8vr1wqnz3wbk75nnte4b",
      "username": "john"
    }
  ],
  "category": {
    "termContentItemIds": ["47z8avhtxq3mcrgq132tq2sgnv"],
    "taxonomyContentItemId": "4xt2ey1mb7dq5zefaff51f1j4x"
  },
  "items": [
    {
      "contentType": "RecipeItem",
      "ingredientId": "4rej84rhthwh1yatc3fxpkxswj",
      "quantity": 3,
      "unitId": "4qtgsx1g3qpkxy6z6mvah17vdm"
    },
    {
      "contentType": "Instruction",
      "text": "Blanda",
      "order": 1
    },
    {
      "contentType": "Comment",
      "content": "Inte gott!",
      "user": [
        {
          "id": "49s26m4j039y53tkndhbcd0kx5",
          "username": "jane"
        }
      ]
    }
  ]
}
```

### PUT Request
```json
{
  "title": "Uppdaterat recept",
  "prepTimeMinutes": 20,
  "servings": 4,
  "description": "Ny beskrivning"
}
```

### Fältbeskrivning
- `title` (string) - Receptnamn
- `description` (string) - MarkdownField (beskrivning)
- `recipeImage` (object) - MediaField med `paths` och `mediaTexts`
- `prepTimeMinutes` (number) - Förberedningstid i minuter
- `cookTimeMinutes` (number) - Tillagningstid i minuter
- `servings` (number) - Antal portioner
- `user` (array) - UserPickerField med objekt som har `id` och `username`
- `category` (object) - TaxonomyField med `termContentItemIds` och `taxonomyContentItemId`
- `items` (array) - BagPart med RecipeItem, Instruction, Comment (se [BagPart Items](#10-bagpart-items))

---

## 3. Ingredient

### POST Request
```json
{
  "title": "Mjölk",
  "unitId": "46t5dx54h0hqa306rnb1bkbzna",
  "productId": ["4jd72mth5f88t5syt89wxgrf5q", "45c7b168rs24jx4fm3ympzy74m"]
}
```

### PUT Request
```json
{
  "title": "Uppdaterad ingrediens",
  "unitId": "46t5dx54h0hqa306rnb1bkbzna"
}
```

### Fältbeskrivning
- `title` (string) - Ingrediensnamn
- `unitId` (string eller array) - Enhet (ContentItemId eller array med ContentItemIds)
- `productId` (string eller array) - Produkter (ContentItemId eller array med ContentItemIds)

---

## 4. Cart

### POST Request
```json
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
    }
  ]
}
```

### PUT Request
```json
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
      "productId": "45c7b168rs24jx4fm3ympzy74m",
      "quanitity": 3,
      "unitId": "43zfyeqm8fyhfwgya2m2nf9m5y"
    }
  ]
}
```

### Fältbeskrivning
- `user` (array, **krävs**) - UserPickerField med objekt som har `id` och `username`
- `items` (array, valfritt) - BagPart med CartItem-objekt

**Viktigt:**
- Använd `user` (array), inte `userId` (string)
- I CartItem: `quanitity` (stavfel i systemet), inte `quantity`!

---

## 5. Order

### POST Request
```json
{
  "orderNumber": 1,
  "status": "pending",
  "totalSum": 35,
  "orderDate": "2025-08-12T11:37:00Z",
  "deliveryAddress": "Blahavägen 19,\r\n52564, Lärköping",
  "user": [
    {
      "id": "49s26m4j039y53tkndhbcd0kx5",
      "username": "jane"
    }
  ],
  "items": [
    {
      "contentType": "OrderItem",
      "productId": "4spkx2jm7f6shzkxs38kt651dn",
      "amount": 1,
      "unitId": "43zfyeqm8fyhfwgya2m2nf9m5y",
      "price": 35,
      "checked": false
    }
  ]
}
```

### PUT Request
```json
{
  "status": "completed",
  "totalSum": 150
}
```

### Fältbeskrivning
- `orderNumber` (number) - Ordernummer
- `status` (string) - Status (TextField)
- `totalSum` (number) - Totalsumma
- `orderDate` (string) - Datum i ISO 8601-format
- `deliveryAddress` (string) - Leveransadress (TextField)
- `user` (array, **krävs**) - UserPickerField med objekt som har `id` och `username`
- `items` (array, valfritt) - BagPart med OrderItem-objekt

**Viktigt:** Använd `user` (array), inte `userId` (string)

---

## 6. ShoppingList

### POST Request
```json
{
  "title": "Min fredagslista",
  "user": [
    {
      "id": "41pa0n8vr1wqnz3wbk75nnte4b",
      "username": "john"
    }
  ],
  "items": [
    {
      "contentType": "ShoppingListItem",
      "productId": "4w2tk68s3wspr7vjv4vngtmyd7",
      "quantity": 2,
      "unitId": "43zfyeqm8fyhfwgya2m2nf9m5y"
    }
  ]
}
```

### PUT Request
```json
{
  "title": "Uppdaterad Shopping List",
  "user": [
    {
      "id": "41pa0n8vr1wqnz3wbk75nnte4b",
      "username": "john"
    }
  ]
}
```

### Fältbeskrivning
- `title` (string) - Listnamn
- `user` (array, **krävs**) - UserPickerField med objekt som har `id` och `username`
- `items` (array, valfritt) - BagPart med ShoppingListItem-objekt

**Viktigt:** Använd `user` (array), inte `userId` (string)

---

## 7. Category

### POST Request
```json
{
  "title": "Mejeri"
}
```

### PUT Request
```json
{
  "title": "Uppdaterad kategori"
}
```

### Fältbeskrivning
- `title` (string) - Kategorinamn

**OBS:** Category är en minimal typ, endast `title` behövs.

---

## 8. ProductUnit

### POST Request
```json
{
  "title": "Paket",
  "code": "pkt",
  "description": "Paket",
  "unitCode": "pkt"
}
```

### PUT Request
```json
{
  "title": "Uppdaterad Enhet",
  "unitCode": "test2"
}
```

### Fältbeskrivning
- `title` (string) - Enhetsnamn
- `code` (string) - Kod
- `description` (string) - Beskrivning
- `unitCode` (string) - Enhetskod

---

## 9. RestPermissions

### POST Request
```json
{
  "title": "Admin Permissions",
  "roles": "Administrator,Editor",
  "contentTypes": "Product,Recipe",
  "restMethods": "GET,POST,PUT,DELETE"
}
```

### PUT Request
```json
{
  "title": "Uppdaterade Permissions",
  "roles": "Administrator,Editor,User",
  "restMethods": "GET,POST,PUT"
}
```

### Fältbeskrivning
- `title` (string) - Permissionsnamn
- `roles` (string) - Kommaseparerade roller
- `contentTypes` (string) - Kommaseparerade contentTypes
- `restMethods` (string) - Kommaseparerade HTTP-metoder (GET, POST, PUT, DELETE)

---

## 10. BagPart Items

BagPart items skapas via `items`-arrayen i parent-objektet (Recipe, Cart, Order, ShoppingList). Alla items måste ha `contentType`-fältet.

### CartItem

**Används i:** Cart

```json
{
  "contentType": "CartItem",
  "productId": "4w2tk68s3wspr7vjv4vngtmyd7",
  "quanitity": 1,
  "unitId": "43zfyeqm8fyhfwgya2m2nf9m5y"
}
```

**Fält:**
- `contentType` (string, **krävs**) - Måste vara `"CartItem"`
- `productId` (string, **krävs**) - ContentItemId för produkten
- `quanitity` (number, **krävs**) - **OBS: Stavfel i systemet!** Använd `quanitity`, inte `quantity`
- `unitId` (string, **krävs**) - ContentItemId för enheten

---

### OrderItem

**Används i:** Order

```json
{
  "contentType": "OrderItem",
  "productId": "4spkx2jm7f6shzkxs38kt651dn",
  "amount": 1,
  "unitId": "43zfyeqm8fyhfwgya2m2nf9m5y",
  "price": 35,
  "checked": false
}
```

**Fält:**
- `contentType` (string, **krävs**) - Måste vara `"OrderItem"`
- `productId` (string, **krävs**) - ContentItemId för produkten
- `amount` (number, **krävs**) - Antal
- `unitId` (string, **krävs**) - ContentItemId för enheten
- `price` (number) - Pris
- `checked` (boolean) - Checkad

---

### ShoppingListItem

**Används i:** ShoppingList

```json
{
  "contentType": "ShoppingListItem",
  "productId": "4w2tk68s3wspr7vjv4vngtmyd7",
  "quantity": 2,
  "unitId": "43zfyeqm8fyhfwgya2m2nf9m5y"
}
```

**Fält:**
- `contentType` (string, **krävs**) - Måste vara `"ShoppingListItem"`
- `productId` (string, **krävs**) - ContentItemId för produkten
- `quantity` (number, **krävs**) - Kvantitet
- `unitId` (string, **krävs**) - ContentItemId för enheten

---

### RecipeItem

**Används i:** Recipe

```json
{
  "contentType": "RecipeItem",
  "ingredientId": "4rej84rhthwh1yatc3fxpkxswj",
  "quantity": 3,
  "unitId": "4qtgsx1g3qpkxy6z6mvah17vdm"
}
```

**Fält:**
- `contentType` (string, **krävs**) - Måste vara `"RecipeItem"`
- `ingredientId` (string, **krävs**) - ContentItemId för ingrediensen
- `quantity` (number, **krävs**) - Kvantitet
- `unitId` (string, **krävs**) - ContentItemId för enheten

---

### Instruction

**Används i:** Recipe

```json
{
  "contentType": "Instruction",
  "text": "Blanda alla ingredienser",
  "order": 1
}
```

**Fält:**
- `contentType` (string, **krävs**) - Måste vara `"Instruction"`
- `text` (string, **krävs**) - Instruktionstext
- `order` (number, **krävs**) - Ordning (stegnummer)

---

### Comment

**Används i:** Recipe

```json
{
  "contentType": "Comment",
  "content": "Detta är en kommentar",
  "user": [
    {
      "id": "41pa0n8vr1wqnz3wbk75nnte4b",
      "username": "john"
    }
  ]
}
```

**Fält:**
- `contentType` (string, **krävs**) - Måste vara `"Comment"`
- `content` (string, **krävs**) - Kommentarstext
- `user` (array, **krävs**) - UserPickerField med objekt som har `id` och `username`

---

## Viktiga noteringar

### 1. UserPickerField-format
Använd alltid `user` (array) med objekt som har `id` och `username`, **inte** `userId` (string):
```json
"user": [
  {
    "id": "41pa0n8vr1wqnz3wbk75nnte4b",
    "username": "john"
  }
]
```

### 2. Stavfel i CartItem
I CartItem måste du använda `quanitity` (stavfel), inte `quantity`:
```json
{
  "contentType": "CartItem",
  "quanitity": 1  // ← Stavfel, men korrekt för systemet!
}
```

### 3. BagPart items
- Alla items i `items`-arrayen måste ha `contentType`-fältet
- Items skapas automatiskt när parent-objektet skapas
- Vid PUT ersätts alla befintliga items med de nya i `items`-arrayen

### 4. ContentItemIds
- Fält som slutar med `Id` (t.ex. `productId`, `unitId`, `ingredientId`) förväntar sig ContentItemIds (26-char alphanumeric strings)
- Kan vara en string eller array med strings

### 5. MediaField
MediaField använder objekt med `paths` (array) och `mediaTexts` (array):
```json
"image": {
  "paths": ["default/image.jpg"],
  "mediaTexts": [""]
}
```

### 6. TaxonomyField
TaxonomyField använder objekt med `termContentItemIds` (array) och `taxonomyContentItemId` (string):
```json
"category": {
  "termContentItemIds": ["48vma1b2jd1fp5e0nz31zc95wx"],
  "taxonomyContentItemId": "4dh2zw1d3h9njrtvbn4kf70rc2"
}
```

### 7. Partial updates (PUT)
Vid PUT behöver du bara inkludera de fält du vill uppdatera. Alla fält som inte ingår i requesten behåller sina befintliga värden.

---

## Exempel med curl

### POST - Skapa Product
```bash
curl -X POST http://localhost:5001/api/Product \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Produkt",
    "price": 29.95,
    "description": "Testbeskrivning",
    "stock": 5
  }'
```

### PUT - Uppdatera Product
```bash
curl -X PUT http://localhost:5001/api/Product/{productId} \
  -H "Content-Type: application/json" \
  -d '{
    "price": 35.00,
    "stock": 10
  }'
```

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

---
