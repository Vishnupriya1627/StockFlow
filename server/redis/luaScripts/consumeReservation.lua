-- KEYS[1] = reservation key
-- KEYS[2] = reservation expiry sorted set

local reservedQty = redis.call('GET', KEYS[1])

-- Reservation doesn't exist anymore.
-- It may have already expired.
if not reservedQty then
    return 0
end

local qty = tonumber(reservedQty)

-- Remove the reservation
redis.call('DEL', KEYS[1])

-- Remove it from the expiration index
redis.call('ZREM', KEYS[2], KEYS[1])

-- Return the quantity that was reserved
return qty