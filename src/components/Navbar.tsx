import React from 'react';
import { Link } from 'react-router-dom';
import WalletConnectButton from './WalletConnectButton';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-gray-900 p-4 shadow-lg">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <Link to="/" className="text-3xl font-bold text-white hover:text-yellow-400 transition duration-200">
          ⚡ MeeChain MeeBot
        </Link>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <NavItem to="/" emoji="🏠" hoverColor="hover:text-yellow-400">Dashboard</NavItem>
          <NavItem to="/gallery" emoji="🖼" hoverColor="hover:text-blue-400">Gallery</NavItem>
          <NavItem to="/staking" emoji="💎" hoverColor="hover:text-green-400">Staking</NavItem>
          <NavItem to="/events" emoji="📜" hoverColor="hover:text-purple-400">Event Logs</NavItem>
        </div>
        <WalletConnectButton />
      </div>
    </nav>
  );
};

interface NavItemProps {
  to: string;
  children: React.ReactNode;
  emoji: string;
  hoverColor: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, children, emoji, hoverColor }) => (
  <Link
    to={to}
    className={`text-white text-lg font-medium ${hoverColor} transition duration-200 px-3 py-1 rounded-md flex items-center`}
  >
    <span className="mr-2">{emoji}</span> {children}
  </Link>
);

export default Navbar;