-- atomicStockDecrement.lua
--
-- This is the core fix for the "add to cart then out of stock" bug.
-- Redis runs this ENTIRE script as one indivisible operation — no other
-- request can interleave in the middle of it, even under massive concurrency.
-- That's what "atomic" means here: check-and-decrement happens as one step,
-- not two separate steps that a race condition could sneak between.
--
-- KEYS[1] = product:{productId}:stock          (current live stock, integer)
-- KEYS[2] = reservation:{clientId}:{productId} (the hold we create on success)
-- KEYS[3] = stats:{productId}:requests         (total buy attempts, for dashboard)
-- KEYS[4] = stats:{productId}:oversell_blocked (rejected-due-to-no-stock counter)
--
-- ARGV[1] = quantity requested (usually 1)
-- ARGV[2] = reservation TTL in seconds (e.g. 300 = 5 minutes)
--
-- Return values (the API layer will interpret these):
--   -2  = sale is not live (stock key doesn't exist yet)
--   -1  = sold out (not enough stock left)
--  >=0  = success — returns the remaining stock AFTER this decrement

-- Every attempt counts toward total requests, success or fail
redis.call('INCR', KEYS[3])

local stock = redis.call('GET', KEYS[1])

if not stock then
    return -2
end

stock = tonumber(stock)
local qty = tonumber(ARGV[1])

if stock < qty then
    -- Not enough stock. Track this for the "oversell attempts blocked" counter
    -- on your ops dashboard — this number proving > 0 during a demo is actually
    -- a GOOD sign: it means real contention happened and was correctly rejected.
    redis.call('INCR', KEYS[4])
    return -1
end

-- The atomic part: decrement stock AND create the reservation in one script.
-- No other client's script execution can run between these two lines.
redis.call('DECRBY', KEYS[1], qty)
redis.call('SET', KEYS[2], qty, 'EX', ARGV[2])

return stock - qty