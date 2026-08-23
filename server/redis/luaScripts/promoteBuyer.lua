-- KEYS[1] = active buyers set
-- KEYS[2] = waiting room sorted set
--
-- ARGV[1] = active capacity

local activeKey = KEYS[1]
local queueKey = KEYS[2]
local capacity = tonumber(ARGV[1])

-- Check current active count
local activeCount = redis.call(
    'SCARD',
    activeKey
)

-- No room
if activeCount >= capacity then
    return nil
end

-- Get the buyer at the front of the queue
local buyers = redis.call(
    'ZRANGE',
    queueKey,
    0,
    0
)

-- Queue is empty
if #buyers == 0 then
    return nil
end

local clientId = buyers[1]

-- Remove from waiting room
redis.call(
    'ZREM',
    queueKey,
    clientId
)

-- Add to active buyers
redis.call(
    'SADD',
    activeKey,
    clientId
)

-- Return promoted buyer
return clientId