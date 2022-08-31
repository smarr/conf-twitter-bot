import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Index from './pages/Index';
import Header from './components/layout/Header';
import { ActiveAccountProvider } from './context/ActiveAccountContext';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
	<React.StrictMode>
		<ActiveAccountProvider>
			<Header />
			<Index />
		</ActiveAccountProvider>
	</React.StrictMode>,
);