import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async tourId => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `/api/v1/bookings/checkout-session/${tourId}`
    );

    // 2) Redirect to Stripe's checkout page
    window.location.assign(session.data.session.url);
  } catch (err) {
    console.log(err);
    showAlert('error', err.message);
  }
};
