#!/bin/bash
# Seed events for testing - creates future (tomorrow) and past events for user15
API="http://localhost:5000/api"

# Login helper
login() {
  local email=$1 password=$2
  curl -s -X POST "$API/auth/login" -H "Content-Type: application/json" -d @- <<JSONEOF | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4
{"email":"$email","password":"$password"}
JSONEOF
}

# Create event helper
create_event() {
  local token=$1 sport=$2 title=$3 desc=$4 date=$5 dur=$6 addr=$7 lat=$8 lng=$9 max=${10} skill=${11}
  curl -s -X POST "$API/events" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $token" \
    -d @- <<JSONEOF
{"sportId":$sport,"title":"$title","description":"$desc","eventDate":"$date","durationMinutes":$dur,"locationAddress":"$addr","locationLat":$lat,"locationLng":$lng,"maxParticipants":$max,"minSkillLevel":"$skill"}
JSONEOF
}

# Apply to event
apply_event() {
  local token=$1 eventId=$2
  curl -s -X POST "$API/events/$eventId/applications" -H "Authorization: Bearer $token"
}

# Approve application
approve_app() {
  local token=$1 eventId=$2 appId=$3
  curl -s -X POST "$API/events/$eventId/applications/$appId/approve" -H "Authorization: Bearer $token"
}

echo "=== Logging in users ==="
T15=$(login "user15@sportactivityorganizer.com" "Prilep123!")
T1=$(login "user1@sportactivityorganizer.com" "Password123!")
T2=$(login "user2@sportactivityorganizer.com" "Password123!")
T3=$(login "user3@sportactivityorganizer.com" "Password123!")
T4=$(login "user4@sportactivityorganizer.com" "Password123!")
T5=$(login "user5@sportactivityorganizer.com" "Password123!")
T6=$(login "user6@sportactivityorganizer.com" "Password123!")
T7=$(login "user7@sportactivityorganizer.com" "Password123!")

echo "T15 length: ${#T15}"
echo "T1 length: ${#T1}"

# Tomorrow date (UTC)
TOMORROW=$(date -u -d "+1 day" +%Y-%m-%dT18:00:00Z 2>/dev/null || date -u -v+1d +%Y-%m-%dT18:00:00Z)
TOMORROW2=$(date -u -d "+1 day" +%Y-%m-%dT10:00:00Z 2>/dev/null || date -u -v+1d +%Y-%m-%dT10:00:00Z)
TOMORROW3=$(date -u -d "+1 day" +%Y-%m-%dT15:00:00Z 2>/dev/null || date -u -v+1d +%Y-%m-%dT15:00:00Z)

# Future dates
FUTURE2=$(date -u -d "+3 days" +%Y-%m-%dT17:00:00Z 2>/dev/null || date -u -v+3d +%Y-%m-%dT17:00:00Z)
FUTURE3=$(date -u -d "+5 days" +%Y-%m-%dT16:00:00Z 2>/dev/null || date -u -v+5d +%Y-%m-%dT16:00:00Z)
FUTURE4=$(date -u -d "+7 days" +%Y-%m-%dT19:00:00Z 2>/dev/null || date -u -v+7d +%Y-%m-%dT19:00:00Z)

echo "Tomorrow: $TOMORROW"

echo ""
echo "=== Creating TOMORROW events (user15 as organizer) ==="

