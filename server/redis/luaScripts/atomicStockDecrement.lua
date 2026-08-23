-- KEYS[1] = stock key
-- KEYS[2] = reservation key
-- KEYS[3] = requests counter
-- KEYS[4] = oversell blocked counter
-- KEYS[5] = reservation expiry sorted set

-- ARGV[1] = quantity
-- ARGV[2] = reservation TTL in seconds

-- Track every buy attempt
redis.call('INCR', KEYS[3])

local stock = redis.call('GET', KEYS[1])

-- Flash sale is not live / stock key doesn't exist
if not stock then
    return -2
end

stock = tonumber(stock)

local qty = tonumber(ARGV[1])
local ttl = tonumber(ARGV[2])

-- Not enough stock
if stock < qty then
    redis.call('INCR', KEYS[4])
    return -1
end

-- Atomic inventory decrement
redis.call('DECRBY', KEYS[1], qty)

-- Create/update reservation with TTL
redis.call('SET', KEYS[2], qty, 'EX', ttl)

-- Register reservation expiration time.
-- Redis TIME returns {seconds, microseconds}
local currentTime = redis.call('TIME')
local expiresAt = tonumber(currentTime[1]) + ttl

redis.call('ZADD', KEYS[5], expiresAt, KEYS[2])

-- Return remaining stock
return stock - qty