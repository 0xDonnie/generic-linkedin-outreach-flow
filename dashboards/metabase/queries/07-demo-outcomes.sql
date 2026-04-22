-- Name: Demo outcomes
-- Chart type: Bar (grouped by status) + Scalar (total scheduled / completed / no_show rate)
-- Demo pipeline health: how many scheduled, how many happened, how many no-showed, how many closed.

SELECT
    status,
    count(*) AS count,
    count(*) FILTER (WHERE booked_at >= CURRENT_DATE - INTERVAL '30 days') AS last_30d
FROM demo_bookings
GROUP BY status
ORDER BY
    CASE status
        WHEN 'scheduled'  THEN 1
        WHEN 'completed'  THEN 2
        WHEN 'no_show'    THEN 3
        WHEN 'cancelled'  THEN 4
        ELSE 5
    END;
