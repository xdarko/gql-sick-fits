import React from 'react';
import Items from '../components/Items';

const Home = props => <Items page={parseFloat(props.query.page)} />;

export default Home;