USE work_logger;

INSERT INTO categories (category_name)
VALUES
    ('Good Teaching Quality'),
    ('Good Connecting Theory to Industry Relevant Practices'),
    ('Good Supporting and Inspiring Students'),
    ('Good Academic and Industry Research');
INSERT INTO subcategories (category_id, subcategory_name)
VALUES
    (
        1,
        'Delivery SUT Unit Learning Outcomes, Grading Timely'
    ),
    (
        1,
        'Participate in Meeting Faculty'
    ),
    (
        2,
        'Organize practical skill competition'
    ),
    (
        2,
        'Organize Mentor Coaching, Talks, Study tour or Industry Project'
    ),
    (
        2,
        'Develop network and internship'
    ),
    (
        3,
        'Do the 1-1 Tutoring'
    ),
    (
        3,
        'Do the Meeting or orientation or communication to current or future students'
    ),
    (
        4,
        'Do something relating publishing academic paper'
    ),
    (
        4,
        'Do something relating Presentation in Industry Workshop or Commercial research'
    );