# Work Logger API Documentation

## Base URL

```text
http://localhost:3000/api
```

The backend uses JSON for requests and responses.

For protected endpoints:

```text
Authorization: Bearer <token>
```

## Authentication

### POST /auth/google
Signs in with a Google account.

**JWT required:** No

Request body:

```json
{
  "credential": "GOOGLE_ID_TOKEN"
}
```

Success response:

```json
{
  "message": "Login successful",
  "token": "JWT_TOKEN",
  "user": {
    "user_id": 1,
    "name": "Thomas",
    "username": "thomas",
    "email": "user@example.com",
    "role": "user"
  }
}
```

Possible errors:
- `400` Google credential is required
- `401` Google account could not be verified
- `403` Google account is not registered

### GET /auth/me
Checks the current JWT.

**JWT required:** Yes

Example response:

```json
{
  "user": {
    "user_id": 1,
    "email": "user@example.com",
    "role": "user"
  }
}
```

## Scheduled Tasks

### GET /scheduled-items
Returns all scheduled items.

**JWT required in current backend:** No

### POST /scheduled-items
Creates a scheduled item.

**JWT required:** Yes

Request body:

```json
{
  "title": "Web Development",
  "item_type": "Class",
  "start_date": "2026-09-01",
  "end_date": "2026-12-15"
}
```

Success response:

```json
{
  "message": "Scheduled item created successfully",
  "item_id": 1
}
```

### PUT /scheduled-items/:id
Updates a scheduled item.

**JWT required in current backend:** No

Request body:

```json
{
  "title": "Web Development",
  "item_type": "Class",
  "start_date": "2026-09-01",
  "end_date": "2026-12-15"
}
```

Success response:

```json
{
  "message": "Scheduled item updated successfully"
}
```

### DELETE /scheduled-items/:id
Deletes a scheduled item.

**JWT required in current backend:** No

Success response:

```json
{
  "message": "Scheduled item deleted successfully"
}
```

## Work Logs

### GET /worklogs
Returns all active work logs.

**JWT required in current backend:** No

### POST /worklogs
Creates a work log.

**JWT required:** Yes

Request body:

```json
{
  "work_date": "2026-11-12",
  "hours": 2.5,
  "time_of_day": "Afternoon",
  "description": "Attended faculty meeting",
  "category_id": 1,
  "subcategory_id": 2,
  "scheduled_item_id": 1
}
```

`subcategory_id` and `scheduled_item_id` may be `null`.

Success response:

```json
{
  "message": "Work log created successfully",
  "log_id": 1
}
```

### PUT /worklogs/:id
Updates an active work log.

**JWT required in current backend:** No

### DELETE /worklogs/:id
Soft deletes a work log by setting `deleted_flag = TRUE`.

**JWT required in current backend:** No

Success response:

```json
{
  "message": "Work log deleted successfully"
}
```

## Categories

### GET /categories
Returns all main categories.

**JWT required:** No

### GET /categories/:id/subcategories
Returns subcategories for a selected category.

**JWT required:** No

## Reports

### GET /reports?from=YYYY-MM-DD&to=YYYY-MM-DD
Generates a report for a custom date range.

**JWT required:** No

Example:

```text
GET /api/reports?from=2026-10-16&to=2026-11-15
```

Response includes:
- `from_date`
- `to_date`
- `total_hours`
- `hours_by_category`
- `work_logs`

Possible errors:
- `400` From date and to date are required
- `400` From date cannot be after to date

### GET /reports/monthly?year=YYYY&month=M
Generates a report for a calendar month.

**JWT required:** No

Example:

```text
GET /api/reports/monthly?year=2026&month=11
```

Response includes:
- `year`
- `month`
- `total_hours`
- `hours_by_category`
- `work_logs`

## Endpoint Summary
| Method | Endpoint | Purpose | JWT Required |
|---|---|---|---|
| POST | `/auth/google` | Google login | No |
| GET | `/auth/me` | Check current login | Yes |
| GET | `/scheduled-items` | Get scheduled items | Yes |
| POST | `/scheduled-items` | Create scheduled item | Yes |
| PUT | `/scheduled-items/:id` | Update scheduled item | Yes |
| DELETE | `/scheduled-items/:id` | Delete scheduled item | Yes |
| GET | `/worklogs` | Get active work logs | Yes |
| POST | `/worklogs` | Create work log | Yes |
| PUT | `/worklogs/:id` | Update work log | Yes |
| DELETE | `/worklogs/:id` | Soft delete work log | Yes |
| GET | `/categories` | Get categories | No |
| GET | `/categories/:id/subcategories` | Get subcategories | No |
| GET | `/reports` | Date-range report | No |
| GET | `/reports/monthly` | Monthly report | No |

## Notes

- Scheduled task creation and work log creation use the logged-in user's `user_id` from the JWT.
- Work log deletion uses soft delete.
- The frontend currently defaults the report period from the 16th of the previous month to the 15th of the current month.
