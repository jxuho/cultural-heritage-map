# Backend API Specification

## Overview

- Base URL: `http://localhost:5000/api/v1`
- API Docs UI: `http://localhost:5000/api-docs`
- Authentication: `Authorization: Bearer <accessToken>`
- Refresh token storage: `refreshToken` HTTP-only cookie
- Common success response:

```json
{
  "status": "success",
  "results": 1,
  "message": "Optional message",
  "data": {}
}
```

- Common error response:

```json
{
  "status": "fail",
  "message": "Error message"
}
```

## Roles

| Role    | Description                                                                             |
| ------- | --------------------------------------------------------------------------------------- |
| `user`  | Authenticated user. Can create reviews, manage own profile, favorites, and proposals.   |
| `admin` | Administrator. Can manage cultural sites, users, all reviews, and proposal review flow. |

## Authentication

### Start Google OAuth

`GET /auth/google`

Redirects the user to the Google OAuth consent/account-selection page.

| Status | Description        |
| ------ | ------------------ |
| `302`  | Redirect to Google |

### Google OAuth Callback

`GET /auth/google/callback`

Handles Google OAuth callback. On success, sets a `refreshToken` cookie and redirects to the frontend.

| Status | Description                  |
| ------ | ---------------------------- |
| `302`  | Redirect to frontend         |
| `401`  | Google authentication failed |

### Refresh Access Token

`GET /auth/refresh`

Uses the `refreshToken` cookie to issue a new access token.

Response:

```json
{
  "status": "success",
  "accessToken": "jwt-access-token",
  "data": {
    "user": {}
  }
}
```

| Status | Description                                      |
| ------ | ------------------------------------------------ |
| `200`  | Access token issued                              |
| `401`  | Missing, invalid, expired token, or deleted user |

### Logout

`POST /auth/logout`

Clears the `refreshToken` cookie.

Response:

```json
{
  "status": "success"
}
```

## Cultural Sites

### Get Cultural Sites

`GET /cultural-sites`

Returns map/list cultural sites. The controller currently supports `bbox`; frontend may also send `limit`, but pagination is not implemented in this endpoint.

Query parameters:

| Name   | Type   | Required | Description                                   |
| ------ | ------ | -------- | --------------------------------------------- |
| `bbox` | string | No       | Bounding box as `minLng,minLat,maxLng,maxLat` |

Response:

```json
{
  "status": "success",
  "results": 10,
  "data": {
    "culturalSites": [
      {
        "_id": "string",
        "name": "Museum",
        "category": "museums_galleries",
        "location": {
          "type": "Point",
          "coordinates": [13.405, 52.52]
        },
        "address": {},
        "averageRating": 4.5,
        "reviewCount": 12
      }
    ]
  }
}
```

### Get Cultural Site By ID

`GET /cultural-sites/:id`

Query parameters:

| Name         | Type | Required | Description                                                      |
| ------------ | ---- | -------- | ---------------------------------------------------------------- |
| `reviewSort` | enum | No       | `newest`, `highestRating`, `lowestRating`. Defaults to `newest`. |

Response data key: `data.culturalSite`

| Status | Description      |
| ------ | ---------------- |
| `200`  | Found            |
| `400`  | Invalid ObjectId |
| `404`  | Not found        |

### Get Nearby OSM Cultural Sites

`GET /cultural-sites/nearby-osm`

Authentication: `user`, `admin`

Query parameters:

| Name               | Type           | Required | Description                          |
| ------------------ | -------------- | -------- | ------------------------------------ |
| `lat`              | number         | Yes      | Latitude                             |
| `lon`              | number         | Yes      | Longitude                            |
| `noReverseGeocode` | boolean string | No       | Use `true` to skip reverse geocoding |

Response data key: `data.osmCulturalSites`

### Create Cultural Site

`POST /cultural-sites`

Authentication: `admin`

Body:

```json
{
  "name": "Example Museum",
  "description": "Optional description",
  "category": "museums_galleries",
  "location": {
    "type": "Point",
    "coordinates": [13.405, 52.52]
  },
  "address": {
    "fullAddress": "Berlin, Germany",
    "street": "Example Str.",
    "houseNumber": "1",
    "postcode": "10115",
    "district": "Mitte",
    "city": "Berlin"
  },
  "website": "https://example.com",
  "imageUrl": "https://example.com/image.jpg",
  "openingHours": "Mo-Fr 10:00-18:00",
  "sourceId": "node/123456",
  "originalTags": {}
}
```

