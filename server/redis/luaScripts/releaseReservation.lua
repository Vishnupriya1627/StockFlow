-- KEYS[1] = reservation key
-- KEYS[2] = reservation expiry sorted set
-- KEYS[3] = product stock key

local reservedQty = redis.call('GET', KEYS[1])

-- Already consumed or already released.
if not reservedQty then
    return 0
end

local qty = tonumber(reservedQty)

-- Delete reservation
redis.call('DEL', KEYS[1])

-- Remove from expiration index
redis.call('ZREM', KEYS[2], KEYS[1])

-- Give the inventory back
redis.call('INCRBY', KEYS[3], qty)

return qty