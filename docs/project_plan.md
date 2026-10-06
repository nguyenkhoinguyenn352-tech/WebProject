# Initial Database Design

This diagram shows the initial relational database design for the Work Logger project.

```mermaid

erDiagram
    USERS ||--o{ SCHEDULED_ITEMS : owns

    CATEGORIES ||--o{ SUBCATEGORIES : contains
    CATEGORIES ||--o{ WORK_LOGS : classifies

    SUBCATEGORIES ||--o{ WORK_LOGS : specifies
    SCHEDULED_ITEMS ||--o{ WORK_LOGS : relates_to

    USERS {
        INT user_id PK
        VARCHAR name
        VARCHAR username
        VARCHAR email
        VARCHAR password_hash
        VARCHAR role
    }

    CATEGORIES {
        INT category_id PK
        VARCHAR category_name
    }

    SUBCATEGORIES {
        INT subcategory_id PK
        INT category_id FK
        VARCHAR subcategory_name
    }

    SCHEDULED_ITEMS {
        INT item_id PK
        INT user_id FK
        VARCHAR title
        VARCHAR item_type
        DATE start_date
        DATE end_date
    }

    WORK_LOGS {
        INT log_id PK
        INT user_id FK
        DATE work_date
        DECIMAL hours
        VARCHAR time_of_day
        TEXT description
        INT category_id FK
        INT subcategory_id FK
        INT scheduled_item_id FK
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