Response data key: `data.culturalSite`

| Status | Description                                                   |
| ------ | ------------------------------------------------------------- |
| `201`  | Created                                                       |
| `400`  | Missing fields, invalid coordinates, or outside city boundary |
| `403`  | Not admin or source ID excluded                               |
| `409`  | Duplicate `sourceId`                                          |

### Update Cultural Site

`PUT /cultural-sites/:id`

Authentication: `admin`

Allowed body fields are defined by `CULTURAL_SITE_UPDATABLE_FIELDS`.

Common updatable fields:

```json
{
  "name": "Updated name",
  "description": "Updated description",
  "category": "museums_galleries",
  "address": {},
  "website": "https://example.com",
  "imageUrl": "https://example.com/image.jpg",
  "openingHours": "Tu-Su 10:00-18:00"
}
```

Response data key: `data.culturalSite`

### Delete Cultural Site

`DELETE /cultural-sites/:id`

Authentication: `admin`

Deletes the cultural site, related reviews, removes it from user favorites, and adds the source ID to the exclusion list.

| Status | Description                         |
| ------ | ----------------------------------- |
| `204`  | Deleted                             |
| `403`  | Not admin                           |
| `404`  | Not found                           |
| `409`  | Source ID already in exclusion list |

### Get District Stats

`GET /cultural-sites/district-stats`

Returns cultural site counts grouped by `address.district`.

Response:

```json
{
  "status": "success",
  "data": [
    {
      "_id": "Mitte",
      "count": 20
    }
  ]
}
```

### Get District Boundaries

`GET /cultural-sites/district-boundaries`

Returns Berlin district boundary GeoJSON.

Response data key: `data.districtBoundaries`

## Reviews

### Get Reviews For Cultural Site

`GET /cultural-sites/:culturalSiteId/reviews`

Response data key: `data.reviews`

| Status | Description              |
| ------ | ------------------------ |
| `200`  | Reviews returned         |
| `400`  | Invalid cultural site ID |
| `404`  | Cultural site not found  |

### Create Review

`POST /cultural-sites/:culturalSiteId/reviews`

Authentication: `user`, `admin`

Body:

```json
{
  "rating": 5,
  "comment": "Great place."
}
```

Response data key: `data.review`

| Status | Description                     |
| ------ | ------------------------------- |
| `201`  | Created                         |
| `404`  | Cultural site not found         |
| `409`  | User already reviewed this site |

### Get Review By ID

`GET /cultural-sites/:culturalSiteId/reviews/:reviewId`

Response data key: `data.review`

### Update Review

`PATCH /cultural-sites/:culturalSiteId/reviews/:reviewId`

Authentication: review owner with role `user` or `admin`

Body:

```json
{
  "rating": 4,
  "comment": "Updated comment."
}
```

Response data key: `data.review`

| Status | Description      |
| ------ | ---------------- |
| `200`  | Updated          |
| `403`  | Not review owner |
| `404`  | Review not found |

### Delete Review

`DELETE /cultural-sites/:culturalSiteId/reviews/:reviewId`

Authentication: review owner or `admin`

| Status | Description               |
| ------ | ------------------------- |
| `204`  | Deleted                   |
| `403`  | Not review owner or admin |
| `404`  | Review not found          |

### Get Reviews

`GET /reviews`

Query parameters:

| Name   | Type   | Required | Description             |
| ------ | ------ | -------- | ----------------------- |
| `user` | string | No       | Filter by user ObjectId |

Response data key: `data.reviews`

### Get All Reviews For Admin

`GET /reviews/admin/all`

Authentication: `admin`

Query parameters:

| Name    | Type   | Required | Default |
| ------- | ------ | -------- | ------- |
| `page`  | number | No       | `1`     |
| `limit` | number | No       | `50`    |

Response:

```json
{
  "status": "success",
  "results": 50,
  "totalResults": 120,
  "page": 1,
  "totalPages": 3,
  "data": {
    "reviews": []
  }
}
```

## Users

All user routes require an access token.

### Get Current User

`GET /users/me`

Response data key: `data.user`

### Update Current User

`PATCH /users/updateMe`

