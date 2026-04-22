-- Name: Reply type breakdown (last 30 days)
-- Chart type: Pie OR stacked bar by sentiment
-- Understand what kinds of replies you're getting. Opt-outs > 2% = message is annoying. Interested < 5% of replies = message isn't compelling.

SELECT reply_type,
       sentiment,
       count(*) AS count
FROM li_replies
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY reply_type, sentiment
ORDER BY count DESC;
