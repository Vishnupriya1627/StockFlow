import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100,
  iterations: 300,
};

export default function () {
  const buyUrl = `${__ENV.BASE_URL}/flashsale/${__ENV.PRODUCT_ID}/buy`;
  const checkoutUrl = `${__ENV.BASE_URL}/flashsale/${__ENV.PRODUCT_ID}/checkout`;

  const MAX_POLL_ATTEMPTS = 20; // give up waiting after ~20 tries
  let attempts = 0;
  let bought = false;

  while (attempts < MAX_POLL_ATTEMPTS && !bought) {
    attempts++;

    const buyRes = http.post(buyUrl, null, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (buyRes.status === 200) {
      // Successfully reserved — now actually complete checkout
      bought = true;

      sleep(2); // simulate a real user filling out checkout

      const checkoutRes = http.post(checkoutUrl, null, {
        headers: { 'Content-Type': 'application/json' },
      });

      check(checkoutRes, {
        'checkout: succeeded': (r) => r.status === 201,
      });

      return;
    }

    if (buyRes.status === 202) {
      // In the waiting room — wait and try again
      sleep(1);
      continue;
    }

    // Sold out, sale not live, or real error — stop trying
    check(buyRes, {
      'buy: got a terminal response': (r) => [404, 409, 500].includes(r.status),
    });
    return;
  }
}