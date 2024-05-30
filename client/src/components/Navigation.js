import React from 'react';
import LeftandTop from './leftandtop';

const Navigation = ({ children }) => (
  <>
    <LeftandTop />
    <div>{children}</div>
  </>
);

export default Navigation;