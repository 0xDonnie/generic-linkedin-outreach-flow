-- Name: Lead funnel
-- Chart type: Funnel (stages in order) OR Bar chart
-- Shows the conversion at each stage of the LinkedIn outreach flow.

SELECT 'Total leads' AS stage, 1 AS ord,
       (SELECT count(*) FROM leads) AS value

UNION ALL SELECT 'Contactable (consent + not suppressed)', 2,
       (SELECT count(*) FROM contactable_leads)

UNION ALL SELECT 'Connection request sent', 3,
       (SELECT count(DISTINCT lead_id) FROM campaign_messages WHERE touch_type = 'connection_request')

UNION ALL SELECT 'Connection accepted', 4,
       (SELECT count(DISTINCT lead_id) FROM campaign_messages
         WHERE touch_type = 'connection_request' AND status = 'connection_accepted')

UNION ALL SELECT 'First message sent', 5,
       (SELECT count(DISTINCT lead_id) FROM campaign_messages WHERE touch_type = 'first_message')

UNION ALL SELECT 'Engaged replies (interested / objection)', 6,
       (SELECT count(DISTINCT lead_id) FROM li_replies WHERE reply_type IN ('interested', 'objection'))

UNION ALL SELECT 'Demo scheduled', 7,
       (SELECT count(*) FROM demo_bookings WHERE status = 'scheduled')

UNION ALL SELECT 'Demo completed', 8,
       (SELECT count(*) FROM demo_bookings WHERE status = 'completed')

ORDER BY ord;
