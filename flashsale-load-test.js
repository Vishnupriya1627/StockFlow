//k6 run -e BASE_URL=https://stockflow-q733.onrender.com -e PRODUCT_ID=yourProductId flashsale-load-test.js

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100,
  iterations: 400,
};

export default function () {
  const buyUrl = `${__ENV.BASE_URL}/flashsale/${__ENV.PRODUCT_ID}/buy`;
  const checkoutUrl = `${__ENV.BASE_URL}/flashsale/${__ENV.PRODUCT_ID}/checkout`;

  const MAX_POLL_ATTEMPTS = 180;
  let attempts = 0;
  let bought = false;

  while (attempts < MAX_POLL_ATTEMPTS && !bought) {
    attempts++;

    const buyRes = http.post(buyUrl, null, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (buyRes.status === 200) {
      bought = true;
      sleep(2);

      const checkoutPayload = JSON.stringify({
        customer: {
          name: `k6-buyer-${__VU}-${__ITER}`,
          email: `k6buyer${__VU}_${__ITER}@example.com`,
          phone: '9999999999',
        },
      });

      const checkoutRes = http.post(checkoutUrl, checkoutPayload, {
        headers: { 'Content-Type': 'application/json' },
      });

      check(checkoutRes, {
        'checkout: succeeded': (r) => r.status === 201,
      });

      return;
    }

    if (buyRes.status === 202) {
      sleep(1);
      continue;
    }

    check(buyRes, {
      'buy: got a terminal response': (r) => [404, 409, 500].includes(r.status),
    });
    return;
  }
}