Allowed body fields: `username`, `profileImage`, `bio`

Body:

```json
{
  "username": "new-name",
  "profileImage": "https://example.com/avatar.jpg",
  "bio": "Short bio"
}
```

Response data key: `data.user`

### Delete Current User

`DELETE /users/deleteMe`

Deletes the user, the user's reviews and proposals, adjusts favorites counts, and clears the auth cookie.

Response:

```json
{
  "status": "success",
  "message": "User deletion success"
}
```

### Get User By ID

`GET /users/:userId`

Response data key: `data.user`

Returned fields: `_id`, `username`, `email`, `profileImage`, `bio`

### Get All Users

`GET /users`

Authentication: `admin`

Response data key: `data.users`

### Update User Role

`PATCH /users/updateRole/:userId`

Authentication: `admin`

Body:

```json
{
  "newRole": "admin"
}
```

Response data key: `data.user`

| Status | Description                            |
| ------ | -------------------------------------- |
| `200`  | Role updated                           |
| `400`  | Invalid role                           |
| `403`  | Not admin or trying to change own role |
| `404`  | User not found                         |

### Get Favorite Sites

`GET /users/me/favorites`

Response data key: `data.favoriteSites`

Important implementation note: in `routes/userRoutes.js`, `GET /:userId` is currently registered before `/me/favorites`, so Express can match `/users/me/favorites` incorrectly. Move `/me/favorites` and `/me/reviews` above `/:userId` to make these routes reachable.

### Add Favorite Site

`POST /users/me/favorites/:siteId`

Response data keys: `data.user`, `data.culturalSite`

### Remove Favorite Site

`DELETE /users/me/favorites/:siteId`

Response data key: `data.user`

### Get My Reviews

`GET /users/me/reviews`

Query parameters:

| Name         | Type | Required | Description                                                      |
| ------------ | ---- | -------- | ---------------------------------------------------------------- |
| `reviewSort` | enum | No       | `newest`, `highestRating`, `lowestRating`. Defaults to `newest`. |

Response data key: `data.reviews`

Important frontend note: current frontend sort values include `highest` and `lowest`, while backend expects `highestRating` and `lowestRating`.

## Proposals

All proposal routes require an access token.

### Get My Proposals

`GET /proposals/my-proposals`

Response data key: `data.proposals`

### Create Proposal

`POST /proposals`

Body for create proposal:

```json
{
  "proposalType": "create",
  "sourceId": "node/123456",
  "name": "New cultural site",
  "category": "museums_galleries",
  "location": {
    "type": "Point",
    "coordinates": [13.405, 52.52]
  },
  "description": "Optional",
  "address": {},
  "website": "https://example.com",
  "imageUrl": "https://example.com/image.jpg",
  "openingHours": "Mo-Fr 10:00-18:00",
  "proposalMessage": "Please add this site."
}
```

Body for update proposal:

```json
{
  "proposalType": "update",
  "culturalSite": "cultural-site-id",
  "name": "Updated name",
  "openingHours": "Tu-Su 10:00-18:00",
  "proposalMessage": "Please update this information."
}
```

Body for delete proposal:

```json
{
  "proposalType": "delete",
  "culturalSite": "cultural-site-id",
  "proposalMessage": "This site should be removed."
}
```

Response data key: `data.proposal`

| Status | Description                                   |
| ------ | --------------------------------------------- |
| `201`  | Proposal created                              |
| `400`  | Missing or invalid proposal fields            |
| `404`  | OSM element or target cultural site not found |
| `409`  | Duplicate registered site or pending proposal |

### Get All Proposals

`GET /proposals`

Authentication: `admin`

Query parameters:

| Name     | Type | Required | Description                       |
| -------- | ---- | -------- | --------------------------------- |
| `status` | enum | No       | `pending`, `accepted`, `rejected` |
| `type`   | enum | No       | `create`, `update`, `delete`      |

Response data key: `data.proposals`

### Get Proposal By ID

`GET /proposals/:id`

Authentication: `admin`

Response data key: `data.proposal`

### Accept Proposal

`PATCH /proposals/:id/accept`

Authentication: `admin`

Body:

```json
{
  "adminComment": "Accepted."
}
```

Response data keys: `data.proposal`, `data.culturalSite`

### Reject Proposal

`PATCH /proposals/:id/reject`

