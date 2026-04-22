-- Name: Template performance
-- Chart type: Table (sortable) OR Bar
-- Which template variants drive the most replies? Used to iterate on copy.
-- Assumes campaign_messages.template_used holds the filename (connection-note.txt, first-message.txt, etc.)

WITH sent AS (
  SELECT template_used, count(*) AS sent_count
  FROM campaign_messages
  WHERE status IN ('sent', 'delivered', 'connection_accepted')
  GROUP BY template_used
),
replied AS (
  SELECT cm.template_used, count(DISTINCT r.id) AS reply_count
  FROM li_replies r
  JOIN campaign_messages cm ON cm.id = r.message_id
  WHERE r.reply_type IN ('interested', 'objection', 'not_interested')
  GROUP BY cm.template_used
)
SELECT
    s.template_used,
    s.sent_count,
    COALESCE(r.reply_count, 0) AS reply_count,
    CASE WHEN s.sent_count > 0
         THEN ROUND(100.0 * COALESCE(r.reply_count, 0) / s.sent_count, 2)
         ELSE 0 END AS reply_rate_pct
FROM sent s
LEFT JOIN replied r USING (template_used)
ORDER BY reply_rate_pct DESC;
