-- Name: Daily activity (last 30 days)
-- Chart type: Line (x=day, y=connections_sent + messages_sent as series)
-- Raw daily sends from rate_limit_log — matches what the engine actually did.

SELECT day,
       connections_sent,
       messages_sent,
       (connections_sent + messages_sent) AS total_actions
FROM rate_limit_log
WHERE day >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY day;
