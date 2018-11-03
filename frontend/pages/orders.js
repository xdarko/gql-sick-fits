import PleaseSignIn from '../components/PleaseSignIn';
import OrdersList from '../components/OrdersList';

const OrdersPage = props => (
  <div>
    <PleaseSignIn>
      <OrdersList />
    </PleaseSignIn>
  </div>
);

export default OrdersPage;