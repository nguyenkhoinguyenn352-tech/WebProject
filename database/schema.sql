CREATE DATABASE IF NOT EXISTS work_logger;

USE work_logger;

CREATE TABLE users (
                       user_id INT AUTO_INCREMENT PRIMARY KEY,
                       name VARCHAR(100) NOT NULL,
                       username VARCHAR(100) NOT NULL UNIQUE,
                       email VARCHAR(150) NOT NULL UNIQUE,
                       password_hash VARCHAR(255) NOT NULL,
                       role VARCHAR(50) NOT NULL DEFAULT 'user'
);

CREATE TABLE categories (
                            category_id INT AUTO_INCREMENT PRIMARY KEY,
                            category_name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE subcategories (
                               subcategory_id INT AUTO_INCREMENT PRIMARY KEY,
                               category_id INT NOT NULL,
                               subcategory_name VARCHAR(255) NOT NULL,

                               CONSTRAINT fk_subcategory_category
                                   FOREIGN KEY (category_id)
                                       REFERENCES categories(category_id)
                                       ON DELETE CASCADE
);

CREATE TABLE scheduled_items (
                                 item_id INT AUTO_INCREMENT PRIMARY KEY,
                                 user_id INT NOT NULL,
                                 title VARCHAR(255) NOT NULL,
                                 item_type VARCHAR(50) NOT NULL,
                                 start_date DATE DEFAULT NULL,
                                 end_date DATE DEFAULT NULL,

                                 CONSTRAINT fk_scheduled_item_user
                                     FOREIGN KEY (user_id)
                                         REFERENCES users(user_id)
                                         ON DELETE CASCADE
);

CREATE TABLE work_logs (
                           log_id INT AUTO_INCREMENT PRIMARY KEY,
                           user_id INT NOT NULL,
                           work_date DATE NOT NULL,
                           hours DECIMAL(4,1) NOT NULL,
                           time_of_day VARCHAR(20) NOT NULL,
                           description TEXT NOT NULL,
                           category_id INT NOT NULL,
                           subcategory_id INT DEFAULT NULL,
                           scheduled_item_id INT DEFAULT NULL,
                           deleted_flag BOOLEAN NOT NULL DEFAULT FALSE,
                           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                           updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                               ON UPDATE CURRENT_TIMESTAMP,

                           CONSTRAINT fk_worklog_user
                               FOREIGN KEY (user_id)
                                   REFERENCES users(user_id)
                                   ON DELETE CASCADE,

                           CONSTRAINT fk_worklog_category
                               FOREIGN KEY (category_id)
                                   REFERENCES categories(category_id),

                           CONSTRAINT fk_worklog_subcategory
                               FOREIGN KEY (subcategory_id)
                                   REFERENCES subcategories(subcategory_id),

                           CONSTRAINT fk_worklog_scheduled_item
                               FOREIGN KEY (scheduled_item_id)
                                   REFERENCES scheduled_items(item_id)
                                   ON DELETE SET NULL
);