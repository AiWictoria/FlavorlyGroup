# Flavorly

Flavorly is a recipe and ordering application developed as a fullstack project.  
The app originally used React and a Minimal API, but was later migrated to **Orchard Core CMS** to enable a more flexible data model and an extended flow for recipes, ingredients, shopping lists, and orders.

---

## Features

### For users
- Create and edit recipes  
- Save ingredients to a shopping list  
- Move items to the cart and order products  
- Step-by-step order flow: Cart → Delivery → Payment → Confirmation  
- View and track personal orders  

### For store staff
- View and manage incoming orders  
- Packing view with a clear overview of each order  

---

## Tech stack

### Frontend
- **React**  
- Routing with custom AuthContext and role handling  
- **React Bootstrap**, **SCSS**, and custom styling  
- **react-hot-toast** for notifications

### Backend – Orchard Core
- Recipes, ingredients, shopping lists, carts, and products structured as Content Types  
- Relations created via Content Picker Fields  
- Roles: *Anonymous*, *Customer*, *Administrator*  
- Direct publishing of created recipes  
- Access controlled through Rest Permissions and frontend auth logic  

---

## Future improvements
Examples of possible future enhancements:
- Suggestion system for new ingredients  
- Additional CMS-driven admin features  
- Improved delivery information in the store view  
- Reintroduction of favorites, ratings, and comments  

---

## Getting started

```bash
npm install
npm start
```

## To use Flavourly, visit:
```
http://localhost:5173
```
Log in as customer: 
```
username: john@doe.com
password: Password123!
```
Log in as admin:
```
username: kalle@doe.com
password: Password123!
```
## To use Orchard Core, visit:
```
http://localhost:5001/admin
```
Log in as admin:
```
username: kalle@doe.com
passoword: Password123!
```
