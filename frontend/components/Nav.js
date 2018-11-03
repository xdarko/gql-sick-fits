import Link from 'next/link';
import { Mutation } from 'react-apollo';

import User from './User';
import SignoutButton from './Signout';
import NavStyles from './styles/NavStyles';

import CartCount from './CartCount';

import { LOCAL_TOGGLE_CART_MUTATION } from './Cart';

const Nav = () => (
  <User>
    {({ data: { currentUser } }) => (
      <NavStyles>
        <Link href="items">
          <a>Shop</a>
        </Link>
        
        {currentUser && (
          <>
            <Link href="sell">
              <a>Sell</a>
            </Link>
            <Link href="orders">
              <a>Oders</a>
            </Link>
            <Link href="me">
              <a>Account</a>
            </Link>
            <SignoutButton />

            <Mutation mutation={LOCAL_TOGGLE_CART_MUTATION}>
              {(toggleCart) => (
                <button onClick={toggleCart}>
                  My Cart
                  <CartCount
                    count={currentUser.cart.reduce((tally, cartItem) => tally + cartItem.quantity, 0)}
                  />
                </button>
              )}
            </Mutation>
          </>
        )}

        {!currentUser && (
          <Link href="signup">
            <a>Sign In</a>
          </Link>
        )}
      </NavStyles>
    )}
  </User>
);

export default Nav;
