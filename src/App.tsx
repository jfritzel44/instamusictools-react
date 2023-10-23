import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './shared/Header';  // adjust the path as needed
import InstaKeyMain from './components/InstaKeysMain';  // adjust the path as needed
import './App.scss';

const App = () => {
    return (
        <Router>
            <div className="app">
                <Header />
                
                <Routes>
                    <Route path="/instakeys" element={<InstaKeyMain />} />
                    {/* Add more routes as needed */}
                </Routes>
            </div>
        </Router>
    );
}

export default App;