# Event 1: Football tomorrow evening
R1=$(create_event "$T15" 1 "Фудбал во Градски Парк" "Пријателски фудбалски меч, дојдете спремни!" "$TOMORROW" 90 "Градски Парк, Скопје" 42.0037 21.4092 10 "Beginner")
E1=$(echo "$R1" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
echo "Event 1 (Football tomorrow): ID=$E1"

# Event 2: Basketball tomorrow morning
R2=$(create_event "$T15" 2 "Кошарка на отворено" "Јутро кошарка, 3 на 3 формат" "$TOMORROW2" 60 "Спортска сала Кале, Скопје" 42.0012 21.4322 6 "Intermediate")
E2=$(echo "$R2" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
echo "Event 2 (Basketball tomorrow): ID=$E2"

# Event 3: Tennis tomorrow afternoon
R3=$(create_event "$T15" 4 "Тенис турнир" "Мини тенис турнир, носете своја рекет" "$TOMORROW3" 120 "Тенис клуб Скопје, Аеродром" 41.9875 21.4456 8 "Beginner")
E3=$(echo "$R3" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
echo "Event 3 (Tennis tomorrow): ID=$E3"

echo ""
echo "=== Creating FUTURE events (user15 as organizer) ==="

# Event 4: Handball in 3 days
R4=$(create_event "$T15" 6 "Ракомет во Карпош" "Ракометен натпревар, потребни 12 играчи" "$FUTURE2" 90 "Спортска сала Карпош, Скопје" 42.0098 21.3892 12 "Intermediate")
E4=$(echo "$R4" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
echo "Event 4 (Handball +3d): ID=$E4"

# Event 5: Running in 5 days
R5=$(create_event "$T15" 8 "Утринско трчање" "5км трчање покрај Вардар" "$FUTURE3" 45 "Кеј на Вардар, Скопје" 42.0005 21.4280 15 "Beginner")
E5=$(echo "$R5" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
echo "Event 5 (Running +5d): ID=$E5"

# Event 6: Volleyball in 7 days
R6=$(create_event "$T15" 3 "Одбојка на плажа" "Одбојка на песок, екипи по 4" "$FUTURE4" 90 "Матка, Скопје" 41.9532 21.2987 8 "Beginner")
E6=$(echo "$R6" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
echo "Event 6 (Volleyball +7d): ID=$E6"

echo ""
echo "=== Creating events with OTHER users as organizers (user15 will join) ==="

# Event by user1
R7=$(create_event "$T1" 1 "Ноќен фудбал" "Фудбал под рефлектори" "$FUTURE2" 90 "Стадион Филип II, Скопје" 41.9724 21.4412 14 "Beginner")
E7=$(echo "$R7" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
echo "Event 7 (user1 football): ID=$E7"

# Event by user2
R8=$(create_event "$T2" 2 "Кошарка 5 на 5" "Натпревар кошарка" "$FUTURE3" 75 "Спортски центар Борис Трајковски, Скопје" 41.9901 21.4201 10 "Intermediate")
E8=$(echo "$R8" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
echo "Event 8 (user2 basketball): ID=$E8"

# Event by user3 - tomorrow (so user15 gets notification)
R9=$(create_event "$T3" 9 "Велосипедска тура" "Тура низ Матка" "$TOMORROW" 120 "Кањон Матка, Скопје" 41.9532 21.2987 10 "Beginner")
E9=$(echo "$R9" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
echo "Event 9 (user3 cycling tomorrow): ID=$E9"

echo ""
echo "=== Users applying to user15's events ==="

for EID in $E1 $E2 $E3 $E4 $E5 $E6; do
  if [ -n "$EID" ]; then
    echo "--- Applying to event $EID ---"
    A1=$(apply_event "$T1" "$EID")
    A1ID=$(echo "$A1" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
    A2=$(apply_event "$T2" "$EID")
    A2ID=$(echo "$A2" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
    A3=$(apply_event "$T3" "$EID")
    A3ID=$(echo "$A3" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
    A4=$(apply_event "$T4" "$EID")
    A4ID=$(echo "$A4" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
    A5=$(apply_event "$T5" "$EID")
    A5ID=$(echo "$A5" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)

    echo "  Approving applications..."
    [ -n "$A1ID" ] && approve_app "$T15" "$EID" "$A1ID" > /dev/null
    [ -n "$A2ID" ] && approve_app "$T15" "$EID" "$A2ID" > /dev/null
    [ -n "$A3ID" ] && approve_app "$T15" "$EID" "$A3ID" > /dev/null
    [ -n "$A4ID" ] && approve_app "$T15" "$EID" "$A4ID" > /dev/null
    [ -n "$A5ID" ] && approve_app "$T15" "$EID" "$A5ID" > /dev/null
    echo "  Done: apps $A1ID $A2ID $A3ID $A4ID $A5ID"
  fi
done

echo ""
echo "=== User15 applying to other users' events ==="

for EID in $E7 $E8 $E9; do
  if [ -n "$EID" ]; then
    echo "--- User15 applying to event $EID ---"
    A15=$(apply_event "$T15" "$EID")
    A15ID=$(echo "$A15" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
    echo "  Application ID: $A15ID"

    # Approve user15 (organizer approves)
    if [ "$EID" = "$E7" ]; then
      [ -n "$A15ID" ] && approve_app "$T1" "$EID" "$A15ID" > /dev/null && echo "  Approved by user1"
    elif [ "$EID" = "$E8" ]; then
      [ -n "$A15ID" ] && approve_app "$T2" "$EID" "$A15ID" > /dev/null && echo "  Approved by user2"
    elif [ "$EID" = "$E9" ]; then
      [ -n "$A15ID" ] && approve_app "$T3" "$EID" "$A15ID" > /dev/null && echo "  Approved by user3"
    fi

    # Also add more users
    A6=$(apply_event "$T6" "$EID")
    A6ID=$(echo "$A6" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
    A7=$(apply_event "$T7" "$EID")
    A7ID=$(echo "$A7" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)

    if [ "$EID" = "$E7" ]; then
      [ -n "$A6ID" ] && approve_app "$T1" "$EID" "$A6ID" > /dev/null
      [ -n "$A7ID" ] && approve_app "$T1" "$EID" "$A7ID" > /dev/null
    elif [ "$EID" = "$E8" ]; then
      [ -n "$A6ID" ] && approve_app "$T2" "$EID" "$A6ID" > /dev/null
      [ -n "$A7ID" ] && approve_app "$T2" "$EID" "$A7ID" > /dev/null
    elif [ "$EID" = "$E9" ]; then
      [ -n "$A6ID" ] && approve_app "$T3" "$EID" "$A6ID" > /dev/null
      [ -n "$A7ID" ] && approve_app "$T3" "$EID" "$A7ID" > /dev/null
    fi
  fi
done

echo ""
echo "=== Creating PAST events directly in DB ==="
# Insert past completed events via SQL for user15

docker exec sao-db psql -U sao_user -d sportactivityorganizer -c "
-- Past event 1: Completed football 2 weeks ago
INSERT INTO \"Events\" (\"OrganizerId\", \"SportId\", \"Title\", \"Description\", \"EventDate\", \"DurationMinutes\", \"LocationAddress\", \"LocationLat\", \"LocationLng\", \"MaxParticipants\", \"CurrentParticipants\", \"MinSkillLevel\", \"Status\", \"CreatedAt\")
VALUES (49, 1, 'Фудбал во Аеродром', 'Завршен меч, беше одлично!', NOW() - INTERVAL '14 days', 90, 'ФК Аеродром, Скопје', 41.9750, 21.4350, 10, 6, 'Beginner', 'Completed', NOW() - INTERVAL '20 days')
ON CONFLICT DO NOTHING
RETURNING \"Id\";

-- Past event 2: Completed basketball 1 week ago
INSERT INTO \"Events\" (\"OrganizerId\", \"SportId\", \"Title\", \"Description\", \"EventDate\", \"DurationMinutes\", \"LocationAddress\", \"LocationLat\", \"LocationLng\", \"MaxParticipants\", \"CurrentParticipants\", \"MinSkillLevel\", \"Status\", \"CreatedAt\")
VALUES (49, 2, 'Кошарка во Центар', 'Одлична кошарка', NOW() - INTERVAL '7 days', 60, 'Спортски центар, Центар, Скопје', 42.0010, 21.4280, 8, 5, 'Intermediate', 'Completed', NOW() - INTERVAL '10 days')
ON CONFLICT DO NOTHING
RETURNING \"Id\";

-- Past event 3: Completed running 3 weeks ago
INSERT INTO \"Events\" (\"OrganizerId\", \"SportId\", \"Title\", \"Description\", \"EventDate\", \"DurationMinutes\", \"LocationAddress\", \"LocationLat\", \"LocationLng\", \"MaxParticipants\", \"CurrentParticipants\", \"MinSkillLevel\", \"Status\", \"CreatedAt\")
VALUES (49, 8, 'Трчање покрај Вардар', 'Утринско 10км трчање', NOW() - INTERVAL '21 days', 60, 'Кеј на Вардар, Скопје', 42.0005, 21.4280, 20, 8, 'Beginner', 'Completed', NOW() - INTERVAL '25 days')
ON CONFLICT DO NOTHING
RETURNING \"Id\";

-- Past event 4: Cancelled event
INSERT INTO \"Events\" (\"OrganizerId\", \"SportId\", \"Title\", \"Description\", \"EventDate\", \"DurationMinutes\", \"LocationAddress\", \"LocationLat\", \"LocationLng\", \"MaxParticipants\", \"CurrentParticipants\", \"MinSkillLevel\", \"Status\", \"CreatedAt\")
VALUES (49, 4, 'Тенис меч (откажан)', 'Откажано поради дожд', NOW() - INTERVAL '5 days', 90, 'Тенис терен Скопје', 41.9900, 21.4100, 4, 2, 'Beginner', 'Cancelled', NOW() - INTERVAL '8 days')
ON CONFLICT DO NOTHING
RETURNING \"Id\";

-- Past event 5: Completed volleyball 1 month ago
INSERT INTO \"Events\" (\"OrganizerId\", \"SportId\", \"Title\", \"Description\", \"EventDate\", \"DurationMinutes\", \"LocationAddress\", \"LocationLat\", \"LocationLng\", \"MaxParticipants\", \"CurrentParticipants\", \"MinSkillLevel\", \"Status\", \"CreatedAt\")
VALUES (49, 3, 'Одбојка на плажа', 'Лете одбојка', NOW() - INTERVAL '30 days', 90, 'Градски Парк, Скопје', 42.0037, 21.4092, 12, 10, 'Beginner', 'Completed', NOW() - INTERVAL '35 days')
ON CONFLICT DO NOTHING
RETURNING \"Id\";
"

echo ""
echo "=== Add participants to past events ==="
docker exec sao-db psql -U sao_user -d sportactivityorganizer -c "
-- Get the past event IDs
DO \$\$
DECLARE
  past_ids INT[];
  eid INT;
  uids INT[] := ARRAY[35,36,37,38,39,40,41,42]; -- user1-user8
BEGIN
  SELECT array_agg(\"Id\") INTO past_ids FROM \"Events\" WHERE \"OrganizerId\" = 49 AND \"Status\" = 'Completed';

  IF past_ids IS NOT NULL THEN
    FOREACH eid IN ARRAY past_ids LOOP
      -- Add 4-5 participants
      FOR i IN 1..5 LOOP
        INSERT INTO \"EventApplications\" (\"EventId\", \"UserId\", \"Status\", \"AppliedAt\", \"ResolvedAt\")
        VALUES (eid, uids[i], 'Approved', NOW() - INTERVAL '30 days', NOW() - INTERVAL '29 days')
        ON CONFLICT DO NOTHING;
      END LOOP;
    END LOOP;
  END IF;
END\$\$;
"

echo ""
echo "=== DONE ==="
echo "Events created for user15@sportactivityorganizer.com"
echo "Tomorrow events will trigger 24h reminder notifications"
echo "Check MailHog at http://localhost:8025 for emails"
