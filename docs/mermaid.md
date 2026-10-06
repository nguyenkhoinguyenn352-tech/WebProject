# Work Logger — Initial Database Design

## Business rules

- A user can create zero or more work logs; each work log belongs to exactly one user.
- A user can create zero or more scheduled items; each scheduled item belongs to exactly one user.
- A category can contain zero or more subcategories; each subcategory belongs to exactly one category.
- Each work log belongs to exactly one category.
- A work log may optionally reference one subcategory.
- A work log may optionally reference one scheduled item.
- A scheduled item represents a class, project, meeting, or other activity that work can be logged against.
- Work hours are recorded in whole-hour or half-hour values.
- `time_of_day` records Morning, Afternoon, or Evening.
- User, category, subcategory, scheduled item, and work log IDs are used as stable identifiers.
- Passwords are stored as password hashes rather than plain-text passwords.

## Mermaid ER diagram

```mermaid
erDiagram
    users ||..o{ work_logs : creates
    users ||..o{ scheduled_items : owns

    categories ||..o{ subcategories : contains
    categories ||..o{ work_logs : classifies

    subcategories o|..o{ work_logs : specifies
    scheduled_items o|..o{ work_logs : relates_to

    users {
        INT user_id PK
        VARCHAR(100) name
        VARCHAR(100) username
        VARCHAR(150) email
        VARCHAR(255) password_hash
        VARCHAR(50) role
    }

    categories {
        INT category_id PK
        VARCHAR(255) category_name
    }

    subcategories {
        INT subcategory_id PK
        INT category_id FK
        VARCHAR(255) subcategory_name
    }

    scheduled_items {
        INT item_id PK
        INT user_id FK
        VARCHAR(255) title
        VARCHAR(50) item_type
        DATE start_date
        DATE end_date
    }

    work_logs {
        INT log_id PK
        INT user_id FK
        DATE work_date
        DECIMAL(4,1) hours
        VARCHAR(20) time_of_day
        TEXT description
        INT category_id FK
        INT subcategory_id FK
        INT scheduled_item_id FK
        BOOLEAN deleted_flag
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }
```

## Text equivalent

Each work log references exactly one user and exactly one category.

A user may have no work logs or may create many work logs.

A user may also create zero or more scheduled items. These scheduled items can represent classes, projects, meetings, or other activities.

Each subcategory belongs to one category, while a category may contain zero or more subcategories.

A work log may optionally reference one subcategory. This allows a user to record a main category even when no more specific subcategory is needed.

A work log may also optionally reference one scheduled item. This allows work to be associated with a class, project, or meeting when appropriate.

All relationships in this initial design are non-identifying relationships because the foreign keys are not part of the child table's primary key.

## Translate the design into SQL

| Design decision | SQL implementation |
| --- | --- |
| Stable identifier for users | `user_id INT AUTO_INCREMENT PRIMARY KEY` |
| Stable identifier for work logs | `log_id INT AUTO_INCREMENT PRIMARY KEY` |
| Stable identifier for categories | `category_id INT AUTO_INCREMENT PRIMARY KEY` |
| Stable identifier for subcategories | `subcategory_id INT AUTO_INCREMENT PRIMARY KEY` |
| Stable identifier for scheduled items | `item_id INT AUTO_INCREMENT PRIMARY KEY` |
| Work log must belong to a user | `user_id INT NOT NULL` with a foreign key |
| Work log must have a category | `category_id INT NOT NULL` with a foreign key |
| Optional subcategory | `subcategory_id INT DEFAULT NULL` |
| Optional scheduled item | `scheduled_item_id INT DEFAULT NULL` |
| Work hours | `DECIMAL(4,1) NOT NULL` |
| Work date | `DATE NOT NULL` |
| Work description | `TEXT NOT NULL` |
| Automatic creation time | `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP` |
| Automatic update time | `updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` |

The Mermaid diagram describes the shared initial database design.

`database/schema.sql` creates the database structure and constraints, while `database/seed.sql` inserts the initial categories and subcategories supplied by the client.

The Mermaid diagram and SQL files should be reviewed together and kept consistent when the database design changes.