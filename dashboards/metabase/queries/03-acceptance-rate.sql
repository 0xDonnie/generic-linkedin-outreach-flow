-- Name: Connection acceptance rate (weekly)
-- Chart type: Line (x=week, y=accept_rate)
-- Acceptance rate is the single biggest health signal. Target: >=18%. Below 12% = ICP/headline needs work.

WITH weekly AS (
  SELECT date_trunc('week', created_at)::date AS week,
         count(*) FILTER (WHERE touch_type = 'connection_request')                                 AS sent,
         count(*) FILTER (WHERE touch_type = 'connection_request' AND status = 'connection_accepted') AS accepted
  FROM campaign_messages
  WHERE created_at >= CURRENT_DATE - INTERVAL '12 weeks'
  GROUP BY 1
)
SELECT week,
       sent,
       accepted,
       CASE WHEN sent > 0 THEN ROUND(100.0 * accepted / sent, 1) ELSE 0 END AS accept_pct
FROM weekly
ORDER BY week;
