-- KEYS[1] = active buyers set
-- KEYS[2] = waiting room sorted set
--
-- ARGV[1] = clientId
-- ARGV[2] = active capacity
-- ARGV[3] = queue score

local activeKey = KEYS[1]
local queueKey = KEYS[2]

local clientId = ARGV[1]
local capacity = tonumber(ARGV[2])
local score = ARGV[3]

-- --------------------------------------------------
-- 1. Is this buyer already active?
-- --------------------------------------------------

local alreadyActive = redis.call(
    'SISMEMBER',
    activeKey,
    clientId
)

if alreadyActive == 1 then
    return 1
end

-- --------------------------------------------------
-- 2. Is there room for another active buyer?
-- --------------------------------------------------

local activeCount = redis.call(
    'SCARD',
    activeKey
)

if activeCount < capacity then

    redis.call(
        'SADD',
        activeKey,
        clientId
    )

    return 1
end

-- --------------------------------------------------
-- 3. Capacity is full.
-- Put buyer into waiting room.
-- --------------------------------------------------

redis.call(
    'ZADD',
    queueKey,
    'NX',
    score,
    clientId
)

return 0