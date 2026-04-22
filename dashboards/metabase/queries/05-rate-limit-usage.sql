-- Name: Today's rate-limit usage
-- Chart type: Progress (set target = cap) OR Scalar pair
-- How close you are to hitting LinkedIn's daily caps. Stay below 100% always.

SELECT 'Connections sent today' AS metric,
       COALESCE(SUM(connections_sent), 0) AS value,
       20 AS cap
FROM rate_limit_log
WHERE day = CURRENT_DATE

UNION ALL

SELECT 'Messages sent today',
       COALESCE(SUM(messages_sent), 0),
       40
FROM rate_limit_log
WHERE day = CURRENT_DATE

UNION ALL

SELECT 'Connections this week',
       COALESCE(SUM(connections_sent), 0),
       100
FROM rate_limit_log
WHERE day >= date_trunc('week', CURRENT_DATE);