Authentication: `admin`

Body:

```json
{
  "adminComment": "Rejected because ..."
}
```

Response data key: `data.proposal`

## Data Models

### CulturalSite

| Field                  | Type     | Required | Description                                                                                                                                                                                                                             |
| ---------------------- | -------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_id`                  | string   | Yes      | MongoDB ObjectId                                                                                                                                                                                                                        |
| `name`                 | string   | Yes      | 2-100 chars                                                                                                                                                                                                                             |
| `description`          | string   | No       | Max 1000 chars                                                                                                                                                                                                                          |
| `category`             | string   | Yes      | One of `historic_ensemble`, `museums_galleries`, `monument`, `memorial`, `castle`, `religious_heritage`, `cultural_venues`, `public_art`, `industrial_heritage`, `archaeological_sites`, `heritage_buildings`, `gardens_parks`, `other` |
| `location.type`        | string   | Yes      | `Point`                                                                                                                                                                                                                                 |
| `location.coordinates` | number[] | Yes      | `[longitude, latitude]`                                                                                                                                                                                                                 |
| `address`              | object   | No       | `fullAddress`, `street`, `houseNumber`, `postcode`, `district`, `city`                                                                                                                                                                  |
| `website`              | string   | No       | URL string                                                                                                                                                                                                                              |
| `imageUrl`             | string   | No       | URL string                                                                                                                                                                                                                              |
| `openingHours`         | string   | No       | Opening hours text                                                                                                                                                                                                                      |
| `sourceId`             | string   | Yes      | OSM ID, e.g. `node/123456`                                                                                                                                                                                                              |
| `originalTags`         | object   | Yes      | Original OSM tags                                                                                                                                                                                                                       |
| `reviews`              | string[] | No       | Review ObjectIds                                                                                                                                                                                                                        |
| `favoritesCount`       | number   | No       | Defaults to `0`                                                                                                                                                                                                                         |
| `averageRating`        | number   | No       | Defaults to `0`                                                                                                                                                                                                                         |
| `reviewCount`          | number   | No       | Defaults to `0`                                                                                                                                                                                                                         |
| `proposedBy`           | string   | No       | User ObjectId                                                                                                                                                                                                                           |
| `registeredBy`         | string   | No       | User ObjectId                                                                                                                                                                                                                           |

### Review

| Field          | Type          | Required | Description             |
| -------------- | ------------- | -------- | ----------------------- |
| `_id`          | string        | Yes      | MongoDB ObjectId        |
| `culturalSite` | string/object | Yes      | Cultural site reference |
| `user`         | string/object | Yes      | User reference          |
| `rating`       | number        | Yes      | 1-5                     |
| `comment`      | string        | No       | Max 500 chars           |
| `createdAt`    | date-time     | Yes      | Creation time           |

### User

| Field           | Type     | Required | Description             |
| --------------- | -------- | -------- | ----------------------- |
| `_id`           | string   | Yes      | MongoDB ObjectId        |
| `username`      | string   | No       | Max 20 chars            |
| `email`         | string   | Yes      | Unique email            |
| `googleId`      | string   | Yes      | Unique Google ID        |
| `profileImage`  | string   | No       | Profile image URL       |
| `role`          | enum     | Yes      | `user` or `admin`       |
| `favoriteSites` | string[] | No       | Cultural site ObjectIds |
| `bio`           | string   | No       | Max 200 chars           |

### Proposal

| Field             | Type      | Required    | Description                                            |
| ----------------- | --------- | ----------- | ------------------------------------------------------ |
| `_id`             | string    | Yes         | MongoDB ObjectId                                       |
| `culturalSite`    | string    | Conditional | Required for `update` and `delete`                     |
| `proposedBy`      | string    | Yes         | User ObjectId                                          |
| `proposalType`    | enum      | Yes         | `create`, `update`, `delete`                           |
| `proposedChanges` | object    | Conditional | Required for `create` and `update`; empty for `delete` |
| `proposalMessage` | string    | No          | Max 500 chars                                          |
| `status`          | enum      | Yes         | `pending`, `accepted`, `rejected`                      |
| `reviewedBy`      | string    | Conditional | Required once reviewed                                 |
| `adminComment`    | string    | Conditional | Required once reviewed                                 |
| `reviewedAt`      | date-time | No          | Review timestamp                                       |
